/**
 * Preview States Components
 *
 * Helper components for preview panel states:
 * - PreviewSkeleton: Loading skeleton animation
 * - PreviewError: Error state with retry option
 * - PreviewEmpty: Empty state when no item selected
 */

import { AlertCircle, RefreshCw, FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ============================================================================
// SKELETON COMPONENT
// ============================================================================

export interface PreviewSkeletonProps {
  /** Optional class name */
  className?: string
}

export function PreviewSkeleton({ className }: PreviewSkeletonProps): React.JSX.Element {
  return (
    <div className={cn('space-y-6 p-6', className)}>
      {/* Hero area skeleton */}
      <div className="h-48 animate-pulse rounded-xl bg-gradient-to-br from-muted/60 to-muted/30" />

      {/* Action buttons skeleton */}
      <div className="flex gap-3">
        <div className="h-10 flex-1 animate-pulse rounded-md bg-muted/50" />
        <div className="h-10 w-28 animate-pulse rounded-md bg-muted/40" />
      </div>

      {/* Info section skeleton */}
      <div className="space-y-3">
        <div className="h-3 w-16 animate-pulse rounded bg-muted/40" />
        <div className="h-20 animate-pulse rounded-lg bg-muted/30" />
      </div>

      {/* Tags skeleton */}
      <div className="space-y-2">
        <div className="h-3 w-12 animate-pulse rounded bg-muted/40" />
        <div className="flex gap-2">
          <div className="h-6 w-16 animate-pulse rounded-full bg-muted/40" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-muted/40" />
          <div className="h-6 w-14 animate-pulse rounded-full bg-muted/40" />
        </div>
      </div>

      {/* Notes skeleton */}
      <div className="space-y-2">
        <div className="h-3 w-20 animate-pulse rounded bg-muted/40" />
        <div className="h-24 animate-pulse rounded-lg bg-muted/30" />
      </div>

      {/* Metadata skeleton */}
      <div className="animate-pulse rounded-lg border border-border/30 bg-muted/20 p-4">
        <div className="mb-3 h-3 w-16 rounded bg-muted/40" />
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="size-3.5 rounded bg-muted/40" />
            <div className="h-3 w-10 rounded bg-muted/40" />
            <div className="h-3 w-32 rounded bg-muted/30" />
          </div>
          <div className="flex items-center gap-3">
            <div className="size-3.5 rounded bg-muted/40" />
            <div className="h-3 w-12 rounded bg-muted/40" />
            <div className="h-3 w-24 rounded bg-muted/30" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// ERROR COMPONENT
// ============================================================================

export interface PreviewErrorProps {
  /** Error message to display */
  message?: string
  /** Callback to retry loading */
  onRetry?: () => void
  /** Optional class name */
  className?: string
}

export function PreviewError({
  message = 'Failed to load preview',
  onRetry,
  className,
}: PreviewErrorProps): React.JSX.Element {
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-center', className)}>
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="size-8 text-destructive" />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-foreground">
        Something went wrong
      </h3>

      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {message}
      </p>

      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCw className="size-4" />
          Try Again
        </Button>
      )}
    </div>
  )
}

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

export interface PreviewEmptyProps {
  /** Optional class name */
  className?: string
}

export function PreviewEmpty({ className }: PreviewEmptyProps): React.JSX.Element {
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-center', className)}>
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted/50">
        <FileQuestion className="size-8 text-muted-foreground" />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-foreground">
        No item selected
      </h3>

      <p className="max-w-sm text-sm text-muted-foreground">
        Click on an item to see its preview here
      </p>
    </div>
  )
}

// ============================================================================
// LOADING OVERLAY COMPONENT
// ============================================================================

export interface PreviewLoadingOverlayProps {
  /** Whether to show the overlay */
  isVisible: boolean
  /** Optional class name */
  className?: string
}

export function PreviewLoadingOverlay({
  isVisible,
  className,
}: PreviewLoadingOverlayProps): React.JSX.Element | null {
  if (!isVisible) return null

  return (
    <div
      className={cn(
        'absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm',
        className
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="relative size-10">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
