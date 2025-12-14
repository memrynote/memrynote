# 18 - Page Integration

## Objective

Assemble all inbox components into the final page, implement state management, connect handlers, set up responsive layout, and ensure all features work together cohesively.

---

## Context

This is the final integration step that brings together:
- All view components (Compact, Medium, Expanded)
- Header bar with search, filters, view toggle
- Empty states
- Bulk action bar
- Snooze features
- Filing panel
- Stale items section
- Keyboard shortcuts
- Responsive layout

**Dependencies:** All previous prompts (01-17)

**Blocks:** None (final prompt)

---

## Implementation Guide

### File Location

Update: `src/renderer/src/pages/inbox.tsx`

### Complete Inbox Page

```tsx
// src/renderer/src/pages/inbox.tsx

import { useState, useRef, useMemo, useEffect } from 'react'
import { cn } from '@/lib/utils'

// Components
import { HeaderBar } from '@/components/inbox/header-bar'
import { ViewSwitcher } from '@/components/inbox/view-switcher'
import { SearchInput } from '@/components/inbox/search-input'
import { FilterBar } from '@/components/inbox/filter-bar'
import { CompactView } from '@/components/inbox/compact-view'
import { MediumView } from '@/components/inbox/medium-view'
import { ExpandedView } from '@/components/inbox/expanded-view'
import { EmptyState } from '@/components/inbox/empty-state'
import { BulkActionBar } from '@/components/inbox/bulk-action-bar'
import { SnoozeMenu } from '@/components/inbox/snooze-menu'
import { SnoozedIndicator } from '@/components/inbox/snoozed-indicator'
import { SnoozeReturnBanner } from '@/components/inbox/snooze-return-banner'
import { FilingPanel } from '@/components/inbox/filing-panel'
import { StaleSection } from '@/components/inbox/stale-section'
import { KeyboardHelp } from '@/components/inbox/keyboard-help'

// Hooks
import { useInboxSelection } from '@/lib/hooks/use-inbox-selection'
import { useInboxFilters } from '@/lib/hooks/use-inbox-filters'
import { useInboxSearch } from '@/lib/hooks/use-inbox-search'
import { useKeyboardNav } from '@/lib/hooks/use-keyboard-nav'

// Types
import type {
  InboxItem,
  InboxViewMode,
  InboxFilterState,
  AISuggestion,
  UserTag,
} from '@/types/inbox'
import type { TreeDataItem } from '@/types'

// =============================================================================
// MOCK DATA (Replace with real data fetching)
// =============================================================================

const MOCK_ITEMS: InboxItem[] = [
  // Add mock items for development/testing
]

const MOCK_FOLDERS: TreeDataItem[] = [
  { id: '1', name: 'Work', type: 'folder', children: [
    { id: '1-1', name: 'Projects', type: 'folder' },
    { id: '1-2', name: 'References', type: 'folder' },
  ]},
  { id: '2', name: 'Personal', type: 'folder' },
  { id: '3', name: 'Research', type: 'folder' },
  { id: '4', name: 'Archive', type: 'folder' },
]

// =============================================================================
// INBOX PAGE COMPONENT
// =============================================================================

export function InboxPage(): React.JSX.Element {
  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------

  // View mode
  const [currentView, setCurrentView] = useState<InboxViewMode>('medium')

  // Items (replace with data fetching)
  const [items, setItems] = useState<InboxItem[]>(MOCK_ITEMS)
  const [snoozedItems, setSnoozedItems] = useState<InboxItem[]>([])
  const [returnedItems, setReturnedItems] = useState<InboxItem[]>([])

  // UI state
  const [isFilingPanelOpen, setIsFilingPanelOpen] = useState(false)
  const [filingItems, setFilingItems] = useState<InboxItem[]>([])
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [isSnoozeMenuOpen, setIsSnoozeMenuOpen] = useState(false)

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null)

  // ---------------------------------------------------------------------------
  // HOOKS
  // ---------------------------------------------------------------------------

  // Selection
  const {
    selectedIds,
    isSelected,
    isBulkMode,
    selectedCount,
    select,
    deselect,
    toggle,
    toggleWithShift,
    selectAll,
    deselectAll,
  } = useInboxSelection({ items })

  // Filters
  const {
    filters,
    setFilters,
    resetFilters,
    filteredItems: filterResults,
    activeFilterCount,
    filteredCount,
  } = useInboxFilters(items)

  // Search
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    filteredItems: searchResults,
    resultCount: searchResultCount,
    recentSearches,
    clearRecentSearches,
  } = useInboxSearch(items)

  // Combine filters and search
  const displayedItems = useMemo(() => {
    let result = items

    // Apply filters
    if (activeFilterCount > 0) {
      result = filterResults
    }

    // Apply search
    if (searchQuery) {
      result = searchResults
    }

    return result
  }, [items, filterResults, searchResults, activeFilterCount, searchQuery])

  // Separate fresh and stale items
  const freshItems = useMemo(() => {
    const staleThreshold = Date.now() - 7 * 24 * 60 * 60 * 1000
    return displayedItems.filter(
      (item) => item.createdAt.getTime() > staleThreshold
    )
  }, [displayedItems])

  // Keyboard navigation
  const { focusedIndex, focusedId, setFocusedIndex } = useKeyboardNav({
    items: displayedItems,
    selectedIds,
    currentView,
    selectItem: select,
    deselectItem: deselect,
    toggleItem: toggle,
    selectAll,
    deselectAll,
    onFile: handleOpenFilingPanel,
    onTag: handleOpenTagPanel,
    onDelete: handleDelete,
    onSnooze: handleOpenSnoozeMenu,
    onOpenOriginal: handleOpenOriginal,
    onOpenPreview: handleOpenPreview,
    onViewChange: setCurrentView,
    onRefresh: handleRefresh,
    onFocusSearch: () => searchInputRef.current?.focus(),
    onShowHelp: () => setShowKeyboardHelp(true),
  })

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------

  function handleSelect(id: string, selected: boolean, shiftKey: boolean = false, index: number = 0) {
    if (shiftKey) {
      toggleWithShift(id, true, index)
    } else if (selected) {
      select(id)
    } else {
      deselect(id)
    }
  }

  function handleOpenFilingPanel(ids?: string[]) {
    const targetIds = ids || Array.from(selectedIds)
    if (targetIds.length === 0 && focusedId) {
      targetIds.push(focusedId)
    }
    if (targetIds.length > 0) {
      const itemsToFile = items.filter((item) => targetIds.includes(item.id))
      setFilingItems(itemsToFile)
      setIsFilingPanelOpen(true)
    }
  }

  function handleFile(itemIds: string[], folderId: string, tags: UserTag[]) {
    // Move items to folder (implement actual logic)
    console.log('Filing items:', itemIds, 'to folder:', folderId, 'with tags:', tags)

    // Remove from inbox
    setItems((prev) => prev.filter((item) => !itemIds.includes(item.id)))
    deselectAll()
    setIsFilingPanelOpen(false)
  }

  function handleOpenTagPanel(ids?: string[]) {
    // Implement tag panel (similar to filing panel)
    console.log('Open tag panel for:', ids)
  }

  function handleDelete(ids?: string[]) {
    const targetIds = ids || Array.from(selectedIds)
    if (targetIds.length === 0 && focusedId) {
      targetIds.push(focusedId)
    }
    if (targetIds.length > 0) {
      // Confirm and delete
      if (confirm(`Delete ${targetIds.length} item(s)?`)) {
        setItems((prev) => prev.filter((item) => !targetIds.includes(item.id)))
        deselectAll()
      }
    }
  }

  function handleOpenSnoozeMenu(ids?: string[]) {
    setIsSnoozeMenuOpen(true)
  }

  function handleSnooze(until: Date) {
    const targetIds = selectedCount > 0 ? Array.from(selectedIds) : focusedId ? [focusedId] : []
    if (targetIds.length > 0) {
      const itemsToSnooze = items.filter((item) => targetIds.includes(item.id))
      const snoozed = itemsToSnooze.map((item) => ({
        ...item,
        snoozedUntil: until,
      }))

      setSnoozedItems((prev) => [...prev, ...snoozed])
      setItems((prev) => prev.filter((item) => !targetIds.includes(item.id)))
      deselectAll()
    }
    setIsSnoozeMenuOpen(false)
  }

  function handleOpenOriginal(id: string) {
    const item = items.find((i) => i.id === id)
    if (item && 'url' in item) {
      window.open(item.url, '_blank')
    }
  }

  function handleOpenPreview(id: string) {
    // Implement preview panel/modal
    console.log('Open preview for:', id)
  }

  function handleRefresh() {
    // Refetch items
    console.log('Refreshing inbox...')
  }

  function handleDismissReturnedItem(id: string) {
    setReturnedItems((prev) => prev.filter((item) => item.id !== id))
  }

  function handleFileAllToUnsorted(ids: string[]) {
    const unsortedFolderId = 'unsorted' // Implement real unsorted folder ID
    handleFile(ids, unsortedFolderId, [])
  }

  function handleSequentialReview(ids: string[]) {
    // Enter expanded view with only these items
    setCurrentView('expanded')
    // Filter to show only these items
  }

  // ---------------------------------------------------------------------------
  // COMPUTED VALUES
  // ---------------------------------------------------------------------------

  const totalItems = items.length
  const todayItems = items.filter((item) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return item.createdAt >= today
  }).length

  const hasFilingHistory = true // Implement real check
  const emptyStateVariant = displayedItems.length === 0
    ? hasFilingHistory
      ? snoozedItems.length > 0
        ? 'returning-empty'
        : 'inbox-zero'
      : 'first-time'
    : null

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b">
        {/* Left: Title and stats */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Inbox</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{totalItems} items</span>
            {todayItems > 0 && <span>. {todayItems} today</span>}
            <SnoozedIndicator
              snoozedItems={snoozedItems}
              onViewAll={() => {/* Show snoozed view */}}
              onUnsnooze={(id) => {/* Unsnooze item */}}
            />
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          <SearchInput
            ref={searchInputRef}
            value={searchQuery}
            onChange={setSearchQuery}
            resultCount={searchResultCount}
            recentSearches={recentSearches}
            onClearRecent={clearRecentSearches}
          />

          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
          />

          <ViewSwitcher
            currentView={currentView}
            onViewChange={setCurrentView}
          />
        </div>
      </header>

      {/* Returned items banner */}
      {returnedItems.map((item) => (
        <SnoozeReturnBanner
          key={item.id}
          item={item}
          onDismiss={() => handleDismissReturnedItem(item.id)}
        />
      ))}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {emptyStateVariant ? (
          <EmptyState
            variant={emptyStateVariant}
            stats={{
              filed: 8,
              deleted: 2,
              snoozed: snoozedItems.length,
              avgProcessingTime: 12,
            }}
            snoozedItems={snoozedItems.slice(0, 3).map((item) => ({
              id: item.id,
              title: item.title,
              type: item.type,
              returnsAt: item.snoozedUntil!,
            }))}
            onCapture={() => {/* Open capture dialog */}}
            onViewSnoozed={() => {/* Show snoozed items */}}
            onAddNew={() => {/* Open add new dialog */}}
          />
        ) : (
          <>
            {/* View content */}
            {currentView === 'compact' && (
              <CompactView
                items={freshItems}
                selectedIds={selectedIds}
                focusedId={focusedId}
                isBulkMode={isBulkMode}
                onSelect={handleSelect}
                onOpen={handleOpenPreview}
                onFile={(id) => handleOpenFilingPanel([id])}
                onDelete={(id) => handleDelete([id])}
              />
            )}

            {currentView === 'medium' && (
              <MediumView
                items={freshItems}
                selectedIds={selectedIds}
                focusedId={focusedId}
                isBulkMode={isBulkMode}
                onSelect={handleSelect}
                onOpen={handleOpenPreview}
                onFile={(id) => handleOpenFilingPanel([id])}
                onDelete={(id) => handleDelete([id])}
                onSnooze={(id) => handleOpenSnoozeMenu([id])}
              />
            )}

            {currentView === 'expanded' && (
              <ExpandedView
                items={freshItems}
                onFile={(id) => handleOpenFilingPanel([id])}
                onOpenOriginal={handleOpenOriginal}
                onSnooze={(id) => handleOpenSnoozeMenu([id])}
                onDelete={(id) => handleDelete([id])}
                onAcceptSuggestion={(id, suggestion) => {
                  handleFile([id], suggestion.folderId, [])
                }}
                onDismissSuggestion={(id) => {/* Clear AI suggestion */}}
                onAddTag={(id) => handleOpenTagPanel([id])}
                onRemoveTag={(id, tagId) => {/* Remove tag */}}
              />
            )}

            {/* Stale items section */}
            <StaleSection
              items={items}
              selectedIds={selectedIds}
              onSelect={(id, selected) => handleSelect(id, selected)}
              onSelectAll={(ids) => ids.forEach((id) => select(id))}
              onFileAllToUnsorted={handleFileAllToUnsorted}
              onReviewSequentially={handleSequentialReview}
              onOpenItem={handleOpenPreview}
            />
          </>
        )}
      </main>

      {/* Bulk action bar */}
      <BulkActionBar
        selectedCount={selectedCount}
        selectedIds={selectedIds}
        onDeselectAll={deselectAll}
        onFile={() => handleOpenFilingPanel()}
        onTag={() => handleOpenTagPanel()}
        onSnooze={() => handleOpenSnoozeMenu()}
        onDelete={() => handleDelete()}
        onAddSuggestedToSelection={(ids) => ids.forEach((id) => select(id))}
        onDismissSuggestion={() => {}}
      />

      {/* Filing panel */}
      <FilingPanel
        isOpen={isFilingPanelOpen}
        onClose={() => setIsFilingPanelOpen(false)}
        items={filingItems}
        folders={MOCK_FOLDERS}
        recentFolders={MOCK_FOLDERS.slice(0, 2)}
        onFile={handleFile}
      />

      {/* Keyboard help */}
      <KeyboardHelp
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
      />
    </div>
  )
}
```

