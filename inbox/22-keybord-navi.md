Prompt #22: Keyboard Navigation
The Prompt
You are building the Keyboard Navigation system for Memry's inbox. This system enables power users to navigate, select, and act on items entirely with the keyboard. Good keyboard support makes the app faster for experienced users and essential for accessibility.

## What You Are Building

A comprehensive keyboard navigation system that includes:
1. **Item navigation** — J/K or arrow keys to move between items
2. **Selection shortcuts** — Space to toggle, X for multi-select
3. **Action shortcuts** — Quick keys for common actions
4. **Focus management** — Proper focus states and focus trapping
5. **Visual indicators** — Clear focus rings and highlighted items
6. **Shortcut help** — Discoverable keyboard shortcut reference

---

## Navigation Model Overview
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                     │
│  NAVIGATION ZONES                                                                                   │
│  ────────────────                                                                                   │
│                                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  ZONE 1: Header Bar                                                              Tab order: 1 │  │
│  │  ─────────────────                                                                            │  │
│  │  Menu button → Search input → Filter button → View toggle                                     │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  ZONE 2: Context Bar                                                             Tab order: 2 │  │
│  │  ──────────────────                                                                           │  │
│  │  Process dropdown (if present)                                                                │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  ZONE 3: Content Area (Items)                                                    Tab order: 3 │  │
│  │  ─────────────────────────────                                                                │  │
│  │  J/K navigation within zone                                                                   │  │
│  │  This is the PRIMARY navigation zone                                                          │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  ZONE 4: Quick Capture Bar                                                       Tab order: 4 │  │
│  │  ───────────────────────                                                                      │  │
│  │  Text input → Voice button → Attach button → Link button                                      │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  ZONE 5: Overlays (when open)                                                    Tab order: 0 │  │
│  │  ───────────────────────────                                                  (Focus trapped) │  │
│  │  Preview panel, Dialogs, Dropdowns                                                            │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

---

## Global Keyboard Shortcuts

### Shortcut Reference
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  GLOBAL SHORTCUTS (work from anywhere)                                      │
│  ─────────────────────────────────────                                      │
│                                                                             │
│  Navigation                                                                 │
│  ──────────                                                                 │
│  /           Focus search input                                             │
│  ⌘K          Focus search input (alternative)                               │
│  G then I    Go to Inbox                                                    │
│  G then A    Go to Archive                                                  │
│  G then F    Go to Folders                                                  │
│  ?           Open keyboard shortcuts help                                   │
│                                                                             │
│  Quick Capture                                                              │
│  ─────────────                                                              │
│  C           Focus Quick Capture input                                      │
│  ⌘⇧V         Paste and capture from clipboard                               │
│                                                                             │
│  View                                                                       │
│  ────                                                                       │
│  V then G    Switch to Grid view                                            │
│  V then L    Switch to List view                                            │
│  ⌘\          Toggle sidebar (if present)                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Implementation
```typescript
interface GlobalShortcut {
  key: string;
  modifiers?: ('ctrl' | 'meta' | 'shift' | 'alt')[];
  sequence?: string[];  // For multi-key shortcuts like "G I"
  action: string;
  description: string;
  scope: 'global' | 'items' | 'preview' | 'dialog';
}

const GLOBAL_SHORTCUTS: GlobalShortcut[] = [
  // Search
  { key: '/', action: 'focusSearch', description: 'Focus search', scope: 'global' },
  { key: 'k', modifiers: ['meta'], action: 'focusSearch', description: 'Focus search', scope: 'global' },

  // Navigation sequences
  { sequence: ['g', 'i'], action: 'goToInbox', description: 'Go to Inbox', scope: 'global' },
  { sequence: ['g', 'a'], action: 'goToArchive', description: 'Go to Archive', scope: 'global' },
  { sequence: ['g', 'f'], action: 'goToFolders', description: 'Go to Folders', scope: 'global' },

  // Quick capture
  { key: 'c', action: 'focusCapture', description: 'Quick capture', scope: 'global' },

  // View switching
  { sequence: ['v', 'g'], action: 'switchToGrid', description: 'Grid view', scope: 'global' },
  { sequence: ['v', 'l'], action: 'switchToList', description: 'List view', scope: 'global' },

  // Help
  { key: '?', action: 'showShortcuts', description: 'Keyboard shortcuts', scope: 'global' },
];
```

