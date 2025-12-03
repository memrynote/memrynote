import { useState, useMemo, useCallback } from "react"
import {
    List,
    Star,
    Calendar,
    Check,
    Plus,
    LayoutList,
    Columns3,
    CalendarDays,
    Settings,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ProjectModal } from "@/components/tasks/project-modal"
import { DeleteProjectDialog, type DeleteTasksOption } from "@/components/tasks/delete-project-dialog"
import { getIconByName } from "@/components/icon-picker"
import { cn } from "@/lib/utils"
import {
    taskViews,
    initialProjects,
    LIST_ONLY_VIEWS,
    type TaskView,
    type Project,
    type ViewMode,
} from "@/data/tasks-data"

// ============================================================================
// TYPES
// ============================================================================

type SelectionType = "view" | "project"

interface TasksPageProps {
    className?: string
}

interface TasksLeftColumnProps {
    selectedId: string
    selectedType: SelectionType
    projects: Project[]
    onSelectView: (id: string) => void
    onSelectProject: (id: string) => void
    onNewProject: () => void
    onEditProject: (project: Project) => void
}

interface TasksViewsSectionProps {
    selectedId: string
    selectedType: SelectionType
    onSelect: (id: string) => void
}

interface TasksProjectsSectionProps {
    selectedId: string
    selectedType: SelectionType
    projects: Project[]
    onSelect: (id: string) => void
    onNewProject: () => void
    onEditProject: (project: Project) => void
}

interface TasksViewNavItemProps {
    id: string
    label: string
    icon: React.ReactNode
    count: number
    isSelected: boolean
    onSelect: (id: string) => void
}

interface TasksProjectNavItemProps {
    project: Project
    isSelected: boolean
    onSelect: (id: string) => void
    onEdit: (project: Project) => void
}

interface TasksContentHeaderProps {
    title: string
    subtitle: string
    activeView: ViewMode
    availableViews: ViewMode[]
    showProjectSettings: boolean
    onViewChange: (view: ViewMode) => void
    onAddTask: () => void
    onProjectSettings: () => void
}

interface TasksViewToggleProps {
    activeView: ViewMode
    availableViews: ViewMode[]
    onViewChange: (view: ViewMode) => void
}

// ============================================================================
// ICON MAPPING
// ============================================================================

const viewIconMap: Record<TaskView["icon"], React.ReactNode> = {
    list: <List className="size-4" />,
    star: <Star className="size-4" />,
    calendar: <Calendar className="size-4" />,
    check: <Check className="size-4" />,
}

// ============================================================================
// VIEW NAV ITEM COMPONENT
// ============================================================================

const TasksViewNavItem = ({
    id,
    label,
    icon,
    count,
    isSelected,
    onSelect,
}: TasksViewNavItemProps): React.JSX.Element => {
    const handleClick = (): void => {
        onSelect(id)
    }

    const handleKeyDown = (e: React.KeyboardEvent): void => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onSelect(id)
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            aria-label={`${label}, ${count} tasks`}
            aria-pressed={isSelected}
            className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-150",
                "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected && "bg-accent border-l-3 border-l-primary font-medium"
            )}
        >
            <span className="shrink-0 text-text-tertiary" aria-hidden="true">
                {icon}
            </span>
            <span className="flex-1 truncate text-left text-text-secondary">{label}</span>
            <span className="shrink-0 text-xs text-text-tertiary">{count}</span>
        </button>
    )
}

// ============================================================================
// PROJECT NAV ITEM COMPONENT (with edit button on hover)
// ============================================================================