---

## Responsive Layout

### Sidebar Collapse Handling

```tsx
// The main app layout should handle sidebar collapse
// Inbox page receives available width through context or props

interface InboxPageProps {
  sidebarCollapsed?: boolean
}

// Adjust header layout based on available space
<header className={cn(
  'flex items-center justify-between px-6 py-4 border-b',
  sidebarCollapsed && 'px-4'
)}>
```

### Mobile Considerations

For narrow screens (<768px):
- Search expands to full width below title
- Filter and view controls move to a bottom sheet
- Bulk action bar becomes compact

---

## State Management Patterns

### Option 1: Local State (Current Implementation)

Good for:
- Simple applications
- Quick prototyping
- When data doesn't need to persist

### Option 2: Context + Reducer

```tsx
// src/renderer/src/contexts/inbox-context.tsx

interface InboxState {
  items: InboxItem[]
  selectedIds: Set<string>
  filters: InboxFilterState
  view: InboxViewMode
  // ...
}

type InboxAction =
  | { type: 'SET_ITEMS'; payload: InboxItem[] }
  | { type: 'SELECT_ITEM'; payload: string }
  | { type: 'DESELECT_ALL' }
  // ...

const InboxContext = createContext<{
  state: InboxState
  dispatch: Dispatch<InboxAction>
} | null>(null)
```

