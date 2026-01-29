---
name: vault-tasks
description: Guide for task management, projects, subtasks, and filtering in Memry.
  Triggers: "create task", "add task", "update task", "delete task", "complete task",
  "task list", "filter tasks", "project tasks", "subtask", "task priority", "due date",
  "repeating task", "task status", "kanban", "task tags", "bulk tasks", "archive task"
---

# Memry Tasks System Guide

## Architecture Overview

Tasks flow: React Component → Service Layer → IPC Handler → Database Query

Key paths:
- Schema: `src/shared/db/schema/tasks.ts`
- Queries: `src/shared/db/queries/tasks.ts`
- IPC: `src/main/ipc/tasks-handlers.ts`
- Contracts: `src/shared/contracts/tasks-api.ts`
- Service: `src/renderer/src/services/tasks-service.ts`
- Components: `src/renderer/src/components/tasks/`
- Hooks: `src/renderer/src/hooks/use-task-*.ts`
- Utils: `src/renderer/src/lib/task-utils.ts`, `subtask-utils.ts`

## Task Schema

```typescript
// Core fields
id: string (ULID)
projectId: string
statusId: string
parentId: string | null  // null = top-level, set = subtask
title: string
description: string | null
priority: 0 | 1 | 2 | 3 | 4  // none/low/medium/high/urgent

// Dates
dueDate: string | null  // YYYY-MM-DD
dueTime: string | null  // HH:MM
startDate: string | null

// Repeating
isRepeating: boolean
repeatConfig: JSON | null
repeatFrom: 'due' | 'completion'
completedCount: number

// Status
completedAt: number | null  // timestamp
archivedAt: number | null

// Ordering
position: number
clock: number  // CRDT sync
```

## Project Schema

```typescript
id: string
name: string
description: string | null
color: string  // #hex
icon: string | null
position: number
isInbox: boolean  // special, cannot delete
archivedAt: number | null
```

Projects have multiple statuses (workflow states). Default: To Do, In Progress, Done.

## Task CRUD Operations

### Create Task

```typescript
// Service call
const task = await tasksService.create({
  projectId: 'project-id',
  title: 'Task title',
  description: 'Optional description',
  priority: 2,  // medium
  dueDate: '2025-01-30',
  dueTime: '14:00',
  statusId: 'status-id',
  parentId: null,  // or parent task id for subtask
  tags: ['tag1', 'tag2']
});
```

### Update Task

```typescript
await tasksService.update(taskId, {
  title: 'Updated title',
  priority: 3,
  dueDate: '2025-02-01'
});
```

### Delete Task

```typescript
await tasksService.delete(taskId);
```

### Complete/Uncomplete

```typescript
await tasksService.complete(taskId);
await tasksService.uncomplete(taskId);
```

### Archive/Unarchive

```typescript
await tasksService.archive(taskId);
await tasksService.unarchive(taskId);
```

## Subtask Operations

Subtasks have `parentId` set to parent task ID. They inherit projectId from parent.

### Create Subtask

```typescript
await tasksService.create({
  parentId: parentTaskId,
  projectId: parentTask.projectId,
  title: 'Subtask title',
  // ... other fields
});
```

### Using subtask-utils.ts

```typescript
import {
  getSubtasks,
  createSubtask,
  createMultipleSubtasks,
  promoteToTask,
  demoteToSubtask
} from '@/lib/subtask-utils';

// Get subtasks
const subtasks = await getSubtasks(parentId);

// Promote subtask to top-level task
await promoteToTask(subtaskId);

// Demote task to subtask
await demoteToSubtask(taskId, newParentId);
```

### Subtask Hook

```typescript
const {
  addSubtask,
  bulkAddSubtasks,
  reorderSubtasks,
  promoteSubtask,
  demoteTask,
  deleteSubtask
} = useSubtaskManagement(parentTask);
```

## Filtering Tasks

### Filter Interface

```typescript
interface TaskFilters {
  search: string
  projectIds: string[]
  priorities: (0 | 1 | 2 | 3 | 4)[]
  dueDate: {
    type: 'any' | 'none' | 'overdue' | 'today' | 'tomorrow' |
          'this-week' | 'next-week' | 'this-month' | 'custom'
    customStart?: Date
    customEnd?: Date
  }
  statusIds: string[]
  completion: 'active' | 'completed' | 'all'
  repeatType: 'repeating' | 'one-time' | 'all'
  hasTime: 'with-time' | 'without-time' | 'all'
}
```

