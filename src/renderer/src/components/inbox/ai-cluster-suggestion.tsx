/**
 * AI Cluster Suggestion Component
 *
 * Displays AI-detected clusters of similar items that can be added
 * to the current selection. Features a warm amber aesthetic that
 * feels intelligent and helpful without being intrusive.
 */

import { useState } from 'react'
import { Sparkles, X, Check, ChevronUp, ChevronDown, Wand2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { TypeIcon } from './type-badge'
import type { InboxItem } from '@/data/inbox-types'

// ============================================================================
// TYPES
// ============================================================================

export interface ClusterSuggestion {
  /** Unique identifier for this suggestion */
  id?: string
  /** Human-readable label describing what connects these items */
  label: string
  /** Items suggested to add to selection */
  items: InboxItem[]
  /** Confidence score 0-1 (higher = more confident) */
  confidence: number
  /** Reason for grouping (for UI display) */
  reason?: 'domain' | 'tags' | 'content' | 'type' | 'semantic'
}

export interface AIClusterSuggestionProps {
  /** The cluster suggestion to display */
  suggestion: ClusterSuggestion
  /** Callback when user wants to add all suggested items */
  onAddAll: (itemIds: string[]) => void
  /** Callback when user dismisses the suggestion */
  onDismiss: () => void
  /** Additional class names */
  className?: string
}

export interface AIClusterSuggestionCompactProps {
  /** The cluster suggestion to display */
  suggestion: ClusterSuggestion
  /** Whether the panel is currently expanded */
  isExpanded: boolean
  /** Callback to toggle expansion */
  onToggle: () => void
  /** Additional class names */
  className?: string
}

// ============================================================================
// REASON LABELS
// ============================================================================

const REASON_LABELS: Record<NonNullable<ClusterSuggestion['reason']>, string> = {
  domain: 'Same website',
  tags: 'Similar tags',
  content: 'Related content',
  type: 'Same type',
  semantic: 'Semantically similar',
}

// ============================================================================
// COMPACT SUGGESTION (inline in bar)
// ============================================================================

export function AIClusterSuggestionCompact({
  suggestion,
  isExpanded,
  onToggle,
  className,
}: AIClusterSuggestionCompactProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full',
        // Warm amber gradient background
        'bg-gradient-to-r from-amber-500/10 to-orange-500/10',
        'hover:from-amber-500/15 hover:to-orange-500/15',
        // Subtle border
        'border border-amber-500/20 hover:border-amber-500/30',
        'transition-all duration-200',
        'group cursor-pointer',
        className
      )}
    >
      <Sparkles className="size-3.5 text-amber-500 group-hover:animate-pulse" />
      <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
        {suggestion.items.length} similar
      </span>
      <span className="text-sm text-muted-foreground hidden sm:inline truncate max-w-[180px]">
        — "{suggestion.label}"
      </span>
      {isExpanded ? (
        <ChevronDown className="size-3.5 text-amber-500/70 group-hover:text-amber-500 transition-colors" />
      ) : (
        <ChevronUp className="size-3.5 text-amber-500/70 group-hover:text-amber-500 transition-colors" />
      )}
    </button>
  )
}

// ============================================================================
// EXPANDED SUGGESTION PANEL
// ============================================================================

