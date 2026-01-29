# FTS Maintenance

## FTS5 Table Creation

```typescript
// src/main/database/fts.ts
function createFtsTable(): void {
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS fts_notes USING fts5(
      note_id UNINDEXED,
      title,
      content,
      tags,
      tokenize='porter'
    )
  `)
}
```

### Tokenizer

Uses Porter stemmer for better matching:
- "running" matches "run"
- "files" matches "file"

## FTS Triggers

### Insert Trigger

```sql
CREATE TRIGGER IF NOT EXISTS fts_notes_insert
AFTER INSERT ON note_cache
BEGIN
  INSERT INTO fts_notes(note_id, title, content, tags)
  VALUES (NEW.id, NEW.title, '', '');
END;
```

Note: Content and tags are populated by the FTS queue, not the trigger.

### Update Trigger

```sql
CREATE TRIGGER IF NOT EXISTS fts_notes_update
AFTER UPDATE ON note_cache
BEGIN
  UPDATE fts_notes SET title = NEW.title WHERE note_id = NEW.id;
END;
```

### Delete Trigger

```sql
CREATE TRIGGER IF NOT EXISTS fts_notes_delete
AFTER DELETE ON note_cache
BEGIN
  DELETE FROM fts_notes WHERE note_id = OLD.id;
END;
```

## FTS Queue

Batches content updates for performance.

```typescript
// src/main/database/fts-queue.ts

const FLUSH_DELAY_MS = 2000

interface FtsUpdate {
  noteId: string
  content: string
  tags: string[]
}

let pendingUpdates: Map<string, FtsUpdate> = new Map()
let flushTimer: NodeJS.Timeout | null = null
```

### Queue Update

```typescript
function queueFtsUpdate(noteId: string, content: string, tags: string[]): void {
  pendingUpdates.set(noteId, { noteId, content, tags })
  scheduleFlush()
}

function scheduleFlush(): void {
  if (flushTimer) return
  flushTimer = setTimeout(() => {
    flushTimer = null
    flushFtsUpdates()
  }, FLUSH_DELAY_MS)
}
```

### Flush Updates

```typescript
function flushFtsUpdates(): void {
  if (pendingUpdates.size === 0) return

  const updates = Array.from(pendingUpdates.values())
  pendingUpdates.clear()

  for (const update of updates) {
    updateFtsContent(update.noteId, update.content, update.tags.join(' '))
  }
}
```

### Update FTS Content

```typescript
// src/main/database/fts.ts
function updateFtsContent(noteId: string, content: string, tags: string): void {
  db.prepare(`
    UPDATE fts_notes
    SET content = ?, tags = ?
    WHERE note_id = ?
  `).run(content, tags, noteId)
}
```

## Queue Management

```typescript
function cancelPendingFtsUpdates(): void
// Clear queue without flushing (used on vault close)

function hasPendingFtsUpdates(): boolean
// Check if updates are pending

function getPendingFtsCount(): number
// Count of pending updates
```

## Direct FTS Operations

```typescript
function insertFtsNote(noteId: string, title: string, content: string, tags: string): void
function deleteFtsNote(noteId: string): void
function ftsNoteExists(noteId: string): boolean
function getFtsCount(): number
function clearFtsTable(): void
```

## Index Rebuild Process

```typescript
async function rebuildIndex(): Promise<RebuildResult> {
  // 1. Cancel pending FTS updates
  cancelPendingFtsUpdates()

  // 2. Clear all cache tables
  await clearNoteCache()

  // 3. Clear FTS table
  clearFtsTable()

  // 4. Re-scan vault
  const files = await findVaultFiles(vaultPath)

  // 5. Index each file
  for (const file of files) {
    await indexFile(file)
  }

  // 6. Flush FTS queue
  flushFtsUpdates()
}
```

## Health Checks

```typescript
function isFtsHealthy(): boolean {
  try {
    db.prepare('SELECT count(*) FROM fts_notes').get()
    return true
  } catch {
    return false
  }
}

function getSearchableCount(): number {
  return db.prepare('SELECT count(*) as count FROM fts_notes').get().count
}
```

## Troubleshooting

### FTS Table Corrupted

1. Close vault
2. Delete `index.db`
3. Reopen vault (triggers rebuild)

### Content Not Searchable

1. Check `getPendingFtsCount()` for queued updates
2. Call `flushFtsUpdates()` to force flush
3. Verify `ftsNoteExists(noteId)`

### Search Returns No Results

1. Check `getSearchableCount()` > 0
2. Verify query escaping with `escapeSearchQuery()`
3. Check FTS triggers exist with `PRAGMA trigger_list`
