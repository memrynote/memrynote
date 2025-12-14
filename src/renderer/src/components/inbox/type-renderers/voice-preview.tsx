/**
 * Voice Preview Component
 *
 * Audio preview for voice memos showing:
 * - Waveform visualization
 * - Play button with progress bar
 * - Duration display
 * - Transcription excerpt (if available)
 */
import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Play, Pause, MessageSquare, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { VoiceItem } from '@/data/inbox-types'
import { formatDuration } from '@/lib/inbox-utils'

// =============================================================================
// TYPES
// =============================================================================

export interface VoicePreviewProps {
  item: VoiceItem
  className?: string
}

// =============================================================================
// WAVEFORM COMPONENT
// =============================================================================

interface WaveformProps {
  data: number[]
  progress?: number
  className?: string
}

function Waveform({ data, progress = 0, className }: WaveformProps): React.JSX.Element {
  // Generate bars from waveform data (or use placeholder)
  const bars = data.length > 0 ? data : generatePlaceholderWaveform()
  const normalizedBars = normalizeBars(bars)

  return (
    <div className={cn('flex h-8 items-center gap-[2px]', className)}>
      {normalizedBars.map((height, index) => {
        const isPlayed = (index / normalizedBars.length) * 100 < progress
        return (
          <div
            key={index}
            className={cn(
              'w-1 rounded-full transition-colors duration-150',
              isPlayed
                ? 'bg-violet-500'
                : 'bg-violet-300 dark:bg-violet-700'
            )}
            style={{ height: `${height}%` }}
          />
        )
      })}
    </div>
  )
}

// Generate placeholder waveform when no data available
function generatePlaceholderWaveform(): number[] {
  return Array.from({ length: 40 }, () => 20 + Math.random() * 80)
}

// Normalize bar heights to 20-100% range
function normalizeBars(bars: number[]): number[] {
  const max = Math.max(...bars)
  const min = Math.min(...bars)
  const range = max - min || 1

  return bars.map((bar) => {
    const normalized = ((bar - min) / range) * 80 + 20
    return Math.round(normalized)
  })
}

// =============================================================================
// COMPONENT
// =============================================================================

export function VoicePreview({ item, className }: VoicePreviewProps): React.JSX.Element {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev)
    // TODO: Implement actual audio playback
    if (!isPlaying) {
      // Simulate playback progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, (item.duration * 1000) / 100)
    }
  }, [isPlaying, item.duration])

  const hasTranscription = item.transcription && item.transcription.trim() !== ''

  return (
    <div className={cn('space-y-3', className)}>
      {/* Waveform and controls */}
      <div className="flex items-center gap-3">
        {/* Play/Pause button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-8 w-8 shrink-0 rounded-full',
            'bg-violet-100 text-violet-600 hover:bg-violet-200',
            'dark:bg-violet-900/30 dark:text-violet-400 dark:hover:bg-violet-900/50'
          )}
          onClick={handlePlayPause}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 translate-x-0.5" />
          )}
        </Button>

        {/* Waveform */}
        <div className="min-w-0 flex-1">
          <Waveform
            data={item.waveformData}
            progress={progress}
          />
        </div>

        {/* Duration */}
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {formatDuration(item.duration)}
        </span>
      </div>

      {/* Transcription preview */}
      {hasTranscription && (
        <div className="flex items-start gap-2">
          <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500" />
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm text-muted-foreground">
              "{item.transcription}"
            </p>
            {item.isAutoTranscribed && (
              <span className="mt-1 inline-block text-xs text-muted-foreground/60">
                (auto-transcribed)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasTranscription && !item.waveformData.length && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground/60">
          <Mic className="h-3.5 w-3.5" />
          <span>Voice recording</span>
        </div>
      )}
    </div>
  )
}
