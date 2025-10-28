import { pgTable, serial, timestamp } from 'drizzle-orm/pg-core';

export const example = pgTable('example', {
    id: serial('id').primaryKey(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
