import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const inboxItems = sqliteTable(
  'inbox_items',
  {
    id: text('id').primaryKey(),
    type: text('type').notNull(),
    content: text('content').notNull(),
    metadata: text('metadata', { mode: 'json' }),
    createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
    filedAt: text('filed_at')
  },
  (table) => [index('idx_inbox_type').on(table.type)]
)

export type InboxItem = typeof inboxItems.$inferSelect
export type NewInboxItem = typeof inboxItems.$inferInsert