---

## Item Navigation (J/K)

### Navigation Keys
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ITEM NAVIGATION (when focused in content area)                             │
│  ──────────────────────────────────────────────                             │
│                                                                             │
│  Movement                                                                   │
│  ────────                                                                   │
│  J / ↓        Move to next item                                             │
│  K / ↑        Move to previous item                                         │
│  H / ←        Previous page (if paginated) / Collapse                       │
│  L / →        Next page (if paginated) / Expand                             │
│  Home         Jump to first item                                            │
│  End          Jump to last item                                             │
│  Page Up      Jump up by 10 items                                           │
│  Page Down    Jump down by 10 items                                         │
│                                                                             │
│  Selection                                                                  │
│  ─────────                                                                  │
│  Space        Toggle selection of focused item                              │
│  X            Toggle selection (alternative)                                │
│  ⇧↓ / ⇧J      Extend selection down                                         │
│  ⇧↑ / ⇧K      Extend selection up                                           │
│  ⌘A           Select all visible items                                      │
│  Escape       Clear selection / Close overlay                               │
│                                                                             │
│  Actions                                                                    │
│  ───────                                                                    │
│  Enter        Open item in preview panel                                    │
│  O            Open item in preview panel (alternative)                      │
│  ⇧Enter       Open item in full screen                                      │
│  M            Move item(s) to folder                                        │
│  T            Tag item(s)                                                   │
│  E            Archive item(s)                                               │
│  #            Delete item(s)                                                │
│  Delete       Delete item(s)                                                │
│  U            Mark as unread                                                │
│  S            Star/favorite item (if feature exists)                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Visual Focus Indicator
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  GRID VIEW - Focused Item                                                   │
│  ────────────────────────                                                   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ ┌───────────────────────────────────────────────────────────────┐   │    │
│  │ │                                                               │   │    │
│  │ │                                                               │   │    │
│  │ │                                                               │   │    │
│  │ │                    FOCUSED CARD                               │   │    │
│  │ │                                                               │   │    │
│  │ │                                                               │   │    │
│  │ │                                                               │   │    │
│  │ │                                                               │   │    │
│  │ └───────────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│   ▲                                                                         │
│   │                                                                         │
│   Focus ring: 2px solid blue-500, offset 2px                                │
│   Box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2)                             │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  LIST VIEW - Focused Item                                                   │
│  ────────────────────────                                                   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                     │    │
│  │  Regular row                                                        │    │
│  │                                                                     │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │ ┃                                                                   │    │
│  │ ┃  FOCUSED ROW                                           ← actions │    │
│  │ ┃                                                                   │    │
│  ├─┸───────────────────────────────────────────────────────────────────┤    │
│  │                                                                     │    │
│  │  Regular row                                                        │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│   ▲                                                                         │
│   │                                                                         │
│   Left border: 3px solid blue-500                                           │
│   Background: blue-50                                                       │
│   Show action buttons (same as hover)                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Focus States CSS
```css
/* Grid view card focus */
.inbox-card:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px white,
    0 0 0 4px rgb(59 130 246),  /* blue-500 */
    0 0 0 8px rgba(59, 130, 246, 0.2);
}

/* List view row focus */
.inbox-row:focus-visible {
  outline: none;
  background-color: rgb(239 246 255);  /* blue-50 */
  box-shadow: inset 3px 0 0 rgb(59 130 246);  /* blue-500 left border */
}

/* Show actions on focus (same as hover) */
.inbox-row:focus-visible .row-actions {
  opacity: 1;
}

/* Remove default outline when using custom focus styles */
*:focus {
  outline: none;
}

/* Only show focus ring for keyboard navigation */
*:focus:not(:focus-visible) {
  box-shadow: none;
}
```

---

## Navigation State Management

