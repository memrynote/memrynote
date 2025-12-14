# 07 - Expanded View

## Objective

Build the expanded view for detailed item inspection without opening a separate preview panel. This view provides full content visibility with one item at a time focus, including AI suggestions, tag management, and complete action buttons.

---

## Context

The expanded view is for users who want to review items thoroughly before filing. It shows:
- Full content without truncation
- AI folder suggestions with confidence
- Inline tag editing
- Complete action bar
- Clear visual separation between items

**Dependencies:**
- 01-foundation-types (InboxItem, AISuggestion)
- 03-type-icon-system (TypeIcon badge variant)
- 06-medium-view-types (similar content patterns)

**Blocks:** 08-view-switcher

---

## Specifications

From inbox-layouts.md:

```
3. EXPANDED VIEW (Review)
Purpose: Detailed inspection without opening preview panel
Density: Full content visibility, one item at a time focus

Card Structure:
|- Type Badge: Top-left, pill style (icon + label)
|- Timestamp: Top-right, muted
|- Title: Large, prominent (text-xl, font-semibold)
|- Source: Below title, muted link
|- Hero Content: Full-width media preview
|- Excerpt: Full text excerpt (not truncated)
|- AI Suggestion: Conditional, shows when confident
|- Tag Input: Inline tag pills with add button
+-- Action Bar: Full action buttons at bottom
```

### Layout Example

```
+----------------------------------------------------------------------+
|                                                                      |
|  +----------------------------------------------------------------+  |
|  |                                                                |  |
|  |  [link badge]                                      2 hours ago |  |
|  |                                                                |  |
|  |  How to Build a Second Brain -- Forte Labs                     |  |
|  |  fortelabs.com                                                 |  |
|  |                                                                |  |
|  |  +----------------------------------------------------------+  |  |
|  |  |                                                          |  |  |
|  |  |                    [Hero Image]                          |  |  |
|  |  |                    Full Width                            |  |  |
|  |  |                    ~200px height                         |  |  |
|  |  |                                                          |  |  |
|  |  +----------------------------------------------------------+  |  |
|  |                                                                |  |
|  |  The PARA method helps you organize information by            |  |
|  |  actionability. Instead of organizing by topic, you           |  |
|  |  organize by how actionable each piece of information is...   |  |
|  |                                                                |  |
|  |  -----------------------------------------------------------  |  |
|  |                                                                |  |
|  |  AI Suggestion: 85% confident                                 |  |
|  |  [folder] Research / PKM Methods               [Accept] [x]   |  |
|  |                                                                |  |
|  |  -----------------------------------------------------------  |  |
|  |                                                                |  |
|  |  [tag] [tag] [+ Add Tags]                                     |  |
|  |                                                                |  |
|  |  -----------------------------------------------------------  |  |
|  |                                                                |  |
|  |  [File to Folder]  [Open Original]  [Snooze]  [Delete]        |  |
|  |                                                                |  |
|  +----------------------------------------------------------------+  |
|                                                                      |
|  ------------------ Next Item ------------------                     |
+----------------------------------------------------------------------+
```

---

## Implementation Guide

### File Locations

1. **View container:** `src/renderer/src/components/inbox/expanded-view.tsx`
2. **Single card:** `src/renderer/src/components/inbox/expanded-item.tsx`

### ExpandedItem Component

