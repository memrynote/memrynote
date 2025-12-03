import { useState, useRef, useCallback, useMemo } from "react"
import { Plus, Calendar, Folder } from "lucide-react"

import { cn } from "@/lib/utils"
import {
    parseQuickAdd,
    getParsePreview,
    hasSpecialSyntax,
} from "@/lib/quick-add-parser"
import { priorityConfig, type Priority } from "@/data/sample-tasks"
import type { Project } from "@/data/tasks-data"
import { formatDateShort } from "@/lib/task-utils"

// ============================================================================
// TYPES
// ============================================================================

interface QuickAddInputProps {
    onAdd: (
        title: string,
        parsedData?: {
            dueDate: Date | null
            priority: Priority
            projectId: string | null
        }
    ) => void
    onOpenModal?: (prefillTitle: string) => void
    projects: Project[]
    placeholder?: string
    className?: string
}

// ============================================================================
// PRIORITY DOT COMPONENT
// ============================================================================

const PriorityDot = ({
    priority,
    className,
}: {
    priority: Priority
    className?: string
}): React.JSX.Element | null => {
    const config = priorityConfig[priority]
    if (!config.color) return null

    return (
        <span
            className={cn("size-2.5 shrink-0 rounded-full", className)}
            style={{ backgroundColor: config.color }}
            aria-hidden="true"
        />
    )
}

// ============================================================================
// PARSE PREVIEW COMPONENT
// ============================================================================

interface ParsePreviewProps {
    dueDate: Date | null
    priority: Priority
    projectName: string | null
}

const ParsePreview = ({
    dueDate,
    priority,
    projectName,
}: ParsePreviewProps): React.JSX.Element | null => {
    const items: React.ReactNode[] = []

    // Due date preview
    if (dueDate) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const isToday = dueDate.getTime() === today.getTime()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const isTomorrow = dueDate.getTime() === tomorrow.getTime()

        let dateLabel = formatDateShort(dueDate)
        if (isToday) dateLabel = "Today"
        if (isTomorrow) dateLabel = "Tomorrow"

        items.push(
            <span key="date" className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-amber-500" />
                <span className="text-amber-600">{dateLabel}</span>
            </span>
        )
    }

    // Priority preview
    if (priority !== "none") {
        const config = priorityConfig[priority]
        items.push(
            <span key="priority" className="flex items-center gap-1.5">
                <PriorityDot priority={priority} />
                <span style={{ color: config.color || undefined }}>{config.label}</span>
            </span>
        )
    }

    // Project preview
    if (projectName) {
        items.push(
            <span key="project" className="flex items-center gap-1.5">
                <Folder className="size-3.5 text-muted-foreground" />
                <span>{projectName}</span>
            </span>
        )
    }

    if (items.length === 0) return null

    return (
        <div className="flex items-center gap-3 px-3 py-2 text-xs text-muted-foreground border-t border-border bg-muted/30">
            {items.map((item, index) => (
                <span key={index} className="flex items-center gap-1.5">
                    {index > 0 && <span className="text-border">·</span>}
                    {item}
                </span>
            ))}
        </div>
    )
}

// ============================================================================
// QUICK ADD INPUT COMPONENT
// ============================================================================

export const QuickAddInput = ({
    onAdd,
    onOpenModal,
    projects,
    placeholder = "Add task...",
    className,
}: QuickAddInputProps): React.JSX.Element => {
    const [value, setValue] = useState("")
    const [isFocused, setIsFocused] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Parse preview data
    const preview = useMemo(() => {
        if (!value.trim() || !hasSpecialSyntax(value)) {
            return null
        }
        return getParsePreview(value, projects)
    }, [value, projects])

    const handleSubmit = useCallback((): void => {
        const trimmedValue = value.trim()
        if (!trimmedValue) return

        // Parse the input
        const parsed = parseQuickAdd(trimmedValue, projects)

        // Call onAdd with title and parsed data
        onAdd(parsed.title, {
            dueDate: parsed.dueDate,
            priority: parsed.priority,
            projectId: parsed.projectId,
        })

        setValue("")
        // Keep focus for rapid entry
        inputRef.current?.focus()
    }, [value, projects, onAdd])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === "Enter") {
            // Cmd/Ctrl+Enter opens modal
            if ((e.metaKey || e.ctrlKey) && onOpenModal) {
                e.preventDefault()
                const trimmedValue = value.trim()
                const parsed = parseQuickAdd(trimmedValue, projects)
                onOpenModal(parsed.title)
                setValue("")
                inputRef.current?.blur()
                return
            }

            // Regular Enter submits
            e.preventDefault()
            handleSubmit()
        } else if (e.key === "Escape") {
            e.preventDefault()
            setValue("")
            inputRef.current?.blur()
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setValue(e.target.value)
    }

    const handleFocus = (): void => {
        setIsFocused(true)
    }

    const handleBlur = (): void => {
        setIsFocused(false)
    }

    const handleContainerClick = (): void => {
        inputRef.current?.focus()
    }

    const showPreview = isFocused && preview && (preview.hasDate || preview.hasPriority || preview.hasProject)

    return (
        <div
            role="button"
            tabIndex={-1}
            onClick={handleContainerClick}
            className={cn(
                "flex flex-col rounded-md border transition-all duration-150 overflow-hidden",
                isFocused
                    ? "border-primary bg-background shadow-sm"
                    : "border-transparent bg-muted/50 hover:bg-muted",
                className
            )}
        >
            <div className="flex items-center gap-3 px-3 py-2.5">
                {/* Checkbox placeholder / Plus icon */}
                <div
                    className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        isFocused ? "border-text-tertiary" : "border-transparent"
                    )}
                >
                    {!isFocused && (
                        <Plus className="size-4 text-text-tertiary" aria-hidden="true" />
                    )}
                </div>

                {/* Input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={cn(
                        "flex-1 bg-transparent text-sm outline-none",
                        "placeholder:text-text-tertiary",
                        isFocused ? "text-text-primary" : "text-text-tertiary"
                    )}
                    aria-label="Quick add task"
                />

                {/* Keyboard hint */}
                {isFocused && value.trim() && onOpenModal && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                        <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                            ⌘↵
                        </kbd>
                        {" "}for more options
                    </span>
                )}
            </div>

            {/* Parse preview */}
            {showPreview && preview && (
                <ParsePreview
                    dueDate={preview.dueDate}
                    priority={preview.priority}
                    projectName={preview.projectName}
                />
            )}
        </div>
    )
}

export default QuickAddInput
