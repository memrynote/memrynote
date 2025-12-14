# 06 — Type-Specific Renderers

## Objective

Implement the preview content renderers for each of the 8 content types. These components render inside the MediumCard to show type-appropriate previews (link cards with images, voice memos with waveforms, etc.).

## Prerequisites

- **01-inbox-types.md** — Type definitions with type-specific properties
- **03-type-icons.md** — Color system
- **05-medium-view.md** — MediumCard shell

## What We're Building

8 renderer components, one for each type:
- `LinkPreview` — Hero image + excerpt
- `NotePreview` — Text excerpt
- `ImagePreview` — Thumbnail
- `VoicePreview` — Waveform + transcription
- `PdfPreview` — Page thumbnail + text
- `WebclipPreview` — Highlighted quote
- `FilePreview` — File icon + metadata
- `VideoPreview` — Thumbnail + duration

Plus a `TypeRenderer` dispatcher component.

## Placement

| What | Where |
|------|-------|
| All renderers | `src/renderer/src/components/inbox/type-renderers/` (NEW directory) |
| Each type | `link-preview.tsx`, `note-preview.tsx`, etc. |
| Dispatcher | `type-renderer.tsx` |
| Index | `index.ts` exports all |

## Specifications

### TypeRenderer Dispatcher

A component that takes an item and renders the appropriate preview:

```
<TypeRenderer item={item} />

→ Internally: switch(item.type) → <LinkPreview>, <NotePreview>, etc.
```

---

### 1. LinkPreview

```
┌──────────┐
│ [Hero    │  "The PARA method helps you organize
│  Image]  │   information by actionability..."
└──────────┘
```

**Layout:** Side-by-side (image left, excerpt right)
**Elements:**
- Hero image thumbnail: `w-20 h-14 rounded object-cover`
- Excerpt: 2-3 lines, `line-clamp-3`
- Fallback: Show domain favicon if no hero image

---

### 2. NotePreview

```
"Discussed roadmap priorities. Key decisions:
 1) Launch inbox feature by end of month
 2) Defer AI suggestions to v2..."
```

**Layout:** Text block
**Elements:**
- First 2-3 lines of note content
- `line-clamp-3` for truncation
- `text-secondary-foreground`

---

### 3. ImagePreview

```
┌─────────────────────────────────┐
│                                 │
│        [Image Thumbnail]        │
│         max-h-40                │
│                                 │
└─────────────────────────────────┘
```

**Layout:** Centered thumbnail
**Elements:**
- Image preview: `max-h-40 w-auto rounded`
- Aspect ratio preserved
- Click to preview full size

---

### 4. VoicePreview

```
▁▂▃▅▇▅▃▂▁▂▃▅▆▇▆▅▃▂▁▂▃▅▇▅▃▂▁▂▃▅▆▇▆▅▃▂
[▶]  0:00 ─────────○───────────── 2:34

💬 "I was thinking about the new feature..."
   (auto-transcribed)
```

**Layout:** Stacked (waveform, playback, transcription)
**Elements:**
- Waveform visualization: bars representing audio levels
- Play button with progress bar
- Duration display
- Transcription excerpt (if available)
- "(auto-transcribed)" label if AI-generated

---

### 5. PdfPreview

```
┌──────────┐
│ [Page 1  │  "Quarterly Revenue Summary
│  Preview]│   Total Revenue: $2.4M..."
└──────────┘
```

**Layout:** Side-by-side (thumbnail left, text right)
**Elements:**
- First page thumbnail: `w-16 h-20 rounded border`
- Text preview from first page
- Page count badge

---

### 6. WebclipPreview

```
┃ "The key insight is that personal knowledge
┃  management isn't about storage—it's about
┃  retrieval and connection."

+ 1 more highlight
```

**Layout:** Quote block
**Elements:**
- Vertical bar indicator: `border-l-2 border-primary pl-3`
- First highlight excerpt
- "+" badge if multiple highlights

---

### 7. FilePreview

```
📄  project-proposal.docx
    Microsoft Word Document
```

**Layout:** Icon + filename
**Elements:**
- Large file type icon based on extension
- Full filename
- File type description
- Minimal — files don't have rich previews

---

### 8. VideoPreview

```
┌─────────────────────────────────┐
│           ▶                     │
│      [Video Thumbnail]          │
│                          5:23   │
└─────────────────────────────────┘
```

**Layout:** Thumbnail with overlay
**Elements:**
- Video thumbnail with play icon overlay
- Duration badge in corner
- Source indicator (YouTube, Vimeo, Local)

---

### Waveform Component

For voice memos, create a simple waveform visualization:
- Array of bars with varying heights
- Can be generated from audio data or use placeholder
- Subtle animation on hover
- Colors: `bg-violet-300` bars on `bg-violet-100` track

### Empty/Loading States

Each renderer should handle:
- **Missing data:** Show placeholder/fallback
- **Loading:** Skeleton animation
- **Error:** Graceful degradation

## Design System Alignment

| Element | Style |
|---------|-------|
| Image thumbnails | `rounded object-cover` |
| Text excerpts | `text-sm text-secondary-foreground line-clamp-3` |
| Quote borders | `border-l-2 border-primary` |
| Duration badges | `text-xs bg-black/60 text-white px-1.5 py-0.5 rounded` |
| Waveform | Type-specific color from config |

## Acceptance Criteria

- [ ] TypeRenderer dispatches to correct component
- [ ] LinkPreview shows image + excerpt
- [ ] NotePreview shows text excerpt
- [ ] ImagePreview shows thumbnail
- [ ] VoicePreview shows waveform + transcription
- [ ] PdfPreview shows page thumbnail + text
- [ ] WebclipPreview shows quote with indicator
- [ ] FilePreview shows icon + filename
- [ ] VideoPreview shows thumbnail + duration
- [ ] All handle missing data gracefully
- [ ] Consistent styling across all types
- [ ] All exported from index.ts

## Next Prompt

**07-expanded-view.md** — Build the expanded/review view with full details and inline actions.
