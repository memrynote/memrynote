/**
 * Voice Preview Component
 *
 * Displays voice memo items with:
 * - Waveform visualization
 * - Playback controls
 * - Transcription (if available)
 * - Download button
 * - Tags and metadata
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Play,
  Pause,
  Download,
  Mic,
  ChevronDown,
  Calendar,
  Zap,
  Plus,
  X,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import type { VoiceItem } from '@/data/inbox-types'

// ============================================================================
// TYPES
// ============================================================================

export interface VoicePreviewProps {
  /** The voice item to preview */
  item: VoiceItem
  /** Callback to download audio */
  onDownload?: () => void
  /** Available tags */
  availableTags?: string[]
  /** Add tag callback */
  onAddTag?: (tag: string) => void
  /** Remove tag callback */
  onRemoveTag?: (tag: string) => void
}

// ============================================================================
// WAVEFORM VISUALIZATION
// ============================================================================

interface WaveformProps {
  data: number[]
  progress: number
  onClick: (position: number) => void
}

function Waveform({ data, progress, onClick }: WaveformProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleClick = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      const x = e.clientX - rect.left
      const position = x / rect.width
      onClick(position)
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative h-20 cursor-pointer rounded-lg bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800"
      onClick={handleClick}
    >
      {/* Waveform bars */}
      <div className="absolute inset-2 flex items-center justify-center gap-[2px]">
        {data.map((value, i) => {
          const isPlayed = i / data.length < progress
          return (
            <div
              key={i}
              className={cn(
                'w-1 rounded-full transition-colors',
                isPlayed
                  ? 'bg-emerald-500 dark:bg-emerald-400'
                  : 'bg-slate-300 dark:bg-slate-600'
              )}
              style={{ height: `${Math.max(4, value * 60)}px` }}
            />
          )
        })}
      </div>

      {/* Progress indicator line */}
      <div
        className="absolute bottom-0 top-0 w-0.5 bg-emerald-500"
        style={{ left: `${progress * 100}%` }}
      />
    </div>
  )
}

// ============================================================================
// AUDIO PLAYER
// ============================================================================

interface AudioPlayerProps {
  audioUrl: string
  duration: number
  waveformData: number[]
  onDownload?: () => void
}

function AudioPlayer({ audioUrl, duration, waveformData, onDownload }: AudioPlayerProps): React.JSX.Element {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)

  const progress = duration > 0 ? currentTime / duration : 0

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const seekTo = useCallback((position: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = position * duration
  }, [duration])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4 rounded-xl border border-border/50 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 p-6 dark:from-emerald-950/30 dark:to-teal-950/20">
      <audio ref={audioRef} src={audioUrl} />

      {/* Waveform */}
      <Waveform
        data={waveformData}
        progress={progress}
        onClick={seekTo}
      />

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Play/Pause */}
        <Button
          size="icon"
          onClick={togglePlay}
          className="size-12 rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {isPlaying ? (
            <Pause className="size-5" />
          ) : (
            <Play className="size-5 ml-0.5" />
          )}
        </Button>

        {/* Time */}
        <div className="flex items-center gap-2 text-sm tabular-nums">
          <span className="text-foreground">{formatTime(currentTime)}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{formatTime(duration)}</span>
        </div>

        {/* Volume */}
        <div className="flex flex-1 items-center gap-2">
          <Mic className="size-4 text-muted-foreground" />
          <Slider
            value={[volume]}
            onValueChange={([v]) => {
              setVolume(v)
              if (audioRef.current) audioRef.current.volume = v
            }}
            max={1}
            step={0.1}
            className="w-24"
          />
        </div>

        {/* Download */}
        <Button variant="outline" size="sm" onClick={onDownload} className="gap-2">
          <Download className="size-4" />
          Download
        </Button>
      </div>
    </div>
  )
}

// ============================================================================
// TRANSCRIPTION SECTION
// ============================================================================

interface TranscriptionSectionProps {
  transcription: string | null
  isAutoTranscribed: boolean
}

function TranscriptionSection({ transcription, isAutoTranscribed }: TranscriptionSectionProps): React.JSX.Element | null {
  const [isExpanded, setIsExpanded] = useState(true)

  if (!transcription) {
    return (
      <section className="rounded-lg border border-dashed border-border/50 bg-muted/20 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          No transcription available
        </p>
        <Button variant="outline" size="sm" className="mt-3 gap-2">
          Generate Transcription
        </Button>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-lg border border-border/50">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between gap-2 bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50"
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          Transcription
          {isAutoTranscribed && (
            <Badge variant="secondary" className="text-[10px]">
              Auto-generated
            </Badge>
          )}
        </div>
        <ChevronDown
          className={cn(
            'size-4 text-muted-foreground transition-transform',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      <div
        className={cn(
          'grid transition-all duration-200',
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <div className="p-4">
            <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
              {transcription}
            </p>
          </div>
        </div>
      </div>
    </section>
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

export function VoicePreview({
  item,
  onDownload,
  onAddTag,
  onRemoveTag,
}: VoicePreviewProps): React.JSX.Element {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  }

  const tags = item.tagIds || []

  return (
    <div className="space-y-6 p-6">
      {/* Audio Player */}
      <AudioPlayer
        audioUrl={item.audioUrl}
        duration={item.duration}
        waveformData={item.waveformData}
        onDownload={onDownload}
      />

      {/* Transcription */}
      <TranscriptionSection
        transcription={item.transcription}
        isAutoTranscribed={item.isAutoTranscribed}
      />

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
              Recorded
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