### Option 3: External State Manager

For complex applications, consider:
- Zustand
- Jotai
- TanStack Query (for server state)

---

## Acceptance Criteria

- [ ] All components integrated into `inbox.tsx`
- [ ] Header bar displays correctly with all controls
- [ ] View switching works (Compact/Medium/Expanded)
- [ ] Search filters items in real-time
- [ ] Filters apply and show active badge
- [ ] Empty states render correctly based on conditions
- [ ] Item selection works (single, range, all)
- [ ] Bulk action bar appears when items selected
- [ ] Filing panel opens and files items
- [ ] Snooze menu works and moves items
- [ ] Stale items section shows for old items
- [ ] Keyboard shortcuts all functional
- [ ] Responsive at different viewport sizes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] App runs without console errors

---

## Testing Checklist

### Functional Tests

- [ ] Add item to inbox
- [ ] Search for item
- [ ] Filter by type
- [ ] Filter by time range
- [ ] Select single item
- [ ] Select multiple items (Shift+click)
- [ ] Select all (Cmd+A)
- [ ] File single item
- [ ] File multiple items (bulk)
- [ ] Snooze item
- [ ] Delete item
- [ ] Switch views
- [ ] Navigate with keyboard
- [ ] Use all keyboard shortcuts

### Visual Tests

- [ ] Light mode appearance
- [ ] Dark mode appearance
- [ ] Empty states look correct
- [ ] Selected items highlighted
- [ ] Focused item has ring
- [ ] Hover states work
- [ ] Animations smooth

### Edge Cases

- [ ] Empty inbox
- [ ] Single item
- [ ] Many items (100+)
- [ ] Long item titles
- [ ] Items without optional fields
- [ ] All items selected
- [ ] Filter returns no results

---

## Next Steps

After completing the inbox feature:

1. **Data Persistence**: Connect to actual data storage
2. **Real AI Suggestions**: Integrate AI service for folder suggestions
3. **Browser Extension**: Build capture extension
4. **Quick Capture**: Implement global capture hotkey
5. **Drag & Drop**: Add drag-to-sidebar filing
6. **Sync**: Multi-device synchronization
