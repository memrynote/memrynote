# Note Operations

## Create Note Workflow

```typescript
interface NoteCreateInput {
  title: string
  content?: string
  folder?: string       // Defaults to config.defaultNoteFolder
  tags?: string[]
  properties?: Record<string, unknown>
  template?: string     // Optional template to use
}
```

### Sequence

1. **Generate path** - `generateNotePath(title, folder)`
2. **Create frontmatter**:
   ```typescript
   {
     id: crypto.randomUUID(),
     title,
     created: new Date().toISOString(),
     modified: new Date().toISOString(),
     tags: tags ?? []
   }
   ```
3. **Serialize** - `serializeNote(frontmatter, content)`
4. **Write file** - `atomicWrite(absolutePath, markdown)`
5. **Sync to cache** - Insert into `note_cache`
6. **Queue FTS** - `queueFtsUpdate(noteId, content, tags)`
7. **Init CRDT** - If sync enabled
8. **Emit event** - `emitNoteEvent('created', note)`

## Read Note

```typescript
// By ID (preferred)
const note = await getNoteById(id)

// By path
const note = await getNoteByPath(relativePath)
```

### Note Interface

```typescript
interface Note {
  id: string
  title: string
  content: string
  path: string          // Relative to vault
  created: string       // ISO timestamp
  modified: string
  tags: string[]
  aliases: string[]
  emoji?: string
  properties: Record<string, unknown>
  frontmatter: NoteFrontmatter
  wordCount: number
}
```

## Update Note Workflow

```typescript
interface NoteUpdateInput {
  id: string
  title?: string
  content?: string
  tags?: string[]
  emoji?: string
  properties?: Record<string, unknown>
  frontmatter?: Partial<NoteFrontmatter>
}
```

### Sequence

1. **Read existing** - Get current note
2. **Maybe snapshot** - `maybeCreateSignificantSnapshot()` if content changed
3. **Merge changes** - Update frontmatter.modified
4. **Serialize** - `serializeNote(newFrontmatter, newContent)`
5. **Write file** - `atomicWrite()`
6. **Sync cache** - Update `note_cache`
7. **Queue FTS** - `queueFtsUpdate()`
8. **Update CRDT** - If sync enabled
9. **Emit event** - `emitNoteEvent('updated', note, changes)`

## Delete Note Workflow

1. **Cleanup CRDT** - Remove from sync
2. **Delete FTS** - `deleteFtsNote(id)`
3. **Delete cache** - Remove from `note_cache`, `note_tags`, `note_links`
4. **Delete attachments** - `deleteNoteAttachments(id)`
5. **Delete file** - `deleteFile(absolutePath)`
6. **Emit event** - `emitNoteEvent('deleted', { id, path })`

## Rename vs Move

### Rename (`renameNote`)
- Changes title and filename
- Keeps same folder
- Updates frontmatter title
- Updates cache

### Move (`moveNote`)
- Changes folder/path
- Keeps same title
- Updates cache path

## List Notes

```typescript
interface NoteListOptions {
  folder?: string
  tags?: string[]
  sortBy?: 'title' | 'created' | 'modified'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
  includeProperties?: boolean
}

interface NoteListResponse {
  notes: NoteListItem[]
  total: number
  hasMore: boolean
}
```

## Event System

```typescript
type NoteEventType = 'created' | 'updated' | 'deleted' | 'moved' | 'renamed'

// Emitted via IPC to renderer
emitNoteEvent(type, note, changes?)
```

Renderer subscribes via `window.api.notes.onNoteEvent(callback)`.
