/**
 * Webclip Preview Component
 *
 * Quote block preview for web highlights showing:
 * - Vertical bar indicator
 * - First highlight excerpt
 * - Badge for additional highlights
 */
import { cn } from '@/lib/utils'
import { Quote, Plus } from 'lucide-react'
import type { WebclipItem } from '@/data/inbox-types'

// =============================================================================
// TYPES
// =============================================================================

export interface WebclipPreviewProps {
  item: WebclipItem
  className?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

export function WebclipPreview({ item, className }: WebclipPreviewProps): React.JSX.Element {
  const hasHighlights = item.highlights && item.highlights.length > 0
  const firstHighlight = hasHighlights ? item.highlights[0] : null
  const additionalCount = hasHighlights ? item.highlights.length - 1 : 0

  return (
    <div className={cn('', className)}>
      {hasHighlights && firstHighlight ? (
        <div className="space-y-2">
          {/* Quote block with left border */}
          <div
            className={cn(
              'border-l-2 border-cyan-500 pl-3',
              'bg-gradient-to-r from-cyan-50/50 to-transparent',
              'dark:from-cyan-950/30 dark:to-transparent',
              'py-1'
            )}
          >
            <p className="line-clamp-3 text-sm italic leading-relaxed text-muted-foreground">
              "{firstHighlight.text}"
            </p>
          </div>

          {/* Additional highlights badge */}
          {additionalCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400">
              <Plus className="h-3 w-3" />
              <span>
                {additionalCount} more highlight{additionalCount > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-muted-foreground/60">
          <Quote className="h-3.5 w-3.5" />
          <span>No highlights captured</span>
        </div>
      )}
    </div>
  )
}
