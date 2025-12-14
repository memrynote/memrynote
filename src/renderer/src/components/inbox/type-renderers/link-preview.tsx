/**
 * Link Preview Component
 *
 * Rich preview for URL captures showing:
 * - Hero image thumbnail (or favicon fallback)
 * - Excerpt text (2-3 lines)
 */
import { cn } from '@/lib/utils'
import { Globe, ExternalLink } from 'lucide-react'
import type { LinkItem } from '@/data/inbox-types'

// =============================================================================
// TYPES
// =============================================================================

export interface LinkPreviewProps {
  item: LinkItem
  className?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

export function LinkPreview({ item, className }: LinkPreviewProps): React.JSX.Element {
  const hasHeroImage = item.heroImage && item.heroImage.trim() !== ''
  const hasFavicon = item.favicon && item.favicon.trim() !== ''

  return (
    <div className={cn('flex gap-3', className)}>
      {/* Hero Image / Favicon Fallback */}
      <div className="shrink-0">
        {hasHeroImage ? (
          <div className="relative h-14 w-20 overflow-hidden rounded-md bg-muted">
            <img
              src={item.heroImage ?? undefined}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {/* Subtle overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        ) : (
          <div className="flex h-14 w-20 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950/30">
            {hasFavicon ? (
              <img
                src={item.favicon ?? undefined}
                alt=""
                className="h-6 w-6"
                loading="lazy"
              />
            ) : (
              <Globe className="h-5 w-5 text-blue-500" />
            )}
          </div>
        )}
      </div>

      {/* Excerpt */}
      <div className="min-w-0 flex-1">
        {item.excerpt ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            "{item.excerpt}"
          </p>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground/60">
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Open link to preview content</span>
          </div>
        )}
      </div>
    </div>
  )
}
