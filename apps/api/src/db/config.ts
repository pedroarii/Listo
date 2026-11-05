const POSTGRES_PROTOCOLS = new Set(['postgres:', 'postgresql:']);

type Env = Readonly<Record<string, string | undefined>>;

// Error messages never include the url itself: it usually carries the database password.
export function readDatabaseUrl(env: Env = process.env): string {
  const url = env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error('DATABASE_URL is not set. Copy .env.example to .env and run `pnpm db:setup`.');
  }

  if (!URL.canParse(url)) {
    throw new Error('DATABASE_URL is not a valid URL.');
  }

  if (!POSTGRES_PROTOCOLS.has(new URL(url).protocol)) {
    throw new Error('DATABASE_URL must use the postgres:// or postgresql:// scheme.');
  }

  return url;
}
