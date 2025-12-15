/**
 * useInboxKeyboard Hook
 *
 * Comprehensive keyboard navigation and shortcuts for the inbox page.
 * Handles navigation, selection, actions, and view controls.
 */

import { useEffect, useCallback, useRef } from 'react'
import type { InboxItem, InboxViewMode } from '@/data/inbox-types'

// =============================================================================
// CONSTANTS
// =============================================================================

export const isMac =
  typeof navigator !== 'undefined' &&
  navigator.platform.toUpperCase().indexOf('MAC') >= 0

export const modifierKey = isMac ? '⌘' : 'Ctrl'
export const altKey = isMac ? '⌥' : 'Alt'

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Check if an input element is currently focused
 */
function isInputFocused(): boolean {
  const activeElement = document.activeElement
  const tagName = activeElement?.tagName.toLowerCase()

  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    (activeElement as HTMLElement)?.isContentEditable === true
  )
}

/**
 * Cycle through view modes
 */
function getNextViewMode(current: InboxViewMode): InboxViewMode {
  const modes: InboxViewMode[] = ['compact', 'medium', 'expanded']
  const currentIndex = modes.indexOf(current)
  return modes[(currentIndex + 1) % modes.length]
}

// =============================================================================
// TYPES
// =============================================================================

export interface UseInboxKeyboardProps {
  /** All visible items (filtered) */
  items: InboxItem[]
  /** Currently focused item ID */
  focusedItemId: string | null
  /** Set of selected item IDs */
  selectedIds: Set<string>
  /** Current view mode */
  viewMode: InboxViewMode
  /** Whether search input is open/focused */
  isSearchFocused: boolean
  /** Whether any panel/modal is open */
  isPanelOpen: boolean

