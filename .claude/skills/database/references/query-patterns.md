# Query Patterns

## File Structure

Query files live in `src/shared/db/queries/`. Each module follows this pattern:

```typescript
import { eq, and, or, isNull, isNotNull, lte, gte, desc, asc, count, sql, type SQL } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { items, type Item, type NewItem } from '../schema/items'
import * as schema from '../schema'

type DrizzleDb = BetterSQLite3Database<typeof schema>
```

## CRUD Operations

### Insert with Returning

```typescript
export function insertTask(db: DrizzleDb, task: NewTask): Task {
  return db.insert(tasks).values(task).returning().get()
}
```

### Update with Timestamp

```typescript
export function updateTask(
  db: DrizzleDb,
  id: string,
  updates: Partial<Omit<Task, 'id' | 'createdAt'>>
): Task | undefined {
  return db
    .update(tasks)
    .set({
      ...updates,
      modifiedAt: new Date().toISOString()
    })
    .where(eq(tasks.id, id))
    .returning()
    .get()
}
```

### Delete

```typescript
export function deleteTask(db: DrizzleDb, id: string): void {
  db.delete(tasks).where(eq(tasks.id, id)).run()
}
```

### Get by ID

```typescript
export function getTaskById(db: DrizzleDb, id: string): Task | undefined {
  return db.select().from(tasks).where(eq(tasks.id, id)).get()
}
```

### Check Exists

```typescript
export function taskExists(db: DrizzleDb, id: string): boolean {
  const result = db.select({ id: tasks.id }).from(tasks).where(eq(tasks.id, id)).get()
  return result !== undefined
}
```

## List with Options Pattern

Define an options interface for flexible filtering:

```typescript
export interface ListTasksOptions {
  projectId?: string
  statusId?: string | null
  parentId?: string | null
  includeCompleted?: boolean
  includeArchived?: boolean
  dueBefore?: string
  dueAfter?: string
  tags?: string[]
  sortBy?: 'position' | 'dueDate' | 'priority' | 'created' | 'modified'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export function listTasks(db: DrizzleDb, options: ListTasksOptions = {}): Task[] {
  const {
    projectId,
    statusId,
    parentId,
    includeCompleted = false,
    includeArchived = false,
    dueBefore,
    dueAfter,
    sortBy = 'position',
    sortOrder = 'asc',
    limit = 100,
    offset = 0
  } = options

  const conditions: SQL<unknown>[] = []

  if (projectId) {
    conditions.push(eq(tasks.projectId, projectId))
  }

  // Handle null vs undefined for optional FKs
  if (statusId !== undefined) {
    if (statusId === null) {
      conditions.push(isNull(tasks.statusId))
    } else {
      conditions.push(eq(tasks.statusId, statusId))
    }
  }

  if (!includeCompleted) {
    conditions.push(isNull(tasks.completedAt))
  }

  if (!includeArchived) {
    conditions.push(isNull(tasks.archivedAt))
  }

  if (dueBefore) {
    conditions.push(lte(tasks.dueDate, dueBefore))
  }

  if (dueAfter) {
    conditions.push(gte(tasks.dueDate, dueAfter))
  }

  // Build sort
  const sortColumn = {
    position: tasks.position,
    dueDate: tasks.dueDate,
    priority: tasks.priority,
    created: tasks.createdAt,
    modified: tasks.modifiedAt
  }[sortBy]

  const orderFn = sortOrder === 'asc' ? asc : desc

  let query = db.select().from(tasks)

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query
  }

  return query.orderBy(orderFn(sortColumn)).limit(limit).offset(offset).all()
}
```

## Tag Filtering via Subquery

Filter items that have ALL specified tags:

```typescript
if (tags && tags.length > 0) {
  const tagResults = db
    .select({
      taskId: taskTags.taskId,
      tagCount: sql<number>`count(distinct ${taskTags.tag})`
    })
    .from(taskTags)
    .where(sql`lower(${taskTags.tag}) IN ${tags.map(t => t.toLowerCase())}`)
    .groupBy(taskTags.taskId)
    .all()

  const taskIdsWithTags = tagResults
    .filter(r => r.tagCount === tags.length)
    .map(r => r.taskId)

  if (taskIdsWithTags.length === 0) {
    return []
  }

  conditions.push(sql`${tasks.id} IN ${taskIdsWithTags}`)
}
```

## Aggregation Queries

### Count with Conditions

```typescript
export function countTasks(
  db: DrizzleDb,
  options: Pick<ListTasksOptions, 'projectId' | 'includeCompleted' | 'includeArchived'> = {}
): number {
  const { projectId, includeCompleted = false, includeArchived = false } = options

  const conditions: SQL<unknown>[] = []

  if (projectId) {
    conditions.push(eq(tasks.projectId, projectId))
  }
  if (!includeCompleted) {
    conditions.push(isNull(tasks.completedAt))
  }
  if (!includeArchived) {
    conditions.push(isNull(tasks.archivedAt))
  }

  let query = db.select({ count: count() }).from(tasks)

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query
  }

  const result = query.get()
  return result?.count ?? 0
}
```

