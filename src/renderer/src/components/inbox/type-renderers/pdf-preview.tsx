/**
 * PDF Preview Component
 *
 * Document preview for PDF files showing:
 * - First page thumbnail
 * - Text preview from first page
 * - Page count badge
 */
import { cn } from '@/lib/utils'
import { FileText, File } from 'lucide-react'
import type { PdfItem } from '@/data/inbox-types'

// =============================================================================
// TYPES
// =============================================================================

export interface PdfPreviewProps {
  item: PdfItem
  className?: string
  onPreviewClick?: () => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function PdfPreview({
  item,
  className,
  onPreviewClick,
}: PdfPreviewProps): React.JSX.Element {
  const hasThumbnail = item.thumbnailUrl && item.thumbnailUrl.trim() !== ''
  const hasTextPreview = item.textPreview && item.textPreview.trim() !== ''

  return (
    <div className={cn('flex gap-3', className)}>
      {/* PDF Thumbnail */}
      <div
        className={cn(
          'group/pdf relative shrink-0 overflow-hidden rounded-md border border-red-200 bg-red-50',
          'dark:border-red-900/50 dark:bg-red-950/30',
          onPreviewClick && 'cursor-pointer'
        )}
        onClick={onPreviewClick}
      >
        {hasThumbnail ? (
          <>
            <img
              src={item.thumbnailUrl ?? undefined}
              alt={`${item.title} page 1`}
              className="h-20 w-16 object-cover transition-transform duration-300 group-hover/pdf:scale-105"
              loading="lazy"
            />
            {/* Hover overlay */}
            <div
              className={cn(
                'absolute inset-0 flex items-center justify-center',
                'bg-black/0 transition-all duration-200',
                'group-hover/pdf:bg-black/20'
              )}
            />
          </>
        ) : (
          <div className="flex h-20 w-16 flex-col items-center justify-center gap-1">
            <FileText className="h-6 w-6 text-red-500" />
            <span className="text-[10px] font-medium text-red-500">PDF</span>
          </div>
        )}

        {/* Page count badge */}
        <div
          className={cn(
            'absolute bottom-1 right-1 rounded px-1 py-0.5',
            'bg-red-600 text-[10px] font-medium text-white'
          )}
        >
          {item.pageCount}p
        </div>
      </div>

      {/* Text preview */}
      <div className="min-w-0 flex-1">
        {hasTextPreview ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            "{item.textPreview}"
          </p>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground/60">
            <File className="h-3.5 w-3.5" />
            <span>PDF document · {item.pageCount} pages</span>
          </div>
        )}
      </div>
    </div>
  )
}
