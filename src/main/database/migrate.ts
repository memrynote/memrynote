import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import path from 'path'

export function runMigrations(dbPath: string): void {
  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
  const db = drizzle(sqlite)

  const migrationsFolder = path.join(__dirname, 'drizzle')
  migrate(db, { migrationsFolder })

  sqlite.close()
}

export function runIndexMigrations(dbPath: string): void {
  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
  const db = drizzle(sqlite)

  // Index database uses the same migrations as data database
  // but only the note_cache, note_tags, note_links tables are used
  const migrationsFolder = path.join(__dirname, 'drizzle')
  migrate(db, { migrationsFolder })

  sqlite.close()
}
