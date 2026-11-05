import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Integration tests need Postgres running; they live in vitest.integration.config.ts.
    exclude: ['src/**/*.integration.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // Database wiring is exercised by the integration suite, not by unit tests.
      exclude: ['src/**/*.test.ts', 'src/server.ts', 'src/db/client.ts', 'src/db/migrate.ts'],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
