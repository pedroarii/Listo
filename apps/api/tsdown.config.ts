import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/server.ts'],
  format: 'esm',
  platform: 'node',
  target: 'node26',
  // Shared exports raw TS, so it must be bundled instead of resolved at runtime.
  deps: { alwaysBundle: ['@listo/shared'] },
});
