# 15 - Filing Panel

## Objective

Build the slide-over filing panel that allows users to organize items into folders. The panel includes folder search, AI suggestions, recent folders, a complete folder tree, and tag input.

---

## Context

Filing is the core organizing action in the inbox:
- Move items from inbox to permanent storage
- AI suggests folders based on content
- Quick access to recent folders
- Full folder tree navigation
- Optional tagging during filing

**Dependencies:**
- 01-foundation-types
- 12-item-selection
- 13-bulk-action-bar

**Blocks:** 18-page-integration

---

## Specifications

From inbox-layouts.md:

### Filing Panel (Slide-over)

```
+----------------------------------------------------------------------+
|                                              |                       |
|                                              |  +==================+ |
|                                              |  ||    FILE ITEM    || |
|                                              |  ||                 || |
|                                              |  ||  -----------    || |
|            [Main Content Area]               |  ||                 || |
|                                              |  ||  [link] How to  || |
|                                              |  ||     Build...    || |
|                                              |  ||                 || |
|                                              |  ||  -----------    || |
|                                              |  ||                 || |
|                                              |  ||  Choose Folder  || |
|                                              |  ||                 || |
|                                              |  ||  +----------+   || |
|                                              |  ||  | Search   |   || |
|                                              |  ||  +----------+   || |
|                                              |  ||                 || |
|                                              |  ||  SUGGESTED      || |
|                                              |  ||  |- Research    || |
|                                              |  ||  +- PKM         || |
|                                              |  ||                 || |
|                                              |  ||  RECENT         || |
|                                              |  ||  |- Work        || |
|                                              |  ||  |- Personal    || |
|                                              |  ||  +- Archive     || |
|                                              |  ||                 || |
|                                              |  ||  ALL FOLDERS    || |
|                                              |  ||  > Work         || |
|                                              |  ||    |- Projects  || |
|                                              |  ||    +- Reference || |
|                                              |  ||  > Personal     || |
|                                              |  ||                 || |
|                                              |  ||  -----------    || |
|                                              |  ||                 || |
|                                              |  ||  Tags           || |
|                                              |  ||  [+ Add tag]    || |
|                                              |  ||                 || |
|                                              |  ||  -----------    || |
|                                              |  ||                 || |
|                                              |  || [Cancel] [File] || |
|                                              |  ||                 || |
|                                              |  +==================+ |
+----------------------------------------------------------------------+

Panel Width: 320px
```

### AI Suggestion Confidence Display

```
HIGH CONFIDENCE (>80%):
+----------------------------------------------------------------------+
|  AI Suggestion                                               85%     |
|                                                                      |
|  [folder] Research / PKM Methods                                     |
|                                                                      |
|  Similar items filed here:                                           |
|  . Building a Zettelkasten                                           |
|  . The BASB Method Explained                                         |
|                                                                      |
|                                    [Accept]  [Choose Different]      |
+----------------------------------------------------------------------+
```

---

## Implementation Guide

### File Location

Create: `src/renderer/src/components/inbox/filing-panel.tsx`

### FilingPanel Component