### Focus Hook
```typescript
interface UseItemNavigationOptions {
  items: InboxItem[];
  onSelect: (ids: Set<string>) => void;
  onOpen: (id: string) => void;
  onAction: (action: string, ids: string[]) => void;
  isEnabled: boolean;  // Disable when dialog/overlay is open
}

interface ItemNavigationState {
  focusedIndex: number;
  focusedId: string | null;
  selectedIds: Set<string>;
  lastSelectedIndex: number | null;  // For shift+select
}

function useItemNavigation(options: UseItemNavigationOptions) {
  const { items, onSelect, onOpen, onAction, isEnabled } = options;

  const [state, setState] = useState<ItemNavigationState>({
    focusedIndex: -1,
    focusedId: null,
    selectedIds: new Set(),
    lastSelectedIndex: null,
  });

  // Refs for DOM elements
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Focus an item by index
  const focusItem = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
    const item = items[clampedIndex];

    if (!item) return;

    setState(prev => ({
      ...prev,
      focusedIndex: clampedIndex,
      focusedId: item.id,
    }));

    // Scroll into view
    const element = itemRefs.current.get(item.id);
    element?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    element?.focus();
  }, [items]);

  // Toggle selection
  const toggleSelection = useCallback((index: number, extend = false) => {
    const item = items[index];
    if (!item) return;

    setState(prev => {
      const newSelected = new Set(prev.selectedIds);

      if (extend && prev.lastSelectedIndex !== null) {
        // Shift+select: select range
        const start = Math.min(prev.lastSelectedIndex, index);
        const end = Math.max(prev.lastSelectedIndex, index);

        for (let i = start; i <= end; i++) {
          newSelected.add(items[i].id);
        }
      } else {
        // Toggle single item
        if (newSelected.has(item.id)) {
          newSelected.delete(item.id);
        } else {
          newSelected.add(item.id);
        }
      }

      onSelect(newSelected);

      return {
        ...prev,
        selectedIds: newSelected,
        lastSelectedIndex: index,
      };
    });
  }, [items, onSelect]);

  // Select all
  const selectAll = useCallback(() => {
    const allIds = new Set(items.map(i => i.id));
    setState(prev => ({ ...prev, selectedIds: allIds }));
    onSelect(allIds);
  }, [items, onSelect]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedIds: new Set() }));
    onSelect(new Set());
  }, [onSelect]);

  // Keyboard handler
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if in input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const { focusedIndex, selectedIds } = state;

      switch (e.key) {
        // Navigation
        case 'j':
        case 'ArrowDown':
          e.preventDefault();
          if (e.shiftKey) {
            toggleSelection(focusedIndex + 1, true);
          }
          focusItem(focusedIndex + 1);
          break;

        case 'k':
        case 'ArrowUp':
          e.preventDefault();
          if (e.shiftKey) {
            toggleSelection(focusedIndex - 1, true);
          }
          focusItem(focusedIndex - 1);
          break;

        case 'Home':
          e.preventDefault();
          focusItem(0);
          break;

        case 'End':
          e.preventDefault();
          focusItem(items.length - 1);
          break;

        case 'PageDown':
          e.preventDefault();
          focusItem(focusedIndex + 10);
          break;

        case 'PageUp':
          e.preventDefault();
          focusItem(focusedIndex - 10);
          break;

        // Selection
        case ' ':
        case 'x':
          e.preventDefault();
          toggleSelection(focusedIndex);
          break;

        case 'a':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            selectAll();
          }
          break;

        case 'Escape':
          e.preventDefault();
          clearSelection();
          break;

        // Actions
        case 'Enter':
        case 'o':
          e.preventDefault();
          if (state.focusedId) {
            onOpen(state.focusedId);
          }
          break;

        case 'm':
          e.preventDefault();
          onAction('move', getActionTargets());
          break;

        case 't':
          e.preventDefault();
          onAction('tag', getActionTargets());
          break;

        case 'e':
          e.preventDefault();
          onAction('archive', getActionTargets());
          break;

        case '#':
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          onAction('delete', getActionTargets());
          break;

        case 'u':
          e.preventDefault();
          onAction('markUnread', getActionTargets());
          break;
      }
    };

    // Get items to act on (selected or focused)
    const getActionTargets = (): string[] => {
      if (state.selectedIds.size > 0) {
        return Array.from(state.selectedIds);
      }
      return state.focusedId ? [state.focusedId] : [];
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isEnabled, state, items, focusItem, toggleSelection, selectAll, clearSelection, onOpen, onAction]);

  // Register item ref
  const registerItem = useCallback((id: string, element: HTMLElement | null) => {
    if (element) {
      itemRefs.current.set(id, element);
    } else {
      itemRefs.current.delete(id);
    }
  }, []);

  return {
    focusedIndex: state.focusedIndex,
    focusedId: state.focusedId,
    selectedIds: state.selectedIds,
    focusItem,
    toggleSelection,
    selectAll,
    clearSelection,
    registerItem,
    containerRef,
  };
}
```

