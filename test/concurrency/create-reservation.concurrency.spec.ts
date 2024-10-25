import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';
import { CreateReservationUsecase } from '../../src/application/reservation/create-reservation.usecase';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { AsyncLocalStorage } from 'async_hooks';
import { QueueService } from 'src/domain/queue/service/queue.service';
import { setupTestDatabase } from 'test/setup-test-database.util';

describe('CreateReservation Concurrency Test', () => {
  let app: INestApplication;
  let createReservationUsecase: CreateReservationUsecase;
  let queueService: QueueService;
  let prisma: PrismaService;
  let container: StartedPostgreSqlContainer;

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

    createReservationUsecase = moduleFixture.get<CreateReservationUsecase>(
      CreateReservationUsecase,
    );
    queueService = moduleFixture.get<QueueService>(QueueService);
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

  it('하나의 좌석에 대해 동시에 여러 요청이 들어오더라도 하나의 예약만 생성된다.', async () => {
    const userId = 1;
    const date = '2024-01-01';
    const seatNumber = 1;

    const sessions = await Promise.all(
      Array.from({ length: 10 }, () => queueService.createSession(userId)),
    );

    const reservationPromises = sessions.map((session) =>
      createReservationUsecase.execute(date, seatNumber, session.id),
    );

    const results = await Promise.allSettled(reservationPromises);

    const fulfilled = results.filter((result) => result.status === 'fulfilled');
    const rejected = results.filter((result) => result.status === 'rejected');

    // Only one reservation should be successful
    expect(fulfilled.length).toBe(1);

    // The rest should fail due to seat being occupied
    expect(rejected.length).toBe(9);

    // Verify that only one reservation exists in the database
    const reservations = await prisma.reservation.findMany();
    expect(reservations).toHaveLength(1);
  });
});