### Multiple Aggregates

```typescript
export function getTaskStats(db: DrizzleDb): {
  total: number
  completed: number
  overdue: number
} {
  const today = new Date().toISOString().split('T')[0]

  const result = db
    .select({
      total: count(),
      completed: sql<number>`sum(case when ${tasks.completedAt} is not null then 1 else 0 end)`,
      overdue: sql<number>`sum(case when ${tasks.dueDate} < ${today} and ${tasks.completedAt} is null then 1 else 0 end)`
    })
    .from(tasks)
    .where(isNull(tasks.archivedAt))
    .get()

  return {
    total: result?.total ?? 0,
    completed: result?.completed ?? 0,
    overdue: result?.overdue ?? 0
  }
}
```

### Count Subtasks

```typescript
export function countSubtasks(
  db: DrizzleDb,
  parentId: string
): { total: number; completed: number } {
  const result = db
    .select({
      total: count(),
      completed: sql<number>`sum(case when ${tasks.completedAt} is not null then 1 else 0 end)`
    })
    .from(tasks)
    .where(eq(tasks.parentId, parentId))
    .get()

  return {
    total: result?.total ?? 0,
    completed: result?.completed ?? 0
  }
}
```

## Bulk Operations

### Bulk Update

```typescript
export function bulkCompleteTasks(db: DrizzleDb, ids: string[]): number {
  if (ids.length === 0) return 0

  const now = new Date().toISOString()
  const result = db
    .update(tasks)
    .set({ completedAt: now, modifiedAt: now })
    .where(sql`${tasks.id} IN ${ids}`)
    .run()

  return result.changes
}
```

### Bulk Delete

```typescript
export function bulkDeleteTasks(db: DrizzleDb, ids: string[]): number {
  if (ids.length === 0) return 0

  const result = db
    .delete(tasks)
    .where(sql`${tasks.id} IN ${ids}`)
    .run()

  return result.changes
}
```

## Junction Table Operations

### Set Tags (Replace All)

```typescript
export function setTaskTags(db: DrizzleDb, taskId: string, tags: string[]): void {
  db.delete(taskTags).where(eq(taskTags.taskId, taskId)).run()

  if (tags.length > 0) {
    const tagRecords: NewTaskTag[] = tags.map(tag => ({
      taskId,
      tag: tag.toLowerCase().trim()
    }))
    db.insert(taskTags).values(tagRecords).run()
  }
}
```

### Get Tags

```typescript
export function getTaskTags(db: DrizzleDb, taskId: string): string[] {
  const results = db
    .select({ tag: taskTags.tag })
    .from(taskTags)
    .where(eq(taskTags.taskId, taskId))
    .all()

  return results.map(r => r.tag)
}
```

### Get All Tags with Counts

```typescript
export function getAllTaskTags(db: DrizzleDb): { tag: string; count: number }[] {
  return db
    .select({
      tag: taskTags.tag,
      count: count()
    })
    .from(taskTags)
    .groupBy(taskTags.tag)
    .orderBy(desc(count()))
    .all()
}
```

## Max Position Query

```typescript
export function getNextTaskPosition(
  db: DrizzleDb,
  projectId: string,
  parentId?: string | null
): number {
  const conditions: SQL<unknown>[] = [eq(tasks.projectId, projectId)]

  if (parentId !== undefined) {
    if (parentId === null) {
      conditions.push(isNull(tasks.parentId))
    } else {
      conditions.push(eq(tasks.parentId, parentId))
    }
  }

  const result = db
    .select({ maxPosition: sql<number>`max(${tasks.position})` })
    .from(tasks)
    .where(and(...conditions))
    .get()

  return (result?.maxPosition ?? -1) + 1
}
```

## Date Range Queries

```typescript
export function getUpcomingTasks(db: DrizzleDb, days: number = 7): Task[] {
  const today = new Date().toISOString().split('T')[0]
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + days)
  const futureDateStr = futureDate.toISOString().split('T')[0]

  return db
    .select()
    .from(tasks)
    .where(
      and(
        isNotNull(tasks.dueDate),
        gte(tasks.dueDate, today),
        lte(tasks.dueDate, futureDateStr),
        isNull(tasks.completedAt),
        isNull(tasks.archivedAt)
      )
    )
    .orderBy(asc(tasks.dueDate), asc(tasks.position))
    .all()
}
```

## Raw SQL with sql Template

For complex queries not easily expressed with Drizzle's API:

```typescript
// Date comparison
sql`${tasks.dueDate} < ${today}`

// IN clause
sql`${tasks.id} IN ${ids}`

// CASE expression
sql<number>`sum(case when ${tasks.completedAt} is not null then 1 else 0 end)`

// Lower case comparison
sql`lower(${taskTags.tag}) IN ${tags.map(t => t.toLowerCase())}`
```
