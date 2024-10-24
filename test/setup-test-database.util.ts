import { execSync } from 'child_process';
import { join } from 'path';

export async function setupTestDatabase(DATABASE_URL: string) {
  // 데이터베이스 초기화
  const prismaBinary = join(__dirname, '..', 'node_modules', '.bin', 'prisma');
  execSync(`${prismaBinary} db push --skip-generate`, {
    env: {
      ...process.env,
      DATABASE_URL,
    },
  });
}
