# Index Database Schema

## Overview

The `index.db` database stores cached data derived from vault files. All tables can be rebuilt by re-indexing the vault.

## note_cache Table

Primary cache for note metadata.

```typescript
// src/shared/db/schema/notes-cache.ts
export const noteCache = sqliteTable('note_cache', {
  id: text('id').primaryKey(),
  path: text('path').notNull().unique(),
  title: text('title').notNull(),
  snippet: text('snippet').default(''),
  wordCount: integer('word_count').default(0),
  characterCount: integer('character_count').default(0),
  contentHash: text('content_hash').default(''),
  createdAt: integer('created_at').notNull(),
  modifiedAt: integer('modified_at').notNull(),
  indexedAt: integer('indexed_at').notNull(),
  fileType: text('file_type').default('note'),  // 'note' | 'journal' | 'file'
  fileSize: integer('file_size').default(0),
  mimeType: text('mime_type').default('text/markdown'),
  emoji: text('emoji'),
  date: text('date'),  // For journal entries: 'YYYY-MM-DD'
})
```

### Indexes
- Primary: `id`
- Unique: `path`

## note_tags Table

Many-to-many relationship between notes and tags.

```typescript
export const noteTags = sqliteTable('note_tags', {
  noteId: text('note_id').notNull().references(() => noteCache.id, { onDelete: 'cascade' }),
  tag: text('tag').notNull(),
  pinnedAt: integer('pinned_at'),  // Unix timestamp if pinned
}, (table) => ({
  pk: primaryKey({ columns: [table.noteId, table.tag] }),
}))
```

## note_links Table

Wiki-link graph (source → target).

```typescript
export const noteLinks = sqliteTable('note_links', {
  sourceId: text('source_id').notNull().references(() => noteCache.id, { onDelete: 'cascade' }),
  targetId: text('target_id').notNull(),
  targetTitle: text('target_title').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.sourceId, table.targetId] }),
}))
```

## note_properties Table

Custom frontmatter properties.

```typescript
export const noteProperties = sqliteTable('note_properties', {
  noteId: text('note_id').notNull().references(() => noteCache.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  value: text('value').notNull(),  // Serialized string
  type: text('type').notNull(),    // PropertyType enum
}, (table) => ({
  pk: primaryKey({ columns: [table.noteId, table.name] }),
}))
```

### PropertyTypes Enum

```typescript
export const PropertyTypes = {
  TEXT: 'TEXT',
  NUMBER: 'NUMBER',
  CHECKBOX: 'CHECKBOX',
  DATE: 'DATE',
  URL: 'URL',
} as const
```

## note_snapshots Table

Version history for notes.

```typescript
export const noteSnapshots = sqliteTable('note_snapshots', {
  id: text('id').primaryKey(),
  noteId: text('note_id').notNull().references(() => noteCache.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  fileContent: text('file_content').notNull(),  // Full markdown
  contentHash: text('content_hash').notNull(),
  wordCount: integer('word_count').default(0),
  reason: text('reason').notNull(),  // SnapshotReason
  createdAt: integer('created_at').notNull(),
})
```

### SnapshotReasons Enum

```typescript
export const SnapshotReasons = {
  MANUAL: 'MANUAL',       // User requested
  AUTO: 'AUTO',           // Timer-based
  SIGNIFICANT: 'SIGNIFICANT',  // Major content change
  TIMER: 'TIMER',         // Periodic backup
} as const
```

## property_definitions Table

Schema for custom property types (future feature).

```typescript
export const propertyDefinitions = sqliteTable('property_definitions', {
  name: text('name').primaryKey(),
  type: text('type').notNull(),
  color: text('color'),
  defaultValue: text('default_value'),
  options: text('options'),  // JSON array for select types
  createdAt: integer('created_at').notNull(),
})
```

## fts_notes Virtual Table

FTS5 full-text search index.

```sql
CREATE VIRTUAL TABLE fts_notes USING fts5(
  note_id UNINDEXED,
  title,
  content,
  tags,
  tokenize='porter'
);
```

### FTS Columns
- `note_id` - Foreign key to note_cache.id (not searchable)
- `title` - Note title
- `content` - Full note content (body only, no frontmatter)
- `tags` - Space-separated tags

### FTS Triggers

Automatically sync cache ↔ FTS:
- `fts_notes_insert` - After insert on note_cache
- `fts_notes_update` - After update on note_cache
- `fts_notes_delete` - After delete on note_cache

See [FTS Maintenance](fts-maintenance.md) for trigger definitions.
