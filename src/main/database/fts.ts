import { sql } from 'drizzle-orm'
import type { DrizzleDb } from './client'

/**
 * Creates FTS5 virtual table for full-text search on notes.
 * Must be called after migrations on index.db.
 */
export function createFtsTable(db: DrizzleDb): void {
  // FTS5 virtual table for full-text search
  db.run(sql`
    CREATE VIRTUAL TABLE IF NOT EXISTS fts_notes USING fts5(
      id UNINDEXED,
      title,
      content,
      tags,
      tokenize='porter unicode61'
    )
  `)
}

/**
 * Creates triggers to keep FTS index in sync with note_cache table.
 * Must be called after createFtsTable.
 */
export function createFtsTriggers(db: DrizzleDb): void {
  // Trigger: Insert into FTS when note is added to cache
  db.run(sql`
    CREATE TRIGGER IF NOT EXISTS note_cache_ai AFTER INSERT ON note_cache BEGIN
      INSERT INTO fts_notes (id, title, content, tags)
      VALUES (NEW.id, NEW.title, '', '');
    END
  `)

  // Trigger: Delete from FTS when note is removed from cache
  db.run(sql`
    CREATE TRIGGER IF NOT EXISTS note_cache_ad AFTER DELETE ON note_cache BEGIN
      DELETE FROM fts_notes WHERE id = OLD.id;
    END
  `)

  // Trigger: Update FTS when note title changes
  db.run(sql`
    CREATE TRIGGER IF NOT EXISTS note_cache_au AFTER UPDATE ON note_cache BEGIN
      UPDATE fts_notes SET title = NEW.title WHERE id = NEW.id;
    END
  `)
}

/**
 * Updates FTS content for a specific note.
 * Called when note content or tags change.
 */
export function updateFtsContent(
  db: DrizzleDb,
  noteId: string,
  content: string,
  tags: string[]
): void {
  const tagsStr = tags.join(' ')
  db.run(sql`
    UPDATE fts_notes
    SET content = ${content}, tags = ${tagsStr}
    WHERE id = ${noteId}
  `)
}

/**
 * Initializes FTS5 for the index database.
 * Call this after running migrations on index.db.
 */
export function initializeFts(db: DrizzleDb): void {
  createFtsTable(db)
  createFtsTriggers(db)
}
