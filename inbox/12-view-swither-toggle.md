Prompt #12: View Switcher
The Prompt
You are building the View Switcher component and logic for Memry's inbox. This component manages the transition between Grid View and List View, persists user preference, and coordinates the state between the two views.

## What You Are Building

A view management system that:
1. Renders the correct view (Grid or List) based on user preference
2. Handles the toggle interaction in the Header Bar
3. Persists view preference to local storage
4. Manages shared state between views (selection, scroll position, etc.)
5. Provides smooth transitions when switching views

## Component Architecture
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  InboxPage (Parent)                                                             │
│  ─────────────────                                                              │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │  HeaderBar                                                                │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                                         ┌───────────────────────┐   │  │  │
│  │  │  ... other header elements ...          │  VIEW TOGGLE          │   │  │  │
│  │  │                                         │  ┌─────┐ ┌─────┐      │   │  │  │
│  │  │                                         │  │ ⊞  │ │ ≡  │      │   │  │  │
│  │  │                                         │  │grid │ │list │      │   │  │  │
│  │  │                                         │  └─────┘ └─────┘      │   │  │  │
│  │  │                                         └───────────────────────┘   │  │  │
│  │  └─────────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │  ContextBar                                                               │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                           │  │
│  │  ViewSwitcher (this component)                                            │  │
│  │  ─────────────────────────────                                            │  │
│  │                                                                           │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                                                                     │  │  │
│  │  │  Conditionally renders:                                             │  │  │
│  │  │                                                                     │  │  │
│  │  │  activeView === "grid" ? <GridView /> : <ListView />                │  │  │
│  │  │                                                                     │  │  │
│  │  └─────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                           │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │  QuickCaptureBar                                                          │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

---

## View Toggle Button (Already in HeaderBar)

The toggle UI was defined in Prompt #2. Here's a reminder of the specification:
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   View toggle (button group):                                │
│                                                              │
│   ┌───────────────────────────────┐                          │
│   │   ┌───────┐ ┌───────┐         │                          │
│   │   │  ⊞   │ │  ≡   │         │                          │
│   │   │ grid  │ │ list  │         │                          │
│   │   └───────┘ └───────┘         │                          │
│   └───────────────────────────────┘                          │
│                                                              │
│   - Container: border: 1px solid gray-200, rounded-lg        │
│   - Each button: 36px × 36px                                 │
│   - Active button: bg-gray-100, icon gray-900                │
│   - Inactive button: bg-white, icon gray-500                 │
│   - Hover (inactive): bg-gray-50                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘

---

## View State Management

### State Hook
```typescript
type ViewType = "grid" | "list";

interface UseViewSwitcherReturn {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  toggleView: () => void;
}

function useViewSwitcher(defaultView: ViewType = "grid"): UseViewSwitcherReturn {
  // Initialize from localStorage or default
  const [activeView, setActiveViewState] = useState<ViewType>(() => {
    if (typeof window === 'undefined') return defaultView;

    const stored = localStorage.getItem('memry-inbox-view');
    if (stored === 'grid' || stored === 'list') {
      return stored;
    }
    return defaultView;
  });

  // Persist to localStorage when changed
  const setActiveView = useCallback((view: ViewType) => {
    setActiveViewState(view);
    localStorage.setItem('memry-inbox-view', view);
  }, []);

  // Toggle between views
  const toggleView = useCallback(() => {
    setActiveView(activeView === 'grid' ? 'list' : 'grid');
  }, [activeView, setActiveView]);

  return { activeView, setActiveView, toggleView };
}
```

### Local Storage Key
Key: "memry-inbox-view"
Values: "grid" | "list"
Default: "grid" (for new users)

---

## ViewSwitcher Component

### Component Structure
```typescript
interface ViewSwitcherProps {
  // Data
  items: InboxItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;

  // View state (from parent via useViewSwitcher)
  activeView: ViewType;

  // Selection (shared between views)
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;

  // Group collapse (shared between views)
  collapsedGroups: Set<DateGroup>;
  onToggleGroup: (group: DateGroup) => void;

  // Filters
  searchQuery: string;
  activeFilters: FilterState;
  onClearFilters: () => void;

  // Item actions
  onItemClick: (id: string) => void;
  onItemMove: (id: string) => void;
  onItemTag: (id: string) => void;
  onItemDelete: (id: string) => void;
  onItemArchive: (id: string) => void;

  // Voice playback (shared)
  playingVoiceId: string | null;
  voiceCurrentTime: number;
  onVoicePlay: (id: string) => void;
  onVoicePause: (id: string) => void;
  onVoiceSeek: (id: string, time: number) => void;

  // URL actions
  onOpenExternal: (url: string) => void;
}
```

