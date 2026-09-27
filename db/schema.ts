import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
export const properties = sqliteTable('properties', {
 id: text('id').primaryKey(), ownerId: text('owner_id').notNull(),
 title: text('title').notNull(), kind: text('kind').notNull(),
 payload: text('payload').notNull(), updatedAt: text('updated_at').notNull(),
}, t => [index('idx_properties_owner_updated').on(t.ownerId,t.updatedAt)]);
