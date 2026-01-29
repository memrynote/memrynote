# Editor Integration

## Overview

Memry uses two different rich-text editors:

| Editor | Use Case | Location |
|--------|----------|----------|
| **TipTap** | Journal entries | `src/renderer/src/components/journal/journal-editor.tsx` |
| **BlockNote** | Notes (content area) | `src/renderer/src/components/note/content-area/ContentArea.tsx` |

Both support wiki-links and real-time CRDT synchronization.

## TipTap (Journal Editor)

**Location**: `src/renderer/src/components/journal/journal-editor.tsx`

### Props Interface

```typescript
interface JournalEditorProps {
  content?: string           // HTML content
  placeholder?: string       // Empty state text
  isActive?: boolean         // Day selection state
  onContentChange?: (html: string) => void
  className?: string
  readOnly?: boolean
}
```

### Extensions

```typescript
extensions: [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    bulletList: { keepMarks: true },
    orderedList: { keepMarks: true }
  }),
  Underline,
  Link.configure({ openOnClick: false }),
  Placeholder.configure({ placeholder }),
  WikiLink.configure({ suggestion: {...} }),
  Tag.configure({ suggestion: {...} })
]
```

### WikiLink TipTap Extension

**Location**: `src/renderer/src/components/journal/extensions/wiki-link/wiki-link.ts`

```typescript
WikiLink = Node.create<WikiLinkOptions>({
  name: 'wikiLink',
  group: 'inline',
  inline: true,
  selectable: true,
  atom: true,  // Indivisible unit

  addAttributes() {
    return {
      href: { ... },      // Link target ID
      title: { ... },     // Display text
      exists: { ... }     // Whether target exists
    }
  },

  addOptions() {
    return {
      suggestion: {
        char: '[[',       // Trigger character
        command: ({ editor, range, props }) => {
          editor.chain()
            .deleteRange(range)
            .insertContent({ type: this.name, attrs: props })
            .run()
        }
      }
    }
  }
})
```

### Autocomplete Integration

Uses `tippy` for popup positioning:

```typescript
WikiLink.configure({
  suggestion: {
    items: ({ query }) => searchPages(query),
    render: () => ({
      onStart: (props) => {
        // Create ReactRenderer with WikiLinkAutocomplete
        // Create tippy popup
      },
      onUpdate: (props) => { /* Update popup position */ },
      onKeyDown: (props) => { /* Handle Escape, arrow keys */ },
      onExit: () => { /* Cleanup */ }
    })
  }
})
```

## BlockNote (Content Area)

**Location**: `src/renderer/src/components/note/content-area/ContentArea.tsx`

### WikiLink Inline Content

**Location**: `src/renderer/src/components/note/content-area/wiki-link.tsx`

```typescript
WikiLink = createInlineContentSpec(
  {
    type: 'wikiLink',
    propSchema: {
      target: { default: '' },
      alias: { default: '' }
    },
    content: 'none'
  },
  {
    render: (inlineContent) => {
      const dom = document.createElement('span')
      dom.className = 'wiki-link'
      dom.setAttribute('data-wiki-link', '')
      dom.setAttribute('data-target', inlineContent.props.target)
      dom.setAttribute('data-alias', inlineContent.props.alias)
      dom.textContent = inlineContent.props.alias || inlineContent.props.target
      return { dom }
    },
    parse: (element) => {
      // Parse from data attributes or text content
    },
    toExternalHTML: (inlineContent) => {
      // Export as [[target|alias]] text
    }
  }
)
```

### Wiki-Link Menu

ContentArea provides autocomplete via `WikiLinkMenu`:

```typescript
const WikiLinkMenu = (props) => {
  // Renders suggestion list
  // Handles selection
}

// Usage in ContentArea
getWikiLinkItems = async (query: string) => {
  return searchPages(query)
}
```

## CRDT Integration

### useYjsDoc Hook

**Location**: `src/renderer/src/hooks/use-yjs-doc.ts`

```typescript
interface UseYjsDocResult {
  doc: Y.Doc | null
  provider: YjsIPCProvider | null
  synced: boolean
  error: Error | null
  retry: () => void
}

function useYjsDoc(noteId: string | null): UseYjsDocResult
```

### Usage Pattern

```typescript
function NoteEditor({ noteId }) {
  const { doc, synced, error, retry } = useYjsDoc(noteId)

  if (error) return <ErrorState onRetry={retry} />
  if (!synced) return <LoadingState />

  // Y.Doc is synced, render editor
  return <BlockNoteEditor doc={doc} />
}
```

### Y.Doc Lifecycle

1. **Create**: `new Y.Doc({ guid: noteId })`
2. **Connect**: `createYjsIPCProvider(noteId, ydoc).connect()`
3. **Sync**: Provider emits `'synced'` when ready
4. **Use**: Editor reads/writes to Y.Doc
5. **Cleanup**: `provider.destroy()`, `ydoc.destroy()`

## Wiki-Link Styling

### CSS Classes

```css
.wiki-link {
  /* Base link styling */
  color: var(--primary);
  cursor: pointer;
}

.wiki-link-broken {
  /* Broken link styling */
  color: var(--muted-foreground);
  text-decoration: underline dashed;
}
```

### Data Attributes

| Attribute | Purpose |
|-----------|---------|
| `data-wiki-link` | Identifies wiki-link elements |
| `data-target` | Link target (note title) |
| `data-alias` | Display text (if different) |
| `data-exists` | `'true'` or `'false'` for styling |
| `data-href` | Resolved note ID |

## Content Normalization

ContentArea normalizes content on load:

```typescript
// Normalize wiki-links in BlockNote blocks
normalizeWikiLinks(blocks)

// Split text with embedded [[links]] into proper blocks
splitTextWithWikiLinks(text)

// Handle inline content normalization
normalizeInlineContent(content)
```

## Key Differences

| Feature | TipTap (Journal) | BlockNote (Notes) |
|---------|------------------|-------------------|
| Content format | HTML | JSON blocks |
| Wiki-link impl | TipTap Node extension | Inline content spec |
| Trigger | `[[` via Suggestion plugin | Custom slash menu |
| Output | `<span data-wiki-link>` | `[[target\|alias]]` |
