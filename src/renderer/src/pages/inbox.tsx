/**
 * Inbox Page
 *
 * Displays captured items from browser extension, quick captures, and unprocessed content.
 * Supports three view modes: Compact, Medium, and Expanded.
 */

import { useState, useMemo, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { InboxHeader, CompactView, MediumView, ExpandedView } from '@/components/inbox'
import {
  type InboxViewMode,
  type InboxFilters,
  type InboxItem,
  defaultInboxFilters,
  isItemSnoozed,
} from '@/data/inbox-types'
import { sampleInboxItems } from '@/data/sample-inbox'

// =============================================================================
// TYPES
// =============================================================================

interface InboxPageState {
  viewMode: InboxViewMode
  filters: InboxFilters
  isFiltersOpen: boolean
  focusedItemId: string | null
  selectedIds: Set<string>
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook to manage inbox page state
 */
function useInboxState() {
  const [state, setState] = useState<InboxPageState>({
    viewMode: 'medium',
    filters: defaultInboxFilters,
    isFiltersOpen: false,
    focusedItemId: null,
    selectedIds: new Set(),
  })

  const setViewMode = useCallback((viewMode: InboxViewMode) => {
    setState((prev) => ({ ...prev, viewMode }))
  }, [])

  const setFilters = useCallback((filters: InboxFilters) => {
    setState((prev) => ({ ...prev, filters }))
  }, [])

  const setSearchQuery = useCallback((search: string) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, search },
    }))
  }, [])

  const toggleFiltersOpen = useCallback(() => {
    setState((prev) => ({ ...prev, isFiltersOpen: !prev.isFiltersOpen }))
  }, [])

  const setSelectedIds = useCallback((selectedIds: Set<string>) => {
    setState((prev) => ({ ...prev, selectedIds }))
  }, [])

  const deselectAll = useCallback(() => {
    setState((prev) => ({ ...prev, selectedIds: new Set() }))
  }, [])

  const setFocusedItemId = useCallback((focusedItemId: string | null) => {
    setState((prev) => ({ ...prev, focusedItemId }))
  }, [])

  return {
    ...state,
    setViewMode,
    setFilters,
    setSearchQuery,
    toggleFiltersOpen,
    setSelectedIds,
    setFocusedItemId,
    deselectAll,
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Filter items based on current filters
 */
function filterItems(items: InboxItem[], filters: InboxFilters): InboxItem[] {
  let filtered = items

  // Filter out snoozed items unless showSnoozed is true
  if (!filters.showSnoozed) {
    filtered = filtered.filter((item) => !isItemSnoozed(item))
  }

  // Search filter
  if (filters.search) {
    const query = filters.search.toLowerCase()
    filtered = filtered.filter((item) =>
      item.title.toLowerCase().includes(query)
    )
  }

  // Type filter
  if (filters.typeFilter !== 'all') {
    filtered = filtered.filter((item) => item.type === filters.typeFilter)
  }

  // Time filter
  if (filters.timeFilter !== 'all') {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    switch (filters.timeFilter) {
      case 'today':
        filtered = filtered.filter((item) => item.createdAt >= today)
        break
      case 'thisWeek':
        filtered = filtered.filter((item) => item.createdAt >= weekAgo)
        break
      case 'older':
        filtered = filtered.filter((item) => item.createdAt < weekAgo)
        break
      case 'stale':
        filtered = filtered.filter((item) => {
          const staleDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return (
            item.createdAt < staleDate &&
            item.folderId === null &&
            !isItemSnoozed(item)
          )
        })
        break
    }
  }

  // Sort
  switch (filters.sortBy) {
    case 'newest':
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      break
    case 'oldest':
      filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      break
    case 'type':
      filtered.sort((a, b) => a.type.localeCompare(b.type))
      break
    case 'title':
      filtered.sort((a, b) => a.title.localeCompare(b.title))
      break
  }

  return filtered
}

/**
 * Get counts for header badge
 */
function getItemCounts(items: InboxItem[]) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const visibleItems = items.filter((item) => !isItemSnoozed(item))
  const todayItems = visibleItems.filter((item) => item.createdAt >= today)
  const snoozedItems = items.filter((item) => isItemSnoozed(item))

  return {
    total: visibleItems.length,
    today: todayItems.length,
    snoozed: snoozedItems.length,
  }
}

/**
 * Check if any filters are active (beyond defaults)
 */
function hasActiveFilters(filters: InboxFilters): boolean {
  return (
    filters.search !== '' ||
    filters.typeFilter !== 'all' ||
    filters.timeFilter !== 'all' ||
    filters.tagIds.length > 0
  )
}

// =============================================================================
// INBOX PAGE COMPONENT
// =============================================================================

