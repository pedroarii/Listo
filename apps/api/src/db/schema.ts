import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

// Units a product is counted and stored in. Display units (kg, L) and recipe measures
// (spoon, cup) are conversions on top of these, not new base units.
export const baseUnit = pgEnum('base_unit', ['g', 'ml', 'un']);

const id = () =>
  uuid('id')
    .primaryKey()
    .default(sql`uuidv7()`);

const timestamps = () => ({
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const sections = pgTable(
  'sections',
  {
    id: id(),
    name: text('name').notNull(),
    // Position along my walk through the store; ties are broken by name.
    order: integer('order').notNull(),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex('sections_name_unique').on(sql`lower(${table.name})`),
    check('sections_name_not_blank', sql`btrim(${table.name}) <> ''`),
    check('sections_order_non_negative', sql`${table.order} >= 0`),
  ],
);

export const products = pgTable(
  'products',
  {
    id: id(),
    name: text('name').notNull(),
    sectionId: uuid('section_id').notNull(),
    baseUnit: baseUnit('base_unit').notNull(),
    // Package content in baseUnit, e.g. 1000 (g) for a 1kg tray.
    packageSize: integer('package_size').notNull(),
    packageName: text('package_name').notNull(),
    isRecurring: boolean('is_recurring').notNull().default(false),
    ...timestamps(),
  },
  (table) => [
    foreignKey({
      name: 'products_section_id_fk',
      columns: [table.sectionId],
      foreignColumns: [sections.id],
    }).onDelete('restrict'),
    index('products_section_id_idx').on(table.sectionId),
    uniqueIndex('products_name_unique').on(sql`lower(${table.name})`),
    check('products_name_not_blank', sql`btrim(${table.name}) <> ''`),
    check('products_package_name_not_blank', sql`btrim(${table.packageName}) <> ''`),
    check('products_package_size_positive', sql`${table.packageSize} > 0`),
  ],
);
