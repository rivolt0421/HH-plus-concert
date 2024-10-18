import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { AsyncLocalStorage } from 'async_hooks';
import { execSync } from 'child_process';
import { join } from 'path';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../database/prisma.service';
import { EnterQueueUsecase } from '../queue/enter-queue.usecase';
import { CreateReservationUsecase } from './create-reservation.usecase';
import { GetAvailableSeatsUsecase } from './get-available-seats.usecase';

describe('CreateReservationUsecase Integration Test', () => {
  let app: INestApplication;
  let enterQueueUsecase: EnterQueueUsecase;
  let getAvailableSeatsUsecase: GetAvailableSeatsUsecase;
  let createReservationUsecase: CreateReservationUsecase;
  let container: StartedPostgreSqlContainer;
  let prisma: PrismaService;

  beforeAll(async () => {
    container = await new PostgreSqlContainer()
      .withDatabase('test_db')
      .withUsername('test_user')
      .withPassword('test_password')
      .start();

    const DATABASE_URL = container.getConnectionUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useFactory({
        factory: () => {
          const prisma = new PrismaService(
            {
              datasources: {
                db: {
                  url: DATABASE_URL,
                },
              },
            },
            new AsyncLocalStorage(),
          );
          return prisma;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    enterQueueUsecase = moduleFixture.get<EnterQueueUsecase>(EnterQueueUsecase);
    getAvailableSeatsUsecase = moduleFixture.get<GetAvailableSeatsUsecase>(
      GetAvailableSeatsUsecase,
    );
    createReservationUsecase = moduleFixture.get<CreateReservationUsecase>(
      CreateReservationUsecase,
    );
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await setupTestDatabase(DATABASE_URL);
  }, 10000);

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
    await container.stop();
  });

  beforeEach(async () => {
    await prisma.$transaction([
      prisma.sessionCounter.create({
        data: {
          createdCount: 0,
          terminatedCount: 0,
        },
      }),
      prisma.user.create({
        data: {
          id: 1,
          name: '존도',
          email: 'test@example.com',
          password: 'test1234',
          point: 1000,
        },
      }),
      prisma.schedule.create({
        data: {
          date: '2024-01-01',
          seats: {
            create: {
              number: 1,
              price: 1000,
            },
          },
        },
      }),
    ]);
  });

  afterEach(async () => {
    await prisma.$transaction([
      prisma.sessionCounter.deleteMany(),
      prisma.session.deleteMany(),
      prisma.reservation.deleteMany(),
      prisma.user.deleteMany(),
      prisma.seat.deleteMany(),
      prisma.schedule.deleteMany(),
    ]);
  });

  it('좌석을 예약할 수 있다.', async () => {
    // 1. 토큰 발급
    const token = await enterQueueUsecase.execute(
      'test@example.com',
      'test1234',
    );

    // 2. 예약 가능한 좌석 조회
    const date = '2024-01-01';
    const availableSeats = await getAvailableSeatsUsecase.execute(date, token);

    // 3. 좌석 예약
    const seat = availableSeats[0];
    const reservation = await createReservationUsecase.execute(
      date,
      seat.number,
      token,
    );

    // 4. 예약 정보 검증
    const prismaReservation = await prisma.reservation.findUnique({
      where: { id: reservation.id },
    });

    expect(reservation).toBeDefined();
    expect(prismaReservation).toBeDefined();
    expect(prismaReservation?.seatId).toBe(seat.id);
    expect(prismaReservation?.userId).toBe(1);
    expect(prismaReservation?.expiresAt.getTime()).toBeGreaterThan(
      new Date().getTime(),
    );
    expect(prismaReservation?.paymentId).toBeNull();
    expect(prismaReservation?.isCancelled).toBe(false);
  });
});

async function setupTestDatabase(DATABASE_URL: string) {
  // 데이터베이스 초기화
  const prismaBinary = join(
    __dirname,
    '..',
    '..',
    '..',
    'node_modules',
    '.bin',
    'prisma',
  );
  execSync(`${prismaBinary} db push --skip-generate`, {
    env: {
      ...process.env,
      DATABASE_URL,
    },
  });
}