export function InboxPage(): React.JSX.Element {
  // State management
  const {
    viewMode,
    filters,
    isFiltersOpen: _isFiltersOpen, // Will be used when filter panel is implemented
    selectedIds,
    focusedItemId,
    setViewMode,
    setSearchQuery,
    toggleFiltersOpen,
    setSelectedIds,
    setFocusedItemId,
    deselectAll,
  } = useInboxState()

  // Items (using sample data for now)
  const items = sampleInboxItems

  // Derived state
  const filteredItems = useMemo(
    () => filterItems(items, filters),
    [items, filters]
  )

  const counts = useMemo(() => getItemCounts(items), [items])

  const isInBulkMode = selectedIds.size > 0

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handleSelectionChange = useCallback(
    (newSelectedIds: Set<string>) => {
      setSelectedIds(newSelectedIds)
    },
    [setSelectedIds]
  )

  const handleItemClick = useCallback(
    (id: string) => {
      // In non-bulk mode, clicking opens preview (to be implemented)
      // For now, just focus the item
      setFocusedItemId(id)
    },
    [setFocusedItemId]
  )

  const handleItemDoubleClick = useCallback(
    (id: string) => {
      // Open preview panel (to be implemented)
      console.log('Double-clicked item:', id)
    },
    []
  )

  const handleFile = useCallback(
    (ids: string[]) => {
      // Open filing panel (to be implemented)
      console.log('File items:', ids)
    },
    []
  )

  const handlePreview = useCallback(
    (id: string) => {
      // Open preview panel (to be implemented)
      console.log('Preview item:', id)
    },
    []
  )

  const handleOpenOriginal = useCallback(
    (id: string) => {
      // Open original link/file (to be implemented)
      console.log('Open original:', id)
    },
    []
  )

  const handleSnooze = useCallback(
    (ids: string[]) => {
      // Open snooze menu (to be implemented)
      console.log('Snooze items:', ids)
    },
    []
  )

  const handleDelete = useCallback(
    (ids: string[]) => {
      // Delete items (to be implemented)
      console.log('Delete items:', ids)
    },
    []
  )

  const handleAcceptSuggestion = useCallback(
    (id: string, folderId: string) => {
      // Accept AI suggestion and file to folder (to be implemented)
      console.log('Accept suggestion for item:', id, 'to folder:', folderId)
    },
    []
  )

  const handleDismissSuggestion = useCallback(
    (id: string) => {
      // Dismiss AI suggestion (to be implemented)
      console.log('Dismiss suggestion for item:', id)
    },
    []
  )

  const handleAddTag = useCallback(
    (id: string, tag: string) => {
      // Add tag to item (to be implemented)
      console.log('Add tag to item:', id, 'tag:', tag)
    },
    []
  )

  const handleRemoveTag = useCallback(
    (id: string, tag: string) => {
      // Remove tag from item (to be implemented)
      console.log('Remove tag from item:', id, 'tag:', tag)
    },
    []
  )

  const handleFocusChange = useCallback(
    (id: string | null) => {
      setFocusedItemId(id)
    },
    [setFocusedItemId]
  )

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <InboxHeader
        itemCount={counts.total}
        todayCount={counts.today}
        snoozedCount={counts.snoozed}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={filters.search}
        onSearchChange={setSearchQuery}
        hasActiveFilters={hasActiveFilters(filters)}
        onFiltersClick={toggleFiltersOpen}
        isInBulkMode={isInBulkMode}
        selectedCount={selectedIds.size}
        onDeselectAll={deselectAll}
      />

      {/* Active Filters Bar - placeholder for future implementation */}
      {hasActiveFilters(filters) && (
        <div className="border-b border-border/50 bg-muted/30 px-6 py-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Active filters:</span>
            {filters.search && (
              <span className="rounded-full bg-background px-2 py-0.5 text-xs">
                Search: "{filters.search}"
              </span>
            )}
            {filters.typeFilter !== 'all' && (
              <span className="rounded-full bg-background px-2 py-0.5 text-xs capitalize">
                Type: {filters.typeFilter}
              </span>
            )}
            {filters.timeFilter !== 'all' && (
              <span className="rounded-full bg-background px-2 py-0.5 text-xs capitalize">
                Time: {filters.timeFilter}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div
        className={cn(
          'flex-1 overflow-y-auto',
          'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border'
        )}
      >
        {filteredItems.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters(filters)
                ? 'No items match your filters'
                : 'Your inbox is empty'}
            </p>
          </div>
        ) : (
          <>
            {/* Compact View */}
            {viewMode === 'compact' && (
              <CompactView
                items={filteredItems}
                selectedIds={selectedIds}
                focusedId={focusedItemId}
                isBulkMode={isInBulkMode}
                onSelectionChange={handleSelectionChange}
                onItemClick={handleItemClick}
                onItemDoubleClick={handleItemDoubleClick}
                onFile={handleFile}
                onPreview={handlePreview}
                onOpenOriginal={handleOpenOriginal}
                onSnooze={handleSnooze}
                onDelete={handleDelete}
              />
            )}

            {/* Medium View */}
            {viewMode === 'medium' && (
              <MediumView
                items={filteredItems}
                selectedIds={selectedIds}
                focusedId={focusedItemId}
                isBulkMode={isInBulkMode}
                onSelectionChange={handleSelectionChange}
                onItemClick={handleItemClick}
                onItemDoubleClick={handleItemDoubleClick}
                onFile={handleFile}
                onPreview={handlePreview}
                onOpenOriginal={handleOpenOriginal}
                onSnooze={handleSnooze}
                onDelete={handleDelete}
              />
            )}

            {/* Expanded View */}
            {viewMode === 'expanded' && (
              <ExpandedView
                items={filteredItems}
                focusedId={focusedItemId}
                onFocusChange={handleFocusChange}
                onFile={handleFile}
                onOpenOriginal={handleOpenOriginal}
                onSnooze={handleSnooze}
                onDelete={handleDelete}
                onAcceptSuggestion={handleAcceptSuggestion}
                onDismissSuggestion={handleDismissSuggestion}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
              />
            )}
          </>
        )}
      </div>

      {/* Bulk Action Bar Area - placeholder for future implementation */}
      {isInBulkMode && (
        <div
          className={cn(
            'border-t border-border bg-background/95 backdrop-blur',
            'px-6 py-4'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedIds.size} {selectedIds.size === 1 ? 'item' : 'items'} selected
            </span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Bulk actions will be implemented in prompt 12
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
