---
name: notes
description: |
  Comprehensive note operations including CRUD, frontmatter parsing, wiki-links, and TipTap/BlockNote editor integration.
  Triggers: "create note", "edit note", "note content", "wiki-link", "[[links]]", "frontmatter",
  "TipTap", "BlockNote", "note editor", "backlinks", "note properties", "parseNote", "serializeNote",
  "WikiLink extension", "note linking", "content-area"
---

# Notes System

## Note Lifecycle

```
Create → Frontmatter → Write → Cache → FTS → CRDT
Update → Snapshot → Write → Cache → FTS → CRDT Update
Delete → CRDT Cleanup → Cache Delete → File Delete
```

## Key Files

| File | Purpose |
|------|---------|
| `src/main/vault/notes.ts` | Note CRUD operations |
| `src/main/vault/frontmatter.ts` | Frontmatter parsing/serialization |
| `src/shared/ipc-channels.ts` | NotesChannels definitions |
| `src/renderer/src/components/note/content-area/ContentArea.tsx` | BlockNote editor for notes |
| `src/renderer/src/components/journal/journal-editor.tsx` | TipTap editor for journal |
| `src/renderer/src/lib/wikilink-resolver.ts` | Wiki-link resolution |
| `src/shared/db/schema/notes-cache.ts` | Cache schema including `noteLinks` |

## Core Patterns

### Atomic Writes

All file writes use atomic operations:
```typescript
atomicWrite(filePath, content)  // Write to temp, then rename
```

### Cache Synchronization

After file write, sync to cache:
```typescript
syncNoteToCache(db, { id, path, fileContent, frontmatter, parsedContent }, { isNew: true/false })
```

### CRDT Integration

New notes initialize Y.Doc:
```typescript
crdtProvider.getOrCreateDoc(noteId)
```

## Wiki-Link Syntax

| Format | Example | Description |
|--------|---------|-------------|
| Basic | `[[Page Name]]` | Link by title |
| Aliased | `[[Page Name\|Display Text]]` | Custom display text |
| Path | `[[folder/Page Name]]` | Link with path hint |

### Regex Pattern
```typescript
/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g
```

## Editor Overview

- **Journal**: TipTap-based (`journal-editor.tsx`) with WikiLink extension
- **Notes**: BlockNote-based (`ContentArea.tsx`) with inline content and custom WikiLink block

Both editors support:
- Wiki-link autocomplete
- Real-time CRDT sync via `useYjsDoc` hook

## IPC Channels

Main operations via `NotesChannels.invoke.*`:
- `CREATE`, `GET`, `UPDATE`, `DELETE`
- `GET_LINKS` (outgoing + backlinks)
- `RESOLVE_BY_TITLE` (wiki-link resolution)

Events via `NotesChannels.events.*`:
- `CREATED`, `UPDATED`, `DELETED`, `RENAMED`, `MOVED`

## Reference Files

- [CRUD Operations](references/crud-operations.md) - Detailed create/update/delete workflow
- [Frontmatter](references/frontmatter.md) - Schema and parsing
- [Wiki-Links](references/wiki-links.md) - Syntax, resolution, and database schema
- [Editor Integration](references/editor-integration.md) - TipTap and BlockNote patterns
