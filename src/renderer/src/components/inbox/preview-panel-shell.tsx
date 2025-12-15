/**
 * Preview Panel Shell
 *
 * A slide-over panel for previewing inbox items.
 * Features:
 * - Slide-in animation from right
 * - Header with navigation and controls
 * - Scrollable content area
 * - Fixed action bar at bottom
 * - Keyboard navigation (J/K, Escape, F)
 * - Fullscreen mode
 */

import { useEffect, type ReactNode } from 'react'
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  MoreVertical,
  X,
  FolderInput,
  Tag,
  Archive,
  Trash2,
  ExternalLink,
  Copy,
  FileText,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { InboxItem } from '@/data/inbox-types'

// ============================================================================
// TYPES
// ============================================================================

export interface PreviewPanelShellProps {
  /** Whether the panel is open */
  isOpen: boolean
  /** Whether fullscreen mode is active */
  isFullscreen: boolean
  /** Whether content is loading */
  isLoading?: boolean
  /** Whether there's an error */
  hasError?: boolean
  /** Error message to display */
  errorMessage?: string
  /** The item being previewed */
  item: InboxItem | null
  /** Current item index (1-based) */
  currentIndex?: number
  /** Total number of items */
  totalItems?: number
  /** Whether can navigate to previous item */
  canNavigatePrev: boolean
  /** Whether can navigate to next item */
  canNavigateNext: boolean
  /** Navigate to previous item */
  onNavigatePrev: () => void
  /** Navigate to next item */
  onNavigateNext: () => void
  /** Close the panel */
  onClose: () => void
  /** Toggle fullscreen mode */
  onToggleFullscreen: () => void
  /** Retry loading on error */
  onRetry?: () => void
  /** Primary action config */
  primaryAction?: {
    label: string
    icon: ReactNode
    onClick: () => void
    disabled?: boolean
  }
  /** Move/file action */
  onMove: () => void
  /** Tag action */
  onTag: () => void
  /** Archive action */
  onArchive: () => void
  /** Delete action */
  onDelete: () => void
  /** Copy link action (for URLs) */
  onCopyLink?: () => void
  /** Open original action */
  onOpenOriginal?: () => void
  /** Content to render */
  children: ReactNode
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getSubtitle(item: InboxItem): string {
  switch (item.type) {
    case 'link':
      return item.domain
    case 'note':
      return `${item.wordCount} words`
    case 'image':
      return `${item.dimensions.width}×${item.dimensions.height} · ${item.fileSize}`
    case 'voice':
      return `${Math.floor(item.duration / 60)}:${String(Math.floor(item.duration % 60)).padStart(2, '0')}`
    case 'pdf':
      return `${item.pageCount} pages · ${item.fileSize}`
    case 'webclip':
      return item.domain
    case 'file':
      return `${item.extension.toUpperCase()} · ${item.fileSize}`
    case 'video':
      return `${Math.floor(item.duration / 60)}:${String(Math.floor(item.duration % 60)).padStart(2, '0')}`
    default:
      return ''
  }
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function PreviewSkeleton(): React.JSX.Element {
  return (
    <div className="animate-pulse space-y-6 p-6">
      {/* Hero skeleton */}
      <div className="h-48 rounded-xl bg-gradient-to-br from-muted/60 to-muted/30" />

      {/* Content skeletons */}
      <div className="space-y-4">
        <div className="h-4 w-3/4 rounded-lg bg-muted/50" />
        <div className="h-4 w-1/2 rounded-lg bg-muted/40" />
        <div className="h-4 w-5/6 rounded-lg bg-muted/30" />
      </div>

      {/* Tags skeleton */}
      <div className="flex gap-2">
        <div className="h-7 w-16 rounded-full bg-muted/40" />
        <div className="h-7 w-20 rounded-full bg-muted/40" />
        <div className="h-7 w-14 rounded-full bg-muted/40" />
      </div>

      {/* Notes skeleton */}
      <div className="space-y-3">
        <div className="h-3 w-20 rounded bg-muted/50" />
        <div className="h-24 rounded-lg bg-muted/30" />
      </div>
    </div>
  )
}

// ============================================================================
// ERROR STATE
// ============================================================================

interface PreviewErrorProps {
  message?: string
  onRetry?: () => void
}

function PreviewError({ message, onRetry }: PreviewErrorProps): React.JSX.Element {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-100/80 dark:bg-amber-900/30">
        <AlertTriangle className="size-8 text-amber-600 dark:text-amber-400" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          Unable to load preview
        </h3>
        <p className="max-w-xs text-sm text-muted-foreground">
          {message || 'Something went wrong while loading this item. Please try again.'}
        </p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="size-4" />
          Try again
        </Button>
      )}
    </div>
  )
}