```tsx
// src/renderer/src/components/inbox/expanded-item.tsx

import { FolderInput, ExternalLink, Clock, Trash2, Check, X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { TypeIcon } from './type-icon'
import type { InboxItem, AISuggestion } from '@/types/inbox'
import { formatRelativeTime, getTagColorClass } from '@/lib/inbox-utils'

// Import type-specific content renderers
import { ExpandedContentLink } from './expanded-content-link'
import { ExpandedContentNote } from './expanded-content-note'
import { ExpandedContentImage } from './expanded-content-image'
import { ExpandedContentVoice } from './expanded-content-voice'
import { ExpandedContentPdf } from './expanded-content-pdf'
import { ExpandedContentWebclip } from './expanded-content-webclip'
import { ExpandedContentFile } from './expanded-content-file'
import { ExpandedContentVideo } from './expanded-content-video'

interface ExpandedItemProps {
  item: InboxItem
  onFile: (id: string) => void
  onOpenOriginal: (id: string) => void
  onSnooze: (id: string) => void
  onDelete: (id: string) => void
  onAcceptSuggestion: (id: string, suggestion: AISuggestion) => void
  onDismissSuggestion: (id: string) => void
  onAddTag: (id: string) => void
  onRemoveTag: (id: string, tagId: string) => void
}

export function ExpandedItem({
  item,
  onFile,
  onOpenOriginal,
  onSnooze,
  onDelete,
  onAcceptSuggestion,
  onDismissSuggestion,
  onAddTag,
  onRemoveTag,
}: ExpandedItemProps): React.JSX.Element {
  const hasHighConfidence = item.aiSuggestion && item.aiSuggestion.confidence >= 80
  const hasMediumConfidence = item.aiSuggestion &&
    item.aiSuggestion.confidence >= 50 &&
    item.aiSuggestion.confidence < 80

  // Render type-specific content
  const renderContent = () => {
    switch (item.type) {
      case 'link':
        return <ExpandedContentLink item={item} />
      case 'note':
        return <ExpandedContentNote item={item} />
      case 'image':
        return <ExpandedContentImage item={item} />
      case 'voice':
        return <ExpandedContentVoice item={item} />
      case 'pdf':
        return <ExpandedContentPdf item={item} />
      case 'webclip':
        return <ExpandedContentWebclip item={item} />
      case 'file':
        return <ExpandedContentFile item={item} />
      case 'video':
        return <ExpandedContentVideo item={item} />
    }
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        {/* Header: Type Badge + Timestamp */}
        <div className="flex items-center justify-between mb-4">
          <TypeIcon type={item.type} variant="badge" />
          <span className="text-sm text-muted-foreground">
            {formatRelativeTime(item.createdAt)}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold mb-1">{item.title}</h2>

        {/* Source URL (for link/webclip types) */}
        {'domain' in item && (
          <a
            href={'url' in item ? item.url : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-4"
          >
            {item.domain}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}

        {/* Type-Specific Content */}
        <div className="my-6">
          {renderContent()}
        </div>

        {/* AI Suggestion Section */}
        {item.aiSuggestion && (
          <>
            <Separator className="my-4" />
            <div
              className={cn(
                'p-4 rounded-lg',
                hasHighConfidence && 'bg-emerald-50 dark:bg-emerald-950/30',
                hasMediumConfidence && 'bg-amber-50 dark:bg-amber-950/30'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  {hasHighConfidence ? '✨' : '💡'} AI Suggestion
                </span>
                <Badge variant="secondary">
                  {item.aiSuggestion.confidence}% confident
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderInput className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {item.aiSuggestion.folderPath}
                  </span>
                </div>

                <div className="flex gap-2">
                  {hasHighConfidence ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => onAcceptSuggestion(item.id, item.aiSuggestion!)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDismissSuggestion(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onFile(item.id)}
                    >
                      Choose a Folder
                    </Button>
                  )}
                </div>
              </div>

              {/* Similar items hint */}
              {item.aiSuggestion.similarItems && item.aiSuggestion.similarItems.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Similar to {item.aiSuggestion.similarItems.length} other items in this folder
                </p>
              )}
            </div>
          </>
        )}

        {/* Tags Section */}
        <Separator className="my-4" />
        <div className="flex items-center gap-2 flex-wrap">
          {item.tags.map(tag => (
            <Badge
              key={tag.id}
              variant="secondary"
              className={cn('gap-1', getTagColorClass(tag.color))}
            >
              {tag.name}
              <button
                onClick={() => onRemoveTag(item.id, tag.id)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() => onAddTag(item.id)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Tags
          </Button>
        </div>

        {/* Action Bar */}
        <Separator className="my-4" />
        <div className="flex items-center gap-2">
          <Button onClick={() => onFile(item.id)}>
            <FolderInput className="h-4 w-4 mr-2" />
            File to Folder
          </Button>

          {('url' in item || 'videoUrl' in item) && (
            <Button variant="outline" onClick={() => onOpenOriginal(item.id)}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Original
            </Button>
          )}

          <Button variant="outline" onClick={() => onSnooze(item.id)}>
            <Clock className="h-4 w-4 mr-2" />
            Snooze
          </Button>

          <div className="flex-1" />

          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

### ExpandedView Container

```tsx
// src/renderer/src/components/inbox/expanded-view.tsx

