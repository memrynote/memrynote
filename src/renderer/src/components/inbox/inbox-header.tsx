/**
 * Inbox Header Component
 *
 * The header bar for the inbox page featuring:
 * - Title with item count badge
 * - Search trigger (expandable)
 * - Filter button
 * - View mode toggle (Compact/Medium/Expanded)
 */

import { useState, useRef, useEffect } from 'react'
import {
  Search,
  SlidersHorizontal,
  X,
  Inbox,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ViewSwitcher } from './view-switcher'
import type { InboxViewMode } from '@/data/inbox-types'

// ============================================================================
// TYPES
// ============================================================================

export interface InboxHeaderProps {
  /** Total number of items in inbox */
  itemCount: number
  /** Number of items captured today */
  todayCount: number
  /** Number of snoozed items */
  snoozedCount?: number
  /** Current view mode */
  viewMode: InboxViewMode
  /** Callback when view mode changes */
  onViewModeChange: (mode: InboxViewMode) => void
  /** Current search query */
  searchQuery?: string
  /** Callback when search query changes */
  onSearchChange?: (query: string) => void
  /** Whether filters are currently active */
  hasActiveFilters?: boolean
  /** Callback when filter button clicked */
  onFiltersClick?: () => void
  /** Whether in bulk selection mode */
  isInBulkMode?: boolean
  /** Number of selected items */
  selectedCount?: number
  /** Callback to deselect all */
  onDeselectAll?: () => void
}


// ============================================================================
// SEARCH INPUT
// ============================================================================

interface SearchInputProps {
  isOpen: boolean
  value: string
  onChange: (value: string) => void
  onClose: () => void
}

function SearchInput({ isOpen, value, onChange, onClose }: SearchInputProps): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div
      className={cn(
        'flex items-center overflow-hidden transition-all duration-300 ease-out',
        isOpen ? 'w-64' : 'w-0'
      )}
    >
      <div className="relative flex w-full items-center">
        <Search className="absolute left-3 size-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search inbox..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            'h-9 w-full pl-9 pr-8',
            'bg-muted/40 border-transparent',
            'focus:bg-background focus:border-border',
            'placeholder:text-muted-foreground/60',
            'transition-colors duration-200'
          )}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2 rounded p-0.5 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// ITEM COUNT BADGE
// ============================================================================

interface ItemCountBadgeProps {
  itemCount: number
  todayCount: number
  snoozedCount?: number
}

function ItemCountBadge({ itemCount, todayCount, snoozedCount }: ItemCountBadgeProps): React.JSX.Element {
  const parts: string[] = []

  parts.push(`${itemCount} ${itemCount === 1 ? 'item' : 'items'}`)

  if (todayCount > 0) {
    parts.push(`${todayCount} today`)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {parts.join(' · ')}
      </span>
      {snoozedCount && snoozedCount > 0 && (
        <button
          type="button"
          className={cn(
            'text-sm text-muted-foreground/80 hover:text-foreground',
            'cursor-pointer transition-colors duration-150'
          )}
        >
          {snoozedCount} snoozed
        </button>
      )}
    </div>
  )
}

// ============================================================================
// BULK MODE HEADER
// ============================================================================

interface BulkModeHeaderProps {
  selectedCount: number
  onDeselectAll: () => void
}

function BulkModeHeader({ selectedCount, onDeselectAll }: BulkModeHeaderProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
          <span className="text-sm font-semibold text-primary">{selectedCount}</span>
        </div>
        <span className="text-sm font-medium text-foreground">
          {selectedCount === 1 ? 'item' : 'items'} selected
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDeselectAll}
        className="h-7 text-xs text-muted-foreground hover:text-foreground"
      >
        Deselect all
      </Button>
    </div>
  )
}

// ============================================================================
// MAIN HEADER COMPONENT
// ============================================================================

export function InboxHeader({
  itemCount,
  todayCount,
  snoozedCount = 0,
  viewMode,
  onViewModeChange,
  searchQuery = '',
  onSearchChange,
  hasActiveFilters = false,
  onFiltersClick,
  isInBulkMode = false,
  selectedCount = 0,
  onDeselectAll,
}: InboxHeaderProps): React.JSX.Element {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const handleSearchToggle = (): void => {
    if (isSearchOpen) {
      onSearchChange?.('')
      setIsSearchOpen(false)
    } else {
      setIsSearchOpen(true)
    }
  }

  const handleSearchClose = (): void => {
    onSearchChange?.('')
    setIsSearchOpen(false)
  }

  return (
    <header className="flex items-center justify-between px-6 py-4">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {isInBulkMode && selectedCount > 0 && onDeselectAll ? (
          <BulkModeHeader
            selectedCount={selectedCount}
            onDeselectAll={onDeselectAll}
          />
        ) : (
          <>
            {/* Title with icon */}
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <Inbox className="size-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                  Inbox
                </h1>
              </div>
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-border/60" />

            {/* Item count badge */}
            <ItemCountBadge
              itemCount={itemCount}
              todayCount={todayCount}
              snoozedCount={snoozedCount}
            />
          </>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <SearchInput
          isOpen={isSearchOpen}
          value={searchQuery}
          onChange={(value) => onSearchChange?.(value)}
          onClose={handleSearchClose}
        />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSearchToggle}
              className={cn(
                'size-9 rounded-lg',
                isSearchOpen && 'bg-muted'
              )}
              aria-label={isSearchOpen ? 'Close search' : 'Open search'}
            >
              {isSearchOpen ? (
                <X className="size-4" />
              ) : (
                <Search className="size-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>
            <p>{isSearchOpen ? 'Close search' : 'Search'}</p>
            <kbd className="ml-1.5 text-[10px] text-muted-foreground">/</kbd>
          </TooltipContent>
        </Tooltip>

        {/* Filters */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onFiltersClick}
              className={cn(
                'size-9 rounded-lg relative',
                hasActiveFilters && 'text-primary'
              )}
              aria-label="Filters"
            >
              <SlidersHorizontal className="size-4" />
              {hasActiveFilters && (
                <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>
            <p>Filters</p>
          </TooltipContent>
        </Tooltip>

        {/* Separator */}
        <div className="mx-1 h-6 w-px bg-border/60" />

        {/* View mode toggle */}
        <ViewSwitcher
          value={viewMode}
          onChange={onViewModeChange}
        />
      </div>
    </header>
  )
}