---

## Preview Panel Navigation

### When Preview Panel is Open
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  PREVIEW PANEL SHORTCUTS                                                    │
│  ───────────────────────                                                    │
│                                                                             │
│  Navigation                                                                 │
│  ──────────                                                                 │
│  J / ↓        Next item (preview updates)                                   │
│  K / ↑        Previous item (preview updates)                               │
│  Escape       Close preview panel                                           │
│  ← (Arrow)    Close preview panel (when not in input)                       │
│                                                                             │
│  View                                                                       │
│  ────                                                                       │
│  F            Toggle fullscreen                                             │
│  Z            Zoom in (for images)                                          │
│  ⇧Z           Zoom out (for images)                                         │
│  0            Reset zoom                                                    │
│                                                                             │
│  Actions                                                                    │
│  ───────                                                                    │
│  M            Move to folder                                                │
│  T            Tag                                                           │
│  E            Archive                                                       │
│  #            Delete                                                        │
│  ⌘Enter       Primary action (Open link, Save note, etc.)                   │
│                                                                             │
│  Media (Voice/Video)                                                        │
│  ──────────────────                                                         │
│  Space        Play/Pause                                                    │
│  ← / →        Seek backward/forward 5 seconds                               │
│  ⇧← / ⇧→      Seek backward/forward 15 seconds                              │
│  [ / ]        Decrease/increase playback speed                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Preview Navigation Hook
```typescript
function usePreviewNavigation(
  isOpen: boolean,
  currentIndex: number,
  totalItems: number,
  onNavigate: (direction: 'prev' | 'next') => void,
  onClose: () => void,
  onAction: (action: string) => void
) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        // Only handle Escape in inputs
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
        return;
      }

      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex < totalItems - 1) {
            onNavigate('next');
          }
          break;

        case 'k':
        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex > 0) {
            onNavigate('prev');
          }
          break;

        case 'Escape':
        case 'ArrowLeft':
          e.preventDefault();
          onClose();
          break;

        case 'f':
          e.preventDefault();
          onAction('toggleFullscreen');
          break;

        case 'm':
          e.preventDefault();
          onAction('move');
          break;

        case 't':
          e.preventDefault();
          onAction('tag');
          break;

        case 'e':
          e.preventDefault();
          onAction('archive');
          break;

        case '#':
        case 'Delete':
          e.preventDefault();
          onAction('delete');
          break;

        case 'Enter':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            onAction('primaryAction');
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, totalItems, onNavigate, onClose, onAction]);
}
```

---

## Multi-Key Sequences

