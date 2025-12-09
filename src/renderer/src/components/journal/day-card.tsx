/**
 * Day Card Component
 * Renders a single day in the journal infinite scroll
 */

import { forwardRef, memo } from 'react'
import { cn } from '@/lib/utils'
import { formatDayHeader } from '@/lib/journal-utils'

// =============================================================================
// TYPES
// =============================================================================

export interface DayCardProps {
    /** Date in ISO format (YYYY-MM-DD) */
    date: string
    /** Whether this day is currently active (centered in viewport) */
    isActive: boolean
    /** Whether this is today */
    isToday: boolean
    /** Whether this is a future date */
    isFuture: boolean
    /** Opacity based on distance from active day */
    opacity: number
    /** Additional CSS classes */
    className?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Day Card - displays a single day with header and content area
 * Uses forwardRef for scroll position tracking
 */
export const DayCard = memo(forwardRef<HTMLDivElement, DayCardProps>(({
    date,
    isActive,
    isToday,
    isFuture,
    opacity,
    className,
}, ref) => {
    const header = formatDayHeader(date)

    return (
        <div
            ref={ref}
            data-date={date}
            style={{ opacity }}
            className={cn(
                // Base styling
                "rounded-xl transition-all duration-150",
                "min-h-[200px]",
                // Background
                "bg-card",
                // Border (solid for past, dashed for future)
                isFuture
                    ? "border border-dashed border-border/60"
                    : "border border-border/40",
                // Active state
                isActive && [
                    "border-2",
                    isFuture
                        ? "border-dashed border-primary/40"
                        : "border-primary/30",
                    "shadow-lg shadow-primary/5",
                ],
                // Today indicator
                isToday && !isActive && "ring-2 ring-primary/20 ring-offset-2 ring-offset-background",
                // Hover
                !isActive && "hover:border-border/60 cursor-pointer",
                className
            )}
        >
            {/* Header */}
            <DayCardHeader
                dayName={header.dayName}
                dateStr={header.dateStr}
                isToday={isToday}
                isFuture={isFuture}
                isActive={isActive}
            />

            {/* Content Area - placeholder for now, will be replaced in Prompt 03 */}
            <div className="p-6 pt-0">
                <div className="h-32 rounded-lg border border-dashed border-border/40 flex items-center justify-center text-muted-foreground text-sm">
                    {isFuture ? 'Plan your day...' : 'Journal content...'}
                </div>
            </div>
        </div>
    )
}))

DayCard.displayName = 'DayCard'

// =============================================================================
// HEADER COMPONENT
// =============================================================================

interface DayCardHeaderProps {
    dayName: string
    dateStr: string
    isToday: boolean
    isFuture: boolean
    isActive: boolean
}

function DayCardHeader({
    dayName,
    dateStr,
    isToday,
    isFuture,
    isActive,
}: DayCardHeaderProps): React.JSX.Element {
    return (
        <header className={cn(
            "px-6 py-4",
            "border-b border-border/30",
            "flex items-center justify-between"
        )}>
            <div className="flex items-center gap-3">
                {/* Day name */}
                <h2 className={cn(
                    "text-lg font-semibold",
                    isActive ? "text-foreground" : "text-foreground/80",
                    isFuture && !isActive && "text-foreground/60"
                )}>
                    {isToday ? 'Today' : dayName}
                </h2>

                {/* Date */}
                <span className={cn(
                    "text-sm",
                    isActive ? "text-muted-foreground" : "text-muted-foreground/70"
                )}>
                    {dateStr}
                </span>

                {/* Today badge */}
                {isToday && !isActive && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                        Today
                    </span>
                )}
            </div>

            {/* Future indicator */}
            {isFuture && (
                <span className="text-xs text-muted-foreground/50 italic">
                    Upcoming
                </span>
            )}
        </header>
    )
}

export default DayCard
