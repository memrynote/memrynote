import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Loader2, CheckCircle } from 'lucide-react'
import type { SyncProgressUpdateEvent } from '@shared/contracts/ipc-sync'

const PHASE_LABELS = {
  pulling: 'Downloading notes...',
  pushing: 'Uploading changes...',
  resolving: 'Resolving conflicts...',
  indexing: 'Indexing notes...',
  complete: 'Sync complete'
} as const

const COMPLETION_DISPLAY_DURATION_MS = 2000

function isValidProgressEvent(event: unknown): event is SyncProgressUpdateEvent {
  return (
    typeof event === 'object' &&
    event !== null &&
    'phase' in event &&
    typeof (event as SyncProgressUpdateEvent).phase === 'string' &&
    'current' in event &&
    typeof (event as SyncProgressUpdateEvent).current === 'number' &&
    'total' in event &&
    typeof (event as SyncProgressUpdateEvent).total === 'number'
  )
}

export function SyncProgressIndicator({ className }: { className?: string }): JSX.Element | null {
  const [progress, setProgress] = useState<SyncProgressUpdateEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const unsubscribe = window.api.onSyncProgressUpdate((event) => {
      try {
        if (!isValidProgressEvent(event)) {
          console.warn('[SyncProgressIndicator] Invalid progress event:', event)
          return
        }

        setProgress(event)
        setVisible(true)

        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current)
          hideTimerRef.current = null
        }

        if (event.phase === 'complete') {
          hideTimerRef.current = setTimeout(() => setVisible(false), COMPLETION_DISPLAY_DURATION_MS)
        }
      } catch (error) {
        console.warn('[SyncProgressIndicator] Error handling progress event:', error)
      }
    })

    return () => {
      unsubscribe()
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
      }
    }
  }, [])

  if (!visible || !progress) return null

  const percentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0

  return (
    <div className={cn('flex items-center gap-2 px-3 py-1.5 text-sm', className)}>
      {progress.phase === 'complete' ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <Loader2 className="h-4 w-4 animate-spin" />
      )}
      <span className="text-muted-foreground">
        {progress.message || PHASE_LABELS[progress.phase]}
      </span>
      {progress.phase !== 'complete' && progress.total > 0 && (
        <>
          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${percentage}%` }} />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {progress.current}/{progress.total}
          </span>
        </>
      )}
    </div>
  )
}
