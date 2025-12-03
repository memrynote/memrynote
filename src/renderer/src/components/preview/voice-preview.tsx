import { Settings } from "lucide-react"

import { AudioPlayer } from "@/components/preview/audio-player"
import type { InboxItem, VoicePreviewContent } from "@/types"

interface VoicePreviewProps {
  item: InboxItem
}

const VoicePreview = ({ item }: VoicePreviewProps): React.JSX.Element => {
  const content = item.previewContent as VoicePreviewContent | undefined
  const duration = item.duration || 0

  return (
    <div className="space-y-6">
      {/* Audio player */}
      <AudioPlayer
        duration={duration}
        audioUrl={content?.audioUrl}
      />

      {/* Transcription section */}
      {content?.transcription && (
        <>
          <div className="h-px bg-[var(--border)]" aria-hidden="true" />

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Transcription
            </h4>

            <div className="bg-[var(--muted)]/30 rounded-lg p-4">
              <p className="text-[var(--foreground)] leading-relaxed">
                "{content.transcription}"
              </p>
            </div>

            {/* Auto-generated indicator */}
            {content.transcriptionAuto && (
              <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                <Settings className="size-3" aria-hidden="true" />
                <span>Auto-generated transcription</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* No transcription message */}
      {!content?.transcription && (
        <>
          <div className="h-px bg-[var(--border)]" aria-hidden="true" />
          <p className="text-sm text-[var(--muted-foreground)] italic text-center py-4">
            No transcription available
          </p>
        </>
      )}
    </div>
  )
}

export { VoicePreview }

