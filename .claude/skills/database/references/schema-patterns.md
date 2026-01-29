# Schema Patterns

## Complete Table Example

```typescript
import { sqliteTable, text, integer, index, primaryKey } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { projects } from './projects'
import { statuses } from './statuses'

export const tasks = sqliteTable(
  'tasks',
  {
    // Primary key (text for UUIDs)
    id: text('id').primaryKey(),

    // Foreign keys with different behaviors
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    statusId: text('status_id')
      .references(() => statuses.id, { onDelete: 'set null' }),
    parentId: text('parent_id'),  // Self-reference (no FK constraint)

    // Required text
    title: text('title').notNull(),

    // Optional text
    description: text('description'),

    // Integer with default
    priority: integer('priority').notNull().default(0),
    position: integer('position').notNull().default(0),

    // Optional dates (text for ISO strings)
    dueDate: text('due_date'),
    startDate: text('start_date'),

    // JSON column
    repeatConfig: text('repeat_config', { mode: 'json' }),

    // Soft delete pattern
    completedAt: text('completed_at'),
    archivedAt: text('archived_at'),

    // Timestamps with defaults
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    modifiedAt: text('modified_at')
      .notNull()
      .default(sql`(datetime('now'))`),

    // Sync vector clock
    clock: text('clock')
  },
  (table) => [
    index('idx_tasks_project').on(table.projectId),
    index('idx_tasks_status').on(table.statusId),
    index('idx_tasks_parent').on(table.parentId),
    index('idx_tasks_due_date').on(table.dueDate),
    index('idx_tasks_completed').on(table.completedAt)
  ]
)

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
```

## Boolean Columns

SQLite has no native boolean, use integer with mode:

```typescript
isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false)
isInbox: integer('is_inbox', { mode: 'boolean' }).notNull().default(false)
```

## JSON Columns

Store serializable objects:

```typescript
config: text('config', { mode: 'json' })
repeatConfig: text('repeat_config', { mode: 'json' })
options: text('options')  // For JSON arrays, serialize manually
```

## Composite Primary Key

For junction tables:

```typescript
export const taskTags = sqliteTable(
  'task_tags',
  {
    taskId: text('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    tag: text('tag').notNull()
  },
  (table) => [
    primaryKey({ columns: [table.taskId, table.tag] }),
    index('idx_task_tags_tag').on(table.tag)
  ]
)
```

## Foreign Key Options

```typescript
// Delete children when parent deleted
.references(() => parent.id, { onDelete: 'cascade' })

// Set to null when parent deleted
.references(() => parent.id, { onDelete: 'set null' })

// Prevent parent deletion if children exist
.references(() => parent.id, { onDelete: 'restrict' })

// Do nothing (default)
.references(() => parent.id)
```

## Unique Constraints

```typescript
// Single column unique
path: text('path').notNull().unique()

// Unique via primary key (composite)
(table) => [primaryKey({ columns: [table.sourceId, table.targetTitle] })]
```

## Cache Table Pattern (index.db)

Tables that can be rebuilt from source files:

```typescript
export const noteCache = sqliteTable(
  'note_cache',
  {
    id: text('id').primaryKey(),
    path: text('path').notNull().unique(),
    title: text('title').notNull(),

    // Discriminator for file types
    fileType: text('file_type').$type<FileType>().notNull().default('markdown'),
    mimeType: text('mime_type'),
    fileSize: integer('file_size'),

    // Nullable for non-markdown files
    contentHash: text('content_hash'),
    wordCount: integer('word_count'),
    snippet: text('snippet'),

    // Journal-specific
    date: text('date'),  // YYYY-MM-DD for journals

    // Timestamps
    createdAt: text('created_at').notNull(),
    modifiedAt: text('modified_at').notNull(),
    indexedAt: text('indexed_at')
      .notNull()
      .default(sql`(datetime('now'))`)
  },
  (table) => [
    index('idx_note_cache_path').on(table.path),
    index('idx_note_cache_modified').on(table.modifiedAt),
    index('idx_note_cache_date').on(table.date),
    index('idx_note_cache_file_type').on(table.fileType)
  ]
)
```

## Version History Pattern

```typescript
export const noteSnapshots = sqliteTable(
  'note_snapshots',
  {
    id: text('id').primaryKey(),  // nanoid(12)
    noteId: text('note_id')
      .notNull()
      .references(() => noteCache.id, { onDelete: 'cascade' }),
    fileContent: text('content').notNull(),
    title: text('title').notNull(),
    wordCount: integer('word_count').notNull().default(0),
    contentHash: text('content_hash').notNull(),
    reason: text('reason').notNull(),  // 'auto' | 'significant' | 'manual'
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`)
  },
  (table) => [
    index('idx_note_snapshots_note_id').on(table.noteId),
    index('idx_note_snapshots_created').on(table.createdAt)
  ]
)
```

## Type Exports Pattern

Always export both select and insert types:

```typescript
export type Task = typeof tasks.$inferSelect      // Full row type
export type NewTask = typeof tasks.$inferInsert   // Insert type (optionals for defaults)

export type TaskTag = typeof taskTags.$inferSelect
export type NewTaskTag = typeof taskTags.$inferInsert
```

## Constants Pattern

Define string enum values as constants:

```typescript
export const PropertyTypes = {
  TEXT: 'text',
  NUMBER: 'number',
  CHECKBOX: 'checkbox',
  DATE: 'date',
  URL: 'url'
} as const

export type PropertyType = (typeof PropertyTypes)[keyof typeof PropertyTypes]

export const SnapshotReasons = {
  MANUAL: 'manual',
  AUTO: 'auto',
  TIMER: 'timer',
  SIGNIFICANT: 'significant'
} as const

export type SnapshotReason = (typeof SnapshotReasons)[keyof typeof SnapshotReasons]
```

## Adding to data-schema.ts or index-schema.ts

After creating a new table, re-export it in the appropriate schema file:

```typescript
// src/shared/db/schema/data-schema.ts
export * from './projects'
export * from './statuses'
export * from './tasks'
export * from './task-relations'
export * from './your-new-table'  // Add here

// src/shared/db/schema/index-schema.ts
export * from './notes-cache'
export * from './your-new-cache-table'  // Add here
```
