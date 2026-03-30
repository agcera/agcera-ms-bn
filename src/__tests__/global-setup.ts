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
    run('pnpm exec sequelize-cli db:create');
  } catch {
    // database might already exist
  }

  run('pnpm db:rollback');
  run('pnpm db:migrate');
  run('pnpm db:seed');
};
