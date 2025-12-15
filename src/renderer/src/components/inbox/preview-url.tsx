/**
 * URL Preview Component
 *
 * Displays saved links with:
 * - Hero image (og:image) or fallback
 * - URL field with copy button
 * - Meta description
 * - AI Summary (collapsible)
 * - Tags with inline editing
 * - Personal notes with auto-save
 * - Metadata
 */

import { useState, useCallback } from 'react'
import {
  Link2,
  Copy,
  Check,
  ChevronDown,
  Sparkles,
  Globe,
  Calendar,
  Clock,
  Zap,
  Plus,
  X,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { LinkItem } from '@/data/inbox-types'

// ============================================================================
// TYPES
// ============================================================================

export interface UrlPreviewProps {
  /** The link item to preview */
  item: LinkItem
  /** AI-generated summary */
  aiSummary?: string
  /** AI summary loading state */
  aiSummaryLoading?: boolean
  /** Available tags for autocomplete */
  availableTags?: string[]
  /** Callback to add a tag */
  onAddTag?: (tag: string) => void
  /** Callback to remove a tag */
  onRemoveTag?: (tag: string) => void
  /** User notes content */
  userNotes?: string
  /** Callback when notes change */
  onNotesChange?: (notes: string) => void
  /** Notes save status */
  notesSaveStatus?: 'idle' | 'saving' | 'saved' | 'error'
  /** Callback to generate AI summary */
  onGenerateSummary?: () => void
  /** Callback to copy URL */
  onCopyUrl?: () => void
}

// ============================================================================
// HERO IMAGE SECTION
// ============================================================================

interface HeroImageProps {
  imageUrl: string | null
  favicon: string | null
  domain: string
  title: string
}

function HeroImage({ imageUrl, favicon, domain, title }: HeroImageProps): React.JSX.Element {
  const [imageError, setImageError] = useState(false)

  if (!imageUrl || imageError) {
    // Fallback with gradient and favicon
    return (
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Centered content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-white/80 shadow-lg ring-1 ring-black/5 dark:bg-slate-800/80">
            {favicon ? (
              <img
                src={favicon}
                alt=""
                className="size-8 rounded"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <Globe className="size-8 text-slate-400" />
            )}
          </div>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {domain}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-900">
      <img
        src={imageUrl}
        alt={title}
        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        onError={() => setImageError(true)}
      />
      {/* Gradient overlay for better text readability if needed */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
    </div>
  )
}

// ============================================================================
// URL FIELD SECTION
// ============================================================================

interface UrlFieldProps {
  url: string
  onCopy?: () => void
}

function UrlField({ url, onCopy }: UrlFieldProps): React.JSX.Element {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      onCopy?.()
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [url, onCopy])

  return (
    <section className="space-y-2">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        URL
      </label>
      <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
        <Link2 className="size-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate font-mono text-sm text-foreground/80">
          {url}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className={cn(
            'h-7 gap-1.5 px-2.5 text-xs',
            copied && 'text-emerald-600 dark:text-emerald-400'
          )}
        >
          {copied ? (
            <>
              <Check className="size-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>
    </section>
  )
}

// ============================================================================
// AI SUMMARY SECTION
// ============================================================================

interface AISummarySectionProps {
  summary?: string
  isLoading?: boolean
  onGenerate?: () => void
}

function AISummarySection({ summary, isLoading, onGenerate }: AISummarySectionProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(true)

  if (!summary && !isLoading && onGenerate) {
    // Show generate button
    return (
      <section className="overflow-hidden rounded-xl border border-violet-200/50 bg-gradient-to-br from-violet-50/80 to-purple-50/50 dark:border-violet-800/30 dark:from-violet-950/30 dark:to-purple-950/20">
        <div className="flex flex-col items-center gap-3 p-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/50">
            <Sparkles className="size-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-violet-900 dark:text-violet-100">
              AI Summary
            </p>
            <p className="mt-1 text-xs text-violet-600/80 dark:text-violet-400/80">
              Analyze this article with AI
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onGenerate}
            className="gap-2 border-violet-300 bg-white/80 text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
          >
            <Sparkles className="size-4" />
            Generate Summary
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-xl border border-violet-200/50 dark:border-violet-800/30">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'flex w-full items-center justify-between gap-2 px-4 py-3',
          'bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/30',
          'transition-colors hover:from-violet-100 hover:to-purple-100 dark:hover:from-violet-950/50 dark:hover:to-purple-950/40'
        )}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-violet-600 dark:text-violet-400" />
          <span className="text-sm font-medium text-violet-800 dark:text-violet-200">
            AI Summary
          </span>
        </div>
        <ChevronDown
          className={cn(
            'size-4 text-violet-500 transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      {/* Content */}
      <div
        className={cn(
          'grid transition-all duration-200',
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <div className="bg-white p-4 dark:bg-slate-900/50">
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Generating summary...
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-foreground/80">
                {summary}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// TAGS SECTION
// ============================================================================

interface TagsSectionProps {
  tags: string[]
  availableTags?: string[]
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
            className="group gap-1.5 bg-slate-100 pr-1.5 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
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
              placeholder="tag name"
              className="h-7 w-24 px-2 text-sm"
              autoFocus
            />
            <Button
              size="icon"
              variant="ghost"
              className="size-7"
              onClick={handleAddTag}
            >
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
// NOTES SECTION
// ============================================================================

interface NotesSectionProps {
  notes?: string
  onNotesChange?: (notes: string) => void
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error'
}

function NotesSection({ notes = '', onNotesChange, saveStatus }: NotesSectionProps): React.JSX.Element {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Your Notes
        </label>
        {saveStatus === 'saving' && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            Saving...
          </span>
        )}
        {saveStatus === 'saved' && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <Check className="size-3" />
            Saved
          </span>
        )}
      </div>
      <Textarea
        value={notes}
        onChange={(e) => onNotesChange?.(e.target.value)}
        placeholder="Add your personal notes about this link..."
        className="min-h-[100px] resize-y border-border/50 bg-muted/20 text-sm placeholder:text-muted-foreground/50"
      />
    </section>
  )
}

// ============================================================================
// METADATA SECTION
// ============================================================================

interface MetadataSectionProps {
  item: LinkItem
}

function MetadataSection({ item }: MetadataSectionProps): React.JSX.Element {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  }

  const sourceLabels: Record<string, string> = {
    paste: 'Pasted',
    'drag-drop': 'Drag & Drop',
    'browser-ext': 'Browser Extension',
    'share-menu': 'Share Menu',
    'quick-capture': 'Quick Capture',
    import: 'Import',
    api: 'API',
  }

  return (
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
          <dd className="text-foreground/80">{sourceLabels[item.source] || item.source}</dd>
        </div>
        {item.filedAt && (
          <div className="flex items-center gap-3">
            <dt className="flex items-center gap-2 text-muted-foreground">
              <Clock className="size-3.5" />
              Filed
            </dt>
            <dd className="text-foreground/80">{formatDate(item.filedAt)}</dd>
          </div>
        )}
      </dl>
    </section>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function UrlPreview({
  item,
  aiSummary,
  aiSummaryLoading,
  availableTags,
  onAddTag,
  onRemoveTag,
  userNotes,
  onNotesChange,
  notesSaveStatus,
  onGenerateSummary,
  onCopyUrl,
}: UrlPreviewProps): React.JSX.Element {
  // Mock tags for now (would come from item.tagIds resolved to names)
  const tags = item.tagIds || []

  return (
    <div className="flex flex-col">
      {/* Hero Image */}
      <HeroImage
        imageUrl={item.heroImage}
        favicon={item.favicon}
        domain={item.domain}
        title={item.title}
      />

      {/* Content */}
      <div className="space-y-6 p-6">
        {/* URL Field */}
        <UrlField url={item.url} onCopy={onCopyUrl} />

        {/* Description */}
        {item.excerpt && (
          <section className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </label>
            <p className="text-sm leading-relaxed text-foreground/80">
              {item.excerpt}
            </p>
          </section>
        )}

        {/* AI Summary */}
        <AISummarySection
          summary={aiSummary}
          isLoading={aiSummaryLoading}
          onGenerate={onGenerateSummary}
        />

        {/* Tags */}
        <TagsSection
          tags={tags}
          availableTags={availableTags}
          onAddTag={onAddTag}
          onRemoveTag={onRemoveTag}
        />

        {/* Notes */}
        <NotesSection
          notes={userNotes}
          onNotesChange={onNotesChange}
          saveStatus={notesSaveStatus}
        />

        {/* Metadata */}
        <MetadataSection item={item} />
      </div>
    </div>
  )
}