import { ExpandedItem } from './expanded-item'
import type { InboxItem, AISuggestion } from '@/types/inbox'

interface ExpandedViewProps {
  items: InboxItem[]
  onFile: (id: string) => void
  onOpenOriginal: (id: string) => void
  onSnooze: (id: string) => void
  onDelete: (id: string) => void
  onAcceptSuggestion: (id: string, suggestion: AISuggestion) => void
  onDismissSuggestion: (id: string) => void
  onAddTag: (id: string) => void
  onRemoveTag: (id: string, tagId: string) => void
}

export function ExpandedView({
  items,
  onFile,
  onOpenOriginal,
  onSnooze,
  onDelete,
  onAcceptSuggestion,
  onDismissSuggestion,
  onAddTag,
  onRemoveTag,
}: ExpandedViewProps): React.JSX.Element {
  return (
    <div className="p-6 space-y-6">
      {items.map((item, index) => (
        <div key={item.id}>
          <ExpandedItem
            item={item}
            onFile={onFile}
            onOpenOriginal={onOpenOriginal}
            onSnooze={onSnooze}
            onDelete={onDelete}
            onAcceptSuggestion={onAcceptSuggestion}
            onDismissSuggestion={onDismissSuggestion}
            onAddTag={onAddTag}
            onRemoveTag={onRemoveTag}
          />

          {/* Separator between items */}
          {index < items.length - 1 && (
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">Next Item</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
```

---

## Type-Specific Content Components

Create expanded content components that show full (not truncated) content:

```tsx
// src/renderer/src/components/inbox/expanded-content-link.tsx

import type { InboxItemLink } from '@/types/inbox'

interface ExpandedContentLinkProps {
  item: InboxItemLink
}

export function ExpandedContentLink({ item }: ExpandedContentLinkProps): React.JSX.Element {
  return (
    <div className="space-y-4">
      {/* Full-width hero image */}
      {item.heroImage && (
        <img
          src={item.heroImage}
          alt=""
          className="w-full h-48 object-cover rounded-lg"
        />
      )}

      {/* Full excerpt (not truncated) */}
      {item.excerpt && (
        <p className="text-muted-foreground leading-relaxed">
          {item.excerpt}
        </p>
      )}
    </div>
  )
}

// Create similar components for all 8 types:
// expanded-content-note.tsx
// expanded-content-image.tsx
// expanded-content-voice.tsx
// expanded-content-pdf.tsx
// expanded-content-webclip.tsx
// expanded-content-file.tsx
// expanded-content-video.tsx
```

---

## Acceptance Criteria

- [ ] `expanded-view.tsx` container component created
- [ ] `expanded-item.tsx` card component created
- [ ] Type badge displays correctly with icon and label
- [ ] Timestamp shows in top-right corner
- [ ] Title uses text-xl font-semibold
- [ ] Source link shows for applicable types
- [ ] Full content renders without truncation
- [ ] AI suggestion section shows for high/medium confidence
- [ ] Accept/Dismiss buttons work for high confidence
- [ ] "Choose a Folder" button shows for medium confidence
- [ ] Tags render with remove buttons
- [ ] "Add Tags" button triggers callback
- [ ] Action bar has all 4 buttons (File, Open, Snooze, Delete)
- [ ] "Next Item" separator shows between cards
- [ ] All 8 expanded content type components created
- [ ] `pnpm typecheck` passes

---

## AI Suggestion Confidence Levels

| Confidence | Visual Treatment | Actions |
|------------|------------------|---------|
| >= 80% | Green bg, "Accept" button | Accept / Dismiss |
| 50-79% | Amber bg, folder options | Choose a Folder |
| < 50% | No suggestion shown | Manual selection |

---

## Notes

- The expanded view does NOT have selection checkboxes (no bulk operations)
- Each card is self-contained with all actions
- This view is best for sequential review of items
- Consider keyboard navigation (up/down arrows) in prompt 17
