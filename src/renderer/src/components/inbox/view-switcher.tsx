/**
 * View Switcher Component
 *
 * A three-way toggle for switching between Compact, Medium, and Expanded views.
 * Features:
 * - Icon-based toggle buttons with smooth transitions
 * - Keyboard shortcut (V key) to cycle through views
 * - Tooltips with keyboard hints
 * - Accessible with proper ARIA labels
 */
import { useEffect, useCallback } from 'react'
import { List, LayoutList, Rows3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { InboxViewMode } from '@/data/inbox-types'

// =============================================================================
// TYPES
// =============================================================================

export interface ViewSwitcherProps {
  /** Current view mode */
  value: InboxViewMode
  /** Callback when view mode changes */
  onChange: (view: InboxViewMode) => void
  /** Enable keyboard shortcut (V key) */
  enableKeyboardShortcut?: boolean
  /** Additional class names */
  className?: string
}

// =============================================================================
// VIEW OPTIONS CONFIGURATION
// =============================================================================

interface ViewOption {
  value: InboxViewMode
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
}

const viewOptions: ViewOption[] = [
  {
    value: 'compact',
    icon: List,
    label: 'Compact',
    description: 'Dense list for quick scanning',
  },
  {
    value: 'medium',
    icon: LayoutList,
    label: 'Medium',
    description: 'Balanced view with previews',
  },
  {
    value: 'expanded',
    icon: Rows3,
    label: 'Expanded',
    description: 'Full details for review',
  },
]

// Get next view in cycle
function getNextView(current: InboxViewMode): InboxViewMode {
  const currentIndex = viewOptions.findIndex((opt) => opt.value === current)
  const nextIndex = (currentIndex + 1) % viewOptions.length
  return viewOptions[nextIndex].value
}

// =============================================================================
// VIEW SWITCHER COMPONENT
// =============================================================================

export function ViewSwitcher({
  value,
  onChange,
  enableKeyboardShortcut = true,
  className,
}: ViewSwitcherProps): React.JSX.Element {
  // Handle keyboard shortcut
  useEffect(() => {
    if (!enableKeyboardShortcut) return

    const handleKeyDown = (e: KeyboardEvent): void => {
      // Don't trigger if user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.getAttribute('contenteditable') === 'true'
      ) {
        return
      }

      // V key cycles through views
      if (e.key === 'v' || e.key === 'V') {
        e.preventDefault()
        onChange(getNextView(value))
      }

      // Number keys for direct access
      if (e.key === '1') {
        e.preventDefault()
        onChange('compact')
      } else if (e.key === '2') {
        e.preventDefault()
        onChange('medium')
      } else if (e.key === '3') {
        e.preventDefault()
        onChange('expanded')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enableKeyboardShortcut, value, onChange])

  const handleValueChange = useCallback(
    (newValue: string): void => {
      if (newValue && newValue !== value) {
        onChange(newValue as InboxViewMode)
      }
    },
    [value, onChange]
  )

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={handleValueChange}
      className={cn(
        // Container styling
        'gap-0.5 rounded-lg p-0.5',
        // Subtle background
        'bg-muted/50',
        // Border for definition
        'border border-border/40',
        className
      )}
      aria-label="View mode"
    >
      {viewOptions.map((option, index) => {
        const Icon = option.icon
        const isSelected = value === option.value

        return (
          <Tooltip key={option.value}>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value={option.value}
                aria-label={`${option.label} view`}
                className={cn(
                  // Base sizing
                  'h-8 w-8 rounded-md',
                  // Default state
                  'text-muted-foreground',
                  // Hover state
                  'hover:text-foreground hover:bg-accent/50',
                  // Selected state - elevated with shadow
                  'data-[state=on]:bg-background',
                  'data-[state=on]:text-foreground',
                  'data-[state=on]:shadow-sm',
                  'data-[state=on]:border data-[state=on]:border-border/50',
                  // Smooth transitions
                  'transition-all duration-200 ease-out',
                  // Focus ring
                  'focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0'
                )}
              >
                <Icon
                  className={cn(
                    'size-4 transition-transform duration-200',
                    isSelected && 'scale-105'
                  )}
                />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              sideOffset={8}
              className="flex flex-col gap-0.5"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{option.label}</span>
                <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  {index + 1}
                </kbd>
              </div>
              <span className="text-xs text-muted-foreground">
                {option.description}
              </span>
              {index === 0 && (
                <span className="mt-1 text-[10px] text-muted-foreground/70">
                  Press <kbd className="px-1 font-mono">V</kbd> to cycle
                </span>
              )}
            </TooltipContent>
          </Tooltip>
        )
      })}
    </ToggleGroup>
  )
}

// =============================================================================
// COMPACT VARIANT (for mobile or space-constrained contexts)
// =============================================================================

export interface ViewSwitcherCompactProps {
  value: InboxViewMode
  onChange: (view: InboxViewMode) => void
  className?: string
}

export function ViewSwitcherCompact({
  value,
  onChange,
  className,
}: ViewSwitcherCompactProps): React.JSX.Element {
  const currentOption = viewOptions.find((opt) => opt.value === value) || viewOptions[1]
  const Icon = currentOption.icon

  const handleClick = useCallback(() => {
    onChange(getNextView(value))
  }, [value, onChange])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5',
            'bg-muted/50 border border-border/40',
            'text-sm text-muted-foreground',
            'hover:bg-accent/50 hover:text-foreground',
            'transition-all duration-200',
            className
          )}
          aria-label={`Current view: ${currentOption.label}. Click to change.`}
        >
          <Icon className="size-4" />
          <span className="font-medium">{currentOption.label}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        <p>Click to switch view</p>
        <kbd className="ml-1.5 text-[10px] text-muted-foreground">V</kbd>
      </TooltipContent>
    </Tooltip>
  )
}

// =============================================================================
// VIEW INDICATOR (read-only display of current view)
// =============================================================================

export interface ViewIndicatorProps {
  value: InboxViewMode
  className?: string
}

export function ViewIndicator({ value, className }: ViewIndicatorProps): React.JSX.Element {
  const currentOption = viewOptions.find((opt) => opt.value === value) || viewOptions[1]
  const Icon = currentOption.icon

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-md px-2 py-1',
        'bg-muted/30 text-muted-foreground',
        'text-xs',
        className
      )}
    >
      <Icon className="size-3.5" />
      <span>{currentOption.label} view</span>
    </div>
  )
}