### Sequence Detection
```typescript
interface KeySequence {
  keys: string[];
  action: string;
  timeout: number;  // ms to wait for next key
}

const KEY_SEQUENCES: KeySequence[] = [
  { keys: ['g', 'i'], action: 'goToInbox', timeout: 1000 },
  { keys: ['g', 'a'], action: 'goToArchive', timeout: 1000 },
  { keys: ['g', 'f'], action: 'goToFolders', timeout: 1000 },
  { keys: ['v', 'g'], action: 'switchToGrid', timeout: 1000 },
  { keys: ['v', 'l'], action: 'switchToList', timeout: 1000 },
];

function useKeySequences(onAction: (action: string) => void) {
  const [sequence, setSequence] = useState<string[]>([]);
  const timeoutRef = useRef<number>();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Ignore modified keys (except shift for ?)
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      const key = e.key.toLowerCase();
      const newSequence = [...sequence, key];

      // Check if sequence matches any action
      for (const seq of KEY_SEQUENCES) {
        // Exact match
        if (
          seq.keys.length === newSequence.length &&
          seq.keys.every((k, i) => k === newSequence[i])
        ) {
          e.preventDefault();
          onAction(seq.action);
          setSequence([]);
          clearTimeout(timeoutRef.current);
          return;
        }

        // Partial match (sequence in progress)
        if (
          seq.keys.length > newSequence.length &&
          seq.keys.slice(0, newSequence.length).every((k, i) => k === newSequence[i])
        ) {
          setSequence(newSequence);
          clearTimeout(timeoutRef.current);
          timeoutRef.current = window.setTimeout(() => {
            setSequence([]);
          }, seq.timeout);
          return;
        }
      }

      // No match, reset sequence
      setSequence([]);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeoutRef.current);
    };
  }, [sequence, onAction]);

  return sequence;  // Can display pending sequence in UI
}
```

### Sequence Indicator (Optional UI)
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  When user presses first key of sequence, show indicator:                   │
│                                                                             │
│                                                           ┌──────────────┐  │
│                                                           │              │  │
│                                                           │   g → ?      │  │
│                                                           │              │  │
│                                                           └──────────────┘  │
│                                                                             │
│  Position: Fixed, bottom-right corner                                       │
│  Background: gray-900                                                       │
│  Color: white                                                               │
│  Padding: 8px 12px                                                          │
│  Border-radius: 6px                                                         │
│  Font-family: monospace                                                     │
│  Font-size: 14px                                                            │
│                                                                             │
│  Shows pressed keys and placeholder for next                                │
│  Auto-hides after timeout                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

---

## Keyboard Shortcuts Help Dialog

### Help Modal
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                     │
│                                                                                                     │
│         ┌───────────────────────────────────────────────────────────────────────────────────┐       │
│         │                                                                                   │       │
│         │  Keyboard Shortcuts                                                          ✕    │       │
│         │  ──────────────────                                                               │       │
│         │                                                                                   │       │
│         │  ┌─────────────────────────────────┐  ┌─────────────────────────────────┐         │       │
│         │  │                                 │  │                                 │         │       │
│         │  │  NAVIGATION                     │  │  ACTIONS                        │         │       │
│         │  │  ──────────                     │  │  ───────                        │         │       │
│         │  │                                 │  │                                 │         │       │
│         │  │  j / ↓    Next item             │  │  Enter    Open preview          │         │       │
│         │  │  k / ↑    Previous item         │  │  m        Move to folder        │         │       │
│         │  │  /        Search                │  │  t        Add/remove tags       │         │       │
│         │  │  g i      Go to Inbox           │  │  e        Archive               │         │       │
│         │  │  g a      Go to Archive         │  │  #        Delete                │         │       │
│         │  │  ?        This help             │  │  u        Mark unread           │         │       │
│         │  │                                 │  │                                 │         │       │
│         │  └─────────────────────────────────┘  └─────────────────────────────────┘         │       │
│         │                                                                                   │       │
│         │  ┌─────────────────────────────────┐  ┌─────────────────────────────────┐         │       │
│         │  │                                 │  │                                 │         │       │
│         │  │  SELECTION                      │  │  PREVIEW PANEL                  │         │       │
│         │  │  ─────────                      │  │  ─────────────                  │         │       │
│         │  │                                 │  │                                 │         │       │
│         │  │  x        Toggle select         │  │  j / k    Navigate items        │         │       │
│         │  │  ⌘A       Select all            │  │  f        Toggle fullscreen     │         │       │
│         │  │  Esc      Clear selection       │  │  Esc      Close panel           │         │       │
│         │  │  ⇧↓/↑     Extend selection      │  │  ⌘Enter   Primary action        │         │       │
│         │  │                                 │  │                                 │         │       │
│         │  └─────────────────────────────────┘  └─────────────────────────────────┘         │       │
│         │                                                                                   │       │
│         │  ┌─────────────────────────────────┐  ┌─────────────────────────────────┐         │       │
│         │  │                                 │  │                                 │         │       │
│         │  │  VIEW                           │  │  MEDIA                          │         │       │
│         │  │  ────                           │  │  ─────                          │         │       │
│         │  │                                 │  │                                 │         │       │
│         │  │  v g      Grid view             │  │  Space    Play/Pause            │         │       │
│         │  │  v l      List view             │  │  ← / →    Seek 5 seconds        │         │       │
│         │  │  c        Quick capture         │  │  [ / ]    Playback speed        │         │       │
│         │  │                                 │  │                                 │         │       │
│         │  └─────────────────────────────────┘  └─────────────────────────────────┘         │       │
│         │                                                                                   │       │
│         └───────────────────────────────────────────────────────────────────────────────────┘       │
│                                                                                                     │
│                                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘

