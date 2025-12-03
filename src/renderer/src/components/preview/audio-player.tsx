import { useState, useRef, useEffect, useCallback } from "react"
import { Play, Pause } from "lucide-react"

import { cn } from "@/lib/utils"

interface AudioPlayerProps {
  duration: number // in seconds
  audioUrl?: string
  onPlay?: () => void
  onPause?: () => void
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

const AudioPlayer = ({
  duration,
  audioUrl,
  onPlay,
  onPause,
}: AudioPlayerProps): React.JSX.Element => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [progress, setProgress] = useState(0)
  const progressRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Simulated playback (since we don't have real audio files)
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.1
          if (next >= duration) {
            setIsPlaying(false)
            return duration
          }
          return next
        })
      }, 100)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, duration])

  // Update progress when currentTime changes
  useEffect(() => {
    setProgress((currentTime / duration) * 100)
  }, [currentTime, duration])

  const handlePlayPause = useCallback((): void => {
    if (isPlaying) {
      setIsPlaying(false)
      onPause?.()
    } else {
      // Reset if at end
      if (currentTime >= duration) {
        setCurrentTime(0)
      }
      setIsPlaying(true)
      onPlay?.()
    }
  }, [isPlaying, currentTime, duration, onPlay, onPause])

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (!progressRef.current) return

    const rect = progressRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration

    setCurrentTime(Math.max(0, Math.min(newTime, duration)))
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault()
      handlePlayPause()
    }
  }

  return (
    <div
      className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 p-6"
      role="region"
      aria-label="Audio player"
    >
      <div className="flex items-center gap-4">
        {/* Play/Pause button */}
        <button
          type="button"
          onClick={handlePlayPause}
          onKeyDown={handleKeyDown}
          className={cn(
            "size-12 rounded-full flex items-center justify-center transition-colors",
            "bg-[var(--primary)] text-[var(--primary-foreground)]",
            "hover:bg-[var(--primary)]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          )}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="size-5" aria-hidden="true" />
          ) : (
            <Play className="size-5 ml-0.5" aria-hidden="true" />
          )}
        </button>

        {/* Progress section */}
        <div className="flex-1 space-y-2">
          {/* Progress bar */}
          <div
            ref={progressRef}
            className="h-2 bg-[var(--muted)] rounded-full cursor-pointer relative overflow-hidden"
            onClick={handleProgressClick}
            role="slider"
            aria-label="Audio progress"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
            tabIndex={0}
          >
            {/* Filled progress */}
            <div
              className="absolute inset-y-0 left-0 bg-[var(--primary)] rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
            {/* Seek handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 size-3 bg-[var(--primary)] rounded-full shadow-md transition-all duration-100"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>

          {/* Time display */}
          <div className="flex justify-between text-xs text-[var(--muted-foreground)] tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export { AudioPlayer }

