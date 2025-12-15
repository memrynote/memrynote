/**
 * Note Preview Component
 *
 * Full inline editor for notes with:
 * - Formatting toolbar
 * - Rich text editor
 * - Auto-save with status indicator
 * - Word count
 * - Tags section
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Link2,
  Paperclip,
  MoreHorizontal,
  Check,
  Loader2,
  AlertCircle,
  Plus,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { NoteItem } from '@/data/inbox-types'

// ============================================================================
// TYPES
// ============================================================================

export interface NotePreviewProps {
  /** The note item to preview */
  item: NoteItem
  /** Editable content */
  content?: string
  /** Callback when content changes */
  onContentChange?: (content: string) => void
  /** Save status */
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error'
  /** Last saved timestamp */
  lastSaved?: Date
  /** Available tags for autocomplete */
  availableTags?: string[]
  /** Callback to add a tag */
  onAddTag?: (tag: string) => void
  /** Callback to remove a tag */
  onRemoveTag?: (tag: string) => void
}

// ============================================================================
// FORMATTING TOOLBAR
// ============================================================================

interface ToolbarButtonProps {
  icon: React.ReactNode
  label: string
  shortcut?: string
  isActive?: boolean
  onClick: () => void
}

function ToolbarButton({
  icon,
  label,
  shortcut,
  isActive,
  onClick,
}: ToolbarButtonProps): React.JSX.Element {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          className={cn(
            'size-8 rounded-md',
            isActive && 'bg-accent text-accent-foreground'
          )}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="flex items-center gap-2">
        <span>{label}</span>
        {shortcut && (
          <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            {shortcut}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  )
}

function ToolbarDivider(): React.JSX.Element {
  return <div className="mx-1 h-6 w-px bg-border/50" />
}

interface FormattingToolbarProps {
  onFormat: (command: string, value?: string) => void
}

function FormattingToolbar({ onFormat }: FormattingToolbarProps): React.JSX.Element {
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-border/50 bg-background/95 px-4 py-2 backdrop-blur-sm">
      {/* Text Styles */}
      <ToolbarButton
        icon={<Bold className="size-4" />}
        label="Bold"
        shortcut="⌘B"
        onClick={() => onFormat('bold')}
      />
      <ToolbarButton
        icon={<Italic className="size-4" />}
        label="Italic"
        shortcut="⌘I"
        onClick={() => onFormat('italic')}
      />
      <ToolbarButton
        icon={<Underline className="size-4" />}
        label="Underline"
        shortcut="⌘U"
        onClick={() => onFormat('underline')}
      />
      <ToolbarButton
        icon={<Strikethrough className="size-4" />}
        label="Strikethrough"
        shortcut="⌘⇧X"
        onClick={() => onFormat('strikethrough')}
      />

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarButton
        icon={<Heading1 className="size-4" />}
        label="Heading 1"
        shortcut="⌘⌥1"
        onClick={() => onFormat('heading1')}
      />
      <ToolbarButton
        icon={<Heading2 className="size-4" />}
        label="Heading 2"
        shortcut="⌘⌥2"
        onClick={() => onFormat('heading2')}
      />
      <ToolbarButton
        icon={<Heading3 className="size-4" />}
        label="Heading 3"
        shortcut="⌘⌥3"
        onClick={() => onFormat('heading3')}
      />

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        icon={<List className="size-4" />}
        label="Bullet List"
        shortcut="⌘⇧8"
        onClick={() => onFormat('bulletList')}
      />
      <ToolbarButton
        icon={<ListOrdered className="size-4" />}
        label="Numbered List"
        shortcut="⌘⇧7"
        onClick={() => onFormat('numberedList')}
      />
      <ToolbarButton
        icon={<CheckSquare className="size-4" />}
        label="Checklist"
        shortcut="⌘⇧9"
        onClick={() => onFormat('checklist')}
      />

      <ToolbarDivider />

      {/* Insert */}
      <ToolbarButton
        icon={<Code className="size-4" />}
        label="Code Block"
        shortcut="⌘⇧C"
        onClick={() => onFormat('code')}
      />
      <ToolbarButton
        icon={<Link2 className="size-4" />}
        label="Link"
        shortcut="⌘K"
        onClick={() => onFormat('link')}
      />
      <ToolbarButton
        icon={<Paperclip className="size-4" />}
        label="Attachment"
        onClick={() => onFormat('attachment')}
      />

      {/* More menu */}
      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onFormat('horizontalRule')}>
              Horizontal rule
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFormat('blockquote')}>
              Block quote
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFormat('table')}>
              Table
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onFormat('clearFormatting')}>
              Clear formatting
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// ============================================================================
// EDITOR AREA
// ============================================================================

interface EditorAreaProps {
  content: string
  onChange: (content: string) => void
  onFormat: (command: string) => void
}