  // Callbacks
  onFocusChange: (id: string | null) => void
  onSelectionChange: (ids: Set<string>) => void
  onToggleSelection: (id: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onViewModeChange: (mode: InboxViewMode) => void
  onOpenPreview: (id: string) => void
  onOpenFiling: (ids: string[]) => void
  onOpenTagging: (ids: string[]) => void
  onOpenSnooze: (ids: string[]) => void
  onDelete: (ids: string[]) => void
  onOpenOriginal: (id: string) => void
  onSearchFocus: () => void
  onRefresh: () => void
  onShowHelp: () => void
  onClosePanel: () => void

  /** Whether keyboard shortcuts are enabled */
  enabled?: boolean
}

export interface InboxShortcutCategory {
  title: string
  shortcuts: InboxShortcutDefinition[]
}

export interface InboxShortcutDefinition {
  keys: string[]
  label: string
  description?: string
}

// =============================================================================
// SHORTCUT DEFINITIONS
// =============================================================================

export function getInboxShortcuts(): InboxShortcutCategory[] {
  return [
    {
      title: 'Navigation',
      shortcuts: [
        { keys: ['↑', 'K'], label: 'Previous item' },
        { keys: ['↓', 'J'], label: 'Next item' },
        { keys: ['Home'], label: 'First item' },
        { keys: ['End'], label: 'Last item' },
        { keys: ['Enter', 'Space'], label: 'Open preview' },
      ],
    },
    {
      title: 'Selection',
      shortcuts: [
        { keys: ['X'], label: 'Toggle selection' },
        { keys: ['Shift+Click'], label: 'Select range' },
        { keys: [`${modifierKey}+A`], label: 'Select all' },
        { keys: [`${modifierKey}+Shift+A`], label: 'Deselect all' },
        { keys: ['Escape'], label: 'Clear selection' },
      ],
    },
    {
      title: 'Actions',
      shortcuts: [
        { keys: ['F'], label: 'File item(s)' },
        { keys: ['T'], label: 'Add tags' },
        { keys: ['S'], label: 'Snooze item(s)' },
        { keys: ['Delete', '⌫'], label: 'Delete item(s)' },
        { keys: ['O'], label: 'Open original' },
      ],
    },
    {
      title: 'View',
      shortcuts: [
        { keys: ['V'], label: 'Cycle view mode' },
        { keys: ['R'], label: 'Refresh inbox' },
        { keys: ['/'], label: 'Focus search' },
        { keys: ['?'], label: 'Show shortcuts' },
      ],
    },
  ]
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useInboxKeyboard({
  items,
  focusedItemId,
  selectedIds,
  viewMode,
  isSearchFocused,
  isPanelOpen,
  onFocusChange,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
  onViewModeChange,
  onOpenPreview,
  onOpenFiling,
  onOpenTagging,
  onOpenSnooze,
  onDelete,
  onOpenOriginal,
  onSearchFocus,
  onRefresh,
  onShowHelp,
  onClosePanel,
  enabled = true,
}: UseInboxKeyboardProps): void {
  // Track items for navigation calculations
  const itemsRef = useRef(items)
  itemsRef.current = items

  // Get target items (selected or focused)
  const getTargetIds = useCallback((): string[] => {
    if (selectedIds.size > 0) {
      return Array.from(selectedIds)
    }
    if (focusedItemId) {
      return [focusedItemId]
    }
    return []
  }, [selectedIds, focusedItemId])

  // Get current focused index
  const getFocusedIndex = useCallback((): number => {
    if (!focusedItemId) return -1
    return itemsRef.current.findIndex((item) => item.id === focusedItemId)
  }, [focusedItemId])

  // Navigate to item at index
  const navigateToIndex = useCallback(
    (index: number) => {
      const items = itemsRef.current
      if (items.length === 0) return

      // Clamp index to valid range
      const clampedIndex = Math.max(0, Math.min(index, items.length - 1))
      const targetItem = items[clampedIndex]
      if (targetItem) {
        onFocusChange(targetItem.id)
      }
    },
    [onFocusChange]
  )

  // Main keyboard handler
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if input is focused (unless it's Escape)
      if (isInputFocused() && e.key !== 'Escape') return

      // Skip if search is focused (allow Escape)
      if (isSearchFocused && e.key !== 'Escape') return

      const isMacPlatform = isMac
      const modKey = isMacPlatform ? e.metaKey : e.ctrlKey
      const key = e.key.toLowerCase()

      // Panel open: only handle Escape
      if (isPanelOpen) {
        if (e.key === 'Escape') {
          e.preventDefault()
          onClosePanel()
        }
        return
      }

      // =======================================================================
      // NAVIGATION
      // =======================================================================

      // Up arrow or K - previous item
      if (e.key === 'ArrowUp' || (key === 'k' && !modKey)) {
        e.preventDefault()
        const currentIndex = getFocusedIndex()
        if (currentIndex > 0) {
          navigateToIndex(currentIndex - 1)
        } else if (currentIndex === -1 && items.length > 0) {
          // Focus last item if nothing focused
          navigateToIndex(items.length - 1)
        }
        return
      }

      // Down arrow or J - next item
      if (e.key === 'ArrowDown' || (key === 'j' && !modKey)) {
        e.preventDefault()
        const currentIndex = getFocusedIndex()
        if (currentIndex < items.length - 1) {
          navigateToIndex(currentIndex + 1)
        } else if (currentIndex === -1 && items.length > 0) {
          // Focus first item if nothing focused
          navigateToIndex(0)
        }
        return
      }

      // Home - first item
      if (e.key === 'Home' && !modKey) {
        e.preventDefault()
        navigateToIndex(0)
        return
      }

      // End - last item
      if (e.key === 'End' && !modKey) {
        e.preventDefault()
        navigateToIndex(items.length - 1)
        return
      }

      // Enter or Space - open preview
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (focusedItemId) {
          onOpenPreview(focusedItemId)
        }
        return
      }

      // =======================================================================
      // SELECTION
      // =======================================================================

      // X - toggle selection
      if (key === 'x' && !modKey && !e.shiftKey) {
        e.preventDefault()
        if (focusedItemId) {
          onToggleSelection(focusedItemId)
        }
        return
      }

      // Cmd/Ctrl + A - select all
      if (key === 'a' && modKey && !e.shiftKey) {
        e.preventDefault()
        onSelectAll()
        return
      }

      // Cmd/Ctrl + Shift + A - deselect all
      if (key === 'a' && modKey && e.shiftKey) {
        e.preventDefault()
        onDeselectAll()
        return
      }

      // Escape - clear selection or close panel
      if (e.key === 'Escape') {
        e.preventDefault()
        if (selectedIds.size > 0) {
          onDeselectAll()
        } else {
          onClosePanel()
        }
        return
      }

      // =======================================================================
      // ACTIONS
      // =======================================================================

      // F - file items
      if (key === 'f' && !modKey) {
        e.preventDefault()
        const targetIds = getTargetIds()
        if (targetIds.length > 0) {
          onOpenFiling(targetIds)
        }
        return
      }

      // T - tag items
      if (key === 't' && !modKey) {
        e.preventDefault()
        const targetIds = getTargetIds()
        if (targetIds.length > 0) {
          onOpenTagging(targetIds)
        }
        return
      }

      // S - snooze items
      if (key === 's' && !modKey) {
        e.preventDefault()
        const targetIds = getTargetIds()
        if (targetIds.length > 0) {
          onOpenSnooze(targetIds)
        }
        return
      }

      // Delete or Backspace - delete items
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        const targetIds = getTargetIds()
        if (targetIds.length > 0) {
          onDelete(targetIds)
        }
        return
      }

      // O - open original
      if (key === 'o' && !modKey) {
        e.preventDefault()
        if (focusedItemId) {
          onOpenOriginal(focusedItemId)
        }
        return
      }

      // =======================================================================
      // VIEW & UTILITY
      // =======================================================================

      // V - cycle view mode
      if (key === 'v' && !modKey) {
        e.preventDefault()
        onViewModeChange(getNextViewMode(viewMode))
        return
      }

      // R - refresh
      if (key === 'r' && !modKey) {
        e.preventDefault()
        onRefresh()
        return
      }

      // / - focus search
      if (e.key === '/' && !modKey) {
        e.preventDefault()
        onSearchFocus()
        return
      }

      // ? - show help
      if (e.key === '?' || (key === '/' && e.shiftKey)) {
        e.preventDefault()
        onShowHelp()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    enabled,
    items,
    focusedItemId,
    selectedIds,
    viewMode,
    isSearchFocused,
    isPanelOpen,
    getFocusedIndex,
    navigateToIndex,
    getTargetIds,
    onFocusChange,
    onToggleSelection,
    onSelectAll,
    onDeselectAll,
    onViewModeChange,
    onOpenPreview,
    onOpenFiling,
    onOpenTagging,
    onOpenSnooze,
    onDelete,
    onOpenOriginal,
    onSearchFocus,
    onRefresh,
    onShowHelp,
    onClosePanel,
  ])
}

// =============================================================================
// SCREEN READER ANNOUNCER
// =============================================================================

export interface SRAnnouncement {
  message: string
  priority?: 'polite' | 'assertive'
}

/**
 * Hook to manage screen reader announcements
 */
export function useSRAnnouncer() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.getElementById('sr-announcer')
    if (announcer) {
      announcer.setAttribute('aria-live', priority)
      announcer.textContent = message
      // Clear after announcement
      setTimeout(() => {
        announcer.textContent = ''
      }, 1000)
    }
  }, [])

  return { announce }
}
