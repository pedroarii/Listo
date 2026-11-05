import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { defineConfig } from 'vitest/config';

const envFile = new URL('../../.env', import.meta.url);
const { TEST_DATABASE_URL } = existsSync(envFile) ? parseEnv(readFileSync(envFile, 'utf8')) : {};

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.integration.test.ts'],
    // Suites share one database, so they must not run concurrently.
    fileParallelism: false,
    env: TEST_DATABASE_URL ? { DATABASE_URL: TEST_DATABASE_URL } : {},
    coverage: {
      provider: 'v8',
      // Complements the unit suite: only the files it excludes from its own coverage.
      include: ['src/db/client.ts', 'src/db/migrate.ts'],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
