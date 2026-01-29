---
name: vault-indexing
description: |
  Guide for search indexing, FTS5, and cache synchronization in Memry.
  Triggers: "search notes", "full-text search", "FTS", "indexing", "reindex",
  "searchNotes", "quickSearch", "advancedSearch", "note_cache", "fts_notes",
  "index.db", "search queries", "rebuild index", "cache sync"
---

# Vault Indexing

## Index Database (index.db)

Rebuildable cache containing:

| Table | Purpose |
|-------|---------|
| `note_cache` | Note metadata cache |
| `note_tags` | Tag associations |
| `note_links` | Wiki-link graph |
| `note_properties` | Custom frontmatter properties |
| `note_snapshots` | Version history |
| `fts_notes` | FTS5 virtual table |

## FTS5 Setup

```sql
-- Created by createFtsTable() in src/main/database/fts.ts
CREATE VIRTUAL TABLE fts_notes USING fts5(
  note_id UNINDEXED,
  title,
  content,
  tags,
  tokenize='porter'
);
```

### FTS Triggers

Auto-sync cache changes to FTS:

```sql
-- Insert trigger
CREATE TRIGGER fts_notes_insert AFTER INSERT ON note_cache
BEGIN
  INSERT INTO fts_notes(note_id, title, content, tags)
  VALUES (NEW.id, NEW.title, '', '');
END;

-- Update trigger
CREATE TRIGGER fts_notes_update AFTER UPDATE ON note_cache
BEGIN
  UPDATE fts_notes SET title = NEW.title WHERE note_id = NEW.id;
END;

-- Delete trigger
CREATE TRIGGER fts_notes_delete AFTER DELETE ON note_cache
BEGIN
  DELETE FROM fts_notes WHERE note_id = OLD.id;
END;
```

## FTS Queue (`src/main/database/fts-queue.ts`)

Batches FTS updates to reduce I/O:

```typescript
const FLUSH_DELAY_MS = 2000  // 2-second batching

queueFtsUpdate(noteId, content, tags)
// Adds to pending queue, schedules flush

flushFtsUpdates()
// Writes all pending updates to FTS

cancelPendingFtsUpdates()
// Clear queue (used on vault close)

getPendingFtsCount(): number
hasPendingFtsUpdates(): boolean
```

## Search Functions (`src/shared/db/queries/search.ts`)

### Quick Search

```typescript
quickSearch(query: string): QuickSearchResult
// Fast title + snippet search
// Returns: { notes: NoteListItem[] }
```

### Full Search

```typescript
searchNotes(query: string, options?: SearchOptions): SearchResultNote[]

interface SearchOptions {
  folder?: string
  tags?: string[]
  limit?: number
  offset?: number
}

interface SearchResultNote {
  id: string
  title: string
  path: string
  snippet: string
  score: number
  tags: string[]
  matchedIn: string[]  // 'title' | 'content' | 'tags'
  createdAt: number
  modifiedAt: number
}
```

### Advanced Search

```typescript
advancedSearch(options: AdvancedSearchOptions): AdvancedSearchResultNote[]

interface AdvancedSearchOptions {
  text?: string
  titleOnly?: boolean
  folder?: string
  tags?: string[]
  dateFrom?: string
  dateTo?: string
  sortBy?: 'relevance' | 'modified' | 'created' | 'title'
  sortDirection?: 'asc' | 'desc'
  limit?: number
  offset?: number
  operators?: {
    tags?: string[]      // AND tags
    excludeTags?: string[]
  }
}
```

## Query Escaping

```typescript
escapeSearchQuery(query: string): string
// Escapes FTS5 special characters: " ' * - + ( )

buildPrefixQuery(query: string): string
// Converts "word1 word2" → "word1* word2*"
// Enables prefix matching
```

## Indexing Functions (`src/main/vault/indexer.ts`)

### Initial Index

```typescript
indexVault(vaultPath: string): Promise<IndexResult>
// Scans entire vault, populates cache + FTS

interface IndexResult {
  indexed: number
  skipped: number
  errors: string[]
}
```

### Rebuild Index

```typescript
rebuildIndex(): Promise<RebuildResult>
// 1. Clear all cache tables
// 2. Clear FTS table
// 3. Re-scan vault
// 4. Rebuild cache + FTS

interface RebuildResult {
  filesIndexed: number
  duration: number
}
```

### File Indexing

```typescript
indexMarkdownFile(absolutePath, relativePath)
// Parse, extract frontmatter, insert cache, queue FTS

indexNonMarkdownFile(absolutePath, relativePath)
// Insert file metadata (no FTS)

needsInitialIndex(): boolean
// Check if index.db is empty
```

## Health Checks

```typescript
isFtsHealthy(): boolean
// Verify FTS table exists and is queryable

getSearchableCount(): number
// Count of notes in FTS

getFtsCount(): number
// Count of FTS entries
```

## Cache Tables Schema

### note_cache

```typescript
{
  id: string           // Note UUID
  path: string         // Relative path
  title: string
  snippet: string      // First ~200 chars
  wordCount: integer
  characterCount: integer
  contentHash: string  // MD5 for change detection
  createdAt: integer   // Unix timestamp
  modifiedAt: integer
  indexedAt: integer   // Last index time
  fileType: string     // 'note' | 'journal' | 'file'
  fileSize: integer
  mimeType: string
  emoji: string?
  date: string?        // For journal (YYYY-MM-DD)
}
```

### note_tags

```typescript
{
  noteId: string
  tag: string
  pinnedAt: integer?   // For pinned tags
}
```

### note_links

```typescript
{
  sourceId: string
  targetId: string
  targetTitle: string
}
```

## Reference Files

- [Index Schema](references/index-schema.md) - Complete table definitions
- [Search API](references/search-api.md) - Search function details
- [FTS Maintenance](references/fts-maintenance.md) - Triggers and queue
