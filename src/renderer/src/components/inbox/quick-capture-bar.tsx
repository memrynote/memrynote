/**
 * Quick Capture Bar Component
 *
 * A fixed bottom bar for quickly capturing notes, URLs, voice memos, and files.
 * Features multiple input modes with refined transitions and premium aesthetics.
 */

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type ChangeEvent,
  type KeyboardEvent,
  type DragEvent,
} from 'react'
import {
  Plus,
  Mic,
  Paperclip,
  Link2,
  ArrowRight,
  Square,
  X,
  Check,
  Upload,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// ============================================================================
// TYPES
// ============================================================================

export interface QuickCaptureBarProps {
  /** Callback when the "New" button is clicked */
  onNewClick: () => void
  /** Callback when text/URL is submitted */
  onSubmit: (content: string, type: 'note' | 'url') => void
  /** Callback when voice recording is submitted */
  onVoiceSubmit: (audioBlob: Blob, duration: number) => void
  /** Callback when files are added via drag-drop or file picker */
  onFilesAdded: (files: File[]) => void
  /** Whether the bar is disabled */
  isDisabled?: boolean
  /** Whether an action is loading */
  isLoading?: boolean
  /** Additional class names */
  className?: string
}

export type CaptureMode = 'default' | 'recording' | 'dragover'

// ============================================================================
// CONSTANTS
// ============================================================================

const URL_PATTERN = /^(https?:\/\/|www\.)/i

const ACCEPTED_FILE_TYPES = [
  'image/*',
  '.pdf',
  '.doc',
  '.docx',
  '.txt',
  '.md',
].join(',')

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatRecordingTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function isUrl(value: string): boolean {
  return URL_PATTERN.test(value.trim())
}

// ============================================================================
// WAVEFORM VISUALIZATION
// ============================================================================

interface WaveformProps {
  isActive: boolean
}

function Waveform({ isActive }: WaveformProps): React.JSX.Element {
  const bars = 24

  return (
    <div className="flex items-center justify-center gap-[3px] h-8">
      {Array.from({ length: bars }).map((_, i) => {
        // Create varied heights for visual interest
        const baseHeight = 8 + Math.sin(i * 0.5) * 6
        const animationDelay = `${i * 30}ms`

        return (
          <div
            key={i}
            className={cn(
              'w-[3px] rounded-full transition-all duration-150',
              isActive
                ? 'bg-gradient-to-t from-red-500 to-red-400 animate-pulse'
                : 'bg-red-300 dark:bg-red-700'
            )}
            style={{
              height: isActive ? `${baseHeight + Math.random() * 16}px` : `${baseHeight}px`,
              animationDelay,
            }}
          />
        )
      })}
    </div>
  )
}

// ============================================================================
// RECORDING INDICATOR
// ============================================================================

function RecordingIndicator(): React.JSX.Element {
  return (
    <span className="flex items-center gap-2">
      <span className="relative flex size-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
      </span>
      <span className="text-sm font-medium text-red-600 dark:text-red-400">
        Recording...
      </span>
    </span>
  )
}

// ============================================================================
// ACTION BUTTON
// ============================================================================

interface ActionButtonProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  className?: string
}

