# 06 - Medium View Type-Specific Layouts

## Objective

Implement the 8 type-specific content renderers for the medium view. Each content type has unique metadata and visual treatment that must be rendered appropriately.

---

## Context

Building on the base medium item structure from prompt 05, this prompt implements the detailed content layouts for:
1. Link - Rich preview with hero image
2. Note - Text excerpt with word count
3. Image - Thumbnail preview with dimensions
4. Voice - Waveform visualization with playback
5. PDF - First page preview with page count
6. Webclip - Highlighted excerpts with source
7. File - File icon with extension and size
8. Video - Thumbnail with play icon and duration

**Dependencies:**
- 01-foundation-types (type-specific interfaces)
- 05-medium-view-base (MediumItem wrapper)

**Blocks:** 07-expanded-view (similar patterns)

---

## Specifications

From inbox-layouts.md, each type has a specific layout:

### Link Layout
```
+----------------------------------------------------------------------+
|  [ ]                                                                 |
|     [link]  How to Build a Second Brain -- Forte Labs                |
|             fortelabs.com . 2 hours ago                              |
|             +----------+                                             |
|             | [Hero    |  "The PARA method helps you organize        |
|             |  Image]  |   information by actionability..."          |
|             +----------+                                             |
|                                                        [File] [:] |
+----------------------------------------------------------------------+
```

### Note Layout
```
+----------------------------------------------------------------------+
|  [ ]                                                                 |
|     [note]  Meeting notes: Q4 planning session                       |
|             3 hours ago . 847 words                                  |
|                                                                      |
|             "Discussed roadmap priorities. Key decisions:            |
|              1) Launch inbox feature by end of month                 |
|              2) Defer AI suggestions to v2..."                       |
|                                                        [File] [:] |
+----------------------------------------------------------------------+
```

### Image Layout
```
+----------------------------------------------------------------------+
|  [ ]                                                                 |
|     [image] whiteboard-sketch.png                                    |
|             5 hours ago . 1920x1080 . 2.4 MB                         |
|                                                                      |
|             +-------------------------------------+                  |
|             |                                     |                  |
|             |        [Image Thumbnail]            |                  |
|             |         ~160px height               |                  |
|             |                                     |                  |
|             +-------------------------------------+                  |
|                                                        [File] [:] |
+----------------------------------------------------------------------+
```

### Voice Layout
```
+----------------------------------------------------------------------+
|  [ ]                                                                 |
|     [voice] Voice memo -- Project ideas                              |
|             1 day ago . 2:34 duration                                |
|                                                                      |
|             [waveform visualization bars]                            |
|             [>]  0:00 ---------o----------- 2:34                     |
|                                                                      |
|             "I was thinking about the new feature..."                |
|             (auto-transcribed)                                       |
|                                                        [File] [:] |
+----------------------------------------------------------------------+
```

---

## Implementation Guide

### File Locations

Create in `src/renderer/src/components/inbox/`:
- `medium-item-link.tsx`
- `medium-item-note.tsx`
- `medium-item-image.tsx`
- `medium-item-voice.tsx`
- `medium-item-pdf.tsx`
- `medium-item-webclip.tsx`
- `medium-item-file.tsx`
- `medium-item-video.tsx`

### MediumItemLink

```tsx
// src/renderer/src/components/inbox/medium-item-link.tsx

import type { InboxItemLink } from '@/types/inbox'

interface MediumItemLinkProps {
  item: InboxItemLink
}

export function MediumItemLink({ item }: MediumItemLinkProps): React.JSX.Element {
  return (
    <div className="mt-1 space-y-2">
      {/* Meta line */}
      <p className="text-sm text-muted-foreground">
        {item.domain}
      </p>

      {/* Hero image + excerpt row */}
      <div className="flex gap-3">
        {item.heroImage && (
          <img
            src={item.heroImage}
            alt=""
            className="w-24 h-16 object-cover rounded-md flex-shrink-0"
          />
        )}
        {item.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            "{item.excerpt}"
          </p>
        )}
      </div>
    </div>
  )
}
```

### MediumItemNote

```tsx
// src/renderer/src/components/inbox/medium-item-note.tsx

import type { InboxItemNote } from '@/types/inbox'

interface MediumItemNoteProps {
  item: InboxItemNote
}

export function MediumItemNote({ item }: MediumItemNoteProps): React.JSX.Element {
  return (
    <div className="mt-1 space-y-2">
      {/* Meta line */}
      <p className="text-sm text-muted-foreground">
        {item.wordCount} words
      </p>

      {/* Content excerpt */}
      <p className="text-sm text-muted-foreground line-clamp-3">
        "{item.content}"
      </p>
    </div>
  )
}
```

