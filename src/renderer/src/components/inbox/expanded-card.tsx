/**
 * Expanded Card Component
 *
 * A full-detail card for the expanded review view.
 * Shows complete content, AI suggestions, tags, and inline actions.
 */
import { forwardRef, useState, useCallback } from 'react'
import {
  FolderInput,
  ExternalLink,
  Clock,
  Trash2,
  Sparkles,
  Lightbulb,
  X,
  Plus,
  Tag,
  Folder,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { TypeBadge } from './type-badge'
import { TypeRenderer } from './type-renderers'
import type { InboxItem, LinkItem } from '@/data/inbox-types'
import { formatRelativeTime } from '@/lib/inbox-utils'

// =============================================================================
// TYPES
// =============================================================================

export interface ExpandedCardProps {
  /** The inbox item to display */
  item: InboxItem
  /** Whether this card is currently focused */
  isFocused?: boolean
  /** AI suggestion data (if available) */
  aiSuggestion?: AISuggestion | null
  /** Callback when file action is triggered */
  onFile?: (id: string) => void
  /** Callback when open original is triggered */
  onOpenOriginal?: (id: string) => void
  /** Callback when snooze is triggered */
  onSnooze?: (id: string) => void
  /** Callback when delete is triggered */
  onDelete?: (id: string) => void
  /** Callback when AI suggestion is accepted */
  onAcceptSuggestion?: (id: string, folderId: string) => void
  /** Callback when AI suggestion is dismissed */
  onDismissSuggestion?: (id: string) => void
  /** Callback when tag is added */
  onAddTag?: (id: string, tag: string) => void
  /** Callback when tag is removed */
  onRemoveTag?: (id: string, tag: string) => void
  /** Additional class names */
  className?: string
}

export interface AISuggestion {
  folderId: string
  folderPath: string
  confidence: number // 0-100
  similarCount?: number
  alternativeFolders?: { folderId: string; folderPath: string }[]
}

// =============================================================================
// AI SUGGESTION SECTION
// =============================================================================

interface AISuggestionSectionProps {
  suggestion: AISuggestion
  onAccept: () => void
  onDismiss: () => void
  onChooseDifferent: () => void
}

function AISuggestionSection({
  suggestion,
  onAccept,
  onDismiss,
  onChooseDifferent,
}: AISuggestionSectionProps): React.JSX.Element {
  const isHighConfidence = suggestion.confidence >= 80
  const isMediumConfidence = suggestion.confidence >= 50 && suggestion.confidence < 80

  if (isHighConfidence) {
    return (
      <div
        className={cn(
          'rounded-lg border p-4',
          'bg-gradient-to-r from-amber-50/80 to-orange-50/50',
          'border-amber-200/60',
          'dark:from-amber-950/30 dark:to-orange-950/20',
          'dark:border-amber-800/40'
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
              <Sparkles className="h-4 w-4" />
              <span>AI Suggestion</span>
              <span className="rounded-full bg-amber-200/60 px-2 py-0.5 text-xs dark:bg-amber-800/40">
                {suggestion.confidence}% confident
              </span>
            </div>

            {/* Folder path */}
            <div className="mt-2 flex items-center gap-2 text-base font-medium text-foreground">
              <Folder className="h-4 w-4 text-amber-600" />
              <span>{suggestion.folderPath}</span>
            </div>

            {/* Similar items */}
            {suggestion.similarCount && suggestion.similarCount > 0 && (
              <p className="mt-1.5 text-sm text-muted-foreground">
                {suggestion.similarCount} similar item{suggestion.similarCount > 1 ? 's' : ''} filed here
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onChooseDifferent}
              className="text-muted-foreground"
            >
              Choose Different
            </Button>
            <Button
              size="sm"
              onClick={onAccept}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Accept
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isMediumConfidence) {
    return (
      <div
        className={cn(
          'rounded-lg border p-4',
          'bg-gradient-to-r from-slate-50/80 to-stone-50/50',
          'border-slate-200/60',
          'dark:from-slate-950/30 dark:to-stone-950/20',
          'dark:border-slate-800/40'
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              <Lightbulb className="h-4 w-4" />
              <span>Possible destinations</span>
            </div>

            {/* Options */}
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center gap-2 text-sm">
                <Folder className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{suggestion.folderPath}</span>
              </div>
              {suggestion.alternativeFolders?.map((alt) => (
                <div key={alt.folderId} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Folder className="h-3.5 w-3.5" />
                  <span>{alt.folderPath}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={onChooseDifferent}>
              <Folder className="mr-1.5 h-3.5 w-3.5" />
              Choose a Folder
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Low confidence - don't show
  return <></>
}

// =============================================================================
// TAGS SECTION
// =============================================================================

interface TagsSectionProps {
  tags: string[]
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
}

function TagsSection({ tags, onAddTag, onRemoveTag }: TagsSectionProps): React.JSX.Element {
  const [isAdding, setIsAdding] = useState(false)
  const [newTag, setNewTag] = useState('')

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (newTag.trim()) {
        onAddTag(newTag.trim())
        setNewTag('')
        setIsAdding(false)
      }
    },
    [newTag, onAddTag]
  )

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsAdding(false)
      setNewTag('')
    }
  }, [])

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Tag className="h-3.5 w-3.5" />
        <span>Tags:</span>
      </div>

      {/* Existing tags */}
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="group gap-1 pr-1 text-sm font-normal"
        >
          {tag}
          <button
            onClick={() => onRemoveTag(tag)}
            className={cn(
              'ml-0.5 rounded-full p-0.5',
              'opacity-60 hover:opacity-100',
              'hover:bg-destructive/20 hover:text-destructive',
              'transition-all duration-150'
            )}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {/* Add tag */}
      {isAdding ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-1">
          <Input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter tag..."
            className="h-7 w-32 text-sm"
            autoFocus
          />
          <Button type="submit" size="sm" variant="ghost" className="h-7 px-2">
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            onClick={() => {
              setIsAdding(false)
              setNewTag('')
            }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </form>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="h-7 gap-1 px-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Add tag
        </Button>
      )}
    </div>
  )
}

// =============================================================================
// ACTION BAR
// =============================================================================

interface ActionBarProps {
  itemId: string
  hasOriginalUrl: boolean
  onFile: () => void
  onOpenOriginal: () => void
  onSnooze: () => void
  onDelete: () => void
}

function ActionBar({
  itemId: _itemId, // Reserved for future action tracking
  hasOriginalUrl,
  onFile,
  onOpenOriginal,
  onSnooze,
  onDelete,
}: ActionBarProps): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={onFile} className="gap-2">
        <FolderInput className="h-4 w-4" />
        File to Folder
      </Button>

      {hasOriginalUrl && (
        <Button variant="outline" size="sm" onClick={onOpenOriginal} className="gap-2">
          <ExternalLink className="h-4 w-4" />
          Open Original
        </Button>
      )}

      <Button variant="outline" size="sm" onClick={onSnooze} className="gap-2">
        <Clock className="h-4 w-4" />
        Snooze
      </Button>

      {/* Delete with confirmation */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The item will be permanently removed from your inbox.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// =============================================================================
// EXPANDED CARD COMPONENT
// =============================================================================

export const ExpandedCard = forwardRef<HTMLDivElement, ExpandedCardProps>(
  function ExpandedCard(
    {
      item,
      isFocused = false,
      aiSuggestion,
      onFile,
      onOpenOriginal,
      onSnooze,
      onDelete,
      onAcceptSuggestion,
      onDismissSuggestion,
      onAddTag,
      onRemoveTag,
      className,
    },
    ref
  ) {
    const [suggestionDismissed, setSuggestionDismissed] = useState(false)

    // Check if item has an original URL
    const hasOriginalUrl =
      item.type === 'link' ||
      item.type === 'webclip' ||
      item.type === 'pdf' ||
      item.type === 'file' ||
      item.type === 'video'

    // Get source/subtitle for display
    const getSubtitle = (): string | null => {
      if (item.type === 'link') {
        return (item as LinkItem).domain
      }
      if (item.type === 'webclip') {
        return (item as { domain: string }).domain
      }
      return null
    }

    const subtitle = getSubtitle()

    // Handlers
    const handleAcceptSuggestion = useCallback(() => {
      if (aiSuggestion) {
        onAcceptSuggestion?.(item.id, aiSuggestion.folderId)
      }
    }, [aiSuggestion, item.id, onAcceptSuggestion])

    const handleDismissSuggestion = useCallback(() => {
      setSuggestionDismissed(true)
      onDismissSuggestion?.(item.id)
    }, [item.id, onDismissSuggestion])

    const handleChooseDifferent = useCallback(() => {
      onFile?.(item.id)
    }, [item.id, onFile])

    const showAISuggestion =
      aiSuggestion && !suggestionDismissed && aiSuggestion.confidence >= 50

    return (
      <article
        ref={ref}
        className={cn(
          'rounded-xl border bg-card p-6',
          'transition-all duration-300 ease-out',
          // Default shadow
          'shadow-sm',
          // Focused state
          isFocused && [
            'shadow-md',
            'ring-2 ring-primary/20 ring-offset-2 ring-offset-background',
          ],
          className
        )}
      >
        {/* Header Row: Type Badge + Timestamp */}
        <div className="flex items-center justify-between">
          <TypeBadge type={item.type} variant="pill" size="sm" />
          <span className="text-sm text-muted-foreground">
            {formatRelativeTime(item.createdAt)}
          </span>
        </div>

        {/* Title Section */}
        <div className="mt-4">
          <h2 className="text-xl font-semibold leading-tight text-foreground">
            {item.title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* Content Area - Full preview */}
        <div className="mt-5">
          <TypeRenderer item={item} className="expanded-preview" />
        </div>

        {/* AI Suggestion Section */}
        {showAISuggestion && (
          <>
            <div className="my-5 border-t border-border/50" />
            <AISuggestionSection
              suggestion={aiSuggestion}
              onAccept={handleAcceptSuggestion}
              onDismiss={handleDismissSuggestion}
              onChooseDifferent={handleChooseDifferent}
            />
          </>
        )}

        {/* Tags Section */}
        <div className="my-5 border-t border-border/50 pt-5">
          <TagsSection
            tags={item.tagIds}
            onAddTag={(tag) => onAddTag?.(item.id, tag)}
            onRemoveTag={(tag) => onRemoveTag?.(item.id, tag)}
          />
        </div>

        {/* Action Bar */}
        <div className="border-t border-border/50 pt-5">
          <ActionBar
            itemId={item.id}
            hasOriginalUrl={hasOriginalUrl}
            onFile={() => onFile?.(item.id)}
            onOpenOriginal={() => onOpenOriginal?.(item.id)}
            onSnooze={() => onSnooze?.(item.id)}
            onDelete={() => onDelete?.(item.id)}
          />
        </div>
      </article>
    )
  }
)
