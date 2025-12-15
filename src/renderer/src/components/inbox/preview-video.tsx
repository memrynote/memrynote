/**
 * Video Preview Component
 *
 * Displays video items with:
 * - Thumbnail with play button overlay
 * - Video player (embedded for YouTube/Vimeo, native otherwise)
 * - Duration and source info
 * - Open in player button
 * - Tags and metadata
 */

import { useState, useCallback } from 'react'
import {
  Play,
  ExternalLink,
  Calendar,
  Zap,
  Plus,
  X,
  Check,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { VideoItem, VideoSource } from '@/data/inbox-types'

// ============================================================================
// TYPES
// ============================================================================

export interface VideoPreviewProps {
  /** The video item to preview */
  item: VideoItem
  /** Callback to open video in external player */
  onOpenExternal?: () => void
  /** Available tags */
  availableTags?: string[]
  /** Add tag callback */
  onAddTag?: (tag: string) => void
  /** Remove tag callback */
  onRemoveTag?: (tag: string) => void
}

// ============================================================================
// VIDEO SOURCE INFO
// ============================================================================

function getVideoSourceInfo(source: VideoSource): { label: string; color: string; bg: string } {
  switch (source) {
    case 'youtube':
      return { label: 'YouTube', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/50' }
    case 'vimeo':
      return { label: 'Vimeo', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-100 dark:bg-sky-900/50' }
    case 'loom':
      return { label: 'Loom', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/50' }
    case 'local':
      return { label: 'Local File', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' }
    default:
      return { label: 'Video', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' }
  }
}

// ============================================================================
// VIDEO THUMBNAIL
// ============================================================================

interface VideoThumbnailProps {
  thumbnailUrl: string | null
  title: string
  duration: number
  videoSource: VideoSource
  onPlay: () => void
}

function VideoThumbnail({ thumbnailUrl, title, duration, videoSource, onPlay }: VideoThumbnailProps): React.JSX.Element {
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const sourceInfo = getVideoSourceInfo(videoSource)

  return (
    <div className="group relative cursor-pointer overflow-hidden rounded-xl" onClick={onPlay}>
      {thumbnailUrl ? (
        <div className="relative aspect-video">
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
          <div className={cn('flex size-16 items-center justify-center rounded-2xl', sourceInfo.bg)}>
            <Play className={cn('size-8', sourceInfo.color)} />
          </div>
        </div>
      )}

      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-black/70">
          <Play className="size-7 text-white ml-1" fill="white" />
        </div>
      </div>

      {/* Duration badge */}
      <div className="absolute bottom-3 right-3 rounded-md bg-black/80 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
        {formatDuration(duration)}
      </div>

      {/* Source badge */}
      <div className={cn(
        'absolute left-3 top-3 rounded-md px-2 py-1 text-xs font-medium backdrop-blur-sm',
        sourceInfo.bg, sourceInfo.color
      )}>
        {sourceInfo.label}
      </div>
    </div>
  )
}

// ============================================================================
// EMBEDDED VIDEO PLAYER
// ============================================================================

interface EmbeddedPlayerProps {
  videoUrl: string
  videoSource: VideoSource
}

function EmbeddedPlayer({ videoUrl, videoSource }: EmbeddedPlayerProps): React.JSX.Element | null {
  const getEmbedUrl = () => {
    if (videoSource === 'youtube') {
      // Extract video ID from YouTube URL
      const match = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
      if (match) {
        return `https://www.youtube.com/embed/${match[1]}?autoplay=1`
      }
    }
    if (videoSource === 'vimeo') {
      // Extract video ID from Vimeo URL
      const match = videoUrl.match(/vimeo\.com\/(\d+)/)
      if (match) {
        return `https://player.vimeo.com/video/${match[1]}?autoplay=1`
      }
    }
    if (videoSource === 'loom') {
      // Extract video ID from Loom URL
      const match = videoUrl.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)
      if (match) {
        return `https://www.loom.com/embed/${match[1]}?autoplay=1`
      }
    }
    return null
  }

  const embedUrl = getEmbedUrl()

  if (!embedUrl) {
    // For local or unsupported videos, use native player
    return (
      <video
        src={videoUrl}
        controls
        autoPlay
        className="aspect-video w-full rounded-xl bg-black"
      >
        Your browser does not support the video tag.
      </video>
    )
  }

  return (
    <iframe
      src={embedUrl}
      className="aspect-video w-full rounded-xl"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  )
}

// ============================================================================
// TAGS SECTION
// ============================================================================

interface TagsSectionProps {
  tags: string[]
  onAddTag?: (tag: string) => void
  onRemoveTag?: (tag: string) => void
}

function TagsSection({ tags, onAddTag, onRemoveTag }: TagsSectionProps): React.JSX.Element {
  const [isAdding, setIsAdding] = useState(false)
  const [newTag, setNewTag] = useState('')

  const handleAddTag = useCallback(() => {
    if (newTag.trim()) {
      onAddTag?.(newTag.trim().toLowerCase())
      setNewTag('')
      setIsAdding(false)
    }
  }, [newTag, onAddTag])

  return (
    <section className="space-y-2">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Tags
      </label>
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="group gap-1.5 bg-slate-100 pr-1.5 dark:bg-slate-800"
          >
            #{tag}
            <button
              type="button"
              onClick={() => onRemoveTag?.(tag)}
              className="rounded p-0.5 opacity-0 transition-opacity hover:bg-slate-300 group-hover:opacity-100 dark:hover:bg-slate-700"
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}

        {isAdding ? (
          <div className="flex items-center gap-1">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTag()
                if (e.key === 'Escape') {
                  setIsAdding(false)
                  setNewTag('')
                }
              }}
              placeholder="tag"
              className="h-7 w-24 px-2 text-sm"
              autoFocus
            />
            <Button size="icon" variant="ghost" className="size-7" onClick={handleAddTag}>
              <Check className="size-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-7"
              onClick={() => {
                setIsAdding(false)
                setNewTag('')
              }}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="h-7 gap-1 border-dashed px-2.5 text-xs text-muted-foreground"
          >
            <Plus className="size-3.5" />
            Add tag
          </Button>
        )}
      </div>
    </section>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function VideoPreview({
  item,
  onOpenExternal,
  onAddTag,
  onRemoveTag,
}: VideoPreviewProps): React.JSX.Element {
  const [isPlaying, setIsPlaying] = useState(false)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  }

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`
    }
    return `${secs}s`
  }

  const tags = item.tagIds || []
  const sourceInfo = getVideoSourceInfo(item.videoSource)

  return (
    <div className="space-y-6 p-6">
      {/* Video Player / Thumbnail */}
      {isPlaying ? (
        <EmbeddedPlayer videoUrl={item.videoUrl} videoSource={item.videoSource} />
      ) : (
        <VideoThumbnail
          thumbnailUrl={item.thumbnailUrl}
          title={item.title}
          duration={item.duration}
          videoSource={item.videoSource}
          onPlay={() => setIsPlaying(true)}
        />
      )}

      {/* Open External Button */}
      <Button onClick={onOpenExternal} className="w-full gap-2">
        <ExternalLink className="size-4" />
        Open in {sourceInfo.label}
      </Button>

      {/* Video Info */}
      <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-4">
        <div className="flex items-center gap-3">
          <div className={cn('flex size-10 items-center justify-center rounded-lg', sourceInfo.bg)}>
            <Play className={cn('size-5', sourceInfo.color)} />
          </div>
          <div>
            <p className="text-sm font-medium">{sourceInfo.label}</p>
            <p className="text-xs text-muted-foreground">
              <Clock className="mr-1 inline size-3" />
              {formatDuration(item.duration)}
            </p>
          </div>
        </div>
        {isPlaying && (
          <Button variant="outline" size="sm" onClick={() => setIsPlaying(false)}>
            Show Thumbnail
          </Button>
        )}
      </div>

      {/* Tags */}
      <TagsSection
        tags={tags}
        onAddTag={onAddTag}
        onRemoveTag={onRemoveTag}
      />

      {/* Metadata */}
      <section className="rounded-lg border border-border/40 bg-muted/20 p-4">
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Details
        </h3>
        <dl className="space-y-2.5 text-sm">
          <div className="flex items-center gap-3">
            <dt className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="size-3.5" />
              Saved
            </dt>
            <dd className="text-foreground/80">{formatDate(item.createdAt)}</dd>
          </div>
          <div className="flex items-center gap-3">
            <dt className="flex items-center gap-2 text-muted-foreground">
              <Zap className="size-3.5" />
              Source
            </dt>
            <dd className="text-foreground/80 capitalize">{item.source.replace(/-/g, ' ')}</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
