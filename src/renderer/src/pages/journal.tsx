/**
 * Journal Page Component
 * Two-column layout with infinite scroll day cards and sticky sidebar
 */

import { useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Calendar, Sparkles, FileText, Loader2 } from 'lucide-react'
import { DayCard } from '@/components/journal/day-card'
import { useJournalScroll } from '@/hooks/use-journal-scroll'

interface JournalPageProps {
    className?: string
}

/**
 * Main Journal Page with two-column layout
 * Left: Infinite scroll area for day cards
 * Right: Sticky sidebar with calendar, AI connections, and notes
 */
export function JournalPage({ className }: JournalPageProps): React.JSX.Element {
    const journal = useJournalScroll()

    return (
        <div
            className={cn(
                "flex h-full w-full overflow-hidden",
                className
            )}
        >
            {/* Left Section - Scrollable Day Cards Area */}
            <JournalScrollArea journal={journal} />

            {/* Right Section - Sticky Sidebar */}
            <JournalSidebar
                activeDate={journal.state.activeDate}
                onTodayClick={() => journal.scrollToToday(true)}
            />
        </div>
    )
}

// =============================================================================
// SCROLL AREA
// =============================================================================

interface JournalScrollAreaProps {
    journal: ReturnType<typeof useJournalScroll>
}

function JournalScrollArea({ journal }: JournalScrollAreaProps): React.JSX.Element {
    const { state, scrollContainerRef, registerDayCardRef, getOpacity } = journal

    // Create ref callback for each day card
    const createRefCallback = useCallback((date: string) => {
        return (element: HTMLDivElement | null) => {
            registerDayCardRef(date, element)
        }
    }, [registerDayCardRef])

    return (
        <div
            ref={scrollContainerRef}
            className={cn(
                // Layout
                "flex-1 min-w-0",
                // Responsive width
                "w-[65%] min-w-[600px]",
                "max-lg:w-[60%] max-lg:min-w-[500px]",
                "max-md:w-full max-md:min-w-0",
                // Scrolling
                "overflow-y-auto overflow-x-hidden",
                // Hide scrollbar but keep functionality
                "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700",
                // Padding
                "px-6 py-10"
            )}
        >
            {/* Loading indicator for past days */}
            {state.isLoadingPast && (
                <div className="flex items-center justify-center py-4 mb-4">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading past days...</span>
                </div>
            )}

            {/* Day Cards Container */}
            <div className="mx-auto max-w-[800px] flex flex-col gap-6">
                {state.days.map((day) => (
                    <DayCard
                        key={day.date}
                        ref={createRefCallback(day.date)}
                        date={day.date}
                        isActive={day.date === state.activeDate}
                        isToday={day.isToday}
                        isFuture={day.isFuture}
                        opacity={getOpacity(day.date)}
                    />
                ))}
            </div>

            {/* Loading indicator for future days */}
            {state.isLoadingFuture && (
                <div className="flex items-center justify-center py-4 mt-4">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading future days...</span>
                </div>
            )}
        </div>
    )
}

// =============================================================================
// SIDEBAR
// =============================================================================

interface JournalSidebarProps {
    activeDate: string
    onTodayClick: () => void
}

function JournalSidebar({
    activeDate,
    onTodayClick,
}: JournalSidebarProps): React.JSX.Element {
    return (
        <aside
            className={cn(
                // Layout
                "shrink-0",
                // Responsive width
                "w-[35%] min-w-[320px] max-w-[400px]",
                "max-lg:w-[40%] max-lg:min-w-[300px]",
                // Hide on mobile (will become drawer in future)
                "max-md:hidden",
                // Positioning
                "sticky top-0 h-full",
                // Scrolling for internal content
                "overflow-y-auto",
                // Styling
                "border-l border-border/50",
                "bg-muted/30",
                // Padding
                "p-6",
                // Spacing between sections
                "flex flex-col gap-5"
            )}
        >
            {/* Calendar Section */}
            <SidebarSection
                icon={Calendar}
                title="Calendar"
                iconColor="text-accent-blue"
                action={
                    <button
                        type="button"
                        onClick={onTodayClick}
                        className="text-xs text-primary hover:underline"
                    >
                        Today
                    </button>
                }
            >
                <div className="h-48 rounded-lg border border-dashed border-border/60 flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                    <span>Calendar Heatmap</span>
                    <span className="text-xs">Active: {activeDate}</span>
                </div>
            </SidebarSection>

            {/* AI Connections Section */}
            <SidebarSection
                icon={Sparkles}
                title="AI Connections"
                iconColor="text-accent-purple"
            >
                <div className="h-32 rounded-lg border border-dashed border-border/60 flex items-center justify-center text-muted-foreground text-sm">
                    AI Connections
                </div>
            </SidebarSection>

            {/* Today's Notes Section */}
            <SidebarSection
                icon={FileText}
                title="Today's Notes"
                iconColor="text-accent-green"
            >
                <div className="h-40 rounded-lg border border-dashed border-border/60 flex items-center justify-center text-muted-foreground text-sm">
                    Today's Notes
                </div>
            </SidebarSection>
        </aside>
    )
}

// =============================================================================
// SIDEBAR SECTION
// =============================================================================

interface SidebarSectionProps {
    icon: typeof Calendar
    title: string
    iconColor?: string
    action?: React.ReactNode
    children: React.ReactNode
}

function SidebarSection({
    icon: Icon,
    title,
    iconColor = "text-muted-foreground",
    action,
    children,
}: SidebarSectionProps): React.JSX.Element {
    return (
        <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon className={cn("size-4", iconColor)} />
                    <h3 className="text-sm font-medium text-foreground">{title}</h3>
                </div>
                {action}
            </div>
            {children}
        </section>
    )
}

export default JournalPage
