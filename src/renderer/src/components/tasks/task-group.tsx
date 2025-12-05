import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"

import { cn } from "@/lib/utils"
import { SortableTaskRow } from "@/components/tasks/drag-drop"
import { SortableParentTaskRow } from "@/components/tasks/sortable-parent-task-row"
import { isTaskCompleted, startOfDay, addDays } from "@/lib/task-utils"
import { getTopLevelTasks, getSubtasks, calculateProgress, isSubtask } from "@/lib/subtask-utils"
import type { Task } from "@/data/sample-tasks"
import type { Project, Status } from "@/data/tasks-data"

// ============================================================================
// HELPER: Get date from label
// ============================================================================

/**
 * Convert a due date group label to an actual Date
 * Returns null for "No Due Date" or unknown labels
 */
const getDateFromLabel = (label: string): Date | null => {
  const normalizedLabel = label.toLowerCase()
  const today = startOfDay(new Date())

  switch (normalizedLabel) {
    case "overdue":
      // For overdue, we'll use yesterday as the target (or keep original)
      return addDays(today, -1)
    case "today":
      return today
    case "tomorrow":
      return addDays(today, 1)
    case "upcoming":
      // Upcoming typically means within the next week, use 2 days from now
      return addDays(today, 2)
    case "later":
      // Later means more than a week out, use next week
      return addDays(today, 7)
    case "no due date":
    case "noduedate":
      return null
    default:
      return null
  }
}

// ============================================================================
// TYPES
// ============================================================================

interface TaskGroupHeaderProps {
  label: string
  count: number
  accentColor?: string
  isMuted?: boolean
  className?: string
}

interface TaskGroupProps {
  label: string
  tasks: Task[]
  allTasks: Task[] // All tasks for subtask lookup
  projects: Project[]
  accentColor?: string
  isMuted?: boolean
  showProjectBadge?: boolean
  selectedTaskId?: string | null
  onToggleComplete: (taskId: string) => void
  onToggleSubtaskComplete?: (subtaskId: string) => void
  onTaskClick?: (taskId: string) => void
  className?: string
  /** Optional explicit date for this group (used for reschedule on drop) */
  date?: Date | null
  // Selection props
  isSelectionMode?: boolean
  selectedIds?: Set<string>
  onToggleSelect?: (taskId: string) => void
  onShiftSelect?: (taskId: string) => void
  // Expand/collapse props
  expandedIds?: Set<string>
  onToggleExpand?: (taskId: string) => void
  // Subtask management props
  onAddSubtask?: (parentId: string, title: string) => void
  onReorderSubtasks?: (parentId: string, newOrder: string[]) => void
}

interface StatusTaskGroupProps {
  status: Status
  tasks: Task[]
  allTasks: Task[] // All tasks for subtask lookup
  project: Project
  selectedTaskId?: string | null
  onToggleComplete: (taskId: string) => void
  onToggleSubtaskComplete?: (subtaskId: string) => void
  onTaskClick?: (taskId: string) => void
  className?: string
  // Selection props
  isSelectionMode?: boolean
  selectedIds?: Set<string>
  onToggleSelect?: (taskId: string) => void
  onShiftSelect?: (taskId: string) => void
  // Expand/collapse props
  expandedIds?: Set<string>
  onToggleExpand?: (taskId: string) => void
  // Subtask management props
  onAddSubtask?: (parentId: string, title: string) => void
  onReorderSubtasks?: (parentId: string, newOrder: string[]) => void
}

// ============================================================================
// TASK GROUP HEADER
// ============================================================================

const TaskGroupHeader = ({
  label,
  count,
  accentColor,
  isMuted = false,
  className,
}: TaskGroupHeaderProps): React.JSX.Element => {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-3 py-2",
        className
      )}
    >
      <h3
        className={cn(
          "text-xs font-semibold uppercase tracking-wide",
          isMuted ? "text-text-tertiary" : "text-text-secondary"
        )}
        style={accentColor ? { color: accentColor } : undefined}
      >
        {label}
      </h3>
      <span className="text-xs text-text-tertiary">({count})</span>
    </div>
  )
}