const TasksProjectNavItem = ({
    project,
    isSelected,
    onSelect,
    onEdit,
}: TasksProjectNavItemProps): React.JSX.Element => {
    const handleClick = (): void => {
        onSelect(project.id)
    }

    const handleKeyDown = (e: React.KeyboardEvent): void => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onSelect(project.id)
        }
    }

    const handleEditClick = (e: React.MouseEvent): void => {
        e.stopPropagation()
        onEdit(project)
    }

    const handleEditKeyDown = (e: React.KeyboardEvent): void => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            e.stopPropagation()
            onEdit(project)
        }
    }

    // Get the icon component
    const IconComponent = getIconByName(project.icon)

    return (
        <div
            role="button"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            aria-label={`${project.name}, ${project.taskCount} tasks`}
            aria-pressed={isSelected}
            className={cn(
                "group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-150",
                "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected && "bg-accent border-l-3 border-l-primary font-medium"
            )}
        >
            {/* Project Icon or Color Dot */}
            {IconComponent ? (
                <IconComponent
                    className="size-4 shrink-0"
                    style={{ color: project.color }}
                    aria-hidden="true"
                />
            ) : (
                <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: project.color }}
                    aria-hidden="true"
                />
            )}

            {/* Project Name */}
            <span className="flex-1 truncate text-left text-text-secondary">
                {project.name}
            </span>

            {/* Settings Icon (visible on hover) */}
            <button
                type="button"
                onClick={handleEditClick}
                onKeyDown={handleEditKeyDown}
                tabIndex={0}
                aria-label={`Edit ${project.name}`}
                className={cn(
                    "shrink-0 rounded p-0.5 text-text-tertiary opacity-0 transition-opacity",
                    "hover:bg-accent hover:text-text-secondary",
                    "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "group-hover:opacity-100"
                )}
            >
                <Settings className="size-3.5" />
            </button>

            {/* Task Count */}
            <span className="shrink-0 text-xs text-text-tertiary">{project.taskCount}</span>
        </div>
    )
}

// ============================================================================
// VIEWS SECTION COMPONENT
// ============================================================================

const TasksViewsSection = ({
    selectedId,
    selectedType,
    onSelect,
}: TasksViewsSectionProps): React.JSX.Element => {
    return (
        <section aria-labelledby="views-section-label">
            <h2
                id="views-section-label"
                className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-text-tertiary"
            >
                Views
            </h2>
            <nav className="flex flex-col gap-0.5" role="navigation" aria-label="Task views">
                {taskViews.map((view) => (
                    <TasksViewNavItem
                        key={view.id}
                        id={view.id}
                        label={view.label}
                        icon={viewIconMap[view.icon]}
                        count={view.count}
                        isSelected={selectedType === "view" && selectedId === view.id}
                        onSelect={onSelect}
                    />
                ))}
            </nav>
        </section>
    )
}

// ============================================================================
// PROJECTS SECTION COMPONENT
// ============================================================================