### Using Filter Hooks

```typescript
import { useFilterState, useFilteredAndSortedTasks } from '@/hooks/use-task-filters';

const { filters, setFilters, resetFilters } = useFilterState('view-key');
const filteredTasks = useFilteredAndSortedTasks(tasks, filters, sort);
```

### Filter Functions (task-utils.ts)

```typescript
import {
  filterBySearch,
  filterByProjects,
  filterByPriorities,
  filterByDueDateRange,
  filterByStatuses,
  filterByCompletion,
  applyFiltersAndSort,
  hasActiveFilters,
  countActiveFilters
} from '@/lib/task-utils';
```

### Grouping Functions

```typescript
import {
  groupTasksByDueDate,      // overdue, today, tomorrow, upcoming, later, noDueDate
  groupTasksByStatus,        // for kanban view
  groupTasksByCompletion     // by completion date
} from '@/lib/task-utils';
```

## Project Operations

### Create Project

```typescript
const project = await tasksService.projectCreate({
  name: 'Project Name',
  description: 'Optional',
  color: '#3B82F6',
  icon: 'folder'
});
// Automatically creates default statuses: To Do, In Progress, Done
```

### List Projects with Stats

```typescript
const projects = await tasksService.projectList();
// Returns: { ...project, taskCount, completedCount }
```

### Project Statuses

```typescript
// Create custom status
await tasksService.statusCreate({
  projectId,
  name: 'Review',
  color: '#F59E0B',
  isDone: false
});

// List statuses
const statuses = await tasksService.statusList(projectId);
```

## Bulk Operations

```typescript
await tasksService.bulkComplete(taskIds);
await tasksService.bulkDelete(taskIds);
await tasksService.bulkMove(taskIds, targetProjectId);
await tasksService.bulkArchive(taskIds);
```

## Task Views

```typescript
// Today's tasks (due today + overdue)
const today = await tasksService.getToday();

// Upcoming (next 7 days)
const upcoming = await tasksService.getUpcoming(7);

// Overdue only
const overdue = await tasksService.getOverdue();

// Stats
const stats = await tasksService.getStats();
// { total, completed, overdue, dueToday, dueThisWeek }
```

## Tags

```typescript
// Set tags on task
await tasksService.update(taskId, { tags: ['work', 'urgent'] });

// Get all tags with counts
const tags = await tasksService.getTags();
// [{ tag: 'work', count: 5 }, ...]
```

## IPC Events

Subscribe to task changes:

```typescript
import { tasksService } from '@/services/tasks-service';

tasksService.onTaskCreated((task) => { /* ... */ });
tasksService.onTaskUpdated((task) => { /* ... */ });
tasksService.onTaskDeleted((taskId) => { /* ... */ });
tasksService.onTaskCompleted((task) => { /* ... */ });
```

## Adding New IPC Handler

1. Add channel to `src/shared/ipc-channels.ts`
2. Add Zod schema to `src/shared/contracts/tasks-api.ts`
3. Add handler to `src/main/ipc/tasks-handlers.ts`
4. Add method to preload in `src/preload/api/tasks-api.ts`
5. Add service method to `src/renderer/src/services/tasks-service.ts`

## Key Components

| Component | Purpose |
|-----------|---------|
| `task-list.tsx` | Main task display with grouping |
| `task-row.tsx` | Single task display |
| `sortable-task-row.tsx` | Draggable task for reordering |
| `task-detail-panel.tsx` | Full task editing sidebar |
| `add-task-modal.tsx` | Create task dialog |
| `subtasks-section.tsx` | Subtask list in detail panel |
| `bulk-add-subtasks.tsx` | Add multiple subtasks at once |

## Key Hooks

| Hook | Purpose |
|------|---------|
| `use-task-filters.ts` | Filter state management |
| `use-subtask-management.ts` | Subtask CRUD operations |
| `use-expanded-tasks.ts` | Track expanded/collapsed tasks |
| `use-task-selection.ts` | Multi-select with shift-click |
| `use-task-order.ts` | Drag-drop reordering |
