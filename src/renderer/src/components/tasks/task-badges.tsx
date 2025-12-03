import { Repeat } from "lucide-react"

import { cn } from "@/lib/utils"
import { formatDueDate, type DueDateStatus } from "@/lib/task-utils"
import { priorityConfig, type Priority } from "@/data/sample-tasks"
import type { Project } from "@/data/tasks-data"

// ============================================================================
// PROJECT BADGE
// ============================================================================

interface ProjectBadgeProps {
  project: Project
  className?: string
}

export const ProjectBadge = ({
  project,
  className,
}: ProjectBadgeProps): React.JSX.Element => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs",
        "bg-muted text-text-secondary",
        className
      )}
    >
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: project.color }}
        aria-hidden="true"
      />
      <span className="truncate max-w-[100px]">{project.name}</span>
    </span>
  )
}

// ============================================================================
// PRIORITY BADGE
// ============================================================================

interface PriorityBadgeProps {
  priority: Priority
  showLabel?: boolean
  className?: string
}

export const PriorityBadge = ({
  priority,
  showLabel = false,
  className,
}: PriorityBadgeProps): React.JSX.Element | null => {
  const config = priorityConfig[priority]

  // Don't render anything for "none" priority
  if (priority === "none" || !config.color) {
    return null
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        showLabel && "text-xs",
        className
      )}
      aria-label={`${config.label} priority`}
    >
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: config.color }}
        aria-hidden="true"
      />
      {showLabel && (
        <span style={{ color: config.color }}>{config.label}</span>
      )}
    </span>
  )
}

// ============================================================================
// DUE DATE BADGE
// ============================================================================

interface DueDateBadgeProps {
  dueDate: Date | null
  dueTime: string | null
  isRepeating?: boolean
  className?: string
}

const dueDateStatusStyles: Record<DueDateStatus, string> = {
  overdue: "text-destructive",
  today: "text-amber-600 dark:text-amber-500",
  tomorrow: "text-text-secondary",
  upcoming: "text-text-secondary",
  later: "text-text-tertiary",
  none: "text-text-tertiary",
}

export const DueDateBadge = ({
  dueDate,
  dueTime,
  isRepeating = false,
  className,
}: DueDateBadgeProps): React.JSX.Element => {
  const formatted = formatDueDate(dueDate, dueTime)

  if (!formatted) {
    return (
      <span className={cn("text-xs text-text-tertiary", className)}>—</span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs",
        dueDateStatusStyles[formatted.status],
        className
      )}
    >
      {isRepeating && (
        <Repeat className="size-3 shrink-0" aria-label="Repeating task" />
      )}
      <span>{formatted.label}</span>
      {formatted.status === "overdue" && (
        <span className="text-[10px] opacity-80">Overdue</span>
      )}
    </span>
  )
}

// ============================================================================
// TASK CHECKBOX
// ============================================================================

interface TaskCheckboxProps {
  checked: boolean
  onChange: () => void
  disabled?: boolean
  className?: string
}

export const TaskCheckbox = ({
  checked,
  onChange,
  disabled = false,
  className,
}: TaskCheckboxProps): React.JSX.Element => {
  const handleClick = (e: React.MouseEvent): void => {
    e.stopPropagation()
    if (!disabled) {
      onChange()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if ((e.key === "Enter" || e.key === " ") && !disabled) {
      e.preventDefault()
      e.stopPropagation()
      onChange()
    }
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      tabIndex={0}
      className={cn(
        "size-5 shrink-0 rounded-full border-2 transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        checked
          ? "border-primary bg-primary"
          : "border-text-tertiary hover:border-primary",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      aria-label={checked ? "Mark as incomplete" : "Mark as complete"}
    >
      {checked && (
        <svg
          className="size-full text-primary-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  ProjectBadge,
  PriorityBadge,
  DueDateBadge,
  TaskCheckbox,
}