### Help Dialog Component
```typescript
interface ShortcutCategory {
  title: string;
  shortcuts: {
    keys: string;
    description: string;
  }[];
}

const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: 'j / ↓', description: 'Next item' },
      { keys: 'k / ↑', description: 'Previous item' },
      { keys: '/', description: 'Search' },
      { keys: 'g i', description: 'Go to Inbox' },
      { keys: 'g a', description: 'Go to Archive' },
      { keys: '?', description: 'This help' },
    ],
  },
  {
    title: 'Actions',
    shortcuts: [
      { keys: 'Enter', description: 'Open preview' },
      { keys: 'm', description: 'Move to folder' },
      { keys: 't', description: 'Add/remove tags' },
      { keys: 'e', description: 'Archive' },
      { keys: '#', description: 'Delete' },
      { keys: 'u', description: 'Mark unread' },
    ],
  },
  {
    title: 'Selection',
    shortcuts: [
      { keys: 'x', description: 'Toggle select' },
      { keys: '⌘A', description: 'Select all' },
      { keys: 'Esc', description: 'Clear selection' },
      { keys: '⇧↓/↑', description: 'Extend selection' },
    ],
  },
  {
    title: 'Preview Panel',
    shortcuts: [
      { keys: 'j / k', description: 'Navigate items' },
      { keys: 'f', description: 'Toggle fullscreen' },
      { keys: 'Esc', description: 'Close panel' },
      { keys: '⌘Enter', description: 'Primary action' },
    ],
  },
  {
    title: 'View',
    shortcuts: [
      { keys: 'v g', description: 'Grid view' },
      { keys: 'v l', description: 'List view' },
      { keys: 'c', description: 'Quick capture' },
    ],
  },
  {
    title: 'Media',
    shortcuts: [
      { keys: 'Space', description: 'Play/Pause' },
      { keys: '← / →', description: 'Seek 5 seconds' },
      { keys: '[ / ]', description: 'Playback speed' },
    ],
  },
];

function KeyboardShortcutsDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === '?') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="shortcuts-backdrop" onClick={onClose}>
      <div className="shortcuts-dialog" onClick={e => e.stopPropagation()}>
        <header>
          <h2>Keyboard Shortcuts</h2>
          <button onClick={onClose}><XIcon /></button>
        </header>

        <div className="shortcuts-grid">
          {SHORTCUT_CATEGORIES.map(category => (
            <div key={category.title} className="shortcut-category">
              <h3>{category.title}</h3>
              <ul>
                {category.shortcuts.map(shortcut => (
                  <li key={shortcut.keys}>
                    <kbd>{shortcut.keys}</kbd>
                    <span>{shortcut.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Help Dialog Styling
```css
.shortcuts-dialog {
  width: 720px;
  max-width: calc(100vw - 48px);
  max-height: calc(100vh - 96px);
  background: white;
  border-radius: 16px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.shortcuts-dialog header {
  padding: 20px 24px;
  border-bottom: 1px solid rgb(229 231 235);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.shortcuts-dialog h2 {
  font-size: 18px;
  font-weight: 600;
  color: rgb(17 24 39);
}

.shortcuts-grid {
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

.shortcut-category h3 {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgb(107 114 128);
  margin-bottom: 12px;
}

.shortcut-category ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.shortcut-category li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgb(243 244 246);
}

.shortcut-category li:last-child {
  border-bottom: none;
}

.shortcut-category kbd {
  font-family: ui-monospace, monospace;
  font-size: 12px;
  font-weight: 500;
  color: rgb(55 65 81);
  background: rgb(243 244 246);
  padding: 4px 8px;
  border-radius: 4px;
  min-width: 60px;
}

.shortcut-category span {
  font-size: 14px;
  color: rgb(75 85 99);
}
```

---

## Focus Trapping for Dialogs

### Focus Trap Hook
```typescript
function useFocusTrap(
  containerRef: RefObject<HTMLElement>,
  isActive: boolean,
  options?: {
    initialFocus?: RefObject<HTMLElement>;
    returnFocus?: boolean;
  }
) {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Get focusable elements
    const getFocusableElements = () => {
      return containerRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) ?? [];
    };

    // Focus initial element
    const focusableElements = getFocusableElements();
    if (options?.initialFocus?.current) {
      options.initialFocus.current.focus();
    } else if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Handle Tab key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: go to previous
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: go to next
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Return focus to previous element
      if (options?.returnFocus !== false && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, containerRef, options]);
}
```

---

## Skip Links

### Skip to Main Content
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Skip links (visible only on focus):                                        │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  [ Skip to main content ]   [ Skip to search ]   [ Skip to capture ]  │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Position: Fixed at top of page                                             │
│  Default state: Positioned off-screen (top: -100px)                         │
│  Focus state: Slides into view (top: 8px)                                   │
│  Z-index: 100 (above everything)                                            │
│                                                                             │
│  Links:                                                                     │
│  - "Skip to main content" → #main-content (items area)                      │
│  - "Skip to search" → #search-input                                         │
│  - "Skip to capture" → #quick-capture-input                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

### Skip Links Component
```tsx
function SkipLinks() {
  return (
    <div className="skip-links">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <a href="#search-input" className="skip-link">
        Skip to search
      </a>
      <a href="#quick-capture-input" className="skip-link">
        Skip to capture
      </a>
    </div>
  );
}
```
```css
.skip-links {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  gap: 8px;
  padding: 8px;
}

