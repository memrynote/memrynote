import { ExternalLink, Quote } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { InboxItem, LinkPreviewContent } from "@/types"
import { extractDomain } from "@/lib/inbox-utils"

interface LinkPreviewProps {
  item: InboxItem
}

const LinkPreview = ({ item }: LinkPreviewProps): React.JSX.Element => {
  const content = item.previewContent as LinkPreviewContent | undefined

  const handleOpenOriginal = (): void => {
    if (item.url) {
      window.open(item.url, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero image if available */}
      {content?.heroImage && (
        <div className="rounded-lg overflow-hidden border border-[var(--border)]">
          <img
            src={content.heroImage}
            alt={`Preview for ${item.title}`}
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {/* Article excerpt */}
      {content?.excerpt && (
        <div className="prose prose-sm max-w-none">
          <p className="text-[var(--foreground)] leading-relaxed">
            {content.excerpt}
          </p>
        </div>
      )}

      {/* Highlighted/clipped text */}
      {content?.highlightedText && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
            <Quote className="size-3" aria-hidden="true" />
            Highlighted
          </div>
          <blockquote className="border-l-4 border-[var(--primary)] bg-[var(--muted)]/30 px-4 py-3 rounded-r-lg">
            <p className="text-[var(--foreground)] italic leading-relaxed">
              "{content.highlightedText}"
            </p>
          </blockquote>
        </div>
      )}

      {/* Separator */}
      <div className="h-px bg-[var(--border)]" aria-hidden="true" />

      {/* Open original link */}
      {item.url && (
        <Button
          variant="outline"
          onClick={handleOpenOriginal}
          className="w-full justify-center gap-2"
        >
          Open original article
          <ExternalLink className="size-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  )
}

export { LinkPreview }

