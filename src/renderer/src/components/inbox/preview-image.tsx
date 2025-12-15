/**
 * Image Preview Component
 *
 * Displays image items with:
 * - Large image display with zoom
 * - Image dimensions and file size
 * - Editable caption
 * - Download button
 * - Tags and metadata
 */

import { useState, useCallback } from 'react'
import {
  ZoomIn,
  ZoomOut,
  Download,
  Maximize2,
  Plus,
  X,
  Check,
  Calendar,
  Zap,
  Image as ImageIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { ImageItem } from '@/data/inbox-types'

// ============================================================================
// TYPES
// ============================================================================

export interface ImagePreviewProps {
  /** The image item to preview */
  item: ImageItem
  /** Caption value */
  caption?: string
  /** Callback when caption changes */
  onCaptionChange?: (caption: string) => void
  /** Callback to download image */
  onDownload?: () => void
  /** Available tags */
  availableTags?: string[]
  /** Add tag callback */
  onAddTag?: (tag: string) => void
  /** Remove tag callback */
  onRemoveTag?: (tag: string) => void
}

// ============================================================================
// IMAGE VIEWER
// ============================================================================

interface ImageViewerProps {
  imageUrl: string
  alt: string
}

function ImageViewer({ imageUrl, alt }: ImageViewerProps): React.JSX.Element {
  const [zoom, setZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)

  return (
    <div className="relative">
      {/* Image Container */}
      <div
        className={cn(
          'relative overflow-hidden bg-slate-100 dark:bg-slate-900',
          isFullscreen
            ? 'fixed inset-0 z-50 flex items-center justify-center bg-black'
            : 'h-72'
        )}
      >
        {/* Checkerboard pattern for transparency */}
        {!isFullscreen && (
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage: `
                linear-gradient(45deg, #e2e8f0 25%, transparent 25%),
                linear-gradient(-45deg, #e2e8f0 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #e2e8f0 75%),
                linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)
              `,
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
            }}
          />
        )}

        <img
          src={imageUrl}
          alt={alt}
          className={cn(
            'h-full w-full transition-transform duration-200',
            isFullscreen ? 'max-h-screen max-w-screen-lg object-contain' : 'object-contain'
          )}
          style={{ transform: `scale(${zoom})` }}
        />

        {/* Fullscreen close button */}
        {isFullscreen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(false)}
            className="absolute right-4 top-4 size-10 rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="size-5" />
          </Button>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-white/20 bg-black/50 p-1 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
          className="size-8 text-white hover:bg-white/20"
          disabled={zoom <= 0.5}
        >
          <ZoomOut className="size-4" />
        </Button>
        <span className="min-w-[3rem] text-center text-xs text-white tabular-nums">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
          className="size-8 text-white hover:bg-white/20"
          disabled={zoom >= 3}
        >
          <ZoomIn className="size-4" />
        </Button>
        <div className="mx-1 h-5 w-px bg-white/30" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsFullscreen(true)}
          className="size-8 text-white hover:bg-white/20"
        >
          <Maximize2 className="size-4" />
        </Button>
      </div>
    </div>
  )
}

// ============================================================================
// TAGS SECTION
// ============================================================================

interface TagsSectionProps {
  tags: string[]
  onAddTag?: (tag: string) => void
  onRemoveTag?: (tag: string) => void
}

function TagsSection({ tags, onAddTag, onRemoveTag }: TagsSectionProps): React.JSX.Element {
  const [isAdding, setIsAdding] = useState(false)
  const [newTag, setNewTag] = useState('')

  const handleAddTag = useCallback(() => {
    if (newTag.trim()) {
      onAddTag?.(newTag.trim().toLowerCase())
      setNewTag('')
      setIsAdding(false)
    }
  }, [newTag, onAddTag])

  return (
    <section className="space-y-2">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Tags
      </label>
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="group gap-1.5 bg-slate-100 pr-1.5 dark:bg-slate-800"
          >
            #{tag}
            <button
              type="button"
              onClick={() => onRemoveTag?.(tag)}
              className="rounded p-0.5 opacity-0 transition-opacity hover:bg-slate-300 group-hover:opacity-100 dark:hover:bg-slate-700"
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}

        {isAdding ? (
          <div className="flex items-center gap-1">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTag()
                if (e.key === 'Escape') {
                  setIsAdding(false)
                  setNewTag('')
                }
              }}
              placeholder="tag"
              className="h-7 w-24 px-2 text-sm"
              autoFocus
            />
            <Button size="icon" variant="ghost" className="size-7" onClick={handleAddTag}>
              <Check className="size-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-7"
              onClick={() => {
                setIsAdding(false)
                setNewTag('')
              }}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="h-7 gap-1 border-dashed px-2.5 text-xs text-muted-foreground"
          >
            <Plus className="size-3.5" />
            Add tag
          </Button>
        )}
      </div>
    </section>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ImagePreview({
  item,
  caption,
  onCaptionChange,
  onDownload,
  onAddTag,
  onRemoveTag,
}: ImagePreviewProps): React.JSX.Element {
  const [localCaption, setLocalCaption] = useState(caption || item.caption || '')

  const handleCaptionChange = useCallback((value: string) => {
    setLocalCaption(value)
    onCaptionChange?.(value)
  }, [onCaptionChange])

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  }

  const tags = item.tagIds || []

  return (
    <div className="flex flex-col">
      {/* Image Viewer */}
      <ImageViewer imageUrl={item.imageUrl} alt={item.title} />

      {/* Content */}
      <div className="space-y-6 p-6">
        {/* Image Info */}
        <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/50">
              <ImageIcon className="size-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {item.dimensions.width} × {item.dimensions.height}
              </p>
              <p className="text-xs text-muted-foreground">{item.fileSize}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            className="gap-2"
          >
            <Download className="size-4" />
            Download
          </Button>
        </div>

        {/* Caption */}
        <section className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Caption
          </label>
          <Textarea
            value={localCaption}
            onChange={(e) => handleCaptionChange(e.target.value)}
            placeholder="Add a caption for this image..."
            className="min-h-[80px] resize-y border-border/50 bg-muted/20 text-sm"
          />
        </section>

        {/* Tags */}
        <TagsSection
          tags={tags}
          onAddTag={onAddTag}
          onRemoveTag={onRemoveTag}
        />

        {/* Metadata */}
        <section className="rounded-lg border border-border/40 bg-muted/20 p-4">
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Details
          </h3>
          <dl className="space-y-2.5 text-sm">
            <div className="flex items-center gap-3">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-3.5" />
                Saved
              </dt>
              <dd className="text-foreground/80">{formatDate(item.createdAt)}</dd>
            </div>
            <div className="flex items-center gap-3">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <Zap className="size-3.5" />
                Source
              </dt>
              <dd className="text-foreground/80 capitalize">{item.source.replace(/-/g, ' ')}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  )
}
