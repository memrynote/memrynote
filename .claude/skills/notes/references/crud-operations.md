# Note CRUD Operations

## Create Note

### Input Schema

```typescript
interface NoteCreateInput {
  title: string
  content?: string
  folder?: string                      // Defaults to config.defaultNoteFolder
  tags?: string[]
  template?: string                    // Template ID to apply
  properties?: Record<string, unknown> // Custom properties
}
```

### Workflow (`src/main/vault/notes.ts:createNote`)

1. **Resolve template** - Check explicit template or folder default
2. **Generate path** - `generateNotePath(notesDir, title, folder)`
3. **Ensure unique** - `generateUniquePath(filePath)`
4. **Merge tags** - Combine template tags with input tags
5. **Create frontmatter**:
   ```typescript
   {
     id: crypto.randomUUID(),
     title,
     created: new Date().toISOString(),
     modified: new Date().toISOString(),
     tags: mergedTags,
     properties  // If any
   }
   ```
6. **Serialize** - `serializeNote(frontmatter, content)`
7. **Atomic write** - `atomicWrite(filePath, fileContent)`
8. **Sync cache** - `syncNoteToCache(db, {...}, { isNew: true })`
9. **Ensure tag definitions** - `ensureTagDefinitions(dataDb, mergedTags)`
10. **Emit event** - `NotesChannels.events.CREATED`
11. **Queue embedding** - `queueEmbeddingUpdate(noteId)`
12. **Init CRDT** - `crdtProvider.getOrCreateDoc(noteId)`

### IPC Channel

```typescript
NotesChannels.invoke.CREATE // 'notes:create'
```

## Update Note

### Input Schema

```typescript
interface NoteUpdateInput {
  id: string
  title?: string
  content?: string
  tags?: string[]
  frontmatter?: Record<string, unknown>
  properties?: Record<string, unknown>
  emoji?: string | null
}
```

### Workflow (`src/main/vault/notes.ts:updateNote`)

1. **Get existing** - `getNoteById(id)` or throw NOT_FOUND
2. **Merge changes** - Combine existing with input
3. **Maybe snapshot** - `maybeCreateSignificantSnapshot()` if content differs significantly
4. **Update frontmatter** - Set new modified timestamp
5. **Serialize** - `serializeNote(newFrontmatter, newContent)`
6. **Atomic write** - `atomicWrite(absolutePath, fileContent)`
7. **Sync cache** - `syncNoteToCache(db, {...}, { isNew: false })`
8. **Emit event** - `NotesChannels.events.UPDATED`
9. **Maybe emit tags-changed** - If tags modified
10. **Queue embedding** - If content changed

### IPC Channel

```typescript
NotesChannels.invoke.UPDATE // 'notes:update'
```

## Delete Note

### Workflow (`src/main/vault/notes.ts:deleteNote`)

1. **Get cached** - `getNoteCacheById(db, id)` or throw NOT_FOUND
2. **Delete file** - `deleteFile(absolutePath)`
3. **Delete from cache** - `deleteNoteFromCache(db, id)` (handles links, tags cleanup)
4. **Clear CRDT** - `crdtProvider.clearDoc(id)`
5. **Emit event** - `NotesChannels.events.DELETED`

### Cascade Behavior

Deleting a note automatically removes:
- `note_cache` row
- `note_tags` rows (via CASCADE)
- `note_links` rows where `sourceId = id` (via CASCADE)
- `note_properties` rows
- Associated Y.Doc

### IPC Channel

```typescript
NotesChannels.invoke.DELETE // 'notes:delete'
```

## Rename Note

### Workflow (`src/main/vault/notes.ts:renameNote`)

1. **Get existing** - Verify note exists
2. **Generate new path** - Keep folder, change filename
3. **Update frontmatter title**
4. **Rename file** - `fs.rename(oldPath, newPath)`
5. **Update cache path**
6. **Emit event** - `NotesChannels.events.RENAMED`

### IPC Channel

```typescript
NotesChannels.invoke.RENAME // 'notes:rename'
```

## Move Note

### Workflow (`src/main/vault/notes.ts:moveNote`)

1. **Get existing** - Verify note exists
2. **Calculate new path** - New folder + same filename
3. **Ensure folder exists** - `mkdirp(newFolder)`
4. **Move file** - `fs.rename(oldPath, newPath)`
5. **Update cache path**
6. **Emit event** - `NotesChannels.events.MOVED`

### IPC Channel

```typescript
NotesChannels.invoke.MOVE // 'notes:move'
```

## Events

All events emitted via IPC to renderer windows:

```typescript
// Event payloads
NoteCreatedEvent: { note: NoteListItem, source: 'internal' | 'external' }
NoteUpdatedEvent: { id, changes, source }
NoteDeletedEvent: { id, path, source }
NoteRenamedEvent: { id, oldTitle, newTitle, oldPath, newPath }
NoteMovedEvent:   { id, oldPath, newPath }
```

## Error Handling

```typescript
enum NoteErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  INVALID_PATH = 'INVALID_PATH',
  WRITE_FAILED = 'WRITE_FAILED'
}

class NoteError extends Error {
  constructor(message: string, code: NoteErrorCode, noteId?: string)
}
```