// ============================================================================
// HEADER COMPONENT
// ============================================================================

interface PreviewHeaderProps {
  item: InboxItem
  currentIndex?: number
  totalItems?: number
  isFullscreen: boolean
  canNavigatePrev: boolean
  canNavigateNext: boolean
  onClose: () => void
  onNavigatePrev: () => void
  onNavigateNext: () => void
  onToggleFullscreen: () => void
  onCopyLink?: () => void
  onOpenOriginal?: () => void
}

function PreviewHeader({
  item,
  currentIndex,
  totalItems,
  isFullscreen,
  canNavigatePrev,
  canNavigateNext,
  onClose,
  onNavigatePrev,
  onNavigateNext,
  onToggleFullscreen,
  onCopyLink,
  onOpenOriginal,
}: PreviewHeaderProps): React.JSX.Element {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border/50 bg-background/80 px-4 backdrop-blur-sm">
      {/* Back Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">Close preview (Esc)</p>
        </TooltipContent>
      </Tooltip>

      {/* Title Area */}
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-semibold text-foreground">
          {item.title}
        </h2>
        <p className="truncate text-xs text-muted-foreground">
          {getSubtitle(item)}
        </p>
      </div>

      {/* Navigation Buttons */}
      {totalItems && totalItems > 1 && (
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNavigatePrev}
                disabled={!canNavigatePrev}
                className="size-8"
              >
                <ChevronUp className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">Previous (K)</p>
            </TooltipContent>
          </Tooltip>

          <span className="min-w-[4rem] text-center text-xs tabular-nums text-muted-foreground">
            {currentIndex} of {totalItems}
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNavigateNext}
                disabled={!canNavigateNext}
                className="size-8"
              >
                <ChevronDown className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">Next (J)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFullscreen}
              className="size-8 text-muted-foreground hover:text-foreground"
            >
              {isFullscreen ? (
                <Minimize2 className="size-4" />
              ) : (
                <Maximize2 className="size-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">{isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}</p>
          </TooltipContent>
        </Tooltip>

        {/* More Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {onCopyLink && (
              <DropdownMenuItem onClick={onCopyLink}>
                <Copy className="mr-2 size-4" />
                Copy link
              </DropdownMenuItem>
            )}
            {onOpenOriginal && (
              <DropdownMenuItem onClick={onOpenOriginal}>
                <ExternalLink className="mr-2 size-4" />
                Open original
              </DropdownMenuItem>
            )}
            {(onCopyLink || onOpenOriginal) && <DropdownMenuSeparator />}
            <DropdownMenuItem>
              <FileText className="mr-2 size-4" />
              View details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="size-8 text-muted-foreground hover:bg-red-500/10 hover:text-red-600"
            >
              <X className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Close (Esc)</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}

// ============================================================================
// ACTION BAR COMPONENT
// ============================================================================

interface PreviewActionBarProps {
  primaryAction?: {
    label: string
    icon: ReactNode
    onClick: () => void
    disabled?: boolean
  }
  onMove: () => void
  onTag: () => void
  onArchive: () => void
  onDelete: () => void
}

function PreviewActionBar({
  primaryAction,
  onMove,
  onTag,
  onArchive,
  onDelete,
}: PreviewActionBarProps): React.JSX.Element {
  return (
    <footer className="flex h-16 shrink-0 items-center justify-between gap-3 border-t border-border/50 bg-background/80 px-4 backdrop-blur-sm">
      {/* Primary Action */}
      {primaryAction && (
        <Button
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled}
          className="gap-2 bg-foreground text-background hover:bg-foreground/90"
        >
          {primaryAction.icon}
          {primaryAction.label}
        </Button>
      )}

      {/* Secondary Actions */}
      <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/30 p-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onMove}
              className="h-8 gap-1.5 px-3 text-muted-foreground hover:text-foreground"
            >
              <FolderInput className="size-4" />
              <span className="hidden sm:inline">Move</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">Move to folder (M)</p>
          </TooltipContent>
        </Tooltip>

        <div className="h-5 w-px bg-border/50" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onTag}
              className="h-8 gap-1.5 px-3 text-muted-foreground hover:text-foreground"
            >
              <Tag className="size-4" />
              <span className="hidden sm:inline">Tag</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">Add tags (T)</p>
          </TooltipContent>
        </Tooltip>

        <div className="h-5 w-px bg-border/50" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onArchive}
              className="h-8 gap-1.5 px-3 text-muted-foreground hover:text-foreground"
            >
              <Archive className="size-4" />
              <span className="hidden sm:inline">Archive</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">Archive (E)</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Delete Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="size-10 text-muted-foreground hover:bg-red-500/10 hover:text-red-600"
          >
            <Trash2 className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">Delete (Del)</p>
        </TooltipContent>
      </Tooltip>
    </footer>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PreviewPanelShell({
  isOpen,
  isFullscreen,
  isLoading = false,
  hasError = false,
  errorMessage,
  item,
  currentIndex,
  totalItems,
  canNavigatePrev,
  canNavigateNext,
  onNavigatePrev,
  onNavigateNext,
  onClose,
  onToggleFullscreen,
  onRetry,
  primaryAction,
  onMove,
  onTag,
  onArchive,
  onDelete,
  onCopyLink,
  onOpenOriginal,
  children,
}: PreviewPanelShellProps): React.JSX.Element {
  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        // Exception: Escape should still close
        if (e.key === 'Escape') {
          e.preventDefault()
          onClose()
        }
        return
      }

      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          onClose()
          break

        case 'j':
        case 'ArrowDown':
          if (canNavigateNext) {
            e.preventDefault()
            onNavigateNext()
          }
          break

        case 'k':
        case 'ArrowUp':
          if (canNavigatePrev) {
            e.preventDefault()
            onNavigatePrev()
          }
          break

        case 'f':
          e.preventDefault()
          onToggleFullscreen()
          break

        case 'm':
          e.preventDefault()
          onMove()
          break

        case 't':
          e.preventDefault()
          onTag()
          break

        case 'e':
          e.preventDefault()
          onArchive()
          break

        case 'Delete':
        case 'Backspace':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault()
            onDelete()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    isOpen,
    canNavigateNext,
    canNavigatePrev,
    onClose,
    onNavigateNext,
    onNavigatePrev,
    onToggleFullscreen,
    onMove,
    onTag,
    onArchive,
    onDelete,
  ])

  if (!item) return <></>

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className={cn(
          'flex flex-col p-0',
          'border-l border-border/30',
          'bg-gradient-to-b from-background via-background to-muted/5',
          // Width variations
          isFullscreen
            ? 'w-full max-w-full sm:max-w-full'
            : 'w-full sm:max-w-[50vw] sm:min-w-[400px] lg:max-w-[720px]',
          // Animation
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
          'data-[state=closed]:duration-200 data-[state=open]:duration-300'
        )}
      >
        {/* Header */}
        <PreviewHeader
          item={item}
          currentIndex={currentIndex}
          totalItems={totalItems}
          isFullscreen={isFullscreen}
          canNavigatePrev={canNavigatePrev}
          canNavigateNext={canNavigateNext}
          onClose={onClose}
          onNavigatePrev={onNavigatePrev}
          onNavigateNext={onNavigateNext}
          onToggleFullscreen={onToggleFullscreen}
          onCopyLink={onCopyLink}
          onOpenOriginal={onOpenOriginal}
        />

        {/* Content Area */}
        <ScrollArea className="flex-1">
          <div
            className={cn(
              'min-h-full',
              isFullscreen && 'mx-auto max-w-3xl'
            )}
          >
            {isLoading ? (
              <PreviewSkeleton />
            ) : hasError ? (
              <PreviewError message={errorMessage} onRetry={onRetry} />
            ) : (
              children
            )}
          </div>
        </ScrollArea>

        {/* Action Bar */}
        <PreviewActionBar
          primaryAction={primaryAction}
          onMove={onMove}
          onTag={onTag}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      </SheetContent>
    </Sheet>
  )
}