### Basic Implementation
```typescript
function ViewSwitcher({
  items,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  activeView,
  selectedIds,
  onSelectionChange,
  collapsedGroups,
  onToggleGroup,
  searchQuery,
  activeFilters,
  onClearFilters,
  onItemClick,
  onItemMove,
  onItemTag,
  onItemDelete,
  onItemArchive,
  playingVoiceId,
  voiceCurrentTime,
  onVoicePlay,
  onVoicePause,
  onVoiceSeek,
  onOpenExternal,
}: ViewSwitcherProps) {

  // Shared props for both views
  const viewProps = {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    onLoadMore,
    selectedIds,
    onSelectionChange,
    collapsedGroups,
    onToggleGroup,
    searchQuery,
    activeFilters,
    onClearFilters,
    onItemClick,
    onItemMove,
    onItemTag,
    onItemDelete,
    onItemArchive,
    playingVoiceId,
    voiceCurrentTime,
    onVoicePlay,
    onVoicePause,
    onVoiceSeek,
    onOpenExternal,
  };

  return (
    <div className="view-switcher">
      {activeView === 'grid' ? (
        <GridView {...viewProps} />
      ) : (
        <ListView {...viewProps} />
      )}
    </div>
  );
}
```

---

## Transition Animation

### Option A: Simple Fade (Recommended)
```css
.view-switcher {
  position: relative;
}

.view-container {
  animation: viewFadeIn 200ms ease-out;
}

@keyframes viewFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

### Option B: Crossfade with Both Views
```typescript
function ViewSwitcher({ activeView, ...props }: ViewSwitcherProps) {
  const [displayView, setDisplayView] = useState(activeView);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (activeView !== displayView) {
      setIsTransitioning(true);

      // Wait for fade out, then switch
      const timer = setTimeout(() => {
        setDisplayView(activeView);
        setIsTransitioning(false);
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [activeView, displayView]);

  return (
    <div className={`view-switcher ${isTransitioning ? 'transitioning' : ''}`}>
      {displayView === 'grid' ? (
        <GridView {...props} />
      ) : (
        <ListView {...props} />
      )}
    </div>
  );
}
```
```css
.view-switcher {
  transition: opacity 150ms ease;
}

.view-switcher.transitioning {
  opacity: 0;
}
```

### Option C: Slide Transition
```css
.view-switcher {
  overflow: hidden;
}

.view-container {
  transition: transform 250ms ease, opacity 250ms ease;
}

/* Grid entering from left */
.view-container.grid-enter {
  transform: translateX(-20px);
  opacity: 0;
}

.view-container.grid-enter-active {
  transform: translateX(0);
  opacity: 1;
}

/* List entering from right */
.view-container.list-enter {
  transform: translateX(20px);
  opacity: 0;
}

.view-container.list-enter-active {
  transform: translateX(0);
  opacity: 1;
}
```

**Recommendation:** Use Option A (Simple Fade) for initial implementation. It's clean, fast, and doesn't distract from content.

---

## Scroll Position Management

### Preserving Scroll Position

When switching views, users expect to roughly maintain their position in the content:
```typescript
function useScrollPreservation(activeView: ViewType, items: InboxItem[]) {
  const scrollPositions = useRef<{ grid: number; list: number }>({
    grid: 0,
    list: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Save scroll position before view change
  const saveScrollPosition = useCallback(() => {
    if (containerRef.current) {
      scrollPositions.current[activeView] = containerRef.current.scrollTop;
    }
  }, [activeView]);

  // Restore scroll position after view change
  const restoreScrollPosition = useCallback(() => {
    if (containerRef.current) {
      const savedPosition = scrollPositions.current[activeView];
      containerRef.current.scrollTop = savedPosition;
    }
  }, [activeView]);

  // Save position when switching away
  useEffect(() => {
    return () => {
      saveScrollPosition();
    };
  }, [activeView, saveScrollPosition]);

  // Restore position when switching to
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(restoreScrollPosition, 50);
    return () => clearTimeout(timer);
  }, [activeView, restoreScrollPosition]);

  return containerRef;
}
```

### Alternative: Scroll to Top

For a simpler approach, always scroll to top when switching views:
```typescript
useEffect(() => {
  if (containerRef.current) {
    containerRef.current.scrollTop = 0;
  }
}, [activeView]);
```

---

## Selection Preservation

Selection state is managed by the parent and shared between views:
```typescript
// In InboxPage (parent component)
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

// Selection persists across view switches automatically
// because both GridView and ListView receive the same selectedIds prop
```

### Behavior When Switching

| Scenario | Behavior |
|----------|----------|
| Items selected, switch view | Selection preserved, visible in new view |
| Multi-select in progress | Selection preserved |
| Preview panel open | Close preview panel, preserve selection |
| Voice playing | Continue playing (audio doesn't stop) |

---

## Keyboard Shortcut for View Toggle

### Global Shortcut
```typescript
// Add to global keyboard handler or in ViewSwitcher

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Don't trigger if user is typing
    if (e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Cmd/Ctrl + Shift + V to toggle view
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'v') {
      e.preventDefault();
      toggleView();
    }

    // Alternative: Just "v" when not typing
    if (e.key === 'v' && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
      e.preventDefault();
      toggleView();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [toggleView]);
```

### Keyboard Shortcuts Reference

| Shortcut | Action |
|----------|--------|
| `v` | Toggle between Grid and List view |
| `Cmd/Ctrl + Shift + V` | Toggle view (alternative) |

---

## Toggle Button Component Enhancement

### With Tooltip
```typescript
function ViewToggle({
  activeView,
  onViewChange
}: {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}) {
  return (
    <div
      className="view-toggle"
      role="tablist"
      aria-label="View options"
    >
      <button
        role="tab"
        aria-selected={activeView === 'grid'}
        aria-label="Grid view"
        title="Grid view (V)"
        className={`toggle-btn ${activeView === 'grid' ? 'active' : ''}`}
        onClick={() => onViewChange('grid')}
      >
        <GridIcon className="w-[18px] h-[18px]" />
      </button>

      <button
        role="tab"
        aria-selected={activeView === 'list'}
        aria-label="List view"
        title="List view (V)"
        className={`toggle-btn ${activeView === 'list' ? 'active' : ''}`}
        onClick={() => onViewChange('list')}
      >
        <ListIcon className="w-[18px] h-[18px]" />
      </button>
    </div>
  );
}
```

### Toggle Button Styles
```css
.view-toggle {
  display: flex;
  border: 1px solid rgb(229 231 235); /* gray-200 */
  border-radius: 8px;
  overflow: hidden;
}

.toggle-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: none;
  cursor: pointer;
  transition: background 150ms ease, color 150ms ease;
}

.toggle-btn:first-child {
  border-right: 1px solid rgb(229 231 235);
}

.toggle-btn svg {
  color: rgb(107 114 128); /* gray-500 */
}

.toggle-btn:hover:not(.active) {
  background: rgb(249 250 251); /* gray-50 */
}

.toggle-btn.active {
  background: rgb(243 244 246); /* gray-100 */
}

.toggle-btn.active svg {
  color: rgb(17 24 39); /* gray-900 */
}

.toggle-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px white, 0 0 0 4px rgb(59 130 246); /* blue-500 ring */
}
```

---

## Integration with InboxPage

### Complete Parent Component Setup
```typescript
function InboxPage() {
  // View state
  const { activeView, setActiveView, toggleView } = useViewSwitcher('grid');

  // Data fetching
  const {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refetch
  } = useInboxItems();

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Group collapse state
  const [collapsedGroups, setCollapsedGroups] = useState<Set<DateGroup>>(new Set());

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterState>({});

  // Voice playback state
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [voiceCurrentTime, setVoiceCurrentTime] = useState(0);

  // Preview panel state
  const [previewItemId, setPreviewItemId] = useState<string | null>(null);

  // Handlers
  const handleToggleGroup = useCallback((group: DateGroup) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  }, []);

  const handleSelectionChange = useCallback((ids: Set<string>) => {
    setSelectedIds(ids);
  }, []);

  const handleItemClick = useCallback((id: string) => {
    setPreviewItemId(id);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setActiveFilters({});
  }, []);

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    return filterItems(items, searchQuery, activeFilters);
  }, [items, searchQuery, activeFilters]);

  // Calculate counts for context bar
  const totalCount = filteredItems.length;
  const newTodayCount = filteredItems.filter(item => isToday(item.createdAt)).length;

  return (
    <div className="inbox-page">
      {/* Header Bar */}
      <HeaderBar
        onMenuClick={() => {/* open sidebar */}}
        onSearch={setSearchQuery}
        searchValue={searchQuery}
        onFilterClick={() => {/* open filter dropdown */}}
        hasActiveFilters={Object.keys(activeFilters).length > 0}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Context Bar */}
      <ContextBar
        totalCount={totalCount}
        newTodayCount={newTodayCount}
        isLoading={isLoading}
        selectedCount={selectedIds.size}
        onCancelSelection={() => setSelectedIds(new Set())}
        onSelectAll={() => {/* select all visible */}}
        onSelectNone={() => setSelectedIds(new Set())}
        onArchiveRead={() => {/* archive read items */}}
        onClearProcessed={() => {/* clear processed */}}
      />

      {/* Content Area with View Switcher */}
      <main className="content-area">
        <ViewSwitcher
          items={filteredItems}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          onLoadMore={loadMore}
          activeView={activeView}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          collapsedGroups={collapsedGroups}
          onToggleGroup={handleToggleGroup}
          searchQuery={searchQuery}
          activeFilters={activeFilters}
          onClearFilters={handleClearFilters}
          onItemClick={handleItemClick}
          onItemMove={(id) => {/* open move modal */}}
          onItemTag={(id) => {/* open tag editor */}}
          onItemDelete={(id) => {/* delete item */}}
          onItemArchive={(id) => {/* archive item */}}
          playingVoiceId={playingVoiceId}
          voiceCurrentTime={voiceCurrentTime}
          onVoicePlay={setPlayingVoiceId}
          onVoicePause={() => setPlayingVoiceId(null)}
          onVoiceSeek={(id, time) => setVoiceCurrentTime(time)}
          onOpenExternal={(url) => window.open(url, '_blank')}
        />
      </main>

      {/* Quick Capture Bar */}
      <QuickCaptureBar
        onNewClick={() => {/* open capture modal */}}
        onSubmit={(content, type) => {/* create new item */}}
        onVoiceSubmit={(blob, duration) => {/* create voice memo */}}
        onFilesAdded={(files) => {/* handle file uploads */}}
      />

      {/* Preview Panel (conditional) */}
      {previewItemId && (
        <PreviewPanel
          itemId={previewItemId}
          onClose={() => setPreviewItemId(null)}
        />
      )}
    </div>
  );
}
```

---

## View-Specific Behaviors

### Items Per Load

| View | Items per page/load |
|------|---------------------|
| Grid | 20 items (more visual, load less) |
| List | 50 items (compact, load more) |
```typescript
const itemsPerPage = activeView === 'grid' ? 20 : 50;
```

### Empty State Messaging

| View | Empty state tone |
|------|------------------|
| Grid | "Your inbox is ready for action" (visual, inviting) |
| List | "Your inbox is empty" (efficient, direct) |

---

## Accessibility

### ARIA Attributes
```html
<!-- View Toggle -->
<div role="tablist" aria-label="View options">
  <button
    role="tab"
    aria-selected="true"
    aria-label="Grid view"
    aria-controls="inbox-content"
  >
    Grid
  </button>
  <button
    role="tab"
    aria-selected="false"
    aria-label="List view"
    aria-controls="inbox-content"
  >
    List
  </button>
