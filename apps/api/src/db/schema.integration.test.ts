import { eq, sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createDb, type Database } from './client.ts';
import { readDatabaseUrl } from './config.ts';
import { runMigrations } from './migrate.ts';
import { products, sections } from './schema.ts';

type Tx = Parameters<Parameters<Database['db']['transaction']>[0]>[0];

// Postgres SQLSTATE codes asserted below.
const PG = {
  checkViolation: '23514',
  uniqueViolation: '23505',
  foreignKeyViolation: '23503',
  // ON DELETE RESTRICT reports restrict_violation rather than foreign_key_violation.
  restrictViolation: '23001',
  invalidTextRepresentation: '22P02',
} as const;

class Rollback extends Error {}

let database: Database;

// Runs `fn` inside a transaction that is always rolled back, so tests leave no rows behind.
async function inRollback(fn: (tx: Tx) => Promise<unknown>): Promise<void> {
  try {
    await database.db.transaction(async (tx) => {
      await fn(tx);
      throw new Rollback();
    });
  } catch (error) {
    if (!(error instanceof Rollback)) throw error;
  }
}

// Drizzle wraps driver errors as "Failed query"; the pg error with code/constraint is the cause.
function pgError(code: string, constraint?: string) {
  return { cause: expect.objectContaining({ code, ...(constraint ? { constraint } : {}) }) };
}

async function insertSection(tx: Tx, values: Partial<typeof sections.$inferInsert> = {}) {
  const [section] = await tx
    .insert(sections)
    .values({ name: 'Hortifruti', order: 1, ...values })
    .returning();
  if (!section) throw new Error('section insert returned no row');
  return section;
}

async function insertProduct(
  tx: Tx,
  sectionId: string,
  values: Partial<typeof products.$inferInsert> = {},
) {
  const [product] = await tx
    .insert(products)
    .values({
      name: 'Frango',
      sectionId,
      baseUnit: 'g',
      packageSize: 1000,
      packageName: 'bandeja',
      ...values,
    })
    .returning();
  if (!product) throw new Error('product insert returned no row');
  return product;
}

beforeAll(async () => {
  database = createDb(readDatabaseUrl());
  await runMigrations(database);
});

afterAll(async () => {
  await database.close();
});

