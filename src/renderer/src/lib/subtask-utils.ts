import type { Task } from "@/data/sample-tasks"

// ============================================================================
// SUBTASK TYPES
// ============================================================================

/**
 * Progress information for subtasks
 */
export interface SubtaskProgress {
  total: number
  completed: number
  percentage: number // 0-100
}

/**
 * Task with its subtasks and progress attached
 */
export type TaskWithSubtasks = Task & {
  subtasks: Task[]
  progress: SubtaskProgress
}

// ============================================================================
// SUBTASK HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a task is a subtask (has a parent)
 */
export const isSubtask = (task: Task): boolean => {
  return task.parentId !== null
}

/**
 * Check if a task has subtasks
 */
export const hasSubtasks = (task: Task): boolean => {
  return task.subtaskIds.length > 0
}

/**
 * Get subtasks for a parent task in order
 */
export const getSubtasks = (parentId: string, allTasks: Task[]): Task[] => {
  const parent = allTasks.find((t) => t.id === parentId)
  if (!parent) return []

  // Return in order specified by subtaskIds
  return parent.subtaskIds
    .map((id) => allTasks.find((t) => t.id === id))
    .filter((t): t is Task => t !== undefined)
}

/**
 * Calculate progress for a list of subtasks
 */
export const calculateProgress = (subtasks: Task[]): SubtaskProgress => {
  const total = subtasks.length
  if (total === 0) {
    return { total: 0, completed: 0, percentage: 0 }
  }

  const completed = subtasks.filter((t) => t.completedAt !== null).length
  const percentage = Math.round((completed / total) * 100)

  return { total, completed, percentage }
}

/**
 * Get the parent task for a subtask
 */
export const getParentTask = (task: Task, allTasks: Task[]): Task | null => {
  if (!task.parentId) return null
  return allTasks.find((t) => t.id === task.parentId) || null
}

/**
 * Get only top-level tasks (tasks without a parent)
 */
export const getTopLevelTasks = (tasks: Task[]): Task[] => {
  return tasks.filter((t) => t.parentId === null)
}

/**
 * Build a task tree with subtasks attached to their parents
 */
export const buildTaskTree = (tasks: Task[]): TaskWithSubtasks[] => {
  const topLevel = getTopLevelTasks(tasks)

  return topLevel.map((task) => {
    const subtasks = getSubtasks(task.id, tasks)
    return {
      ...task,
      subtasks,
      progress: calculateProgress(subtasks),
    }
  })
}

/**
 * Get all subtask IDs for a parent task (for filtering)
 */
export const getAllSubtaskIds = (parentId: string, allTasks: Task[]): string[] => {
  const parent = allTasks.find((t) => t.id === parentId)
  if (!parent) return []
  return parent.subtaskIds
}

/**
 * Check if a task can have subtasks added
 * (subtasks themselves cannot have children)
 */
export const canHaveSubtasks = (task: Task): boolean => {
  return task.parentId === null
}

/**
 * Validate subtask relationships
 * - A task cannot be its own parent
 * - Circular references are not allowed
 * - Subtasks must belong to the same project as parent
 */
export const validateSubtaskRelationship = (
  parentId: string,
  subtaskId: string,
  allTasks: Task[]
): { valid: boolean; error?: string } => {
  // Cannot be own parent
  if (parentId === subtaskId) {
    return { valid: false, error: "A task cannot be its own parent" }
  }

  const parent = allTasks.find((t) => t.id === parentId)
  const subtask = allTasks.find((t) => t.id === subtaskId)

  if (!parent || !subtask) {
    return { valid: false, error: "Parent or subtask not found" }
  }

  // Subtask must be in same project
  if (parent.projectId !== subtask.projectId) {
    return { valid: false, error: "Subtask must belong to the same project as parent" }
  }

  // Parent cannot be a subtask itself (no nested subtasks)
  if (parent.parentId !== null) {
    return { valid: false, error: "Cannot add subtasks to a subtask (no nested subtasks)" }
  }

  // Subtask cannot already have subtasks (would create nested structure)
  if (subtask.subtaskIds.length > 0) {
    return { valid: false, error: "Cannot make a parent task into a subtask" }
  }

  return { valid: true }
}

/**
 * Filter tasks while maintaining subtask relationships
 * When a parent matches the filter, include all its subtasks
 */
export const filterTasksWithSubtasks = (
  tasks: Task[],
  filterFn: (task: Task) => boolean
): Task[] => {
  // Get top-level tasks that match the filter
  const matchingTopLevel = tasks.filter((t) => t.parentId === null && filterFn(t))

  // Get IDs of matching top-level tasks
  const matchingIds = new Set(matchingTopLevel.map((t) => t.id))

  // Include all subtasks of matching parents
  return tasks.filter(
    (t) =>
      matchingIds.has(t.id) || // Is a matching top-level task
      (t.parentId !== null && matchingIds.has(t.parentId)) // Is subtask of matching parent
  )
}

/**
 * Sort tasks maintaining parent-subtask order
 * Subtasks appear immediately after their parent in the specified order
 */
export const sortTasksWithSubtasks = (
  tasks: Task[],
  sortFn: (a: Task, b: Task) => number
): Task[] => {
  // First, sort top-level tasks
  const topLevel = tasks.filter((t) => t.parentId === null)
  const sortedTopLevel = [...topLevel].sort(sortFn)

  // Build result with subtasks inserted after parents
  const result: Task[] = []
  const taskMap = new Map(tasks.map((t) => [t.id, t]))

  for (const parent of sortedTopLevel) {
    result.push(parent)
    // Add subtasks in their specified order
    for (const subtaskId of parent.subtaskIds) {
      const subtask = taskMap.get(subtaskId)
      if (subtask) {
        result.push(subtask)
      }
    }
  }

  return result
}