</div>

<!-- Content Area -->
<div
  id="inbox-content"
  role="tabpanel"
  aria-label="Inbox items in {activeView} view"
>
  ...
</div>
```

### Announcements

When view changes, announce to screen readers:
```typescript
function useViewAnnouncement(activeView: ViewType) {
  useEffect(() => {
    const message = activeView === 'grid'
      ? 'Switched to grid view'
      : 'Switched to list view';

    // Use aria-live region or announce utility
    announceToScreenReader(message);
  }, [activeView]);
}
```

---

## Verification Checklist

After building, verify:
☐ View toggle buttons show correct active state
☐ Clicking grid button switches to GridView
☐ Clicking list button switches to ListView
☐ View preference persists after page refresh (localStorage)
☐ New users default to Grid view
☐ Transition animation plays smoothly (no flash/jump)
☐ Selection state preserves when switching views
☐ Selected items visible in both views after switch
☐ Group collapse state preserves when switching views
☐ Scroll position handled appropriately (preserved or reset)
☐ Voice playback continues when switching views
☐ Keyboard shortcut (v) toggles view
☐ Screen reader announces view change
☐ Toggle buttons have proper ARIA attributes
☐ Focus states visible on toggle buttons
☐ Toggle works on mobile/touch devices

## Output

Create the following:

1. **useViewSwitcher hook** — Manages view state with localStorage persistence

2. **ViewSwitcher component** — Conditionally renders GridView or ListView with shared props

3. **ViewToggle component** — The toggle button UI (enhance existing HeaderBar toggle)

4. **Update InboxPage** — Integrate all pieces together

Use Tailwind CSS for styling. Ensure smooth transitions and proper state sharing between views.

Implementation Notes
Key Techniques Used:
TechniqueWhylocalStorage persistenceUser's view preference remembered across sessionsShared state propsSelection, collapse, playback work identically in both viewsSimple fade transitionClean, fast, doesn't distract from contentKeyboard shortcutPower users can switch quickly without mouseARIA tablist patternProper semantics for toggle between views
Design Choices:

Grid as default — New users see the more visual, browsable view first. List is for power users who discover it.
Single localStorage key — Simple persistence, easy to clear, no complex state management.
Selection preserved — Switching views shouldn't lose work. If user selected 5 items in grid, they're still selected in list.
Voice continues playing — Audio shouldn't interrupt just because visual layout changed.
Simple fade transition — Fancy transitions (slide, morph) can feel slow and distracting. Quick fade is professional.


Expected Output Structure
jsx// useViewSwitcher.ts
export function useViewSwitcher(defaultView: ViewType = 'grid') {
  const [activeView, setActiveView] = useState<ViewType>(() => {
    const stored = localStorage.getItem('memry-inbox-view');
    return (stored === 'grid' || stored === 'list') ? stored : defaultView;
  });

  const handleSetView = useCallback((view: ViewType) => {
    setActiveView(view);
    localStorage.setItem('memry-inbox-view', view);
  }, []);

  const toggleView = useCallback(() => {
    handleSetView(activeView === 'grid' ? 'list' : 'grid');
  }, [activeView, handleSetView]);

  return { activeView, setActiveView: handleSetView, toggleView };
}

// ViewSwitcher.tsx
export function ViewSwitcher({ activeView, ...props }: ViewSwitcherProps) {
  return (
    <div className="view-switcher animate-fade-in">
      {activeView === 'grid' ? (
        <GridView {...props} />
      ) : (
        <ListView {...props} />
      )}
    </div>
  );
}

// ViewToggle.tsx (for HeaderBar)
export function ViewToggle({ activeView, onViewChange }: ViewToggleProps) {
  return (
    <div className="view-toggle" role="tablist">
      <button
        role="tab"
        aria-selected={activeView === 'grid'}
        className={`toggle-btn ${activeView === 'grid' ? 'active' : ''}`}
        onClick={() => onViewChange('grid')}
      >
        <GridIcon />
      </button>
      <button
        role="tab"
        aria-selected={activeView === 'list'}
        className={`toggle-btn ${activeView === 'list' ? 'active' : ''}`}
        onClick={() => onViewChange('list')}
      >
        <ListIcon />
      </button>
    </div>
  );
}

Usage Guidelines

Test persistence — Change view, refresh page, verify same view loads
Test with selection — Select items in grid, switch to list, verify still selected
Test voice playback — Start voice memo in grid, switch to list, verify audio continues
Test keyboard — Press 'v' to toggle, verify it works when not in an input
Test transition — Switch views rapidly, verify no flickering or state loss
Test on mobile — Tap toggle buttons, verify touch targets are adequate