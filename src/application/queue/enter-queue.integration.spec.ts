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
import { EnterQueueUsecase } from './enter-queue.usecase';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/constants/jwt';

describe('EnterQueueUsecase Integration Test', () => {
  let app: INestApplication;
  let enterQueueUsecase: EnterQueueUsecase;
  let container: StartedPostgreSqlContainer;
  let prisma: PrismaService;
  let jwt: JwtService;
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
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwt = moduleFixture.get<JwtService>(JwtService);

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

  it('대기열 토큰을 발급받을 수 있다.', async () => {
    const token = await enterQueueUsecase.execute(
      'test@example.com',
      'test1234',
    );

    expect(token).toBeDefined();

    // 토큰 검증
    await expect(async () => {
      const payload = await jwt.verifyAsync<{ sessionId: number }>(token, {
        secret: jwtConstants.secret,
      });
      expect(payload.sessionId).toBeDefined();
    }).not.toThrow();
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
