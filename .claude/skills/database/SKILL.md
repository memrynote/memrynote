---
name: database
description: |
  Covers Drizzle schema definitions, migrations, queries, and database patterns for Memry.
  Triggers: "create table", "add column", "schema", "migration", "drizzle", "query",
  "database", "db", "tasks table", "projects table", "index.db", "data.db",
  "sqliteTable", "insert", "update", "delete", "select", "foreign key"
---

# Database Patterns

## Two-Database Architecture

| Database   | Purpose                                | Drizzle Config       |
|------------|----------------------------------------|----------------------|
| `data.db`  | Source of truth (tasks, projects, etc) | `drizzle.data.config.ts` |
| `index.db` | Rebuildable cache (note search, FTS)   | `drizzle.index.config.ts` |

**Rule**: Never store anything in `index.db` that can't be rebuilt from files or `data.db`.

### Database Access

```typescript
import { getDatabase, getIndexDatabase, type DrizzleDb } from '@/main/database/client'

const dataDb = getDatabase()    // For tasks, projects, settings
const indexDb = getIndexDatabase()  // For note cache, FTS
```

## Schema Location

| Path | Contains |
|------|----------|
| `src/shared/db/schema/` | All schema definitions |
| `src/shared/db/schema/data-schema.ts` | data.db re-exports |
| `src/shared/db/schema/index-schema.ts` | index.db re-exports |
| `src/shared/db/queries/` | Query functions |

## Schema Definition Pattern

```typescript
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const myTable = sqliteTable(
  'my_table',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    count: integer('count').notNull().default(0),
    isActive: integer('is_active', { mode: 'boolean' }).default(false),
    config: text('config', { mode: 'json' }),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    archivedAt: text('archived_at')  // Soft delete pattern
  },
  (table) => [
    index('idx_my_table_name').on(table.name),
    index('idx_my_table_created').on(table.createdAt)
  ]
)

export type MyTable = typeof myTable.$inferSelect
export type NewMyTable = typeof myTable.$inferInsert
```

### Foreign Keys

```typescript
import { projects } from './projects'

projectId: text('project_id')
  .notNull()
  .references(() => projects.id, { onDelete: 'cascade' })

statusId: text('status_id')
  .references(() => statuses.id, { onDelete: 'set null' })
```

### Composite Primary Key

```typescript
import { primaryKey } from 'drizzle-orm/sqlite-core'

(table) => [primaryKey({ columns: [table.taskId, table.noteId] })]
```

## Migration Commands

```bash
pnpm db:generate        # Generate migrations (both DBs)
pnpm db:generate:data   # Generate for data.db only
pnpm db:generate:index  # Generate for index.db only

pnpm db:push            # Push schema (dev only, both)
pnpm db:push:data       # Push to data.db
pnpm db:push:index      # Push to index.db

pnpm db:studio:data     # Drizzle Studio for data.db
pnpm db:studio:index    # Drizzle Studio for index.db
```

## Query Function Pattern

```typescript
import { eq, and, or, isNull, isNotNull, lte, gte, desc, asc, count, sql, type SQL } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from '../schema'

type DrizzleDb = BetterSQLite3Database<typeof schema>

// Insert with returning
export function insertItem(db: DrizzleDb, item: NewItem): Item {
  return db.insert(items).values(item).returning().get()
}

// Update with timestamp
export function updateItem(
  db: DrizzleDb,
  id: string,
  updates: Partial<Omit<Item, 'id' | 'createdAt'>>
): Item | undefined {
  return db
    .update(items)
    .set({ ...updates, modifiedAt: new Date().toISOString() })
    .where(eq(items.id, id))
    .returning()
    .get()
}

// Delete
export function deleteItem(db: DrizzleDb, id: string): void {
  db.delete(items).where(eq(items.id, id)).run()
}

// Get single
export function getItemById(db: DrizzleDb, id: string): Item | undefined {
  return db.select().from(items).where(eq(items.id, id)).get()
}

// List with filters
export function listItems(db: DrizzleDb, options: ListOptions = {}): Item[] {
  const conditions: SQL<unknown>[] = []

  if (options.projectId) {
    conditions.push(eq(items.projectId, options.projectId))
  }
  if (!options.includeArchived) {
    conditions.push(isNull(items.archivedAt))
  }

  let query = db.select().from(items)
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query
  }

  return query.orderBy(asc(items.position)).limit(options.limit ?? 100).all()
}
```

## Common Query Patterns

### Result Methods

| Method | Returns | Use When |
|--------|---------|----------|
| `.get()` | `T \| undefined` | Single row expected |
| `.all()` | `T[]` | Multiple rows |
| `.run()` | `{ changes: number }` | No return data needed |
| `.returning().get()` | `T` | Insert/update with return |

### Operators

| Operator | Usage |
|----------|-------|
| `eq(col, val)` | Equality |
| `and(...conditions)` | AND conditions |
| `or(...conditions)` | OR conditions |
| `isNull(col)` | IS NULL |
| `isNotNull(col)` | IS NOT NULL |
| `lte(col, val)` | Less than or equal |
| `gte(col, val)` | Greater than or equal |
| `sql\`...\`` | Raw SQL |

### Bulk Operations

```typescript
// Bulk update
db.update(items)
  .set({ archivedAt: now })
  .where(sql`${items.id} IN ${ids}`)
  .run()

// Count with conditions
db.select({ count: count() })
  .from(items)
  .where(isNull(items.completedAt))
  .get()
```

## Key Tables

### data.db

| Table | Purpose |
|-------|---------|
| `projects` | Project containers |
| `statuses` | Kanban columns per project |
| `tasks` | Task items |
| `task_tags` | Task tag associations |
| `task_notes` | Task-note links |
| `settings` | App configuration |
| `bookmarks` | Note bookmarks |

### index.db

| Table | Purpose |
|-------|---------|
| `note_cache` | Note metadata cache |
| `note_tags` | Note tag associations |
| `note_links` | Wiki-link graph |
| `note_properties` | Custom frontmatter |
| `note_snapshots` | Version history |
| `fts_notes` | FTS5 virtual table |

## Reference Files

- [Schema Patterns](references/schema-patterns.md) - Detailed schema examples
- [Query Patterns](references/query-patterns.md) - Complex query examples
