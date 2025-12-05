import { useState, useCallback } from "react"
import { toast } from "sonner"

import {
  createSubtask,
  createMultipleSubtasks,
  reorderSubtasks,
  promoteToTask,
  demoteToSubtask,
  deleteSubtask,
  deleteParentWithSubtasks,
  completeParentWithSubtasks,
  getIncompleteSubtasks,
  hasIncompleteSubtasks,
  hasSubtasks,
  type CreateSubtaskOptions,
} from "@/lib/subtask-utils"
import type { Task } from "@/data/sample-tasks"
import type { Project } from "@/data/tasks-data"

// ============================================================================
// TYPES
// ============================================================================

interface UseSubtaskManagementOptions {
  tasks: Task[]
  projects: Project[]
  onTasksChange: (tasks: Task[]) => void
}

interface UseSubtaskManagementReturn {
  // Dialog state
  deleteParentDialogOpen: boolean
  completeParentDialogOpen: boolean
  parentPickerDialogOpen: boolean

  // Dialog data
  pendingDeleteParent: Task | null
  pendingDeleteSubtaskCount: number
  pendingCompleteParent: Task | null
  pendingCompleteIncompleteSubtasks: Task[]
  pendingDemoteTask: Task | null

  // Dialog handlers
  openDeleteParentDialog: (parent: Task) => void
  closeDeleteParentDialog: () => void
  confirmDeleteParent: (keepSubtasks: boolean) => void

  openCompleteParentDialog: (parent: Task) => void
  closeCompleteParentDialog: () => void
  confirmCompleteParent: (completeSubtasks: boolean) => void

  openParentPickerDialog: (task: Task) => void
  closeParentPickerDialog: () => void
  confirmDemoteToSubtask: (parentId: string) => void

  // Direct actions
  handleAddSubtask: (parentId: string, title: string) => void
  handleBulkAddSubtasks: (parentId: string, titles: string[]) => void
  handleReorderSubtasks: (parentId: string, newOrder: string[]) => void
  handlePromoteToTask: (subtaskId: string) => void
  handleDeleteSubtask: (subtaskId: string) => void

  // Smart actions (may open dialogs if needed)
  handleDeleteTask: (taskId: string) => void
  handleCompleteTask: (taskId: string) => void
}

// ============================================================================
// USE SUBTASK MANAGEMENT HOOK
// ============================================================================

