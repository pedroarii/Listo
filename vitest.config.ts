import { defineConfig } from 'vitest/config';

// Single entry point for `pnpm test:watch`: runs every package's own vitest config in one watcher.
export default defineConfig({
  test: {
    projects: ['apps/api', 'packages/shared'],
  },
});
