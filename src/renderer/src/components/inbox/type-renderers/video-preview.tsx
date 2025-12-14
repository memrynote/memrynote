/**
 * Video Preview Component
 *
 * Thumbnail preview for video files/links showing:
 * - Video thumbnail with play icon overlay
 * - Duration badge in corner
 * - Source indicator (YouTube, Vimeo, Local)
 */
import { cn } from '@/lib/utils'
import { Play, Video, Youtube } from 'lucide-react'
import type { VideoItem, VideoSource } from '@/data/inbox-types'
import { formatDuration } from '@/lib/inbox-utils'

// =============================================================================
// TYPES
// =============================================================================

export interface VideoPreviewProps {
  item: VideoItem
  className?: string
  onPreviewClick?: () => void
}

// =============================================================================
// SOURCE HELPERS
// =============================================================================

interface SourceInfo {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  color: string
}

function getSourceInfo(videoSource: VideoSource): SourceInfo {
  switch (videoSource) {
    case 'youtube':
      return {
        label: 'YouTube',
        icon: Youtube,
        color: 'text-red-600',
      }
    case 'vimeo':
      return {
        label: 'Vimeo',
        color: 'text-cyan-600',
      }
    case 'local':
      return {
        label: 'Local',
        color: 'text-stone-600',
      }
    case 'loom':
      return {
        label: 'Loom',
        color: 'text-purple-600',
      }
    default:
      return {
        label: 'Video',
        color: 'text-pink-600',
      }
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

export function VideoPreview({
  item,
  className,
  onPreviewClick,
}: VideoPreviewProps): React.JSX.Element {
  const hasThumbnail = item.thumbnailUrl && item.thumbnailUrl.trim() !== ''
  const sourceInfo = getSourceInfo(item.videoSource)
  const SourceIcon = sourceInfo.icon

  return (
    <div className={cn('', className)}>
      {/* Video thumbnail container */}
      <div
        className={cn(
          'group/video relative inline-block overflow-hidden rounded-lg bg-pink-50',
          'dark:bg-pink-950/30',
          onPreviewClick && 'cursor-pointer'
        )}
        onClick={onPreviewClick}
      >
        {hasThumbnail ? (
          <img
            src={item.thumbnailUrl ?? undefined}
            alt={item.title}
            className="max-h-36 w-auto object-contain transition-transform duration-300 group-hover/video:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-28 w-48 items-center justify-center">
            <Video className="h-10 w-10 text-pink-400" />
          </div>
        )}

        {/* Play button overlay */}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            'bg-black/0 transition-all duration-200',
            'group-hover/video:bg-black/30'
          )}
        >
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full',
              'bg-white/90 shadow-lg',
              'transition-transform duration-200',
              'group-hover/video:scale-110'
            )}
          >
            <Play className="h-5 w-5 translate-x-0.5 text-pink-600" />
          </div>
        </div>

        {/* Duration badge */}
        <div
          className={cn(
            'absolute bottom-2 right-2 rounded px-1.5 py-0.5',
            'bg-black/70 text-xs font-medium tabular-nums text-white'
          )}
        >
          {formatDuration(item.duration)}
        </div>

        {/* Source badge */}
        <div
          className={cn(
            'absolute left-2 top-2 flex items-center gap-1 rounded px-1.5 py-0.5',
            'bg-white/90 text-xs font-medium shadow-sm',
            sourceInfo.color
          )}
        >
          {SourceIcon && <SourceIcon className="h-3 w-3" />}
          <span>{sourceInfo.label}</span>
        </div>
      </div>
    </div>
  )
}