.skip-link {
  position: absolute;
  top: -100px;
  padding: 12px 16px;
  background: rgb(17 24 39);
  color: white;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  text-decoration: none;
  transition: top 150ms ease;
}

.skip-link:focus {
  top: 8px;
  outline: none;
  box-shadow: 0 0 0 2px white, 0 0 0 4px rgb(59 130 246);
}
```

---

## ARIA Live Announcements

### Screen Reader Announcements
```typescript
function useAnnouncer() {
  const [announcement, setAnnouncement] = useState('');

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Clear first to ensure re-announcement of same message
    setAnnouncement('');

    requestAnimationFrame(() => {
      setAnnouncement(message);
    });
  }, []);

  return { announcement, announce };
}

// Announcer component (invisible but read by screen readers)
function ScreenReaderAnnouncer({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
```

### Announcement Examples
```typescript
// Navigation announcements
announce(`Item ${focusedIndex + 1} of ${totalItems}. ${item.title}`);

// Selection announcements
announce(`${selectedCount} items selected`);

// Action announcements
announce(`${count} items moved to ${folderName}`);
announce(`${count} items archived`);
announce(`${count} items deleted`);

// View change announcements
announce('Switched to grid view');
announce('Switched to list view');

// Panel announcements
announce(`Preview panel opened. ${item.title}`);
announce('Preview panel closed');
```

---

## Props Interface
```typescript
interface KeyboardNavigationProviderProps {
  children: React.ReactNode;

  // Feature flags
  enableGlobalShortcuts?: boolean;
  enableItemNavigation?: boolean;
  enableSequences?: boolean;

  // Callbacks
  onNavigate?: (destination: string) => void;
  onAction?: (action: string, targetIds?: string[]) => void;
  onViewChange?: (view: 'grid' | 'list') => void;
}

interface UseItemNavigationResult {
  focusedIndex: number;
  focusedId: string | null;
  selectedIds: Set<string>;
  focusItem: (index: number) => void;
  toggleSelection: (index: number, extend?: boolean) => void;
  selectAll: () => void;
  clearSelection: () => void;
  registerItem: (id: string, element: HTMLElement | null) => void;
  containerRef: RefObject<HTMLDivElement>;
}
```

---

## Responsive Considerations

### Touch Devices
```typescript
function useIsKeyboardUser() {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return isKeyboardUser;
}

// Only show focus indicators for keyboard users
// CSS: .keyboard-user .item:focus-visible { /* focus styles */ }
```

### Mobile

- Hide keyboard shortcuts help button
- Disable global shortcuts on touch devices
- Focus management still works for accessibility

---

## Verification Checklist

After building, verify:

### Global Shortcuts
☐ `/` focuses search input
☐ `⌘K` focuses search input
☐ `c` focuses Quick Capture input
☐ `?` opens keyboard shortcuts help
☐ `g i` goes to Inbox
☐ `g a` goes to Archive
☐ `v g` switches to Grid view
☐ `v l` switches to List view
☐ Sequence indicator shows pending keys

### Item Navigation
☐ `j` / `↓` moves to next item
☐ `k` / `↑` moves to previous item
☐ `Home` jumps to first item
☐ `End` jumps to last item
☐ `Page Down` jumps 10 items down
☐ `Page Up` jumps 10 items up
☐ Focused item scrolls into view
☐ Focus ring is visible (2px blue)

### Selection
☐ `Space` / `x` toggles selection
☐ `⇧↓` extends selection down
☐ `⇧↑` extends selection up
☐ `⌘A` selects all items
☐ `Escape` clears selection
☐ Selected items show checkbox state

### Actions
☐ `Enter` / `o` opens preview
☐ `m` opens Move dialog
☐ `t` opens Tag dialog
☐ `e` archives item(s)
☐ `#` / `Delete` deletes item(s)
☐ Actions work on focused or selected items

### Preview Panel
☐ `j` / `k` navigates between items
☐ `Escape` closes panel
☐ `f` toggles fullscreen
☐ `⌘Enter` triggers primary action
☐ Media controls work (Space, arrows)

### Focus Management
☐ Tab order is logical (Header → Content → Capture)
☐ Focus trap works in dialogs
☐ Focus returns to trigger when dialog closes
☐ Skip links work

### Accessibility
☐ Screen reader announcements work
☐ Focus indicators only show for keyboard users
☐ All shortcuts work without mouse
☐ Shortcuts don't fire when typing in inputs

## Output

Create a keyboard navigation system with:

1. **KeyboardNavigationProvider** — Context provider for keyboard state
2. **useItemNavigation** — Hook for item focus and selection
3. **useKeySequences** — Hook for multi-key shortcuts
4. **useFocusTrap** — Hook for modal focus management
5. **KeyboardShortcutsDialog** — Help modal showing all shortcuts
6. **ScreenReaderAnnouncer** — Invisible announcer component
7. **SkipLinks** — Skip navigation links

Use Tailwind CSS for styling focus states. The system should:
1. Enable full keyboard navigation throughout the app
2. Support multi-key sequences (g i, v l, etc.)
3. Manage focus properly in modals
4. Announce changes to screen readers
5. Show discoverable shortcuts help
6. Work alongside mouse/touch input

Implementation Notes
Key Principles:
PrincipleApplicationVim-style navigationJ/K for up/down (familiar to power users)Multi-key sequencesG I for "go to inbox" (efficient)Context-awareShortcuts change based on focus zoneDiscoverable? shows all shortcutsAccessibleScreen reader announcements, skip links
Design Choices:

J/K navigation — Standard in many productivity apps (Gmail, GitHub). Power users expect it.
Multi-key sequences — Allows many shortcuts without modifier keys. g i is faster than Ctrl+Shift+I.
Scope-based shortcuts — Same key can do different things in different contexts (e.g., Space in items vs. in media player).
Focus ring only on keyboard — Uses :focus-visible to avoid focus rings on click.
Announce everything — Screen reader users need to know what happened after keyboard actions.