describe('sections', () => {
  it('stores a section with a database-generated uuid and timestamps', async () => {
    await inRollback(async (tx) => {
      const section = await insertSection(tx);

      expect(section.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(section).toMatchObject({ name: 'Hortifruti', order: 1 });
      expect(section.createdAt).toBeInstanceOf(Date);
      expect(section.updatedAt).toBeInstanceOf(Date);
    });
  });

  it('allows two sections to share the same order', async () => {
    await inRollback(async (tx) => {
      await insertSection(tx, { name: 'Hortifruti', order: 1 });

      await expect(insertSection(tx, { name: 'Padaria', order: 1 })).resolves.toBeDefined();
    });
  });

  it('rejects a negative order', async () => {
    await expect(inRollback((tx) => insertSection(tx, { order: -1 }))).rejects.toMatchObject(
      pgError(PG.checkViolation, 'sections_order_non_negative'),
    );
  });

  it('rejects a blank name', async () => {
    await expect(inRollback((tx) => insertSection(tx, { name: '   ' }))).rejects.toMatchObject(
      pgError(PG.checkViolation, 'sections_name_not_blank'),
    );
  });

  it('rejects a duplicate name, ignoring case', async () => {
    await expect(
      inRollback(async (tx) => {
        await insertSection(tx, { name: 'Padaria' });
        await insertSection(tx, { name: 'PADARIA' });
      }),
    ).rejects.toMatchObject(pgError(PG.uniqueViolation, 'sections_name_unique'));
  });

  it('cannot be deleted while products reference it', async () => {
    await expect(
      inRollback(async (tx) => {
        const section = await insertSection(tx);
        await insertProduct(tx, section.id);
        await tx.delete(sections).where(eq(sections.id, section.id));
      }),
    ).rejects.toMatchObject(pgError(PG.restrictViolation, 'products_section_id_fk'));
  });
});

describe('products', () => {
  it('stores a valid product with defaults', async () => {
    await inRollback(async (tx) => {
      const section = await insertSection(tx);
      const product = await insertProduct(tx, section.id);

      expect(product).toMatchObject({
        name: 'Frango',
        sectionId: section.id,
        baseUnit: 'g',
        packageSize: 1000,
        packageName: 'bandeja',
        isRecurring: false,
      });
      expect(product.id).toMatch(/^[0-9a-f-]{36}$/);
    });
  });

  it.each(['g', 'ml', 'un'] as const)('accepts the base unit %s', async (baseUnit) => {
    await inRollback(async (tx) => {
      const section = await insertSection(tx);

      await expect(insertProduct(tx, section.id, { baseUnit })).resolves.toMatchObject({
        baseUnit,
      });
    });
  });

  it('rejects a base unit outside g, ml and un', async () => {
    await expect(
      inRollback(async (tx) => {
        const section = await insertSection(tx);
        await tx.execute(sql`
          insert into products (name, section_id, base_unit, package_size, package_name)
          values ('Arroz', ${section.id}, 'kg', 5, 'pacote')
        `);
      }),
    ).rejects.toMatchObject(pgError(PG.invalidTextRepresentation));
  });

  it.each([0, -500])('rejects a package size of %i', async (packageSize) => {
    await expect(
      inRollback(async (tx) => {
        const section = await insertSection(tx);
        await insertProduct(tx, section.id, { packageSize });
      }),
    ).rejects.toMatchObject(pgError(PG.checkViolation, 'products_package_size_positive'));
  });

  it('rejects a fractional package size', async () => {
    await expect(
      inRollback(async (tx) => {
        const section = await insertSection(tx);
        await insertProduct(tx, section.id, { packageSize: 1.5 });
      }),
    ).rejects.toMatchObject(pgError(PG.invalidTextRepresentation));
  });

  it('rejects a blank name', async () => {
    await expect(
      inRollback(async (tx) => {
        const section = await insertSection(tx);
        await insertProduct(tx, section.id, { name: '' });
      }),
    ).rejects.toMatchObject(pgError(PG.checkViolation, 'products_name_not_blank'));
  });

  it('rejects a blank package name', async () => {
    await expect(
      inRollback(async (tx) => {
        const section = await insertSection(tx);
        await insertProduct(tx, section.id, { packageName: '  ' });
      }),
    ).rejects.toMatchObject(pgError(PG.checkViolation, 'products_package_name_not_blank'));
  });

  it('rejects a duplicate name, ignoring case', async () => {
    await expect(
      inRollback(async (tx) => {
        const section = await insertSection(tx);
        await insertProduct(tx, section.id, { name: 'Café' });
        await insertProduct(tx, section.id, { name: 'café' });
      }),
    ).rejects.toMatchObject(pgError(PG.uniqueViolation, 'products_name_unique'));
  });

  it('rejects a section that does not exist', async () => {
    await expect(
      inRollback((tx) => insertProduct(tx, '01960000-0000-7000-8000-000000000000')),
    ).rejects.toMatchObject(pgError(PG.foreignKeyViolation, 'products_section_id_fk'));
  });

  it('refreshes updatedAt when the row changes', async () => {
    await inRollback(async (tx) => {
      const section = await insertSection(tx);
      const product = await insertProduct(tx, section.id);

      const [updated] = await tx
        .update(products)
        .set({ isRecurring: true })
        .where(eq(products.id, product.id))
        .returning();

      expect(updated?.isRecurring).toBe(true);
      expect(updated?.updatedAt.getTime()).toBeGreaterThan(product.updatedAt.getTime());
    });
  });
});