export function AIClusterSuggestion({
  suggestion,
  onAddAll,
  onDismiss,
  className,
}: AIClusterSuggestionProps): React.JSX.Element {
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null)

  const handleAddAll = () => {
    onAddAll(suggestion.items.map((item) => item.id))
  }

  // Confidence indicator
  const confidenceLevel =
    suggestion.confidence >= 0.8
      ? 'high'
      : suggestion.confidence >= 0.5
        ? 'medium'
        : 'low'

  return (
    <div
      className={cn(
        // Container
        'rounded-xl overflow-hidden',
        // Gradient border effect via wrapper
        'p-px',
        'bg-gradient-to-b from-amber-500/30 via-amber-500/10 to-transparent',
        // Animation
        'animate-in slide-in-from-bottom-2 fade-in-0 duration-300',
        className
      )}
    >
      <div
        className={cn(
          'rounded-[11px] p-4',
          // Background
          'bg-gradient-to-b from-amber-500/5 via-background to-background',
          'backdrop-blur-sm'
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Icon with glow effect */}
            <div
              className={cn(
                'relative flex size-10 items-center justify-center rounded-xl',
                'bg-gradient-to-br from-amber-500/20 to-orange-500/20',
                'border border-amber-500/20',
                // Subtle glow
                'shadow-[0_0_12px_-2px_rgba(245,158,11,0.15)]'
              )}
            >
              <Wand2 className="size-5 text-amber-500" />
              {/* Animated sparkle */}
              <Sparkles className="absolute -top-1 -right-1 size-3 text-amber-400 animate-pulse" />
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">
                AI detected similar items
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span>"{suggestion.label}"</span>
                {suggestion.reason && (
                  <>
                    <span className="text-border">·</span>
                    <span className="text-amber-600/70 dark:text-amber-400/70">
                      {REASON_LABELS[suggestion.reason]}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onDismiss}
            className={cn(
              'p-1.5 rounded-lg -mr-1 -mt-1',
              'text-muted-foreground hover:text-foreground',
              'hover:bg-accent/80 transition-colors'
            )}
            aria-label="Dismiss suggestion"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Confidence indicator */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-1 bg-accent rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                confidenceLevel === 'high' && 'bg-amber-500',
                confidenceLevel === 'medium' && 'bg-amber-500/70',
                confidenceLevel === 'low' && 'bg-amber-500/40'
              )}
              style={{ width: `${suggestion.confidence * 100}%` }}
            />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            {Math.round(suggestion.confidence * 100)}% match
          </span>
        </div>

        {/* Item List */}
        <div className="space-y-1 mb-4 max-h-[200px] overflow-y-auto">
          {suggestion.items.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg',
                'bg-accent/40 hover:bg-accent/60',
                'transition-all duration-150',
                // Staggered entrance
                'animate-in slide-in-from-left-1 fade-in-0',
                hoveredItemId === item.id && 'bg-accent/70 scale-[1.01]'
              )}
              style={{ animationDelay: `${index * 40}ms` }}
              onMouseEnter={() => setHoveredItemId(item.id)}
              onMouseLeave={() => setHoveredItemId(null)}
            >
              <TypeIcon type={item.type} size="sm" />
              <span className="text-sm text-foreground/90 truncate flex-1">
                {item.title}
              </span>
              {/* Add individual item button on hover */}
              {hoveredItemId === item.id && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onAddAll([item.id])
                  }}
                  className={cn(
                    'p-1 rounded-md',
                    'bg-primary/10 hover:bg-primary/20',
                    'text-primary',
                    'transition-colors',
                    'animate-in fade-in-0 duration-100'
                  )}
                >
                  <Check className="size-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground">
            {suggestion.items.length} items to add
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-muted-foreground h-8"
            >
              Dismiss
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleAddAll}
              className={cn(
                'gap-1.5 h-8',
                // Warm gradient
                'bg-gradient-to-r from-amber-500 to-orange-500',
                'hover:from-amber-600 hover:to-orange-600',
                'text-white border-0',
                'shadow-md shadow-amber-500/20'
              )}
            >
              <Check className="size-3.5" />
              Add all
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// HOOK FOR MOCK SUGGESTIONS (development)
// ============================================================================

/**
 * Mock hook to generate cluster suggestions based on selected items.
 * Replace with actual AI-based clustering in production.
 */
export function useMockClusterSuggestion(
  selectedItems: InboxItem[],
  allItems: InboxItem[]
): ClusterSuggestion | undefined {
  // Only suggest when 2+ items are selected
  if (selectedItems.length < 2) {
    return undefined
  }

  // Check if selected items share a domain (for links)
  const linkItems = selectedItems.filter((item) => item.type === 'link') as Array<
    InboxItem & { domain?: string }
  >

  if (linkItems.length >= 2) {
    const domains = linkItems.map((item) => item.domain).filter(Boolean)
    const uniqueDomains = [...new Set(domains)]

    if (uniqueDomains.length === 1 && uniqueDomains[0]) {
      // Find other items with the same domain
      const domain = uniqueDomains[0]
      const relatedItems = allItems.filter(
        (item) =>
          item.type === 'link' &&
          (item as InboxItem & { domain?: string }).domain === domain &&
          !selectedItems.some((s) => s.id === item.id)
      )

      if (relatedItems.length > 0) {
        return {
          label: `Articles from ${domain}`,
          items: relatedItems,
          confidence: 0.9,
          reason: 'domain',
        }
      }
    }
  }

  // Check if selected items share the same type
  const types = selectedItems.map((item) => item.type)
  const uniqueTypes = [...new Set(types)]

  if (uniqueTypes.length === 1) {
    const itemType = uniqueTypes[0]
    const relatedItems = allItems.filter(
      (item) =>
        item.type === itemType &&
        !selectedItems.some((s) => s.id === item.id)
    )

    if (relatedItems.length > 0) {
      const typeLabels: Record<string, string> = {
        link: 'Links',
        note: 'Notes',
        image: 'Images',
        voice: 'Voice memos',
        pdf: 'PDFs',
        webclip: 'Web clips',
        file: 'Files',
        video: 'Videos',
      }

      return {
        label: `More ${typeLabels[itemType] || itemType}`,
        items: relatedItems.slice(0, 5),
        confidence: 0.6,
        reason: 'type',
      }
    }
  }

  return undefined
}