```tsx
// src/renderer/src/components/inbox/filing-panel.tsx

import { useState, useMemo } from 'react'
import {
  X,
  Search,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Check,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { TypeIcon } from './type-icon'
import type { InboxItem, AISuggestion, UserTag } from '@/types/inbox'
import type { TreeDataItem } from '@/types'

interface FilingPanelProps {
  isOpen: boolean
  onClose: () => void
  items: InboxItem[]  // Items being filed (1 or more for bulk)
  folders: TreeDataItem[]
  recentFolders: TreeDataItem[]
  onFile: (itemIds: string[], folderId: string, tags: UserTag[]) => void
}

export function FilingPanel({
  isOpen,
  onClose,
  items,
  folders,
  recentFolders,
  onFile,
}: FilingPanelProps): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [tags, setTags] = useState<UserTag[]>([])

  const isBulkFiling = items.length > 1
  const firstItem = items[0]
  const aiSuggestion = firstItem?.aiSuggestion

  // Filter folders by search
  const filteredFolders = useMemo(() => {
    if (!searchQuery) return folders
    return filterFolderTree(folders, searchQuery.toLowerCase())
  }, [folders, searchQuery])

  // Suggested folders from AI
  const suggestedFolders = useMemo(() => {
    if (!aiSuggestion) return []
    return folders.filter(
      (f) => f.id === aiSuggestion.folderId || f.name.toLowerCase().includes('pkm')
    ).slice(0, 2)
  }, [aiSuggestion, folders])

  const handleToggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }

  const handleSelectFolder = (folderId: string) => {
    setSelectedFolderId(folderId)
  }

  const handleAcceptSuggestion = () => {
    if (aiSuggestion) {
      setSelectedFolderId(aiSuggestion.folderId)
    }
  }

  const handleFile = () => {
    if (selectedFolderId) {
      onFile(
        items.map((item) => item.id),
        selectedFolderId,
        tags
      )
      onClose()
    }
  }

  const handleAddTag = (tag: UserTag) => {
    if (!tags.find((t) => t.id === tag.id)) {
      setTags([...tags, tag])
    }
  }

  const handleRemoveTag = (tagId: string) => {
    setTags(tags.filter((t) => t.id !== tagId))
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[360px] sm:w-[400px] p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="p-4 border-b">
          <SheetTitle>
            {isBulkFiling ? `File ${items.length} items` : 'File Item'}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Item Preview */}
            <div className="p-3 bg-muted/50 rounded-lg">
              {isBulkFiling ? (
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    {items.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="w-6 h-6 rounded-full bg-background border flex items-center justify-center"
                      >
                        <TypeIcon type={item.type} size="sm" variant="icon-only" />
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-medium">
                    {items.length} items selected
                  </span>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <TypeIcon type={firstItem.type} variant="with-bg" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{firstItem.title}</p>
                    {'domain' in firstItem && (
                      <p className="text-xs text-muted-foreground">
                        {firstItem.domain}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* AI Suggestion */}
            {aiSuggestion && aiSuggestion.confidence >= 50 && (
              <div
                className={cn(
                  'p-4 rounded-lg',
                  aiSuggestion.confidence >= 80
                    ? 'bg-emerald-50 dark:bg-emerald-950/30'
                    : 'bg-amber-50 dark:bg-amber-950/30'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">AI Suggestion</span>
                  </div>
                  <Badge variant="secondary">{aiSuggestion.confidence}%</Badge>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{aiSuggestion.folderPath}</span>
                </div>

                {aiSuggestion.similarItems && aiSuggestion.similarItems.length > 0 && (
                  <p className="text-xs text-muted-foreground mb-3">
                    Similar to {aiSuggestion.similarItems.length} items in this folder
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={handleAcceptSuggestion}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Choose Different
                  </Button>
                </div>
              </div>
            )}

            {/* Folder Search */}
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search folders..."
                  className="pl-9"
                />
              </div>
            </div>

            {/* Suggested Folders */}
            {suggestedFolders.length > 0 && !searchQuery && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">
                  SUGGESTED
                </h4>
                <div className="space-y-1">
                  {suggestedFolders.map((folder) => (
                    <FolderItem
                      key={folder.id}
                      folder={folder}
                      isSelected={selectedFolderId === folder.id}
                      onSelect={handleSelectFolder}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Folders */}
            {recentFolders.length > 0 && !searchQuery && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">
                  RECENT
                </h4>
                <div className="space-y-1">
                  {recentFolders.map((folder) => (
                    <FolderItem
                      key={folder.id}
                      folder={folder}
                      isSelected={selectedFolderId === folder.id}
                      onSelect={handleSelectFolder}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Folders */}
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">
                ALL FOLDERS
              </h4>
              <FolderTree
                folders={filteredFolders}
                expandedFolders={expandedFolders}
                selectedFolderId={selectedFolderId}
                onToggle={handleToggleFolder}
                onSelect={handleSelectFolder}
              />
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">
                TAGS
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="gap-1">
                    {tag.name}
                    <button
                      onClick={() => handleRemoveTag(tag.id)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" className="h-6 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Add tag
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <SheetFooter className="p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleFile} disabled={!selectedFolderId}>
            File {isBulkFiling ? `${items.length} items` : ''}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

interface FolderItemProps {
  folder: TreeDataItem
  isSelected: boolean
  onSelect: (id: string) => void
  indent?: number
}

function FolderItem({
  folder,
  isSelected,
  onSelect,
  indent = 0,
}: FolderItemProps): React.JSX.Element {
  return (
    <button
      onClick={() => onSelect(folder.id)}
      className={cn(
        'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left',
        'hover:bg-accent',
        isSelected && 'bg-accent'
      )}
      style={{ paddingLeft: `${8 + indent * 16}px` }}
    >
      <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <span className="truncate">{folder.name}</span>
      {isSelected && <Check className="h-4 w-4 ml-auto text-primary" />}
    </button>
  )
}

interface FolderTreeProps {
  folders: TreeDataItem[]
  expandedFolders: Set<string>
  selectedFolderId: string | null
  onToggle: (id: string) => void
  onSelect: (id: string) => void
  indent?: number
}

function FolderTree({
  folders,
  expandedFolders,
  selectedFolderId,
  onToggle,
  onSelect,
  indent = 0,
}: FolderTreeProps): React.JSX.Element {
  return (
    <div className="space-y-0.5">
      {folders.map((folder) => {
        const hasChildren = folder.children && folder.children.length > 0
        const isExpanded = expandedFolders.has(folder.id)
        const isSelected = selectedFolderId === folder.id

        return (
          <div key={folder.id}>
            <div
              className={cn(
                'flex items-center gap-1 py-1 rounded-md',
                'hover:bg-accent',
                isSelected && 'bg-accent'
              )}
              style={{ paddingLeft: `${4 + indent * 16}px` }}
            >
              {hasChildren ? (
                <button
                  onClick={() => onToggle(folder.id)}
                  className="h-6 w-6 flex items-center justify-center"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              ) : (
                <div className="w-6" />
              )}

              <button
                onClick={() => onSelect(folder.id)}
                className="flex-1 flex items-center gap-2 text-sm text-left"
              >
                {isExpanded ? (
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Folder className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="truncate">{folder.name}</span>
              </button>

              {isSelected && (
                <Check className="h-4 w-4 text-primary mr-2" />
              )}
            </div>

            {hasChildren && isExpanded && (
              <FolderTree
                folders={folder.children!}
                expandedFolders={expandedFolders}
                selectedFolderId={selectedFolderId}
                onToggle={onToggle}
                onSelect={onSelect}
                indent={indent + 1}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// =============================================================================
// UTILITIES
// =============================================================================

function filterFolderTree(
  folders: TreeDataItem[],
  query: string
): TreeDataItem[] {
  return folders.reduce<TreeDataItem[]>((acc, folder) => {
    const matchesQuery = folder.name.toLowerCase().includes(query)
    const filteredChildren = folder.children
      ? filterFolderTree(folder.children, query)
      : []

    if (matchesQuery || filteredChildren.length > 0) {
      acc.push({
        ...folder,
        children: filteredChildren.length > 0 ? filteredChildren : folder.children,
      })
    }

    return acc
  }, [])
}
```

