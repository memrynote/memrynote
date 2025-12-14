/**
 * Note Preview Component
 *
 * Text excerpt preview for notes showing:
 * - First 2-3 lines of content
 * - Clean typography with line clamping
 */
import { cn } from '@/lib/utils'
import { FileText } from 'lucide-react'
import type { NoteItem } from '@/data/inbox-types'

// =============================================================================
// TYPES
// =============================================================================

export interface NotePreviewProps {
  item: NoteItem
  className?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

export function NotePreview({ item, className }: NotePreviewProps): React.JSX.Element {
  const preview = item.preview || item.content

  return (
    <div className={cn('', className)}>
      {preview ? (
        <div className="relative">
          {/* Text content with subtle left border for visual hierarchy */}
          <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {preview}
          </p>

          {/* Fade out gradient if content is long */}
          {item.content.length > 200 && (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-card to-transparent" />
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-muted-foreground/60">
          <FileText className="h-3.5 w-3.5" />
          <span>Empty note</span>
        </div>
      )}
    </div>
  )
}