### MediumItemImage

```tsx
// src/renderer/src/components/inbox/medium-item-image.tsx

import type { InboxItemImage } from '@/types/inbox'
import { formatFileSize } from '@/lib/inbox-utils'

interface MediumItemImageProps {
  item: InboxItemImage
}

export function MediumItemImage({ item }: MediumItemImageProps): React.JSX.Element {
  return (
    <div className="mt-1 space-y-2">
      {/* Meta line */}
      <p className="text-sm text-muted-foreground">
        {item.dimensions.width}x{item.dimensions.height} . {formatFileSize(item.fileSize)}
      </p>

      {/* Image thumbnail */}
      <div className="relative w-full max-w-md">
        <img
          src={item.src}
          alt={item.title}
          className="w-full h-40 object-cover rounded-md border"
        />
      </div>
    </div>
  )
}
```

### MediumItemVoice

```tsx
// src/renderer/src/components/inbox/medium-item-voice.tsx

import { useState } from 'react'
import { Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import type { InboxItemVoice } from '@/types/inbox'
import { formatDuration } from '@/lib/inbox-utils'

interface MediumItemVoiceProps {
  item: InboxItemVoice
}

export function MediumItemVoice({ item }: MediumItemVoiceProps): React.JSX.Element {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  return (
    <div className="mt-1 space-y-2">
      {/* Meta line */}
      <p className="text-sm text-muted-foreground">
        {formatDuration(item.duration)} duration
      </p>

      {/* Waveform visualization (simplified) */}
      <div className="flex items-center gap-1 h-8">
        {item.waveformData?.map((value, i) => (
          <div
            key={i}
            className="w-1 bg-violet-400 rounded-full"
            style={{ height: `${Math.max(4, value * 32)}px` }}
          />
        )) || (
          // Default waveform if no data
          Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="w-1 bg-violet-400/50 rounded-full"
              style={{ height: `${Math.random() * 24 + 8}px` }}
            />
          ))
        )}
      </div>

      {/* Playback controls */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" />
          )}
        </Button>
        <span className="text-xs text-muted-foreground w-10">
          {formatDuration(Math.floor(progress * item.duration))}
        </span>
        <Slider
          value={[progress * 100]}
          max={100}
          step={1}
          className="flex-1"
          onValueChange={([v]) => setProgress(v / 100)}
        />
        <span className="text-xs text-muted-foreground w-10">
          {formatDuration(item.duration)}
        </span>
      </div>

      {/* Transcription preview */}
      {item.transcription && (
        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground line-clamp-2">
            <span className="font-medium">Transcription:</span> "{item.transcription}"
          </p>
        </div>
      )}
    </div>
  )
}
```

### MediumItemPdf

```tsx
// src/renderer/src/components/inbox/medium-item-pdf.tsx

import { FileText } from 'lucide-react'
import type { InboxItemPdf } from '@/types/inbox'
import { formatFileSize } from '@/lib/inbox-utils'

interface MediumItemPdfProps {
  item: InboxItemPdf
}

export function MediumItemPdf({ item }: MediumItemPdfProps): React.JSX.Element {
  return (
    <div className="mt-1 space-y-2">
      {/* Meta line */}
      <p className="text-sm text-muted-foreground">
        {item.pageCount} pages . {formatFileSize(item.fileSize)}
      </p>

      {/* PDF preview */}
      <div className="flex gap-3">
        {item.firstPageThumb ? (
          <img
            src={item.firstPageThumb}
            alt="First page"
            className="w-20 h-28 object-cover rounded border shadow-sm"
          />
        ) : (
          <div className="w-20 h-28 bg-muted rounded border flex items-center justify-center">
            <FileText className="h-8 w-8 text-red-500" />
          </div>
        )}
        {item.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-4">
            "{item.excerpt}"
          </p>
        )}
      </div>
    </div>
  )
}
```

### MediumItemWebclip

