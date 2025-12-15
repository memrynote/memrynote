/**
 * File Preview Component
 *
 * Displays generic file items with:
 * - File icon based on extension
 * - File name, extension, size, MIME type
 * - Open/Download buttons
 * - Tags and metadata
 */

import { useState, useCallback } from 'react'
import {
  File,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileArchive,
  FileCode,
  FileAudio,
  FileVideo,
  Download,
  ExternalLink,
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
import type { FileItem } from '@/data/inbox-types'

// ============================================================================
// TYPES
// ============================================================================

export interface FilePreviewProps {
  /** The file item to preview */
  item: FileItem
  /** Callback to open file */
  onOpen?: () => void
  /** Callback to download file */
  onDownload?: () => void
  /** Available tags */
  availableTags?: string[]
  /** Add tag callback */
  onAddTag?: (tag: string) => void
  /** Remove tag callback */
  onRemoveTag?: (tag: string) => void
}

// ============================================================================
// FILE ICON
// ============================================================================

function getFileIcon(extension: string, mimeType: string) {
  const ext = extension.toLowerCase()

  // Document types
  if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext)) {
    return { Icon: FileText, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/50' }
  }

  // Spreadsheet types
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) {
    return { Icon: FileSpreadsheet, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/50' }
  }

  // Image types
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) {
    return { Icon: FileImage, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/50' }
  }

  // Archive types
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return { Icon: FileArchive, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/50' }
  }

  // Code types
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'rb', 'java', 'cpp', 'c', 'h', 'css', 'html', 'json', 'xml'].includes(ext)) {
    return { Icon: FileCode, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-900/50' }
  }

  // Audio types
  if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(ext) || mimeType.startsWith('audio/')) {
    return { Icon: FileAudio, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-100 dark:bg-pink-900/50' }
  }

  // Video types
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext) || mimeType.startsWith('video/')) {
    return { Icon: FileVideo, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/50' }
  }

  // Default
  return { Icon: File, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' }
}

// ============================================================================
// FILE DISPLAY
// ============================================================================

interface FileDisplayProps {
  fileName: string
  extension: string
  fileSize: string
  mimeType: string
}

function FileDisplay({ fileName: _fileName, extension, fileSize, mimeType }: FileDisplayProps): React.JSX.Element {
  const { Icon, color, bg } = getFileIcon(extension, mimeType)

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-gradient-to-b from-muted/30 to-muted/10 py-12">
      <div className={cn('flex size-24 items-center justify-center rounded-2xl', bg)}>
        <Icon className={cn('size-12', color)} />
      </div>
      <div className="mt-4 text-center">
        <p className="text-lg font-semibold text-foreground">.{extension.toUpperCase()}</p>
        <p className="mt-1 text-sm text-muted-foreground">{fileSize}</p>
      </div>
    </div>
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

export function FilePreview({
  item,
  onOpen,
  onDownload,
  onAddTag,
  onRemoveTag,
}: FilePreviewProps): React.JSX.Element {
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
  const { Icon, color, bg } = getFileIcon(item.extension, item.mimeType)

  return (
    <div className="space-y-6 p-6">
      {/* File Display */}
      <FileDisplay
        fileName={item.fileName}
        extension={item.extension}
        fileSize={item.fileSize}
        mimeType={item.mimeType}
      />

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={onOpen} className="flex-1 gap-2">
          <ExternalLink className="size-4" />
          Open File
        </Button>
        <Button variant="outline" onClick={onDownload} className="gap-2">
          <Download className="size-4" />
          Download
        </Button>
      </div>

      {/* File Info */}
      <section className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          File Information
        </label>
        <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <div className={cn('flex size-10 items-center justify-center rounded-lg', bg)}>
              <Icon className={cn('size-5', color)} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.fileName}</p>
              <p className="text-xs text-muted-foreground">
                {item.extension.toUpperCase()} • {item.fileSize} • {item.mimeType}
              </p>
            </div>
          </div>
        </div>
      </section>

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
