# Database Architecture

## Two-Database Design

Memry uses two SQLite databases per vault:

| Database | File | Purpose | Rebuildable |
|----------|------|---------|-------------|
| **data.db** | `.memry/data.db` | Source of truth | No |
| **index.db** | `.memry/index.db` | Search/cache | Yes |

## data.db (Source of Truth)

Contains persistent data that cannot be reconstructed from files:
- Tasks
- Task lists
- User preferences
- Sync state (CRDT)

**Never delete or rebuild** - data loss would occur.

## index.db (Cache Layer)

Contains data derived from vault files:

### Tables

| Table | Purpose |
|-------|---------|
| `note_cache` | Cached note metadata (path, title, dates, word count) |
| `note_tags` | Tag associations |
| `note_links` | Wiki-link relationships (source → target) |
| `note_properties` | Custom frontmatter properties |
| `note_snapshots` | Version history |
| `fts_notes` | FTS5 virtual table for full-text search |

### Schema Highlights

```typescript
// note_cache - src/shared/db/schema/notes-cache.ts
{
  id: string           // Note UUID from frontmatter
  path: string         // Relative path in vault
  title: string
  snippet: string      // First 200 chars of content
  wordCount: integer
  characterCount: integer
  contentHash: string  // For change detection
  createdAt: integer   // Unix timestamp
  modifiedAt: integer
  indexedAt: integer   // When last indexed
  fileType: string     // 'note' | 'journal' | 'file'
  fileSize: integer
  mimeType: string
  emoji: string        // Optional emoji icon
  date: string         // For journal entries (YYYY-MM-DD)
}
```

## Initialization Order

1. **data.db first** - Contains tasks, must exist
2. **index.db second** - Depends on data.db being ready
3. **Run migrations** - Drizzle handles both databases
4. **Initialize FTS** - Create FTS5 table and triggers

## Database Client

```typescript
// src/main/database/client.ts
getDataDb()   // Returns Drizzle client for data.db
getIndexDb()  // Returns Drizzle client for index.db
getRawDb()    // Returns raw better-sqlite3 for FTS operations
```

## Migration System

Migrations are managed by Drizzle ORM:
- Schema files in `src/shared/db/schema/`
- Data schema in `src/shared/db/schema/data.ts`
- Index schema in `src/shared/db/schema/notes-cache.ts`

## Rebuilding index.db

When index.db is corrupted or needs refresh:
1. Close database connections
2. Delete `index.db`
3. Call `openVault()` - will detect missing index and rebuild
4. `rebuildIndex()` scans all vault files and populates cache

The `needsInitialIndex()` function checks if index.db needs population.
