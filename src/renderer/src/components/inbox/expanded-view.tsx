/**
 * Expanded View Component
 *
 * A vertical stack of large cards for detailed item review.
 * Shows 1-2 items at a time with full content and inline actions.
 */
import { useCallback, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ExpandedCard, type AISuggestion } from './expanded-card'
import type { InboxItem } from '@/data/inbox-types'

// =============================================================================
// TYPES
// =============================================================================

export interface ExpandedViewProps {
  /** Array of inbox items to display */
  items: InboxItem[]
  /** ID of the currently focused item */
  focusedId: string | null
  /** AI suggestions by item ID */
  aiSuggestions?: Map<string, AISuggestion>
  /** Callback when focus changes */
  onFocusChange?: (id: string | null) => void
  /** Callback when file action is triggered */
  onFile?: (ids: string[]) => void
  /** Callback when open original is triggered */
  onOpenOriginal?: (id: string) => void
  /** Callback when snooze is triggered */
  onSnooze?: (ids: string[]) => void
  /** Callback when delete is triggered */
  onDelete?: (ids: string[]) => void
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

// =============================================================================
// MOCK AI SUGGESTIONS (for demo purposes)
// =============================================================================

function generateMockSuggestion(item: InboxItem): AISuggestion | null {
  // Generate mock suggestions based on item type and title
  const suggestions: Record<string, { path: string; confidence: number }> = {
    link: { path: 'Research / Articles', confidence: 85 },
    note: { path: 'Work / Notes', confidence: 72 },
    pdf: { path: 'Documents / Reports', confidence: 90 },
    webclip: { path: 'Research / Highlights', confidence: 78 },
  }

  const suggestion = suggestions[item.type]
  if (!suggestion) return null

  // Add some randomness
  const adjustedConfidence = Math.max(
    40,
    Math.min(95, suggestion.confidence + (Math.random() - 0.5) * 30)
  )

  if (adjustedConfidence < 50) return null

  return {
    folderId: `folder-${item.type}`,
    folderPath: suggestion.path,
    confidence: Math.round(adjustedConfidence),
    similarCount: Math.floor(Math.random() * 5) + 1,
    alternativeFolders:
      adjustedConfidence < 80
        ? [
            { folderId: 'folder-alt-1', folderPath: 'Archive / Misc' },
            { folderId: 'folder-alt-2', folderPath: 'Personal / Saved' },
          ]
        : undefined,
  }
}

// =============================================================================
// EXPANDED VIEW COMPONENT
// =============================================================================

export function ExpandedView({
  items,
  focusedId,
  aiSuggestions,
  onFocusChange,
  onFile,
  onOpenOriginal,
  onSnooze,
  onDelete,
  onAcceptSuggestion,
  onDismissSuggestion,
  onAddTag,
  onRemoveTag,
  className,
}: ExpandedViewProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // Scroll focused card into view
  useEffect(() => {
    if (focusedId) {
      const card = cardRefs.current.get(focusedId)
      if (card) {
        card.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }
  }, [focusedId])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return
      }

      const currentIndex = focusedId
        ? items.findIndex((item) => item.id === focusedId)
        : -1

      switch (e.key) {
        case 'ArrowDown':
        case 'j':
          e.preventDefault()
          if (currentIndex < items.length - 1) {
            onFocusChange?.(items[currentIndex + 1].id)
          }
          break
        case 'ArrowUp':
        case 'k':
          e.preventDefault()
          if (currentIndex > 0) {
            onFocusChange?.(items[currentIndex - 1].id)
          }
          break
        case 'Home':
          e.preventDefault()
          if (items.length > 0) {
            onFocusChange?.(items[0].id)
          }
          break
        case 'End':
          e.preventDefault()
          if (items.length > 0) {
            onFocusChange?.(items[items.length - 1].id)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusedId, items, onFocusChange])

  // Get AI suggestion for an item
  const getAISuggestion = useCallback(
    (itemId: string): AISuggestion | null => {
      if (aiSuggestions) {
        return aiSuggestions.get(itemId) || null
      }
      // Generate mock suggestion for demo
      const item = items.find((i) => i.id === itemId)
      return item ? generateMockSuggestion(item) : null
    },
    [aiSuggestions, items]
  )

  // Set card ref
  const setCardRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      if (el) {
        cardRefs.current.set(id, el)
      } else {
        cardRefs.current.delete(id)
      }
    },
    []
  )

  if (items.length === 0) {
    return (
      <div
        className={cn(
          'flex h-64 items-center justify-center',
          'text-muted-foreground',
          className
        )}
      >
        <p className="text-sm">No items to display</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'px-6 py-4',
        // Scroll snap for card-by-card navigation
        'scroll-smooth',
        className
      )}
      role="feed"
      aria-label="Inbox items in expanded view"
    >
      {/* Cards Container */}
      <div className="mx-auto max-w-3xl space-y-6">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              'transition-all duration-300',
              // Slight scale for non-focused items
              focusedId && focusedId !== item.id && 'opacity-80'
            )}
            style={{
              // Staggered animation on mount
              animationDelay: `${index * 50}ms`,
            }}
          >
            <ExpandedCard
              ref={setCardRef(item.id)}
              item={item}
              isFocused={focusedId === item.id}
              aiSuggestion={getAISuggestion(item.id)}
              onFile={(id) => onFile?.([id])}
              onOpenOriginal={onOpenOriginal}
              onSnooze={(id) => onSnooze?.([id])}
              onDelete={(id) => onDelete?.([id])}
              onAcceptSuggestion={onAcceptSuggestion}
              onDismissSuggestion={onDismissSuggestion}
              onAddTag={onAddTag}
              onRemoveTag={onRemoveTag}
            />
          </div>
        ))}
      </div>

      {/* Navigation hint */}
      <div className="mt-8 flex justify-center">
        <div className="rounded-full bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
          Use <kbd className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono">↑</kbd>{' '}
          <kbd className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono">↓</kbd> or{' '}
          <kbd className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono">j</kbd>{' '}
          <kbd className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono">k</kbd> to navigate
        </div>
      </div>
    </div>
  )
}
