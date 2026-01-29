# Frontmatter Schema

## Structure

YAML frontmatter is enclosed in `---` delimiters at the start of markdown files.

```markdown
---
id: 550e8400-e29b-41d4-a716-446655440000
title: My Note Title
created: 2024-01-15T10:30:00.000Z
modified: 2024-01-15T14:45:00.000Z
tags:
  - project/work
  - status/active
aliases:
  - my-note
  - alternate-title
# Custom properties
status: draft
priority: 1
due: 2024-02-01
url: https://example.com
---

Note content starts here...
```

## Reserved Keys

These keys are managed by Memry and have special meaning:

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `id` | `string` | Yes | UUID v4, unique identifier |
| `title` | `string` | Yes | Display title |
| `created` | `string` | Yes | ISO 8601 timestamp |
| `modified` | `string` | Yes | ISO 8601 timestamp |
| `tags` | `string[]` | No | Array of tags |
| `aliases` | `string[]` | No | Alternative titles for linking |

## Custom Properties

Any non-reserved key becomes a custom property.

### Property Types

```typescript
type PropertyType = 'TEXT' | 'NUMBER' | 'CHECKBOX' | 'DATE' | 'URL'
```

Type inference (`inferPropertyType`):
- Boolean → `CHECKBOX`
- Number → `NUMBER`
- ISO date string → `DATE`
- URL string → `URL`
- Otherwise → `TEXT`

### Property Storage

Custom properties stored in `note_properties` table:
```typescript
{
  noteId: string
  name: string
  value: string   // Serialized
  type: string    // PropertyType
}
```

## Parsing Functions

### `parseNote(content: string): ParsedNote`

```typescript
interface ParsedNote {
  frontmatter: NoteFrontmatter
  content: string          // Body without frontmatter
  hadFrontmatter: boolean  // Was frontmatter present
  wasModified: boolean     // Was frontmatter auto-fixed
}
```

### `ensureFrontmatter(content, defaults): string`

Adds missing frontmatter fields:
- Generates `id` if missing
- Extracts `title` from first `#` heading or filename
- Sets `created`/`modified` to now

### `serializeNote(frontmatter, content): string`

Combines frontmatter and content into valid markdown.

## Tag Format

- Lowercase, trimmed
- Nested tags: `parent/child`
- Extracted from frontmatter `tags` array
- Also extracted from inline `#tag` in content (optional)

## Wiki Links

Extracted by `extractWikiLinks(content)`:

```typescript
[[Note Title]]           // Basic link
[[Note Title|Display]]   // Aliased link
[[folder/Note Title]]    // Path link
```

Returns array of target titles for building link graph.

## Content Hash

`generateContentHash(content)` creates MD5 hash for change detection.
Used to:
- Determine if content actually changed
- Decide if snapshot needed
- Track sync state

## Word Count

`calculateWordCount(content)` counts words excluding:
- Frontmatter
- Wiki link syntax
- Markdown formatting
