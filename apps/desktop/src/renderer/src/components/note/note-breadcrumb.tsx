import { useMemo, useCallback } from 'react'
import { useTabs } from '@/contexts/tabs'

interface BreadcrumbSegment {
  label: string
  folderPath: string
}

interface NoteBreadcrumbProps {
  notePath: string
  noteTitle: string
}

function parseBreadcrumbSegments(notePath: string): BreadcrumbSegment[] {
  const parts = notePath.split('/')

  const withoutNotesPrefix = parts[0] === 'notes' ? parts.slice(1) : [...parts]
  withoutNotesPrefix.pop()

  if (withoutNotesPrefix.length === 0) return []

  return withoutNotesPrefix.map((segment, i) => ({
    label: segment,
    folderPath: withoutNotesPrefix.slice(0, i + 1).join('/')
  }))
}

export const SIDEBAR_REVEAL_FOLDER_EVENT = 'sidebar:reveal-folder'

export function NoteBreadcrumb({ notePath, noteTitle }: NoteBreadcrumbProps) {
  const { openTab } = useTabs()

  const segments = useMemo(() => parseBreadcrumbSegments(notePath), [notePath])

  const handleFolderClick = useCallback(
    (folderPath: string, folderName: string) => {
      window.dispatchEvent(new CustomEvent(SIDEBAR_REVEAL_FOLDER_EVENT, { detail: { folderPath } }))

      openTab({
        type: 'folder',
        title: folderName,
        icon: 'folder',
        path: `/folder/${encodeURIComponent(folderPath)}`,
        entityId: folderPath,
        isPinned: false,
        isModified: false,
        isPreview: true,
        isDeleted: false
      })
    },
    [openTab]
  )

  const handleRootClick = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent(SIDEBAR_REVEAL_FOLDER_EVENT, { detail: { folderPath: '' } })
    )
  }, [])

  return (
    <nav
      aria-label="Note location"
      className="flex items-center gap-1.5 text-xs leading-4 select-none"
    >
      <button
        type="button"
        onClick={handleRootClick}
        className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer bg-transparent border-none p-0"
      >
        Notes
      </button>

      {segments.map((segment) => (
        <span key={segment.folderPath} className="contents">
          <span className="text-xs text-muted-foreground/40">/</span>
          <button
            type="button"
            onClick={() => handleFolderClick(segment.folderPath, segment.label)}
            className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            {segment.label}
          </button>
        </span>
      ))}

      <span className="text-xs text-muted-foreground/40">/</span>
      <span className="text-xs text-foreground/70 font-medium">{noteTitle}</span>
    </nav>
  )
}
