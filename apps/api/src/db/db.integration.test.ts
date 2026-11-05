import { sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createDb, type Database } from './client.ts';
import { readDatabaseUrl } from './config.ts';
import { runMigrations } from './migrate.ts';

// Drizzle records applied migrations here (default schema and table for node-postgres).
const countAppliedMigrations = async ({ db }: Database): Promise<number> => {
  const result = await db.execute<{ count: number }>(
    sql`select count(*)::int as count from drizzle.__drizzle_migrations`,
  );
  return result.rows[0]?.count ?? 0;
};

describe('database (integration)', () => {
  let database: Database;

  beforeAll(() => {
    database = createDb(readDatabaseUrl());
  });

  afterAll(async () => {
    await database.close();
  });

  it('connects and runs a query', async () => {
    const result = await database.db.execute<{ ok: number }>(sql`select 1 as ok`);

    expect(result.rows).toEqual([{ ok: 1 }]);
  });

  it('applies the migrations and records them', async () => {
    await runMigrations(database);

    expect(await countAppliedMigrations(database)).toBeGreaterThanOrEqual(1);
  });

  it('is idempotent: running migrations again applies nothing new', async () => {
    await runMigrations(database);
    const before = await countAppliedMigrations(database);

    await runMigrations(database);

    expect(await countAppliedMigrations(database)).toBe(before);
  });
});

describe('createDb', () => {
  it('rejects queries after close', async () => {
    const database = createDb(readDatabaseUrl());
    await database.close();

    // Drizzle wraps driver errors as "Failed query"; the pool's own error is the cause.
    await expect(database.db.execute(sql`select 1`)).rejects.toMatchObject({
      cause: { message: expect.stringMatching(/after calling end on the pool/) },
    });
  });
});