// ============================================================================
// TASK GROUP (for due date grouping)
// ============================================================================

export const TaskGroup = ({
  label,
  tasks,
  allTasks,
  projects,
  accentColor,
  isMuted = false,
  showProjectBadge = false,
  selectedTaskId,
  onToggleComplete,
  onToggleSubtaskComplete,
  onTaskClick,
  className,
  date,
  // Selection props
  isSelectionMode = false,
  selectedIds,
  onToggleSelect,
  onShiftSelect,
  // Expand/collapse props
  expandedIds,
  onToggleExpand,
  // Subtask management props
  onAddSubtask,
  onReorderSubtasks,
}: TaskGroupProps): React.JSX.Element | null => {
  // Create a unique section ID based on label
  const sectionId = `group-${label.toLowerCase().replace(/\s+/g, "-")}`

  // Determine the target date for this section
  // Use explicit date prop if provided, otherwise derive from label
  const targetDate = date !== undefined ? date : getDateFromLabel(label)

  // Set up droppable for section-level drops
  const { setNodeRef, isOver } = useDroppable({
    id: sectionId,
    data: {
      type: "section",
      sectionId,
      label,
      date: targetDate,
    },
  })

  // Filter to only top-level tasks (subtasks are rendered within their parent)
  const topLevelTasks = getTopLevelTasks(tasks)

  // Get task IDs for SortableContext (only top-level)
  const taskIds = topLevelTasks.map((t) => t.id)

  // Count top-level tasks for header display
  const topLevelCount = topLevelTasks.length

  // Don't render if no top-level tasks
  if (topLevelCount === 0) return null

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "mb-4 rounded-lg transition-colors",
        isOver && "bg-primary/5 ring-2 ring-primary/30",
        className
      )}
      aria-labelledby={sectionId}
    >
      <TaskGroupHeader
        label={label}
        count={topLevelCount}
        accentColor={accentColor}
        isMuted={isMuted}
      />
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col">
          {topLevelTasks.map((task) => {
            const project = projects.find((p) => p.id === task.projectId)
            if (!project) return null

            const completed = isTaskCompleted(task, projects)
            const isCheckedForSelection = selectedIds?.has(task.id) ?? false
            const subtasks = getSubtasks(task.id, allTasks || tasks)
            const progress = calculateProgress(subtasks)
            const hasSubtasksFlag = subtasks.length > 0
            const isExpanded = expandedIds?.has(task.id) ?? false

            // If task has subtasks and we have expand/collapse handlers, render with subtask support
            if (hasSubtasksFlag && onToggleExpand) {
              return (
                <SortableParentTaskRow
                  key={task.id}
                  task={task}
                  project={project}
                  sectionId={sectionId}
                  subtasks={subtasks}
                  progress={progress}
                  isExpanded={isExpanded}
                  isCompleted={completed}
                  isSelected={selectedTaskId === task.id}
                  showProjectBadge={showProjectBadge}
                  onToggleExpand={onToggleExpand}
                  onToggleComplete={onToggleComplete}
                  onToggleSubtaskComplete={onToggleSubtaskComplete}
                  onClick={onTaskClick}
                  // Selection props
                  isSelectionMode={isSelectionMode}
                  isCheckedForSelection={isCheckedForSelection}
                  onToggleSelect={onToggleSelect}
                  onShiftSelect={onShiftSelect}
                  // Subtask management props
                  onAddSubtask={onAddSubtask}
                  onReorderSubtasks={onReorderSubtasks}
                />
              )
            }

            // Regular task without subtasks
            return (
              <SortableTaskRow
                key={task.id}
                task={task}
                project={project}
                sectionId={sectionId}
                isCompleted={completed}
                isSelected={selectedTaskId === task.id}
                showProjectBadge={showProjectBadge}
                onToggleComplete={onToggleComplete}
                onClick={onTaskClick}
                // Selection props
                isSelectionMode={isSelectionMode}
                isCheckedForSelection={isCheckedForSelection}
                onToggleSelect={onToggleSelect}
                onShiftSelect={onShiftSelect}
              />
            )
          })}
        </div>
      </SortableContext>
    </section>
  )
}