const TasksProjectsSection = ({
    selectedId,
    selectedType,
    projects,
    onSelect,
    onNewProject,
    onEditProject,
}: TasksProjectsSectionProps): React.JSX.Element => {
    const handleNewProjectClick = (): void => {
        onNewProject()
    }

    const handleNewProjectKeyDown = (e: React.KeyboardEvent): void => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onNewProject()
        }
    }

    // Filter out archived projects
    const visibleProjects = projects.filter((p) => !p.isArchived)

    return (
        <section aria-labelledby="projects-section-label">
            <h2
                id="projects-section-label"
                className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-text-tertiary"
            >
                Projects
            </h2>
            <nav className="flex flex-col gap-0.5" role="navigation" aria-label="Projects">
                {visibleProjects.map((project) => (
                    <TasksProjectNavItem
                        key={project.id}
                        project={project}
                        isSelected={selectedType === "project" && selectedId === project.id}
                        onSelect={onSelect}
                        onEdit={onEditProject}
                    />
                ))}
            </nav>

            {/* New Project Button */}
            <button
                type="button"
                onClick={handleNewProjectClick}
                onKeyDown={handleNewProjectKeyDown}
                tabIndex={0}
                aria-label="Create new project"
                className={cn(
                    "mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm",
                    "text-text-tertiary transition-colors duration-150",
                    "hover:bg-accent/50 hover:text-text-secondary",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
            >
                <Plus className="size-4" aria-hidden="true" />
                <span>New Project</span>
            </button>
        </section>
    )
}

// ============================================================================
// LEFT COLUMN COMPONENT
// ============================================================================

const TasksLeftColumn = ({
    selectedId,
    selectedType,
    projects,
    onSelectView,
    onSelectProject,
    onNewProject,
    onEditProject,
}: TasksLeftColumnProps): React.JSX.Element => {
    return (
        <aside
            className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-surface"
            aria-label="Task navigation"
        >
            <ScrollArea className="flex-1">
                <div className="flex flex-col gap-6 p-4">
                    <TasksViewsSection
                        selectedId={selectedId}
                        selectedType={selectedType}
                        onSelect={onSelectView}
                    />
                    <TasksProjectsSection
                        selectedId={selectedId}
                        selectedType={selectedType}
                        projects={projects}
                        onSelect={onSelectProject}
                        onNewProject={onNewProject}
                        onEditProject={onEditProject}
                    />
                </div>
            </ScrollArea>
        </aside>
    )
}

// ============================================================================
// VIEW TOGGLE COMPONENT
// ============================================================================

const TasksViewToggle = ({
    activeView,
    availableViews,
    onViewChange,
}: TasksViewToggleProps): React.JSX.Element => {
    const handleValueChange = (value: string): void => {
        if (value && availableViews.includes(value as ViewMode)) {
            onViewChange(value as ViewMode)
        }
    }

    return (
        <ToggleGroup
            type="single"
            value={activeView}
            onValueChange={handleValueChange}
            className="gap-1"
            aria-label="View mode"
        >
            <ToggleGroupItem
                value="list"
                aria-label="List view"
                disabled={!availableViews.includes("list")}
            >
                <LayoutList className="size-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
                value="kanban"
                aria-label="Kanban view"
                disabled={!availableViews.includes("kanban")}
                className={cn(!availableViews.includes("kanban") && "hidden")}
            >
                <Columns3 className="size-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
                value="calendar"
                aria-label="Calendar view"
                disabled={!availableViews.includes("calendar")}
                className={cn(!availableViews.includes("calendar") && "hidden")}
            >
                <CalendarDays className="size-4" />
            </ToggleGroupItem>
        </ToggleGroup>
    )
}

// ============================================================================
// CONTENT HEADER COMPONENT
// ============================================================================

const TasksContentHeader = ({
    title,
    subtitle,
    activeView,
    availableViews,
    showProjectSettings,
    onViewChange,
    onAddTask,
    onProjectSettings,
}: TasksContentHeaderProps): React.JSX.Element => {
    return (
        <header className="flex items-start justify-between border-b border-border px-6 py-5">
            {/* Left side: Title and Subtitle */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
                    {showProjectSettings && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    onClick={onProjectSettings}
                                    className={cn(
                                        "rounded p-1 text-text-tertiary transition-colors",
                                        "hover:bg-accent hover:text-text-secondary",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    )}
                                    aria-label="Project settings"
                                >
                                    <Settings className="size-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>Project settings</TooltipContent>
                        </Tooltip>
                    )}
                </div>
                <p className="text-sm text-text-tertiary">{subtitle}</p>
            </div>

            {/* Right side: View Toggle and Add Task button */}
            <div className="flex items-center gap-3">
                <TasksViewToggle
                    activeView={activeView}
                    availableViews={availableViews}
                    onViewChange={onViewChange}
                />
                <Button onClick={onAddTask} size="sm">
                    <Plus className="size-4" aria-hidden="true" />
                    Add Task
                </Button>
            </div>
        </header>
    )
}

// ============================================================================
// MAIN TASKS PAGE COMPONENT
// ============================================================================

export const TasksPage = ({ className }: TasksPageProps): React.JSX.Element => {
    // Projects state (lifted to page level)
    const [projects, setProjects] = useState<Project[]>(initialProjects)

    // Selection state - single selection model (either view OR project)
    const [selectedId, setSelectedId] = useState<string>("all")
    const [selectedType, setSelectedType] = useState<SelectionType>("view")

    // View mode state
    const [activeView, setActiveView] = useState<ViewMode>("list")

    // Modal states
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
    const [editingProject, setEditingProject] = useState<Project | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

    // Derived: get the selected project (if any)
    const selectedProject = useMemo(() => {
        if (selectedType === "project") {
            return projects.find((p) => p.id === selectedId) || null
        }
        return null
    }, [selectedId, selectedType, projects])

    // Derived: available views based on selection
    const availableViews = useMemo((): ViewMode[] => {
        if (LIST_ONLY_VIEWS.includes(selectedId)) {
            return ["list"]
        }
        return ["list", "kanban", "calendar"]
    }, [selectedId])

    // Reset to list view if current view becomes unavailable
    useMemo(() => {
        if (!availableViews.includes(activeView)) {
            setActiveView("list")
        }
    }, [availableViews, activeView])

    // Derived: title for content header
    const headerTitle = useMemo(() => {
        if (selectedType === "view") {
            const view = taskViews.find((v) => v.id === selectedId)
            return view?.label || "All Tasks"
        }
        return selectedProject?.name || "Project"
    }, [selectedId, selectedType, selectedProject])

    // Derived: subtitle for content header
    const headerSubtitle = useMemo(() => {
        if (selectedType === "view") {
            const view = taskViews.find((v) => v.id === selectedId)
            const count = view?.count || 0

            if (selectedId === "today") {
                return `${count} tasks due`
            }

            const dueToday = selectedId === "all" ? 3 : Math.min(2, count)
            return `${count} tasks${dueToday > 0 ? ` · ${dueToday} due today` : ""}`
        }

        if (selectedProject) {
            const count = selectedProject.taskCount
            const dueToday = Math.min(2, count)
            return `${count} tasks${dueToday > 0 ? ` · ${dueToday} due today` : ""}`
        }

        return "0 tasks"
    }, [selectedId, selectedType, selectedProject])

    // ========== HANDLERS ==========

    const handleSelectView = (id: string): void => {
        setSelectedId(id)
        setSelectedType("view")
    }

    const handleSelectProject = (id: string): void => {
        setSelectedId(id)
        setSelectedType("project")
    }

    const handleNewProject = (): void => {
        setEditingProject(null)
        setIsProjectModalOpen(true)
    }

    const handleEditProject = useCallback((project: Project): void => {
        setEditingProject(project)
        setIsProjectModalOpen(true)
    }, [])

    const handleProjectModalClose = (): void => {
        setIsProjectModalOpen(false)
        setEditingProject(null)
    }

    const handleProjectSave = useCallback((project: Project): void => {
        setProjects((prev) => {
            const existingIndex = prev.findIndex((p) => p.id === project.id)
            if (existingIndex >= 0) {
                // Update existing project
                const updated = [...prev]
                updated[existingIndex] = project
                return updated
            }
            // Add new project
            return [...prev, project]
        })
    }, [])

    const handleProjectDelete = useCallback((projectId: string): void => {
        const project = projects.find((p) => p.id === projectId)
        if (project && !project.isDefault) {
            setProjectToDelete(project)
            setIsDeleteDialogOpen(true)
            setIsProjectModalOpen(false)
        }
    }, [projects])

    const handleDeleteDialogClose = (): void => {
        setIsDeleteDialogOpen(false)
        setProjectToDelete(null)
    }

    const handleDeleteConfirm = useCallback(
        (option: DeleteTasksOption): void => {
            if (!projectToDelete) return

            // Remove project
            setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id))

            // If deleted project was selected, switch to "All Tasks"
            if (selectedId === projectToDelete.id) {
                setSelectedId("all")
                setSelectedType("view")
            }

            // In a real app, we would handle tasks based on `option`:
            // - "move": Move tasks to Personal project
            // - "delete": Delete all tasks
            console.log(`Deleted project "${projectToDelete.name}" with option: ${option}`)

            setIsDeleteDialogOpen(false)
            setProjectToDelete(null)
        },
        [projectToDelete, selectedId]
    )

    const handleProjectSettings = (): void => {
        if (selectedProject) {
            handleEditProject(selectedProject)
        }
    }

    const handleViewChange = (view: ViewMode): void => {
        setActiveView(view)
    }

    const handleAddTask = (): void => {
        console.log("Add task clicked")
    }

    return (
        <>
            <div className={cn("flex h-full", className)}>
                {/* Left Column - Navigation */}
                <TasksLeftColumn
                    selectedId={selectedId}
                    selectedType={selectedType}
                    projects={projects}
                    onSelectView={handleSelectView}
                    onSelectProject={handleSelectProject}
                    onNewProject={handleNewProject}
                    onEditProject={handleEditProject}
                />

                {/* Main Content Area */}
                <main className="flex flex-1 flex-col overflow-hidden">
                    {/* Content Header */}
                    <TasksContentHeader
                        title={headerTitle}
                        subtitle={headerSubtitle}
                        activeView={activeView}
                        availableViews={availableViews}
                        showProjectSettings={selectedType === "project" && !!selectedProject}
                        onViewChange={handleViewChange}
                        onAddTask={handleAddTask}
                        onProjectSettings={handleProjectSettings}
                    />

                    {/* Content Body - Placeholder */}
                    <div className="flex flex-1 items-center justify-center p-6">
                        <div className="text-center">
                            <p className="text-lg text-text-secondary">
                                Showing tasks for: <span className="font-medium">{headerTitle}</span>
                            </p>
                            <p className="mt-2 text-sm text-text-tertiary">(placeholder content)</p>
                        </div>
                    </div>
                </main>
            </div>

            {/* Project Modal */}
            <ProjectModal
                isOpen={isProjectModalOpen}
                onClose={handleProjectModalClose}
                onSave={handleProjectSave}
                onDelete={handleProjectDelete}
                project={editingProject}
            />

            {/* Delete Project Dialog */}
            <DeleteProjectDialog
                isOpen={isDeleteDialogOpen}
                onClose={handleDeleteDialogClose}
                onConfirm={handleDeleteConfirm}
                project={projectToDelete}
            />
        </>
    )
}
