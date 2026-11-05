import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

export interface Database {
  db: NodePgDatabase<typeof schema>;
  close: () => Promise<void>;
}

export function createDb(url: string): Database {
  const pool = new Pool({ connectionString: url });
  return {
    db: drizzle(pool, { schema }),
    close: () => pool.end(),
  };
}