export const useSubtaskManagement = ({
  tasks,
  projects,
  onTasksChange,
}: UseSubtaskManagementOptions): UseSubtaskManagementReturn => {
  // Delete parent dialog state
  const [deleteParentDialogOpen, setDeleteParentDialogOpen] = useState(false)
  const [pendingDeleteParent, setPendingDeleteParent] = useState<Task | null>(null)
  const [pendingDeleteSubtaskCount, setPendingDeleteSubtaskCount] = useState(0)

  // Complete parent dialog state
  const [completeParentDialogOpen, setCompleteParentDialogOpen] = useState(false)
  const [pendingCompleteParent, setPendingCompleteParent] = useState<Task | null>(null)
  const [pendingCompleteIncompleteSubtasks, setPendingCompleteIncompleteSubtasks] = useState<Task[]>([])

  // Parent picker dialog state
  const [parentPickerDialogOpen, setParentPickerDialogOpen] = useState(false)
  const [pendingDemoteTask, setPendingDemoteTask] = useState<Task | null>(null)

  // ========================================================================
  // ADD SUBTASK
  // ========================================================================

  const handleAddSubtask = useCallback(
    (parentId: string, title: string): void => {
      const options: CreateSubtaskOptions = {
        parentId,
        title,
      }

      const result = createSubtask(options, tasks)

      if (result.success && result.updatedTasks) {
        onTasksChange(result.updatedTasks)
        toast.success("Subtask added")
      } else {
        toast.error(result.error || "Failed to add subtask")
      }
    },
    [tasks, onTasksChange]
  )

  // ========================================================================
  // BULK ADD SUBTASKS
  // ========================================================================

  const handleBulkAddSubtasks = useCallback(
    (parentId: string, titles: string[]): void => {
      if (titles.length === 0) return

      const result = createMultipleSubtasks(parentId, titles, tasks)

      if (result.success && result.updatedTasks) {
        onTasksChange(result.updatedTasks)
        toast.success(`${titles.length} subtask${titles.length > 1 ? "s" : ""} added`)
      } else {
        toast.error(result.error || "Failed to add subtasks")
      }
    },
    [tasks, onTasksChange]
  )

  // ========================================================================
  // REORDER SUBTASKS
  // ========================================================================

  const handleReorderSubtasks = useCallback(
    (parentId: string, newOrder: string[]): void => {
      const result = reorderSubtasks(parentId, newOrder, tasks)

      if (result.success && result.updatedTasks) {
        onTasksChange(result.updatedTasks)
      } else {
        toast.error(result.error || "Failed to reorder subtasks")
      }
    },
    [tasks, onTasksChange]
  )

  // ========================================================================
  // PROMOTE TO TASK
  // ========================================================================

  const handlePromoteToTask = useCallback(
    (subtaskId: string): void => {
      const subtask = tasks.find((t) => t.id === subtaskId)
      const result = promoteToTask(subtaskId, tasks)

      if (result.success && result.updatedTasks) {
        onTasksChange(result.updatedTasks)
        toast.success(`"${subtask?.title}" promoted to task`)
      } else {
        toast.error(result.error || "Failed to promote subtask")
      }
    },
    [tasks, onTasksChange]
  )

  // ========================================================================
  // DELETE SUBTASK
  // ========================================================================

  const handleDeleteSubtask = useCallback(
    (subtaskId: string): void => {
      const result = deleteSubtask(subtaskId, tasks)

      if (result.success && result.updatedTasks) {
        onTasksChange(result.updatedTasks)
        toast.success("Subtask deleted", {
          description: "The subtask has been removed",
        })
      } else {
        toast.error(result.error || "Failed to delete subtask")
      }
    },
    [tasks, onTasksChange]
  )

  // ========================================================================
  // DELETE PARENT DIALOG
  // ========================================================================

  const openDeleteParentDialog = useCallback((parent: Task): void => {
    setPendingDeleteParent(parent)
    setPendingDeleteSubtaskCount(parent.subtaskIds.length)
    setDeleteParentDialogOpen(true)
  }, [])

  const closeDeleteParentDialog = useCallback((): void => {
    setDeleteParentDialogOpen(false)
    setPendingDeleteParent(null)
    setPendingDeleteSubtaskCount(0)
  }, [])

  const confirmDeleteParent = useCallback(
    (keepSubtasks: boolean): void => {
      if (!pendingDeleteParent) return

      const result = deleteParentWithSubtasks(
        pendingDeleteParent.id,
        keepSubtasks,
        tasks
      )

      if (result.success && result.updatedTasks) {
        onTasksChange(result.updatedTasks)
        toast.success(
          keepSubtasks
            ? "Task deleted, subtasks converted to tasks"
            : "Task and subtasks deleted"
        )
      } else {
        toast.error(result.error || "Failed to delete task")
      }

      closeDeleteParentDialog()
    },
    [pendingDeleteParent, tasks, onTasksChange, closeDeleteParentDialog]
  )

  // ========================================================================
  // COMPLETE PARENT DIALOG
  // ========================================================================

  const openCompleteParentDialog = useCallback(
    (parent: Task): void => {
      const incompleteSubtasks = getIncompleteSubtasks(parent.id, tasks)
      setPendingCompleteParent(parent)
      setPendingCompleteIncompleteSubtasks(incompleteSubtasks)
      setCompleteParentDialogOpen(true)
    },
    [tasks]
  )

  const closeCompleteParentDialog = useCallback((): void => {
    setCompleteParentDialogOpen(false)
    setPendingCompleteParent(null)
    setPendingCompleteIncompleteSubtasks([])
  }, [])

  const confirmCompleteParent = useCallback(
    (completeSubtasks: boolean): void => {
      if (!pendingCompleteParent) return

      const result = completeParentWithSubtasks(
        pendingCompleteParent.id,
        completeSubtasks,
        tasks
      )

      if (result.success && result.updatedTasks) {
        onTasksChange(result.updatedTasks)
        toast.success(
          completeSubtasks
            ? "Task and subtasks completed"
            : "Task completed"
        )
      } else {
        toast.error(result.error || "Failed to complete task")
      }

      closeCompleteParentDialog()
    },
    [pendingCompleteParent, tasks, onTasksChange, closeCompleteParentDialog]
  )

  // ========================================================================
  // PARENT PICKER DIALOG (DEMOTE TO SUBTASK)
  // ========================================================================

  const openParentPickerDialog = useCallback((task: Task): void => {
    setPendingDemoteTask(task)
    setParentPickerDialogOpen(true)
  }, [])

  const closeParentPickerDialog = useCallback((): void => {
    setParentPickerDialogOpen(false)
    setPendingDemoteTask(null)
  }, [])

  const confirmDemoteToSubtask = useCallback(
    (parentId: string): void => {
      if (!pendingDemoteTask) return

      const parent = tasks.find((t) => t.id === parentId)
      const result = demoteToSubtask(pendingDemoteTask.id, parentId, tasks)

      if (result.success && result.updatedTasks) {
        onTasksChange(result.updatedTasks)
        toast.success(`Moved under "${parent?.title}"`)
      } else {
        toast.error(result.error || "Failed to make subtask")
      }

      closeParentPickerDialog()
    },
    [pendingDemoteTask, tasks, onTasksChange, closeParentPickerDialog]
  )

  // ========================================================================
  // SMART DELETE (opens dialog if has subtasks)
  // ========================================================================

  const handleDeleteTask = useCallback(
    (taskId: string): void => {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      // If it's a subtask, use simple delete
      if (task.parentId !== null) {
        handleDeleteSubtask(taskId)
        return
      }

      // If it has subtasks, open confirmation dialog
      if (hasSubtasks(task)) {
        openDeleteParentDialog(task)
        return
      }

      // Simple delete for task without subtasks
      const updatedTasks = tasks.filter((t) => t.id !== taskId)
      onTasksChange(updatedTasks)
      toast.success("Task deleted")
    },
    [tasks, onTasksChange, handleDeleteSubtask, openDeleteParentDialog]
  )

  // ========================================================================
  // SMART COMPLETE (opens dialog if has incomplete subtasks)
  // ========================================================================

  const handleCompleteTask = useCallback(
    (taskId: string): void => {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      // If already completed, uncomplete
      if (task.completedAt !== null) {
        const updatedTasks = tasks.map((t) =>
          t.id === taskId ? { ...t, completedAt: null } : t
        )
        onTasksChange(updatedTasks)
        return
      }

      // If it's a parent with incomplete subtasks, open dialog
      if (task.parentId === null && hasIncompleteSubtasks(taskId, tasks)) {
        openCompleteParentDialog(task)
        return
      }

      // Simple complete
      const updatedTasks = tasks.map((t) =>
        t.id === taskId ? { ...t, completedAt: new Date() } : t
      )
      onTasksChange(updatedTasks)
      toast.success("Task completed")
    },
    [tasks, onTasksChange, openCompleteParentDialog]
  )

  return {
    // Dialog state
    deleteParentDialogOpen,
    completeParentDialogOpen,
    parentPickerDialogOpen,

    // Dialog data
    pendingDeleteParent,
    pendingDeleteSubtaskCount,
    pendingCompleteParent,
    pendingCompleteIncompleteSubtasks,
    pendingDemoteTask,

    // Dialog handlers
    openDeleteParentDialog,
    closeDeleteParentDialog,
    confirmDeleteParent,

    openCompleteParentDialog,
    closeCompleteParentDialog,
    confirmCompleteParent,

    openParentPickerDialog,
    closeParentPickerDialog,
    confirmDemoteToSubtask,

  // Direct actions
  handleAddSubtask,
  handleBulkAddSubtasks,
  handleReorderSubtasks,
  handlePromoteToTask,
  handleDeleteSubtask,

    // Smart actions
    handleDeleteTask,
    handleCompleteTask,
  }
}

export default useSubtaskManagement
