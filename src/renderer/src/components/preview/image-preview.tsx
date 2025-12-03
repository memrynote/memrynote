import { ExternalLink, ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { InboxItem, ImagePreviewContent } from "@/types"

interface ImagePreviewProps {
  item: InboxItem
}

const ImagePreview = ({ item }: ImagePreviewProps): React.JSX.Element => {
  const content = item.previewContent as ImagePreviewContent | undefined

  const handleViewFullSize = (): void => {
    if (content?.imageUrl) {
      window.open(content.imageUrl, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <div className="space-y-4">
      {/* Image container */}
      <div className="rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--muted)]/30">
        {content?.imageUrl ? (
          <img
            src={content.imageUrl}
            alt={item.title}
            className="w-full h-auto object-contain max-h-[400px]"
          />
        ) : (
          // Placeholder when no image URL
          <div className="flex flex-col items-center justify-center h-[300px] gap-4">
            <div className="size-16 rounded-full bg-[var(--muted)] flex items-center justify-center">
              <ImageIcon className="size-8 text-[var(--muted-foreground)]" aria-hidden="true" />
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              Image preview not available
            </p>
          </div>
        )}
      </div>

      {/* Caption */}
      {content?.caption && (
        <p className="text-sm text-[var(--muted-foreground)] text-center italic">
          {content.caption}
        </p>
      )}

      {/* View full size button */}
      {content?.imageUrl && (
        <Button
          variant="outline"
          onClick={handleViewFullSize}
          className="w-full justify-center gap-2"
        >
          View full size
          <ExternalLink className="size-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  )
}

export { ImagePreview }

