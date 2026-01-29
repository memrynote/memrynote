# Frontmatter

## NoteFrontmatter Interface

```typescript
// src/main/vault/frontmatter.ts
interface NoteFrontmatter {
  id: string              // UUID v4, required
  title?: string          // Display title
  created: string         // ISO 8601 timestamp
  modified: string        // ISO 8601 timestamp
  tags?: string[]         // Array of tag strings
  aliases?: string[]      // Alternative titles for linking
  [key: string]: unknown  // Custom properties allowed
}
```

## Reserved Keys

These keys have special meaning and are managed by Memry:

| Key | Type | Description |
|-----|------|-------------|
| `id` | `string` | UUID v4, auto-generated if missing |
| `title` | `string` | Display title, extracted from `#` heading if missing |
| `created` | `string` | ISO timestamp, set on creation |
| `modified` | `string` | ISO timestamp, updated on every save |
| `tags` | `string[]` | Note tags, normalized to lowercase |
| `aliases` | `string[]` | Alternative titles for wiki-link resolution |
| `emoji` | `string` | Visual icon for the note |
| `properties` | `object` | Custom properties container |

## Example Frontmatter

```yaml
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
emoji: "\U+1F4DD"
properties:
  status: draft
  priority: 1
  due: 2024-02-01
---

Note content starts here...
```

## parseNote()

**Location**: `src/main/vault/frontmatter.ts:52-97`

Parses markdown file content into frontmatter and body.

```typescript
function parseNote(content: string): ParsedNote

interface ParsedNote {
  frontmatter: NoteFrontmatter
  content: string          // Body without frontmatter
  hadFrontmatter: boolean  // Was frontmatter present in original
  wasModified: boolean     // Was frontmatter auto-fixed
}
```

### Auto-Generation Behavior

If frontmatter is missing or incomplete, `parseNote` auto-generates:

1. **Missing `id`**: Generates `crypto.randomUUID()`
2. **Missing `title`**: Extracts from first `#` heading or uses "Untitled"
3. **Missing `created`/`modified`**: Sets to current ISO timestamp
4. **Sets `wasModified: true`**: When any field was auto-generated

## serializeNote()

**Location**: `src/main/vault/frontmatter.ts:127-136`

Combines frontmatter and content into valid markdown.

```typescript
function serializeNote(frontmatter: NoteFrontmatter, content: string): string
```

### Behavior

1. Updates `modified` timestamp to current time
2. Serializes frontmatter as YAML
3. Wraps in `---` delimiters
4. Appends content with proper newline separation

### Output Format

```markdown
---
id: uuid
title: Title
created: 2024-01-15T10:30:00.000Z
modified: 2024-01-15T14:45:00.000Z
tags:
  - tag1
---

Content here...
```

## extractProperties()

Extracts custom properties from frontmatter (non-reserved keys).

```typescript
function extractProperties(frontmatter: NoteFrontmatter): Record<string, unknown>
```

### Property Type Inference

Uses `inferPropertyType(value)`:

| Value Type | Inferred Type |
|------------|---------------|
| `true`/`false` | `CHECKBOX` |
| Number | `NUMBER` |
| ISO date string | `DATE` |
| URL string (http/https) | `URL` |
| Other string | `TEXT` |

## createFrontmatter()

Creates new frontmatter with required fields.

```typescript
function createFrontmatter(title: string, tags?: string[]): NoteFrontmatter
```

Returns:
```typescript
{
  id: crypto.randomUUID(),
  title,
  created: new Date().toISOString(),
  modified: new Date().toISOString(),
  tags: tags ?? []
}
```

## ensureFrontmatter()

Ensures content has valid frontmatter, adding missing fields.

```typescript
function ensureFrontmatter(content: string, defaults?: Partial<NoteFrontmatter>): string
```

Use case: Processing imported markdown files that may lack frontmatter.

## Tag Normalization

Tags are normalized before storage:
- Trimmed of whitespace
- Converted to lowercase
- Nested tags use `/` separator: `parent/child`

```typescript
function extractTags(frontmatter: NoteFrontmatter): string[]
// Returns normalized tag array
```
