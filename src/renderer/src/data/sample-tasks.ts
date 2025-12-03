// ============================================================================
// TASK TYPES AND INTERFACES
// ============================================================================

export type Priority = "none" | "low" | "medium" | "high" | "urgent"

export type RepeatFrequency = "daily" | "weekly" | "monthly" | "yearly" | "custom"

export interface RepeatConfig {
  frequency: RepeatFrequency
  interval: number // every X days/weeks/months/years
  daysOfWeek: number[] // for weekly: [1,3,5] = Mon,Wed,Fri (0=Sun, 6=Sat)
  endDate: Date | null // optional end to recurrence
}

export interface Task {
  id: string
  title: string
  description: string // optional, rich text
  projectId: string // required, references a project
  statusId: string // references a status within the project

  priority: Priority

  // Due date
  dueDate: Date | null
  dueTime: string | null // "14:30" format, optional even if dueDate set

  // Repeating
  isRepeating: boolean
  repeatConfig: RepeatConfig | null

  // Linking
  linkedNoteIds: string[] // connections to notes
  sourceNoteId: string | null // if extracted from a note

  // Metadata
  createdAt: Date
  completedAt: Date | null // set when moved to "done" type status
}

// ============================================================================
// PRIORITY CONFIGURATION
// ============================================================================

export const priorityConfig: Record<
  Priority,
  { color: string | null; label: string | null; order: number }
> = {
  none: { color: null, label: null, order: 4 },
  low: { color: "#6b7280", label: "Low", order: 3 },
  medium: { color: "#f59e0b", label: "Medium", order: 2 },
  high: { color: "#f97316", label: "High", order: 1 },
  urgent: { color: "#ef4444", label: "Urgent", order: 0 },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Helper to create dates relative to today
 */
const daysFromNow = (days: number): Date => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(0, 0, 0, 0)
  return date
}

/**
 * Generate unique task ID
 */