function ActionButton({
  icon,
  label,
  onClick,
  disabled,
  className,
}: ActionButtonProps): React.JSX.Element {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClick}
          disabled={disabled}
          className={cn(
            'size-10 rounded-xl',
            'text-muted-foreground hover:text-foreground',
            'hover:bg-accent active:bg-accent/80',
            'transition-all duration-150',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            className
          )}
        >
          {icon}
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={8}>
        <p className="text-xs">{label}</p>
      </TooltipContent>
    </Tooltip>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function QuickCaptureBar({
  onNewClick,
  onSubmit,
  onVoiceSubmit,
  onFilesAdded,
  isDisabled = false,
  isLoading = false,
  className,
}: QuickCaptureBarProps): React.JSX.Element {
  // State
  const [inputValue, setInputValue] = useState('')
  const [mode, setMode] = useState<CaptureMode>('default')
  const [recordingTime, setRecordingTime] = useState(0)
  const [isFocused, setIsFocused] = useState(false)

  // Refs
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Derived state
  const hasContent = inputValue.trim().length > 0
  const inputIsUrl = isUrl(inputValue)
  const isRecording = mode === 'recording'
  const isDragOver = mode === 'dragover'

  // =========================================================================
  // INPUT HANDLERS
  // =========================================================================

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  const handleInputFocus = useCallback(() => {
    setIsFocused(true)
  }, [])

  const handleInputBlur = useCallback(() => {
    setIsFocused(false)
  }, [])

  const handleInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && hasContent && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      } else if (e.key === 'Escape') {
        setInputValue('')
        inputRef.current?.blur()
      }
    },
    [hasContent]
  )

  const handleSubmit = useCallback(() => {
    if (!hasContent || isLoading) return

    const type = inputIsUrl ? 'url' : 'note'
    onSubmit(inputValue.trim(), type)
    setInputValue('')
  }, [hasContent, inputIsUrl, inputValue, isLoading, onSubmit])

  // =========================================================================
  // NEW BUTTON
  // =========================================================================

  const handleNewClick = useCallback(() => {
    onNewClick()
  }, [onNewClick])

  // =========================================================================
  // VOICE RECORDING
  // =========================================================================

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      mediaRecorder.start()
      setMode('recording')
      setRecordingTime(0)

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Failed to start recording:', error)
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
    }

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }

    setMode('default')
  }, [])

  const cancelRecording = useCallback(() => {
    stopRecording()
    audioChunksRef.current = []
    setRecordingTime(0)
  }, [stopRecording])

  const saveRecording = useCallback(() => {
    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      onVoiceSubmit(audioBlob, recordingTime)
    }
    stopRecording()
    audioChunksRef.current = []
    setRecordingTime(0)
  }, [onVoiceSubmit, recordingTime, stopRecording])

  const handleVoiceClick = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  // =========================================================================
  // FILE HANDLING
  // =========================================================================

  const handleAttachClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        onFilesAdded(Array.from(files))
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [onFilesAdded]
  )

  // =========================================================================
  // LINK BUTTON
  // =========================================================================

  const handleLinkClick = useCallback(() => {
    inputRef.current?.focus()
    if (!inputValue) {
      setInputValue('https://')
    }
  }, [inputValue])

  // =========================================================================
  // DRAG & DROP
  // =========================================================================

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setMode('dragover')
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only leave if not entering a child element
    if (e.currentTarget === e.target) {
      setMode('default')
    }
  }, [])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setMode('default')

      const files = e.dataTransfer.files
      if (files && files.length > 0) {
        onFilesAdded(Array.from(files))
      }
    },
    [onFilesAdded]
  )

  // =========================================================================
  // CLEANUP
  // =========================================================================

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div
      className={cn(
        // Fixed positioning
        'border-t border-border',
        // Background with frosted glass effect
        'bg-background/95 backdrop-blur-md',
        // Shadow
        'shadow-[0_-2px_16px_-4px_rgba(0,0,0,0.08)]',
        'dark:shadow-[0_-2px_16px_-4px_rgba(0,0,0,0.25)]',
        // Padding
        'px-4 py-3',
        // Animation for state changes
        'transition-all duration-200',
        // Recording state colors
        isRecording && [
          'bg-red-50/95 dark:bg-red-950/50',
          'border-t-2 border-t-red-500',
        ],
        // Drag over state colors
        isDragOver && [
          'bg-blue-50/95 dark:bg-blue-950/50',
          'border-2 border-dashed border-blue-400',
        ],
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Inner container */}
      <div className="mx-auto max-w-3xl w-full">
        {/* ============================================================= */}
        {/* DRAG OVER STATE */}
        {/* ============================================================= */}
        {isDragOver ? (
          <div className="flex items-center justify-center gap-3 py-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/50">
              <Upload className="size-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-base font-medium text-blue-700 dark:text-blue-300">
              Drop files to add to inbox
            </span>
          </div>
        ) : isRecording ? (
          /* ============================================================= */
          /* RECORDING STATE */
          /* ============================================================= */
          <div className="flex items-center gap-3">
            {/* Stop button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  onClick={stopRecording}
                  className={cn(
                    'size-10 rounded-full',
                    'bg-red-600 hover:bg-red-700',
                    'text-white',
                    'animate-pulse'
                  )}
                >
                  <Square className="size-4" />
                  <span className="sr-only">Stop recording</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Stop recording</TooltipContent>
            </Tooltip>

            {/* Waveform area */}
            <div
              className={cn(
                'flex-1 flex items-center justify-between',
                'h-12 px-4 rounded-xl',
                'bg-white dark:bg-gray-900',
                'border border-red-200 dark:border-red-800'
              )}
            >
              <RecordingIndicator />
              <Waveform isActive={isRecording} />
              <span className="text-sm font-mono font-medium text-red-600 dark:text-red-400 tabular-nums">
                {formatRecordingTime(recordingTime)}
              </span>
            </div>

            {/* Cancel button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={cancelRecording}
                  className="size-10 rounded-xl"
                >
                  <X className="size-4" />
                  <span className="sr-only">Cancel recording</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Cancel</TooltipContent>
            </Tooltip>

            {/* Save button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  onClick={saveRecording}
                  className={cn(
                    'size-10 rounded-xl',
                    'bg-green-600 hover:bg-green-700',
                    'text-white'
                  )}
                >
                  <Check className="size-4" />
                  <span className="sr-only">Save recording</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Save</TooltipContent>
            </Tooltip>
          </div>
        ) : (
          /* ============================================================= */
          /* DEFAULT STATE */
          /* ============================================================= */
          <div className="flex items-center gap-3">
            {/* New button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  onClick={handleNewClick}
                  disabled={isDisabled}
                  className={cn(
                    'size-10 rounded-full shrink-0',
                    'bg-foreground hover:bg-foreground/90',
                    'text-background',
                    'active:scale-95',
                    'transition-transform duration-100',
                    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                  )}
                >
                  <Plus className="size-5" strokeWidth={2} />
                  <span className="sr-only">Create new item</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={8}>
                <p className="text-xs">Create new item</p>
              </TooltipContent>
            </Tooltip>

            {/* Input wrapper */}
            <div
              className={cn(
                'relative flex-1 flex items-center',
                'h-10 rounded-xl',
                'transition-all duration-200',
                // Default state
                'bg-muted',
                // Hover
                'hover:bg-muted/80',
                // Focused
                isFocused && [
                  'bg-background',
                  'ring-2 ring-ring',
                  'shadow-sm',
                ]
              )}
            >
              {/* URL indicator icon */}
              {inputIsUrl && (
                <div className="absolute left-3 flex items-center pointer-events-none">
                  <Link2 className="size-4 text-blue-500" />
                </div>
              )}

              {/* Input */}
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                placeholder="Type or paste anything..."
                disabled={isDisabled}
                className={cn(
                  'w-full h-full bg-transparent',
                  'text-sm text-foreground placeholder:text-muted-foreground',
                  'focus:outline-none',
                  // Adjust padding for URL icon
                  inputIsUrl ? 'pl-9 pr-20' : 'pl-4 pr-20'
                )}
                aria-label="Quick capture - type or paste anything"
              />

              {/* Submit button */}
              {hasContent && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={cn(
                    'absolute right-1.5',
                    'h-7 px-3 rounded-lg',
                    'bg-blue-600 hover:bg-blue-700',
                    'text-white text-xs font-medium',
                    'flex items-center gap-1.5',
                    'animate-in fade-in-0 zoom-in-95 duration-150'
                  )}
                >
                  Save
                  <ArrowRight className="size-3.5" />
                </Button>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <ActionButton
                icon={<Mic className="size-5" />}
                label="Record voice memo"
                onClick={handleVoiceClick}
                disabled={isDisabled}
              />

              <ActionButton
                icon={<Paperclip className="size-5" />}
                label="Attach file"
                onClick={handleAttachClick}
                disabled={isDisabled}
              />

              <ActionButton
                icon={<Link2 className="size-5" />}
                label="Add link"
                onClick={handleLinkClick}
                disabled={isDisabled}
                className="hidden sm:flex"
              />
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_FILE_TYPES}
              onChange={handleFileChange}
              className="hidden"
              aria-label="File upload"
            />
          </div>
        )}
      </div>
    </div>
  )
}
