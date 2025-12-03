import { useEffect } from "react"
import {
  Link,
  FileText,
  Image,
  Mic,
  Calendar,
  Globe,
  Clock,
  FileIcon,
  Ruler,
  Trash2,
  Folder,
} from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { LinkPreview } from "@/components/preview/link-preview"
import { NotePreview } from "@/components/preview/note-preview"
import { ImagePreview } from "@/components/preview/image-preview"
import { VoicePreview } from "@/components/preview/voice-preview"
import { extractDomain } from "@/lib/inbox-utils"
import type { InboxItem, InboxItemType, ImagePreviewContent } from "@/types"

// Type icon component
const TypeIcon = ({ type }: { type: InboxItemType }): React.JSX.Element => {
  const iconClass = "size-5 text-[var(--muted-foreground)]"

  switch (type) {
    case "link":
      return <Link className={iconClass} aria-hidden="true" />
    case "note":
      return <FileText className={iconClass} aria-hidden="true" />
    case "image":
      return <Image className={iconClass} aria-hidden="true" />
    case "voice":
      return <Mic className={iconClass} aria-hidden="true" />
  }
}

// Metadata component
interface PreviewMetadataProps {
  item: InboxItem
}

const PreviewMetadata = ({ item }: PreviewMetadataProps): React.JSX.Element => {
  const formatDate = (date: Date): string => {
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = date.toDateString() === yesterday.toDateString()

    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

    if (isToday) {
      return `today at ${timeStr}`
    }
    if (isYesterday) {
      return `yesterday at ${timeStr}`
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) + ` at ${timeStr}`
  }

  const renderMetadataByType = (): React.JSX.Element => {
    switch (item.type) {
      case "link":
        return (
          <>
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Calendar className="size-4" aria-hidden="true" />
              <span>Captured {formatDate(item.timestamp)}</span>
            </div>
            {item.url && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="size-4 text-[var(--muted-foreground)]" aria-hidden="true" />
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--primary)] hover:underline"
                >
                  {extractDomain(item.url)}
                </a>
              </div>
            )}
          </>
        )

      case "note":
        const noteContent = item.previewContent as { fullText?: string } | undefined
        const wordCount = noteContent?.fullText
          ? noteContent.fullText.split(/\s+/).filter(Boolean).length
          : item.content?.split(/\s+/).filter(Boolean).length || 0
        return (
          <>
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Calendar className="size-4" aria-hidden="true" />
              <span>Captured {formatDate(item.timestamp)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <FileText className="size-4" aria-hidden="true" />
              <span>{wordCount} words · Personal note</span>
            </div>
          </>
        )

      case "image":
        const imageContent = item.previewContent as ImagePreviewContent | undefined
        return (
          <>
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Calendar className="size-4" aria-hidden="true" />
              <span>Captured {formatDate(item.timestamp)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              {imageContent?.dimensions && (
                <>
                  <Ruler className="size-4" aria-hidden="true" />
                  <span>
                    {imageContent.dimensions.width} × {imageContent.dimensions.height}
                  </span>
                  <span className="text-[var(--border)]">·</span>
                </>
              )}
              {imageContent?.fileSize && <span>{imageContent.fileSize}</span>}
            </div>
          </>
        )

      case "voice":
        return (
          <>
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Calendar className="size-4" aria-hidden="true" />
              <span>Captured {formatDate(item.timestamp)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Clock className="size-4" aria-hidden="true" />
              <span>
                Duration: {Math.floor((item.duration || 0) / 60)}:
                {((item.duration || 0) % 60).toString().padStart(2, "0")}
              </span>
            </div>
          </>
        )
    }
  }

  return (
    <div className="px-6 py-3 bg-[var(--muted)]/30 space-y-1 border-b border-[var(--border)]">
      {renderMetadataByType()}
    </div>
  )
}

// Content router component
interface PreviewContentProps {
  item: InboxItem
}

const PreviewContent = ({ item }: PreviewContentProps): React.JSX.Element => {
  switch (item.type) {
    case "link":
      return <LinkPreview item={item} />
    case "note":
      return <NotePreview item={item} />
    case "image":
      return <ImagePreview item={item} />
    case "voice":
      return <VoicePreview item={item} />
  }
}

// Main Preview Panel component
interface PreviewPanelProps {
  isOpen: boolean
  item: InboxItem | null
  onClose: () => void
  onFile: (id: string) => void
  onDelete: (id: string) => void
}

const PreviewPanel = ({
  isOpen,
  item,
  onClose,
  onFile,
  onDelete,
}: PreviewPanelProps): React.JSX.Element => {
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (!isOpen) return

      // Space or Escape to close
      if (e.key === " " || e.key === "Escape") {
        // Don't close if typing in an input
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        ) {
          return
        }
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  const handleOpenChange = (open: boolean): void => {
    if (!open) {
      onClose()
    }
  }

  const handleFile = (): void => {
    if (item) {
      onFile(item.id)
    }
  }

  const handleDelete = (): void => {
    if (item) {
      onDelete(item.id)
      onClose()
    }
  }

  const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-[520px] sm:max-w-[520px] flex flex-col p-0"
      >
        {item && (
          <>
            {/* Header */}
            <SheetHeader className="px-6 py-4 border-b border-[var(--border)] shrink-0">
              <div className="flex items-start gap-3">
                <TypeIcon type={item.type} />
                <SheetTitle className="text-lg font-semibold flex-1 line-clamp-2">
                  {item.title}
                </SheetTitle>
              </div>
            </SheetHeader>

            {/* Metadata */}
            <PreviewMetadata item={item} />

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <PreviewContent item={item} />
            </div>

            {/* Footer */}
            <SheetFooter className="px-6 py-4 border-t border-[var(--border)] shrink-0">
              <div className="flex items-center justify-between w-full">
                <Button
                  variant="ghost"
                  onClick={handleDelete}
                  className="text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 className="size-4 mr-2" aria-hidden="true" />
                  Delete
                </Button>
                <Button onClick={handleFile}>
                  <Folder className="size-4 mr-2" aria-hidden="true" />
                  File
                </Button>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] text-center w-full mt-3">
                Space to close
              </p>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

export { PreviewPanel }