```tsx
// src/renderer/src/components/inbox/medium-item-webclip.tsx

import { ExternalLink } from 'lucide-react'
import type { InboxItemWebclip } from '@/types/inbox'

interface MediumItemWebclipProps {
  item: InboxItemWebclip
}

export function MediumItemWebclip({ item }: MediumItemWebclipProps): React.JSX.Element {
  return (
    <div className="mt-1 space-y-2">
      {/* Meta line */}
      <p className="text-sm text-muted-foreground flex items-center gap-1">
        <ExternalLink className="h-3 w-3" />
        {item.sourceDomain} . {item.highlights.length} highlight{item.highlights.length !== 1 ? 's' : ''}
      </p>

      {/* Highlighted excerpts */}
      <div className="space-y-2">
        {item.highlights.slice(0, 2).map((highlight, index) => (
          <blockquote
            key={index}
            className="border-l-2 border-cyan-400 pl-3 py-1 text-sm text-muted-foreground"
          >
            "{highlight}"
          </blockquote>
        ))}
        {item.highlights.length > 2 && (
          <p className="text-xs text-muted-foreground">
            + {item.highlights.length - 2} more highlight{item.highlights.length - 2 !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  )
}
```

### MediumItemFile

```tsx
// src/renderer/src/components/inbox/medium-item-file.tsx

import { FileIcon, FileArchive, FileSpreadsheet, FileCode } from 'lucide-react'
import type { InboxItemFile } from '@/types/inbox'
import { formatFileSize } from '@/lib/inbox-utils'

interface MediumItemFileProps {
  item: InboxItemFile
}

function getFileIcon(extension: string) {
  const ext = extension.toLowerCase()
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return FileArchive
  if (['csv', 'xlsx', 'xls'].includes(ext)) return FileSpreadsheet
  if (['js', 'ts', 'py', 'json', 'html', 'css'].includes(ext)) return FileCode
  return FileIcon
}

export function MediumItemFile({ item }: MediumItemFileProps): React.JSX.Element {
  const Icon = getFileIcon(item.extension)

  return (
    <div className="mt-1 space-y-2">
      {/* Meta line */}
      <p className="text-sm text-muted-foreground">
        .{item.extension.toUpperCase()} . {formatFileSize(item.fileSize)}
      </p>

      {/* File representation */}
      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
        <Icon className="h-8 w-8 text-stone-500" />
        <span className="text-sm font-mono truncate">{item.fileName}</span>
      </div>
    </div>
  )
}
```

### MediumItemVideo

```tsx
// src/renderer/src/components/inbox/medium-item-video.tsx

import { Play, ExternalLink } from 'lucide-react'
import type { InboxItemVideo } from '@/types/inbox'
import { formatDuration } from '@/lib/inbox-utils'

interface MediumItemVideoProps {
  item: InboxItemVideo
}

export function MediumItemVideo({ item }: MediumItemVideoProps): React.JSX.Element {
  return (
    <div className="mt-1 space-y-2">
      {/* Meta line */}
      <p className="text-sm text-muted-foreground flex items-center gap-1">
        {formatDuration(item.duration)}
        {item.source && (
          <>
            {' . '}
            <ExternalLink className="h-3 w-3" />
            {item.source}
          </>
        )}
      </p>

      {/* Video thumbnail */}
      <div className="relative w-full max-w-md group cursor-pointer">
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-40 object-cover rounded-md"
          />
        ) : (
          <div className="w-full h-40 bg-muted rounded-md flex items-center justify-center">
            <Play className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="h-6 w-6 text-black ml-1" />
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/75 rounded text-xs text-white font-medium">
          {formatDuration(item.duration)}
        </div>
      </div>
    </div>
  )
}
```

---

## Utility Functions

Add to `src/renderer/src/lib/inbox-utils.ts`:

```typescript
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}
```

---

## Acceptance Criteria

- [ ] All 8 type-specific components created
- [ ] Link: Shows domain, hero image (optional), excerpt
- [ ] Note: Shows word count, content excerpt
- [ ] Image: Shows dimensions, file size, thumbnail
- [ ] Voice: Shows duration, waveform, playback controls, transcription
- [ ] PDF: Shows page count, file size, first page thumbnail
- [ ] Webclip: Shows source domain, highlighted excerpts
- [ ] File: Shows extension, file size, file icon
- [ ] Video: Shows duration, source, thumbnail with play overlay
- [ ] All components use consistent spacing (mt-1, space-y-2)
- [ ] Text truncation works correctly (line-clamp-*)
- [ ] `pnpm typecheck` passes

---

## Testing

Verify each type renders correctly with sample data:

```tsx
const testItems = {
  link: {
    id: '1', type: 'link', title: 'Test Link',
    url: 'https://example.com/article',
    domain: 'example.com',
    heroImage: 'https://picsum.photos/400/200',
    excerpt: 'This is a preview excerpt...',
    // ... other required fields
  },
  // ... other types
}
```