---

## Acceptance Criteria

- [ ] `filing-panel.tsx` component created
- [ ] Panel slides in from right side
- [ ] Shows single item preview or bulk count
- [ ] AI suggestion section shows when confidence >= 50%
- [ ] Accept button selects suggested folder
- [ ] Folder search filters the tree
- [ ] Recent folders section displays
- [ ] Suggested folders section displays
- [ ] Full folder tree with expand/collapse
- [ ] Folder selection shows checkmark
- [ ] Tags can be added and removed
- [ ] Cancel button closes panel
- [ ] File button is disabled without folder selection
- [ ] File button calls onFile with correct params
- [ ] `pnpm typecheck` passes

---

## Props Interface

```typescript
interface FilingPanelProps {
  isOpen: boolean
  onClose: () => void
  items: InboxItem[]
  folders: TreeDataItem[]
  recentFolders: TreeDataItem[]
  onFile: (itemIds: string[], folderId: string, tags: UserTag[]) => void
}
```

---

## Drag and Drop (Future Enhancement)

The spec mentions drag-and-drop filing to sidebar folders. This can be added later:

```tsx
// In inbox item components
<div
  draggable
  onDragStart={(e) => {
    e.dataTransfer.setData('inbox-item-id', item.id)
  }}
>
  {/* Item content */}
</div>

// In sidebar folder components
<div
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => {
    const itemId = e.dataTransfer.getData('inbox-item-id')
    onFileItem(itemId, folder.id)
  }}
>
  {/* Folder content */}
</div>
```

---

## Testing

```tsx
function FilingPanelTest() {
  const [isOpen, setIsOpen] = useState(false)

  const mockFolders: TreeDataItem[] = [
    {
      id: '1',
      name: 'Work',
      type: 'folder',
      children: [
        { id: '1-1', name: 'Projects', type: 'folder' },
        { id: '1-2', name: 'References', type: 'folder' },
      ],
    },
    { id: '2', name: 'Personal', type: 'folder' },
    { id: '3', name: 'Archive', type: 'folder' },
  ]

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Filing Panel</Button>

      <FilingPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={[mockItem]}
        folders={mockFolders}
        recentFolders={mockFolders.slice(0, 2)}
        onFile={(ids, folderId, tags) => {
          console.log('Filed:', ids, 'to:', folderId, 'with tags:', tags)
          setIsOpen(false)
        }}
      />
    </>
  )
}
```