function EditorArea({ content, onChange, onFormat: _onFormat }: EditorAreaProps): React.JSX.Element {
  const editorRef = useRef<HTMLDivElement>(null)

  // Handle keyboard shortcuts
  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey

      if (isMod && e.key === 'b') {
        e.preventDefault()
        document.execCommand('bold')
      } else if (isMod && e.key === 'i') {
        e.preventDefault()
        document.execCommand('italic')
      } else if (isMod && e.key === 'u') {
        e.preventDefault()
        document.execCommand('underline')
      }
    }

    editor.addEventListener('keydown', handleKeyDown)
    return () => editor.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className={cn(
          'prose prose-slate dark:prose-invert mx-auto max-w-2xl',
          'min-h-[300px] outline-none',
          // Typography
          'prose-headings:font-semibold prose-headings:tracking-tight',
          'prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-6',
          'prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-5',
          'prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4',
          'prose-p:mb-4 prose-p:leading-relaxed',
          // Lists
          'prose-ul:my-4 prose-ol:my-4',
          'prose-li:my-1',
          // Code
          'prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5',
          'prose-code:before:content-none prose-code:after:content-none',
          'prose-pre:rounded-lg prose-pre:bg-slate-900 prose-pre:text-slate-100',
          // Links
          'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
          // Focus
          'focus:outline-none'
        )}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}

// ============================================================================
// STATUS BAR
// ============================================================================

interface StatusBarProps {
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  wordCount: number
  lastSaved?: Date
}

function StatusBar({ saveStatus, wordCount, lastSaved }: StatusBarProps): React.JSX.Element {
  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex items-center justify-between border-t border-border/50 bg-muted/30 px-6 py-3 text-xs text-muted-foreground">
      {/* Save Status */}
      <div className="flex items-center gap-2">
        {saveStatus === 'saving' && (
          <>
            <Loader2 className="size-3 animate-spin" />
            <span>Saving...</span>
          </>
        )}
        {saveStatus === 'saved' && (
          <>
            <Check className="size-3 text-emerald-500" />
            <span className="text-emerald-600 dark:text-emerald-400">Auto-saved</span>
          </>
        )}
        {saveStatus === 'error' && (
          <>
            <AlertCircle className="size-3 text-red-500" />
            <span className="text-red-600 dark:text-red-400">Unable to save</span>
          </>
        )}
        {saveStatus === 'idle' && <span>Ready</span>}
      </div>

      {/* Word Count */}
      <span className="tabular-nums">{wordCount.toLocaleString()} words</span>

      {/* Last Saved */}
      {lastSaved && (
        <span>Last edited {formatRelativeTime(lastSaved)}</span>
      )}
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
    <div className="border-t border-border/50 bg-muted/20 px-6 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Tags:</span>
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="group gap-1.5 bg-slate-100 pr-1.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
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
              className="h-6 w-20 px-2 text-xs"
              autoFocus
            />
            <Button size="icon" variant="ghost" className="size-6" onClick={handleAddTag}>
              <Check className="size-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-6"
              onClick={() => {
                setIsAdding(false)
                setNewTag('')
              }}
            >
              <X className="size-3" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="h-6 gap-1 px-2 text-xs text-muted-foreground"
          >
            <Plus className="size-3" />
            Add
          </Button>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function NotePreview({
  item,
  content,
  onContentChange,
  saveStatus = 'idle',
  lastSaved,
  onAddTag,
  onRemoveTag,
}: NotePreviewProps): React.JSX.Element {
  const [localContent, setLocalContent] = useState(content || item.content)

  const handleContentChange = useCallback((newContent: string) => {
    setLocalContent(newContent)
    onContentChange?.(newContent)
  }, [onContentChange])

  const handleFormat = useCallback((command: string) => {
    // Execute formatting command
    switch (command) {
      case 'bold':
        document.execCommand('bold')
        break
      case 'italic':
        document.execCommand('italic')
        break
      case 'underline':
        document.execCommand('underline')
        break
      case 'strikethrough':
        document.execCommand('strikethrough')
        break
      case 'heading1':
        document.execCommand('formatBlock', false, 'h1')
        break
      case 'heading2':
        document.execCommand('formatBlock', false, 'h2')
        break
      case 'heading3':
        document.execCommand('formatBlock', false, 'h3')
        break
      case 'bulletList':
        document.execCommand('insertUnorderedList')
        break
      case 'numberedList':
        document.execCommand('insertOrderedList')
        break
      case 'code':
        document.execCommand('formatBlock', false, 'pre')
        break
      case 'clearFormatting':
        document.execCommand('removeFormat')
        break
      case 'horizontalRule':
        document.execCommand('insertHorizontalRule')
        break
      default:
        console.log('Format command:', command)
    }
  }, [])

  // Count words from content
  const wordCount = localContent
    .replace(/<[^>]*>/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length

  // Mock tags from item
  const tags = item.tagIds || []

  return (
    <div className="flex h-full flex-col">
      {/* Formatting Toolbar */}
      <FormattingToolbar onFormat={handleFormat} />

      {/* Editor Area */}
      <EditorArea
        content={localContent}
        onChange={handleContentChange}
        onFormat={handleFormat}
      />

      {/* Status Bar */}
      <StatusBar
        saveStatus={saveStatus}
        wordCount={wordCount}
        lastSaved={lastSaved}
      />

      {/* Tags */}
      <TagsSection
        tags={tags}
        onAddTag={onAddTag}
        onRemoveTag={onRemoveTag}
      />
    </div>
  )
}