// ============================================================================
// STATUS TASK GROUP (for project view grouping by status)
// ============================================================================

export const StatusTaskGroup = ({
  status,
  tasks,
  allTasks,
  project,
  selectedTaskId,
  onToggleComplete,
  onToggleSubtaskComplete,
  onTaskClick,
  className,
  // Selection props
  isSelectionMode = false,
  selectedIds,
  onToggleSelect,
  onShiftSelect,
  // Expand/collapse props
  expandedIds,
  onToggleExpand,
  // Subtask management props
  onAddSubtask,
  onReorderSubtasks,
}: StatusTaskGroupProps): React.JSX.Element | null => {
  // Create section ID from status
  const sectionId = `status-${status.id}`

  // Set up droppable for status changes (like Kanban columns)
  // Using type "column" so it triggers status change logic in drag handlers
  const { setNodeRef, isOver } = useDroppable({
    id: sectionId,
    data: {
      type: "column",
      columnId: status.id,
      statusId: status.id,
      status,
      project,
      label: status.name,
    },
  })

  // Filter to only top-level tasks
  const topLevelTasks = getTopLevelTasks(tasks)

  // Get task IDs for SortableContext (only top-level)
  const taskIds = topLevelTasks.map((t) => t.id)

  const isDoneStatus = status.type === "done"
  const topLevelCount = topLevelTasks.length

  // Don't render empty groups - same as TaskGroup
  // This prevents flickering issues with empty drop targets
  if (topLevelCount === 0) return null

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "mb-4 rounded-lg",
        isOver && "bg-primary/5 ring-2 ring-primary/30",
        className
      )}
      aria-labelledby={sectionId}
    >
      <TaskGroupHeader
        label={status.name.toUpperCase()}
        count={topLevelCount}
        accentColor={status.color}
        isMuted={isDoneStatus}
      />
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col">
          {topLevelTasks.map((task) => {
            const completed = status.type === "done"
            const isCheckedForSelection = selectedIds?.has(task.id) ?? false
            const subtasks = getSubtasks(task.id, allTasks || tasks)
            const progress = calculateProgress(subtasks)
            const hasSubtasksFlag = subtasks.length > 0
            const isExpanded = expandedIds?.has(task.id) ?? false

            // If task has subtasks and we have expand/collapse handlers, render with subtask support
            if (hasSubtasksFlag && onToggleExpand) {
              return (
                <SortableParentTaskRow
                  key={task.id}
                  task={task}
                  project={project}
                  sectionId={sectionId}
                  subtasks={subtasks}
                  progress={progress}
                  isExpanded={isExpanded}
                  isCompleted={completed}
                  isSelected={selectedTaskId === task.id}
                  showProjectBadge={false}
                  onToggleExpand={onToggleExpand}
                  onToggleComplete={onToggleComplete}
                  onToggleSubtaskComplete={onToggleSubtaskComplete}
                  onClick={onTaskClick}
                  // Selection props
                  isSelectionMode={isSelectionMode}
                  isCheckedForSelection={isCheckedForSelection}
                  onToggleSelect={onToggleSelect}
                  onShiftSelect={onShiftSelect}
                  // Subtask management props
                  onAddSubtask={onAddSubtask}
                  onReorderSubtasks={onReorderSubtasks}
                />
              )
            }

            return (
              <SortableTaskRow
                key={task.id}
                task={task}
                project={project}
                sectionId={sectionId}
                isCompleted={completed}
                isSelected={selectedTaskId === task.id}
                showProjectBadge={false} // Never show in project view
                onToggleComplete={onToggleComplete}
                onClick={onTaskClick}
                // Selection props
                isSelectionMode={isSelectionMode}
                isCheckedForSelection={isCheckedForSelection}
                onToggleSelect={onToggleSelect}
                onShiftSelect={onShiftSelect}
              />
            )
          })}
        </div>
      </SortableContext>
    </section>
  )
}

export default TaskGroup
