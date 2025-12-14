/**
 * Type Renderer Dispatcher
 *
 * A component that takes an inbox item and renders the appropriate
 * type-specific preview component.
 */
import { cn } from '@/lib/utils'
import type { InboxItem } from '@/data/inbox-types'
import {
  isLinkItem,
  isNoteItem,
  isImageItem,
  isVoiceItem,
  isPdfItem,
  isWebclipItem,
  isFileItem,
  isVideoItem,
} from '@/data/inbox-types'

import { LinkPreview } from './link-preview'
import { NotePreview } from './note-preview'
import { ImagePreview } from './image-preview'
import { VoicePreview } from './voice-preview'
import { PdfPreview } from './pdf-preview'
import { WebclipPreview } from './webclip-preview'
import { FilePreview } from './file-preview'
import { VideoPreview } from './video-preview'

// =============================================================================
// TYPES
// =============================================================================

export interface TypeRendererProps {
  /** The inbox item to render a preview for */
  item: InboxItem
  /** Additional CSS classes */
  className?: string
  /** Callback when user wants to preview (for images/videos/PDFs) */
  onPreviewClick?: () => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function TypeRenderer({
  item,
  className,
  onPreviewClick,
}: TypeRendererProps): React.JSX.Element {
  // Dispatch to the appropriate renderer based on item type
  const renderPreview = (): React.JSX.Element => {
    if (isLinkItem(item)) {
      return <LinkPreview item={item} className={className} />
    }

    if (isNoteItem(item)) {
      return <NotePreview item={item} className={className} />
    }

    if (isImageItem(item)) {
      return (
        <ImagePreview
          item={item}
          className={className}
          onPreviewClick={onPreviewClick}
        />
      )
    }

    if (isVoiceItem(item)) {
      return <VoicePreview item={item} className={className} />
    }

    if (isPdfItem(item)) {
      return (
        <PdfPreview
          item={item}
          className={className}
          onPreviewClick={onPreviewClick}
        />
      )
    }

    if (isWebclipItem(item)) {
      return <WebclipPreview item={item} className={className} />
    }

    if (isFileItem(item)) {
      return <FilePreview item={item} className={className} />
    }

    if (isVideoItem(item)) {
      return (
        <VideoPreview
          item={item}
          className={className}
          onPreviewClick={onPreviewClick}
        />
      )
    }

    // Fallback for unknown types
    return (
      <div className={cn('text-sm text-muted-foreground/60', className)}>
        Unknown item type
      </div>
    )
  }

  return renderPreview()
}

// =============================================================================
// LOADING/ERROR STATES
// =============================================================================

interface TypeRendererSkeletonProps {
  type: InboxItem['type'] // Used for determining skeleton layout
  className?: string
}

/**
 * Skeleton loader for type renderers
 */
export function TypeRendererSkeleton({
  type,
  className,
}: TypeRendererSkeletonProps): React.JSX.Element {
  const skeletonClass = 'animate-pulse bg-muted rounded'

  switch (type) {
    case 'link':
    case 'pdf':
      // Side-by-side layout
      return (
        <div className={cn('flex gap-3', className)}>
          <div className={cn(skeletonClass, 'h-14 w-20')} />
          <div className="flex-1 space-y-2">
            <div className={cn(skeletonClass, 'h-3 w-full')} />
            <div className={cn(skeletonClass, 'h-3 w-3/4')} />
          </div>
        </div>
      )

    case 'note':
    case 'webclip':
      // Text block
      return (
        <div className={cn('space-y-2', className)}>
          <div className={cn(skeletonClass, 'h-3 w-full')} />
          <div className={cn(skeletonClass, 'h-3 w-5/6')} />
          <div className={cn(skeletonClass, 'h-3 w-2/3')} />
        </div>
      )

    case 'image':
    case 'video':
      // Centered thumbnail
      return (
        <div className={cn('flex justify-center', className)}>
          <div className={cn(skeletonClass, 'h-32 w-48')} />
        </div>
      )

    case 'voice':
      // Waveform-like bars
      return (
        <div className={cn('space-y-3', className)}>
          <div className="flex items-center gap-3">
            <div className={cn(skeletonClass, 'h-8 w-8 rounded-full')} />
            <div className="flex flex-1 items-center gap-0.5">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(skeletonClass, 'w-1')}
                  style={{ height: `${20 + Math.random() * 60}%` }}
                />
              ))}
            </div>
            <div className={cn(skeletonClass, 'h-4 w-10')} />
          </div>
        </div>
      )

    case 'file':
      // Icon + text
      return (
        <div className={cn('flex items-center gap-4', className)}>
          <div className={cn(skeletonClass, 'h-12 w-12')} />
          <div className="flex-1 space-y-2">
            <div className={cn(skeletonClass, 'h-4 w-2/3')} />
            <div className={cn(skeletonClass, 'h-3 w-1/3')} />
          </div>
        </div>
      )

    default:
      return <div className={cn(skeletonClass, 'h-16 w-full', className)} />
  }
}

interface TypeRendererErrorProps {
  type: InboxItem['type']
  message?: string
  className?: string
}

/**
 * Error state for type renderers
 */
export function TypeRendererError({
  type: _type, // Reserved for type-specific error styling
  message = 'Failed to load preview',
  className,
}: TypeRendererErrorProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-md bg-destructive/10 p-4',
        className
      )}
    >
      <p className="text-sm text-destructive/80">
        {message}
      </p>
    </div>
  )
}
