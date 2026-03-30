import { execSync } from 'child_process';
import path from 'path';

const backendDir = path.resolve(__dirname, '../../');

const run = (command: string) => {
  execSync(command, {
    stdio: 'inherit',
    cwd: backendDir,
    env: { ...process.env, NODE_ENV: 'test' },
  });
};

export default async () => {
  try {
    run('pnpm exec ts-node -r tsconfig-paths/register scripts/cleanup-test-db.ts');
    run('pnpm exec sequelize-cli db:seed:undo:all');
  } catch {
    // ignore seed rollback errors
  }
};
