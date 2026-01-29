# Wiki-Links

## Syntax

Wiki-links connect notes using double-bracket notation.

| Format | Example | Description |
|--------|---------|-------------|
| Basic | `[[Page Name]]` | Link by title |
| Aliased | `[[Page Name\|Display Text]]` | Custom display text |
| Path hint | `[[folder/Page Name]]` | Include folder context |

## Regex Pattern

**Location**: `src/main/vault/frontmatter.ts:extractWikiLinks`

```typescript
const linkPattern = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g
```

### Pattern Breakdown

- `\[\[` - Opening brackets (escaped)
- `([^\]|]+)` - Capture group 1: target (no `]` or `|`)
- `(?:\|[^\]]+)?` - Optional non-capturing group: `|` + alias
- `\]\]` - Closing brackets

### Extracted Target

Only the target is extracted, not the alias:
- `[[My Note]]` → `"My Note"`
- `[[My Note|Click here]]` → `"My Note"`

## extractWikiLinks()

**Location**: `src/main/vault/frontmatter.ts:199-212`

Extracts unique wiki-link targets from content.

```typescript
function extractWikiLinks(content: string): string[]
```

### Implementation

```typescript
export function extractWikiLinks(content: string): string[] {
  const linkPattern = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g
  const links = new Set<string>()
  let match: RegExpExecArray | null

  while ((match = linkPattern.exec(content)) !== null) {
    const link = match[1]
    if (link) {
      links.add(link.trim())
    }
  }

  return Array.from(links)
}
```

Returns deduplicated array of target titles.

## resolveWikiLink()

**Location**: `src/renderer/src/lib/wikilink-resolver.ts:55-108`

Resolves a wiki-link target to a note or file.

```typescript
function resolveWikiLink(target: string): Promise<ResolvedWikiLink>

interface ResolvedWikiLink {
  type: 'note' | 'file' | 'create' | 'not-found'
  id: string
  title: string
  fileType: 'markdown' | 'image' | 'pdf' | 'audio' | 'video' | 'other'
  icon: string
}
```

### Resolution Flow

1. Trim target
2. Check for known file extension
3. Query database via `notesService.resolveByTitle(target)`
4. If found: return `type: 'note'` or `type: 'file'`
5. If not found + has extension: return `type: 'not-found'`
6. If not found + no extension: return `type: 'create'` (will create new note)

### Resolution Types

| Type | Meaning |
|------|---------|
| `note` | Existing markdown note |
| `file` | Existing non-markdown file (image, PDF) |
| `create` | Target doesn't exist, will create on click |
| `not-found` | Has file extension but doesn't exist |

## Database Schema

**Location**: `src/shared/db/schema/notes-cache.ts:60-73`

```typescript
export const noteLinks = sqliteTable(
  'note_links',
  {
    sourceId: text('source_id')
      .notNull()
      .references(() => noteCache.id, { onDelete: 'cascade' }),
    targetId: text('target_id'),        // Null if target doesn't exist
    targetTitle: text('target_title').notNull()
  },
  (table) => [
    primaryKey({ columns: [table.sourceId, table.targetTitle] }),
    index('idx_note_links_target').on(table.targetId)
  ]
)
```

### Key Points

- `sourceId`: Note containing the link (FK to `note_cache`)
- `targetId`: Resolved note ID (can be NULL for broken links)
- `targetTitle`: Original link text (always stored)
- Cascade delete when source note is deleted

## Backlinks Query

Get all notes linking TO a specific note:

```typescript
// Via IPC
const links = await notesService.getLinks(noteId)
// Returns { outgoing: WikiLink[], incoming: WikiLink[] }
```

### SQL Pattern

```sql
-- Incoming links (backlinks)
SELECT nc.* FROM note_cache nc
JOIN note_links nl ON nl.source_id = nc.id
WHERE nl.target_id = ?
```

## Link Extraction on Save

When a note is saved:

1. `extractWikiLinks(content)` gets all targets
2. `syncNoteToCache()` updates `note_links` table
3. Old links removed, new links inserted
4. `targetId` resolved if target note exists

## Aliases Support

Notes can have aliases in frontmatter:

```yaml
aliases:
  - alternate-name
  - another-title
```

Wiki-links resolve against both `title` and `aliases`:
- `[[My Note]]` matches title
- `[[alternate-name]]` matches alias of "My Note"

## IPC Channels

```typescript
NotesChannels.invoke.GET_LINKS       // 'notes:get-links'
NotesChannels.invoke.RESOLVE_BY_TITLE // 'notes:resolve-by-title'
```
