/**
 * Image Preview Component
 *
 * Thumbnail preview for image captures showing:
 * - Centered thumbnail with max height
 * - Aspect ratio preserved
 * - Hover effect for full-size preview hint
 */
import { cn } from '@/lib/utils'
import { Image as ImageIcon, ZoomIn } from 'lucide-react'
import type { ImageItem } from '@/data/inbox-types'

// =============================================================================
// TYPES
// =============================================================================

export interface ImagePreviewProps {
  item: ImageItem
  className?: string
  onPreviewClick?: () => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ImagePreview({
  item,
  className,
  onPreviewClick,
}: ImagePreviewProps): React.JSX.Element {
  const hasImage = item.imageUrl && item.imageUrl.trim() !== ''

  return (
    <div className={cn('', className)}>
      {hasImage ? (
        <div
          className={cn(
            'group/image relative inline-block overflow-hidden rounded-lg bg-muted',
            onPreviewClick && 'cursor-pointer'
          )}
          onClick={onPreviewClick}
        >
          {/* Image thumbnail */}
          <img
            src={item.imageUrl}
            alt={item.title}
            className="max-h-40 w-auto object-contain transition-transform duration-300 group-hover/image:scale-[1.02]"
            loading="lazy"
          />

          {/* Hover overlay with zoom hint */}
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center',
              'bg-black/0 transition-all duration-200',
              'group-hover/image:bg-black/30'
            )}
          >
            <div
              className={cn(
                'flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5',
                'text-xs font-medium text-slate-900',
                'opacity-0 transition-all duration-200',
                'group-hover/image:opacity-100'
              )}
            >
              <ZoomIn className="h-3.5 w-3.5" />
              <span>Preview</span>
            </div>
          </div>

          {/* Caption if available */}
          {item.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
              <p className="line-clamp-1 text-xs text-white">{item.caption}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
          <div className="flex flex-col items-center gap-2 text-emerald-500">
            <ImageIcon className="h-8 w-8 opacity-50" />
            <span className="text-xs">Image not available</span>
          </div>
        </div>
      )}
    </div>
  )
}
