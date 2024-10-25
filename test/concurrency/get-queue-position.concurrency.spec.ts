import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { AsyncLocalStorage } from 'async_hooks';
import { TokenService } from 'src/domain/queue/service/token.service';
import { setupTestDatabase } from 'test/setup-test-database.util';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';
import { QueueManager } from '../../src/domain/queue/entity/queue-manager';
import { EnterQueueUsecase } from 'src/application/queue/enter-queue.usecase';
import { GetQueuePositionUsecase } from 'src/application/queue/get-queue-position.usecase';

describe('GetQueuePosition Concurrency Test', () => {
  let app: INestApplication;
  let enterQueueUsecase: EnterQueueUsecase;
  let getQueuePositionUsecase: GetQueuePositionUsecase;
  let tokenService: TokenService;
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
    getQueuePositionUsecase = moduleFixture.get<GetQueuePositionUsecase>(
      GetQueuePositionUsecase,
    );
    tokenService = moduleFixture.get<TokenService>(TokenService);
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
          name: '존도',
          email: 'test@example.com',
          password: 'test1234',
          point: 1000,
        },
      }),
    ]);
  });

  afterEach(async () => {
    await prisma.$transaction([
      prisma.sessionCounter.deleteMany(),
      prisma.session.deleteMany(),
      prisma.user.deleteMany(),
    ]);
  });

  it('200개의 동시 요청에서 대기 번호가 순차적으로 증가해야 한다', async () => {
    const capacity = QueueManager.CAPACITY; // CAPACITY 가져오기
    const count = 200;

    // 1. 토큰 발급 (200개의 동시 요청)
    const tokens = await Promise.all(
      Array.from({ length: count }, () =>
        enterQueueUsecase.execute('test@example.com', 'test1234'),
      ),
    );

    const sessionIds = await Promise.all(
      tokens.map((token) => tokenService.getSessionId(token)),
    );

    // 2. 대기 번호 조회 (200개의 동시 요청)
    const remainingCounts = await Promise.all(
      sessionIds.map((sessionId) => getQueuePositionUsecase.execute(sessionId)),
    );

    // 3. 검증
    const uniqueCounts = new Set(remainingCounts);

    // 모든 대기 번호가 유니크해야 함
    expect(uniqueCounts.size).toBe(count - capacity + 1);

    // 대기 번호가 순차적으로 증가하는지 확인
    const sortedCounts = [...uniqueCounts].sort((a, b) => a - b);
    sortedCounts.forEach((count, index) => {
      expect(count).toBe(index);
    });

    // 세션 카운터 검증
    const counter = await prisma.sessionCounter.findFirst();
    expect(counter?.createdCount).toBe(count);
    expect(counter?.terminatedCount).toBe(0);
  });
});
