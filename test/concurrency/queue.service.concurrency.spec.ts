import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { AsyncLocalStorage } from 'async_hooks';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/database/prisma.service';
import { QueueManager } from 'src/domain/queue/entity/queue-manager';
import { QueueService } from 'src/domain/queue/service/queue.service';
import { setupTestDatabase } from 'test/setup-test-database.util';

describe('GetQueuePosition Concurrency Test', () => {
  let app: INestApplication;
  let queueService: QueueService;
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

    queueService = moduleFixture.get<QueueService>(QueueService);
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await setupTestDatabase(DATABASE_URL);
  }, 20000);

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

  it('수용 가능한 세션 수를 초과하는 요청이 들어오면 수용 가능한 세션 수만큼만 수용할 수 있다.', async () => {
    const capacity = QueueManager.CAPACITY;
    const sessionCount = capacity + 10; // Create more sessions than capacity

    // Create multiple sessions
    const sessions = await Promise.all(
      Array.from({ length: sessionCount }, () => queueService.createSession(1)),
    );

    // Check accessibility concurrently
    const results = await Promise.all(
      sessions.map((session) => queueService.isAccessible(session.id)),
    );

    // Check that only up to capacity are accessible
    const accessibleCount = results.filter((result) => !!result).length;
    console.log(accessibleCount);
    expect(accessibleCount).toBeLessThanOrEqual(capacity);
  });
});
