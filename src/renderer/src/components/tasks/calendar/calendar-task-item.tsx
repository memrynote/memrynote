import React from "react"

import { cn } from "@/lib/utils"
import { priorityConfig, type Task } from "@/data/sample-tasks"
import { isBefore, startOfDay } from "@/lib/task-utils"

interface CalendarTaskItemProps {
  task: Task
  compact?: boolean
  onClick?: (taskId: string) => void
}

const getPriorityColor = (priority: Task["priority"]): string | null => {
  return priorityConfig[priority].color
}

const formatShortTime = (time: string | null): string | null => {
  if (!time) return null
  const [hours, minutes] = time.split(":").map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
  return `${hours}:${minutes.toString().padStart(2, "0")}`
}

export const CalendarTaskItem = ({
  task,
  compact = false,
  onClick,
}: CalendarTaskItemProps): React.JSX.Element => {
  const priorityColor = getPriorityColor(task.priority) || "#9ca3af"
  const isCompleted = !!task.completedAt
  const isOverdue =
    task.dueDate !== null &&
    isBefore(startOfDay(task.dueDate), startOfDay(new Date())) &&
    !isCompleted

  if (compact) {
    return (
      <span
        className={cn(
          "inline-flex size-2 rounded-full",
          isOverdue && "ring-2 ring-red-300"
        )}
        style={{ backgroundColor: priorityColor }}
        title={task.title}
      />
    )
  }

  const handleClick = (): void => {
    if (onClick) onClick(task.id)
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onClick?.(task.id)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex items-center gap-1.5 rounded px-1.5 py-0.5 text-xs",
        "hover:bg-muted cursor-pointer truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isCompleted && "opacity-60 line-through",
        isOverdue && "bg-red-50"
      )}
      aria-label={task.title}
    >
    {task.priority !== "none" && (
      <span
        className="block size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: priorityColor }}
        aria-hidden="true"
      />
    )}
    {task.dueTime && (
      <span className="shrink-0 text-muted-foreground">{formatShortTime(task.dueTime)}</span>
    )}
    <span className="truncate">{task.title}</span>
    {task.isRepeating && <span className="shrink-0">🔄</span>}
    </div>
  )
}

export default CalendarTaskItem

