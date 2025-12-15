/**
 * Webclip Preview Component
 *
 * Displays web clip items with:
 * - Source URL with favicon
 * - List of highlights with notes
 * - Open source button
 * - Tags and metadata
 */

import { useState, useCallback } from 'react'
import {
  ExternalLink,
  Globe,
  Quote,
  StickyNote,
  Calendar,
  Zap,
  Plus,
  X,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { WebclipItem, WebclipHighlight } from '@/data/inbox-types'

// ============================================================================
// TYPES
// ============================================================================

export interface WebclipPreviewProps {
  /** The webclip item to preview */
  item: WebclipItem
  /** Callback to open source URL */
  onOpenSource?: () => void
  /** Available tags */
  availableTags?: string[]
  /** Add tag callback */
  onAddTag?: (tag: string) => void
  /** Remove tag callback */
  onRemoveTag?: (tag: string) => void
}

// ============================================================================
// SOURCE HEADER
// ============================================================================

interface SourceHeaderProps {
  domain: string
  sourceUrl: string
  onOpen?: () => void
}

function SourceHeader({ domain, sourceUrl, onOpen }: SourceHeaderProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-between rounded-xl border border-amber-200/50 bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:border-amber-800/30 dark:from-amber-950/30 dark:to-orange-950/20">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
          <Globe className="size-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{domain}</p>
          <p className="truncate text-xs text-muted-foreground">{sourceUrl}</p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onOpen} className="gap-2 shrink-0">
        <ExternalLink className="size-4" />
        Open Source
      </Button>
    </div>
  )
}

// ============================================================================
// HIGHLIGHT CARD
// ============================================================================

interface HighlightCardProps {
  highlight: WebclipHighlight
  index: number
}

function HighlightCard({ highlight, index }: HighlightCardProps): React.JSX.Element {
  return (
    <div className="group relative rounded-lg border border-border/50 bg-card p-4 transition-colors hover:bg-accent/30">
      {/* Index badge */}
      <div className="absolute -left-2 -top-2 flex size-6 items-center justify-center rounded-full bg-amber-500 text-xs font-semibold text-white">
        {index}
      </div>

      {/* Quote icon */}
      <Quote className="mb-2 size-4 text-amber-500" />

      {/* Highlight text */}
      <blockquote className="mb-3 text-sm leading-relaxed text-foreground/90 italic">
        "{highlight.text}"
      </blockquote>

      {/* Note if present */}
      {highlight.note && (
        <div className="flex items-start gap-2 rounded-md bg-muted/50 p-2.5">
          <StickyNote className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">{highlight.note}</p>
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

export function WebclipPreview({
  item,
  onOpenSource,
  onAddTag,
  onRemoveTag,
}: WebclipPreviewProps): React.JSX.Element {
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
      {/* Source Header */}
      <SourceHeader
        domain={item.domain}
        sourceUrl={item.sourceUrl}
        onOpen={onOpenSource}
      />

      {/* Highlights */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Highlights
          </label>
          <span className="text-xs text-muted-foreground">
            {item.highlights.length} {item.highlights.length === 1 ? 'clip' : 'clips'}
          </span>
        </div>
        <div className="space-y-4">
          {item.highlights.map((highlight, index) => (
            <HighlightCard
              key={highlight.id}
              highlight={highlight}
              index={index + 1}
            />
          ))}
        </div>
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
  )
}
