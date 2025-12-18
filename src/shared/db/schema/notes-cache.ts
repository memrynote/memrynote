import { sqliteTable, text, integer, index, primaryKey } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const noteCache = sqliteTable(
  'note_cache',
  {
    id: text('id').primaryKey(),
    path: text('path').notNull().unique(),
    title: text('title').notNull(),
    contentHash: text('content_hash').notNull(),
    wordCount: integer('word_count').notNull().default(0),
    createdAt: text('created_at').notNull(),
    modifiedAt: text('modified_at').notNull(),
    indexedAt: text('indexed_at').notNull().default(sql`(datetime('now'))`)
  },
  (table) => [
    index('idx_note_cache_path').on(table.path),
    index('idx_note_cache_modified').on(table.modifiedAt)
  ]
)

export const noteTags = sqliteTable(
  'note_tags',
  {
    noteId: text('note_id')
      .notNull()
      .references(() => noteCache.id, { onDelete: 'cascade' }),
    tag: text('tag').notNull()
  },
  (table) => [
    primaryKey({ columns: [table.noteId, table.tag] }),
    index('idx_note_tags_tag').on(table.tag)
  ]
)

export const noteLinks = sqliteTable(
  'note_links',
  {
    sourceId: text('source_id')
      .notNull()
      .references(() => noteCache.id, { onDelete: 'cascade' }),
    targetId: text('target_id'),
    targetTitle: text('target_title').notNull()
  },
  (table) => [
    primaryKey({ columns: [table.sourceId, table.targetTitle] }),
    index('idx_note_links_target').on(table.targetId)
  ]
)

export type NoteCache = typeof noteCache.$inferSelect
export type NewNoteCache = typeof noteCache.$inferInsert
export type NoteTag = typeof noteTags.$inferSelect
export type NewNoteTag = typeof noteTags.$inferInsert
export type NoteLink = typeof noteLinks.$inferSelect
export type NewNoteLink = typeof noteLinks.$inferInsert
