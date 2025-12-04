import React, { useMemo } from "react"
import { X } from "lucide-react"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { formatDateShort, formatDayName } from "@/lib/task-utils"
import { priorityConfig, type Task } from "@/data/sample-tasks"

interface DayDetailPopoverProps {
  date: Date | null
  tasks: Task[]
  isOpen: boolean
  onClose: () => void
  onTaskClick: (taskId: string) => void
  onToggleComplete: (taskId: string) => void
  onAddTask: (date: Date) => void
}

const sortTasks = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    if (a.dueTime && b.dueTime && a.dueTime !== b.dueTime) {
      return a.dueTime.localeCompare(b.dueTime)
    }
    if (a.dueTime && !b.dueTime) return -1
    if (!a.dueTime && b.dueTime) return 1

    const pa = priorityConfig[a.priority].order
    const pb = priorityConfig[b.priority].order
    if (pa !== pb) return pa - pb

    return a.title.localeCompare(b.title)
  })
}

export const DayDetailPopover = ({
  date,
  tasks,
  isOpen,
  onClose,
  onTaskClick,
  onToggleComplete,
  onAddTask,
}: DayDetailPopoverProps): React.JSX.Element | null => {
  const sortedTasks = useMemo(() => sortTasks(tasks), [tasks])
  const title = date
    ? `${formatDayName(date)}, ${date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      })}`
    : ""

  const handleAdd = (): void => {
    if (!date) return
    onAddTask(date)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h3 className="text-base font-semibold leading-tight">{title}</h3>
            <p className="text-sm text-muted-foreground">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            type="button"
            className="rounded p-2 text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={onClose}
            aria-label="Close day details"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[320px] overflow-y-auto px-4 py-3">
          {sortedTasks.length === 0 && (
            <p className="text-sm text-muted-foreground">No tasks for this day.</p>
          )}

          <div className="space-y-2">
            {sortedTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm",
                  "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
                onClick={() => onTaskClick(task.id)}
              >
                <Checkbox
                  checked={!!task.completedAt}
                  onCheckedChange={() => onToggleComplete(task.id)}
                  aria-label="Toggle complete"
                />
                <div className="flex flex-1 items-center gap-2">
                  <span
                    className={cn(
                      "w-12 shrink-0 tabular-nums text-xs",
                      task.dueTime ? "text-muted-foreground" : "text-muted-foreground/60"
                    )}
                  >
                    {task.dueTime || "—"}
                  </span>
                  {task.priority !== "none" && (
                    <span
                      className="block size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: priorityConfig[task.priority].color || undefined }}
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={cn(
                      "truncate text-sm",
                      task.completedAt && "line-through text-muted-foreground"
                    )}
                  >
                    {task.title}
                  </span>
                  {task.isRepeating && <span className="shrink-0 text-xs opacity-60">🔄</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-border px-4 py-3">
          <Button className="w-full" onClick={handleAdd}>
            + Add task for this day
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DayDetailPopover

