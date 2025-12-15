/**
 * PDF Preview Component
 *
 * Displays PDF items with:
 * - Thumbnail preview
 * - Page count and file size
 * - Text preview
 * - Open/Download buttons
 * - Tags and metadata
 */

import { useState, useCallback } from 'react'
import {
  FileText,
  Download,
  ExternalLink,
  Calendar,
  Zap,
  Plus,
  X,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { PdfItem } from '@/data/inbox-types'

// ============================================================================
// TYPES
// ============================================================================

export interface PdfPreviewProps {
  /** The PDF item to preview */
  item: PdfItem
  /** Callback to open PDF */
  onOpen?: () => void
  /** Callback to download PDF */
  onDownload?: () => void
  /** Available tags */
  availableTags?: string[]
  /** Add tag callback */
  onAddTag?: (tag: string) => void
  /** Remove tag callback */
  onRemoveTag?: (tag: string) => void
}

// ============================================================================
// PDF THUMBNAIL
// ============================================================================

interface PdfThumbnailProps {
  thumbnailUrl: string | null
  title: string
  pageCount: number
}

function PdfThumbnail({ thumbnailUrl, title, pageCount }: PdfThumbnailProps): React.JSX.Element {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/20">
      {thumbnailUrl ? (
        <div className="relative h-64">
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-contain"
          />
          {/* Page indicator */}
          <div className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            Page 1 of {pageCount}
          </div>
        </div>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <div className="flex size-20 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-900/50">
            <FileText className="size-10 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">{pageCount} pages</p>
            <p className="text-xs text-muted-foreground">PDF Document</p>
          </div>
        </div>
      )}
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

export function PdfPreview({
  item,
  onOpen,
  onDownload,
  onAddTag,
  onRemoveTag,
}: PdfPreviewProps): React.JSX.Element {
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
    <div className="space-y-6 p-6">
      {/* PDF Thumbnail */}
      <PdfThumbnail
        thumbnailUrl={item.thumbnailUrl}
        title={item.title}
        pageCount={item.pageCount}
      />

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={onOpen} className="flex-1 gap-2">
          <ExternalLink className="size-4" />
          Open PDF
        </Button>
        <Button variant="outline" onClick={onDownload} className="gap-2">
          <Download className="size-4" />
          Download
        </Button>
      </div>

      {/* File Info */}
      <div className="flex items-center gap-4 rounded-lg border border-border/50 bg-muted/30 p-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/50">
          <FileText className="size-5 text-rose-600 dark:text-rose-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{item.pageCount} pages</p>
          <p className="text-xs text-muted-foreground">{item.fileSize}</p>
        </div>
      </div>

      {/* Text Preview */}
      {item.textPreview && (
        <section className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Text Preview
          </label>
          <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
            <p className="text-sm leading-relaxed text-foreground/80 line-clamp-6">
              {item.textPreview}
            </p>
          </div>
        </section>
      )}

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
  )
}