export const generateTaskId = (): string => {
  return `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// ============================================================================
// SAMPLE TASKS DATA
// ============================================================================

export const sampleTasks: Task[] = [
  // ========== Personal project tasks ==========
  {
    id: "task-1",
    title: "Review API documentation",
    description: "",
    projectId: "personal",
    statusId: "p-todo",
    priority: "high",
    dueDate: daysFromNow(0), // today
    dueTime: null,
    isRepeating: false,
    repeatConfig: null,
    linkedNoteIds: [],
    sourceNoteId: null,
    createdAt: new Date("2024-12-01"),
    completedAt: null,
  },
  {
    id: "task-2",
    title: "Buy groceries",
    description: "Milk, eggs, bread, vegetables",
    projectId: "personal",
    statusId: "p-todo",
    priority: "medium",
    dueDate: daysFromNow(0), // today
    dueTime: "18:00",
    isRepeating: false,
    repeatConfig: null,
    linkedNoteIds: [],
    sourceNoteId: null,
    createdAt: new Date("2024-12-10"),
    completedAt: null,
  },
  {
    id: "task-3",
    title: "Call mom",
    description: "",
    projectId: "personal",
    statusId: "p-doing",
    priority: "none",
    dueDate: daysFromNow(1), // tomorrow
    dueTime: null,
    isRepeating: true,
    repeatConfig: {
      frequency: "weekly",
      interval: 1,
      daysOfWeek: [0], // Sunday
      endDate: null,
    },
    linkedNoteIds: [],
    sourceNoteId: null,
    createdAt: new Date("2024-11-01"),
    completedAt: null,
  },
  {
    id: "task-4",
    title: "Read 'Atomic Habits' chapter 5",
    description: "",
    projectId: "personal",
    statusId: "p-todo",
    priority: "low",
    dueDate: daysFromNow(3),
    dueTime: null,
    isRepeating: false,
    repeatConfig: null,
    linkedNoteIds: ["note-123"],
    sourceNoteId: null,
    createdAt: new Date("2024-12-05"),
    completedAt: null,
  },
  {
    id: "task-5",
    title: "Pay electricity bill",
    description: "",
    projectId: "personal",
    statusId: "p-todo",
    priority: "high",
    dueDate: daysFromNow(-2), // overdue
    dueTime: null,
    isRepeating: false,
    repeatConfig: null,
    linkedNoteIds: [],
    sourceNoteId: null,
    createdAt: new Date("2024-12-01"),
    completedAt: null,
  },

  // ========== Project Alpha tasks ==========
  {
    id: "task-6",
    title: "Design system color tokens",
    description: "Define primary, secondary, and semantic colors",
    projectId: "project-alpha",
    statusId: "a-progress",
    priority: "high",
    dueDate: daysFromNow(0), // today
    dueTime: null,
    isRepeating: false,
    repeatConfig: null,
    linkedNoteIds: [],
    sourceNoteId: null,
    createdAt: new Date("2024-12-01"),
    completedAt: null,
  },
  {
    id: "task-7",
    title: "Component inventory audit",
    description: "",
    projectId: "project-alpha",
    statusId: "a-backlog",
    priority: "medium",
    dueDate: daysFromNow(5),
    dueTime: null,
    isRepeating: false,
    repeatConfig: null,
    linkedNoteIds: [],
    sourceNoteId: null,
    createdAt: new Date("2024-12-08"),
    completedAt: null,
  },
  {
    id: "task-8",
    title: "Review typography scale",
    description: "",
    projectId: "project-alpha",
    statusId: "a-review",
    priority: "none",
    dueDate: daysFromNow(1), // tomorrow
    dueTime: "14:00",
    isRepeating: false,
    repeatConfig: null,
    linkedNoteIds: [],
    sourceNoteId: null,
    createdAt: new Date("2024-12-10"),
    completedAt: null,
  },
  {
    id: "task-9",
    title: "Setup Storybook",
    description: "",
    projectId: "project-alpha",
    statusId: "a-done",
    priority: "none",
    dueDate: daysFromNow(-3),
    dueTime: null,
    isRepeating: false,
    repeatConfig: null,
    linkedNoteIds: [],
    sourceNoteId: null,
    createdAt: new Date("2024-12-01"),
    completedAt: daysFromNow(-1),
  },

  // ========== Work tasks ==========
  {
    id: "task-10",
    title: "Prepare quarterly presentation",
    description: "Q4 results and Q1 planning",
    projectId: "work",
    statusId: "w-progress",
    priority: "urgent",
    dueDate: daysFromNow(2),
    dueTime: "09:00",
    isRepeating: false,
    repeatConfig: null,
    linkedNoteIds: [],
    sourceNoteId: null,
    createdAt: new Date("2024-12-05"),
    completedAt: null,
  },
  {
    id: "task-11",
    title: "Weekly team standup",
    description: "",
    projectId: "work",
    statusId: "w-todo",
    priority: "none",
    dueDate: daysFromNow(1), // tomorrow
    dueTime: "10:00",
    isRepeating: true,
    repeatConfig: {
      frequency: "weekly",
      interval: 1,
      daysOfWeek: [1], // Monday
      endDate: null,
    },
    linkedNoteIds: [],
    sourceNoteId: null,
    createdAt: new Date("2024-11-01"),
    completedAt: null,
  },
  {
    id: "task-12",
    title: "Update project roadmap",
    description: "",
    projectId: "work",
    statusId: "w-todo",
    priority: "medium",
    dueDate: null, // no due date
    dueTime: null,
    isRepeating: false,
    repeatConfig: null,
    linkedNoteIds: [],
    sourceNoteId: null,
    createdAt: new Date("2024-12-01"),
    completedAt: null,
  },
]

// ============================================================================
// CREATE DEFAULT TASK
// ============================================================================

export const createDefaultTask = (
  projectId: string,
  statusId: string,
  title: string = "",
  dueDate: Date | null = null
): Task => ({
  id: generateTaskId(),
  title,
  description: "",
  projectId,
  statusId,
  priority: "none",
  dueDate,
  dueTime: null,
  isRepeating: false,
  repeatConfig: null,
  linkedNoteIds: [],
  sourceNoteId: null,
  createdAt: new Date(),
  completedAt: null,
})

