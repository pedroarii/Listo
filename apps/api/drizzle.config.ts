import { existsSync } from 'node:fs';
import { defineConfig } from 'drizzle-kit';
import { readDatabaseUrl } from './src/db/config.ts';

const envFile = new URL('../../.env', import.meta.url);
if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: readDatabaseUrl() },
  strict: true,
  verbose: true,
});
