import { mysqlTable, serial, varchar, timestamp, uniqueIndex, int, bigint, text, mysqlEnum, boolean } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// ตารางเก็บ Products
export const products = mysqlTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  productId: varchar('product_id', { length: 100 }).notNull().unique(), // Unique product identifier
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
}, (table) => ({
  productIdIndex: uniqueIndex('product_id_idx').on(table.productId),
}));

// ตารางเก็บ License Keys ที่คุณจะแจกจ่าย
export const licenses = mysqlTable('licenses', {
  id: serial('id').primaryKey(),
  licenseKey: varchar('license_key', { length: 255 }).notNull().unique(),
  productId: varchar('product_id', { length: 100 }).notNull().references(() => products.productId), // Reference to product
  status: mysqlEnum('status', ['available', 'activated', 'expired', 'revoked'])
    .notNull()
    .default('available'),
  enabled: boolean('enabled').notNull().default(true), // Admin can disable/enable
  notes: text('notes'), // Optional notes for admin
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').onUpdateNow(),
}, (table) => ({
  keyIndex: uniqueIndex('key_idx').on(table.licenseKey),
}));

// ตารางเก็บข้อมูลการ Activate (ผูกกับ HWID)
export const activations = mysqlTable('activations', {
  id: serial('id').primaryKey(),
  licenseId: bigint('license_id', { mode: 'number', unsigned: true }).notNull().references(() => licenses.id, { onDelete: 'cascade' }),
  // **สำคัญ:** เราไม่เก็บ Hardware ID ตรงๆ แต่เก็บค่า Hash ของมัน
  hardwareIdHash: text('hardware_id_hash').notNull(),
  // "Hash Key" ที่จะส่งกลับไปให้ Client (เป็น Token ยืนยัน)
  activationToken: varchar('activation_token', { length: 255 }).notNull().unique(),
  // Customer information (optional, for support center)
  customerEmail: varchar('customer_email', { length: 255 }),
  customerName: varchar('customer_name', { length: 255 }),
  activatedAt: timestamp('activated_at').defaultNow().notNull(),
}, (table) => ({
  tokenIndex: uniqueIndex('token_idx').on(table.activationToken),
}));

// Relations
export const productsRelations = relations(products, ({ many }) => ({
  licenses: many(licenses),
}));

export const licensesRelations = relations(licenses, ({ one, many }) => ({
  product: one(products, {
    fields: [licenses.productId],
    references: [products.productId],
  }),
  activations: many(activations),
}));

export const activationsRelations = relations(activations, ({ one }) => ({
  license: one(licenses, {
    fields: [activations.licenseId],
    references: [licenses.id],
  }),
}));

