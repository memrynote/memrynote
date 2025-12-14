/**
 * File Preview Component
 *
 * Minimal preview for generic files showing:
 * - Large file type icon
 * - Full filename
 * - File type description
 */
import { cn } from '@/lib/utils'
import {
  File,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  Presentation,
} from 'lucide-react'
import type { FileItem } from '@/data/inbox-types'

// =============================================================================
// TYPES
// =============================================================================

export interface FilePreviewProps {
  item: FileItem
  className?: string
}

// =============================================================================
// FILE TYPE HELPERS
// =============================================================================

interface FileTypeInfo {
  icon: React.ComponentType<{ className?: string }>
  label: string
  color: string
  bgColor: string
}

function getFileTypeInfo(extension: string, _mimeType: string): FileTypeInfo {
  const ext = extension.toLowerCase().replace('.', '')

  // Document types
  if (['doc', 'docx', 'odt', 'rtf'].includes(ext)) {
    return {
      icon: FileText,
      label: 'Word Document',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    }
  }

  // Spreadsheet types
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) {
    return {
      icon: FileSpreadsheet,
      label: 'Spreadsheet',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
    }
  }

  // Presentation types
  if (['ppt', 'pptx', 'odp', 'key'].includes(ext)) {
    return {
      icon: Presentation,
      label: 'Presentation',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    }
  }

  // Image types (shouldn't usually hit here, but fallback)
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) {
    return {
      icon: FileImage,
      label: 'Image File',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    }
  }

  // Video types
  if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv'].includes(ext)) {
    return {
      icon: FileVideo,
      label: 'Video File',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-950/30',
    }
  }

  // Audio types
  if (['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg'].includes(ext)) {
    return {
      icon: FileAudio,
      label: 'Audio File',
      color: 'text-violet-600',
      bgColor: 'bg-violet-50 dark:bg-violet-950/30',
    }
  }

  // Archive types
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) {
    return {
      icon: FileArchive,
      label: 'Archive',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    }
  }

  // Code types
  if (
    ['js', 'ts', 'jsx', 'tsx', 'py', 'rb', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'css', 'html', 'json', 'xml', 'yaml', 'yml', 'md', 'sh'].includes(
      ext
    )
  ) {
    return {
      icon: FileCode,
      label: 'Code File',
      color: 'text-slate-600',
      bgColor: 'bg-slate-50 dark:bg-slate-950/30',
    }
  }

  // Default
  return {
    icon: File,
    label: 'File',
    color: 'text-stone-600',
    bgColor: 'bg-stone-100 dark:bg-stone-900/30',
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

export function FilePreview({ item, className }: FilePreviewProps): React.JSX.Element {
  const typeInfo = getFileTypeInfo(item.extension, item.mimeType)
  const IconComponent = typeInfo.icon

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {/* Large file icon */}
      <div
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg',
          typeInfo.bgColor
        )}
      >
        <IconComponent className={cn('h-6 w-6', typeInfo.color)} />
      </div>

      {/* File info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {item.fileName}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {typeInfo.label}
          {item.extension && (
            <span className="ml-1 uppercase text-muted-foreground/60">
              (.{item.extension.replace('.', '')})
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
