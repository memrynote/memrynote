---
name: vault-file-operations
description: |
  Guide for file I/O, note CRUD, journal entries, and attachments in Memry.
  Triggers: "create note", "update note", "delete note", "read note", "note CRUD",
  "journal entry", "attachments", "frontmatter", "file watcher", "atomicWrite",
  "NoteCreateInput", "NoteUpdateInput", "file operations", "markdown files"
---

# Vault File Operations

## Atomic Write Pattern

All file writes use atomic operations to prevent data corruption:

```typescript
// src/main/vault/file-ops.ts
atomicWrite(filePath, content)
// 1. Write to temp file: {filePath}.tmp
// 2. Rename temp → target (atomic on POSIX)
```

## Note Lifecycle

```
Create → Frontmatter Generated → File Written → Cache Sync → FTS Queue → CRDT Init
Update → Snapshot (if significant) → File Written → Cache Sync → FTS Queue → CRDT Update
Delete → CRDT Cleanup → FTS Delete → Cache Delete → File Delete
```

## Key Functions

### Note CRUD (`src/main/vault/notes.ts`)

| Function | Purpose |
|----------|---------|
| `createNote(input)` | Create new note with frontmatter |
| `getNoteById(id)` | Read note by UUID |
| `getNoteByPath(path)` | Read note by relative path |
| `updateNote(input)` | Update content/metadata |
| `deleteNote(id)` | Delete note and cleanup |
| `renameNote(id, newTitle)` | Rename preserving ID |
| `moveNote(id, newPath)` | Move to different folder |

### File Operations (`src/main/vault/file-ops.ts`)

| Function | Purpose |
|----------|---------|
| `atomicWrite(path, content)` | Safe file write |
| `safeRead(path)` | Read with error handling |
| `readRequired(path)` | Read or throw |
| `fileExists(path)` | Check file exists |
| `deleteFile(path)` | Safe delete |
| `generateNotePath(title, folder)` | Create unique path |
| `sanitizeFilename(name)` | Clean filename |

## Frontmatter Structure

```yaml
---
id: uuid-v4
title: Note Title
created: 2024-01-15T10:30:00.000Z
modified: 2024-01-15T14:45:00.000Z
tags:
  - tag1
  - tag2
aliases:
  - alternate-name
# Custom properties below
status: draft
priority: high
---
```

### Reserved Keys
`id`, `title`, `created`, `modified`, `tags`, `aliases`

### Frontmatter Functions (`src/main/vault/frontmatter.ts`)

| Function | Purpose |
|----------|---------|
| `parseNote(content)` | Extract frontmatter and body |
| `serializeNote(frontmatter, content)` | Combine to markdown |
| `ensureFrontmatter(content, defaults)` | Add missing frontmatter |
| `extractTags(frontmatter)` | Get normalized tags |
| `extractProperties(frontmatter)` | Get custom properties |
| `extractWikiLinks(content)` | Find `[[links]]` |

## Journal Entries (`src/main/vault/journal.ts`)

Files named `YYYY-MM-DD.md` in the journal folder.

```typescript
interface JournalFrontmatter {
  id: string
  date: string      // 'YYYY-MM-DD'
  created: string   // ISO timestamp
  modified: string
  tags: string[]
}
```

| Function | Purpose |
|----------|---------|
| `readJournalEntry(date)` | Get entry for date |
| `writeJournalEntry(date, content)` | Create/update entry |
| `journalEntryExists(date)` | Check if entry exists |
| `getJournalPath(date)` | Get file path for date |

## Attachments (`src/main/vault/attachments.ts`)

Stored at: `attachments/{noteId}/{prefix}-{filename}`

| Function | Purpose |
|----------|---------|
| `saveAttachment(noteId, buffer, filename)` | Save file |
| `deleteAttachment(noteId, filename)` | Remove file |
| `listNoteAttachments(noteId)` | List attachments |
| `getAttachmentPath(noteId, filename)` | Get full path |

### Limits
- Max size: 50MB (`MAX_FILE_SIZE`)
- Allowed types: Images, PDFs, common docs

## File Watcher (`src/main/vault/watcher.ts`)

Watches vault for external changes using chokidar.

```typescript
class VaultWatcher {
  start(options: WatcherOptions)
  stop()
  handleFileAdd(path)
  handleFileChange(path)
  handleFileDelete(path)
}
```

### Debouncing
- Changes debounced by path (300ms default)
- Prevents duplicate events during saves
- Tracks renames via add/delete pairs

## Snapshots (Version History)

```typescript
// Constants
MAX_SNAPSHOTS_PER_NOTE = 50
MIN_SNAPSHOT_INTERVAL_MS = 60000  // 1 minute
SIGNIFICANT_WORD_CHANGE = 50      // Words changed

// Functions
createSnapshot(noteId, reason)
getVersionHistory(noteId)
restoreVersion(noteId, snapshotId)
maybeCreateSignificantSnapshot(noteId, oldContent, newContent)
```

## Reference Files

- [Note Operations](references/note-operations.md) - Complete CRUD workflow
- [Frontmatter Schema](references/frontmatter-schema.md) - YAML structure
- [File Watching](references/file-watching.md) - Watcher patterns
