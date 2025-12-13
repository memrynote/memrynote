import { cn } from "@/lib/utils"
import { formatDueDate } from "@/lib/task-utils"
import {
  TaskCheckbox,
  InteractiveProjectBadge,
  InteractivePriorityBadge,
  InteractiveDueDateBadge,
} from "@/components/tasks/task-badges"
import { RepeatIndicator } from "@/components/tasks/repeat-indicator"
import type { Task, Priority } from "@/data/sample-tasks"
import type { Project } from "@/data/tasks-data"

// ============================================================================
// TYPES
// ============================================================================

interface TaskRowProps {
  task: Task
  project: Project
  projects: Project[]
  isCompleted: boolean
  isSelected?: boolean
  showProjectBadge?: boolean
  onToggleComplete: (taskId: string) => void
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void
  onClick?: (taskId: string) => void
  className?: string
}

// ============================================================================
// TASK ROW COMPONENT
// ============================================================================

export const TaskRow = ({
  task,
  project,
  projects,
  isCompleted,
  isSelected = false,
  showProjectBadge = false,
  onToggleComplete,
  onUpdateTask,
  onClick,
  className,
}: TaskRowProps): React.JSX.Element => {
  // Check if overdue
  const formattedDate = formatDueDate(task.dueDate, task.dueTime)
  const isOverdue = formattedDate?.status === "overdue"

  const handleRowClick = (): void => {
    onClick?.(task.id)
  }

  const handleRowKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter" && onClick) {
      e.preventDefault()
      onClick(task.id)
    }
  }

  const handleToggleComplete = (): void => {
    onToggleComplete(task.id)
  }

  const handleProjectChange = (projectId: string): void => {
    onUpdateTask?.(task.id, { projectId })
  }

  const handlePriorityChange = (priority: Priority): void => {
    onUpdateTask?.(task.id, { priority })
  }

  const handleDateChange = (date: Date | null): void => {
    onUpdateTask?.(task.id, { dueDate: date })
  }

  return (
    <div
      role="button"
      tabIndex={onClick ? 0 : -1}
      onClick={handleRowClick}
      onKeyDown={onClick ? handleRowKeyDown : undefined}
      className={cn(
        "group rounded-md px-3 py-2.5 transition-colors duration-150",
        "hover:bg-accent/50",
        onClick && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        // Mobile: flex layout for stacked view
        "flex flex-col gap-1",
        // Tablet+: grid layout with fixed columns
        // md: [check 20px][title 1fr][priority 70px][due 110px] (no project)
        // lg: [check 20px][title 1fr][project 120px][priority 70px][due 110px]
        "md:grid md:items-center md:gap-2",
        showProjectBadge
          ? "md:grid-cols-[20px_1fr_70px_110px] lg:grid-cols-[20px_1fr_120px_70px_110px]"
          : "md:grid-cols-[20px_1fr_70px_110px]",
        isOverdue && !isCompleted && "border-l-2 border-l-destructive",
        // Detail panel selected
        isSelected && "bg-primary/10 ring-2 ring-primary/30",
        className
      )}
      aria-label={`Task: ${task.title}${isCompleted ? ", completed" : ""}`}
    >
      {/* Mobile: Main row with checkbox and title */}
      {/* Desktop: Grid columns */}
      <div className="flex items-center gap-2 md:contents">
        {/* Task Completion Checkbox - Column 1 */}
        <div className="flex items-center justify-center shrink-0">
          <TaskCheckbox
            checked={isCompleted}
            onChange={handleToggleComplete}
          />
        </div>

        {/* Title with Repeat Indicator - Column 2 (flex-1) */}
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <span
            className={cn(
              "truncate text-sm",
              isCompleted
                ? "text-text-tertiary line-through decoration-text-tertiary"
                : "text-text-primary"
            )}
          >
            {task.title}
          </span>
          {task.isRepeating && task.repeatConfig && !isCompleted && (
            <RepeatIndicator config={task.repeatConfig} size="sm" />
          )}
        </div>

        {/* Project Badge - Column 3 (conditional, 120px) - hidden on mobile & tablet */}
        {showProjectBadge && (
          <div className="hidden lg:block">
            <InteractiveProjectBadge
              project={project}
              projects={projects}
              onProjectChange={handleProjectChange}
              fixedWidth
            />
          </div>
        )}

        {/* Priority Badge - Column 4 (70px) - hidden on mobile */}
        <div className="hidden md:block">
          <InteractivePriorityBadge
            priority={isCompleted ? "none" : task.priority}
            onPriorityChange={handlePriorityChange}
            compact
            fixedWidth
          />
        </div>

        {/* Due Date Badge - Column 5 (110px) - hidden on mobile */}
        <div className="hidden md:block">
          <InteractiveDueDateBadge
            dueDate={task.dueDate}
            dueTime={task.dueTime}
            onDateChange={handleDateChange}
            isRepeating={task.isRepeating}
            fixedWidth
            className={cn(isCompleted && "opacity-60")}
          />
        </div>
      </div>

      {/* Mobile: Stacked metadata row */}
      <div className="flex items-center gap-2 pl-7 text-xs md:hidden">
        {showProjectBadge && (
          <InteractiveProjectBadge
            project={project}
            projects={projects}
            onProjectChange={handleProjectChange}
          />
        )}
        {!isCompleted && task.priority !== "none" && (
          <InteractivePriorityBadge
            priority={task.priority}
            onPriorityChange={handlePriorityChange}
            compact
          />
        )}
        <InteractiveDueDateBadge
          dueDate={task.dueDate}
          dueTime={task.dueTime}
          onDateChange={handleDateChange}
          isRepeating={task.isRepeating}
          className={cn(isCompleted && "opacity-60")}
        />
      </div>
    </div>
  )
}

export default TaskRow
