# 13 — Filing Data Model

## Objective

Define the data structures for folders, tags, and how inbox items map to them. This is the underlying data model that the filing panel UI (next prompt) will use.

## Prerequisites

- **01-inbox-types.md** — Base item types

## What We're Building

Data models for:
1. **Folder System** — Hierarchical folder tree
2. **Tag System** — Flat tags with colors
3. **Item Associations** — How items link to folders/tags
4. **AI Suggestions** — Destination recommendation data
5. **Recent Tracking** — Recently used folders/tags

## Placement

| What | Where |
|------|-------|
| Data types | `src/renderer/src/data/filing-types.ts` (NEW) |
| Sample data | `src/renderer/src/data/filing-data.ts` (NEW) |
| Utils | `src/renderer/src/lib/filing-utils.ts` (NEW) |

## Specifications

### Folder Data Model

```
interface Folder {
  id: string
  name: string
  parentId: string | null      // null = root level
  path: string                 // "Work / Projects / Alpha"
  icon?: string                // Optional custom icon
  color?: string               // Optional color
  createdAt: Date
  itemCount: number            // Number of items filed here
}
```

**Hierarchy Rules:**
- Folders can nest to any depth
- Each folder has unique `id`
- `path` is computed: parent names joined by " / "
- Root folders have `parentId: null`

### Folder Tree Example

```
📁 Work (id: "work")
   ├── 📁 Projects (id: "work-projects", parentId: "work")
   │   ├── 📁 Alpha (id: "work-projects-alpha")
   │   └── 📁 Beta (id: "work-projects-beta")
   └── 📁 References (id: "work-refs")
📁 Personal (id: "personal")
📁 Archive (id: "archive")
📁 Unsorted (id: "unsorted")  // Special: catch-all folder
```

---

### Tag Data Model

```
interface Tag {
  id: string
  name: string                 // Display name: "productivity"
  color: TagColor              // Color key
  usageCount: number           // Times applied
  createdAt: Date
}

type TagColor =
  | 'red' | 'orange' | 'yellow' | 'green'
  | 'blue' | 'purple' | 'gray'
```

**Tag Rules:**
- Tags are flat (no hierarchy)
- Tag names are unique (case-insensitive)
- Each tag has assigned color
- Colors from predefined palette

### Tag Color Mapping

```
TAG_COLORS = {
  red:    { bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  green:  { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500' },
  blue:   { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  gray:   { bg: 'bg-gray-100',   text: 'text-gray-700',   dot: 'bg-gray-500' },
}
```

---

### Item ↔ Folder Association

When an item is "filed":

```
// On InboxItem:
interface InboxItem {
  // ... existing properties
  folderId: string | null      // null = still in inbox (unfiled)
  filedAt: Date | null         // When it was filed
}
```

**Filing an item:**
1. Set `folderId` to destination folder ID
2. Set `filedAt` to current timestamp
3. Item may remain visible in inbox or be removed (configurable)
4. Increment folder's `itemCount`

---

### Item ↔ Tag Association

Tags are stored on the item:

```
interface InboxItem {
  // ... existing properties
  tagIds: string[]             // Array of tag IDs
}
```

**Tagging behavior:**
- Items can have 0 to many tags
- Tags don't remove items from inbox
- Tags are independent of folders

---

### AI Suggestion Data

```
interface FolderSuggestion {
  folderId: string
  confidence: number           // 0-100
  reason: string               // "Similar to 5 items in this folder"
  similarItems: string[]       // IDs of similar items in folder
}

interface AISuggestions {
  primary: FolderSuggestion | null      // Highest confidence
  alternatives: FolderSuggestion[]      // Other possibilities
}
```

**Confidence Levels:**
- ≥80%: Show as strong suggestion with "Accept" button
- 50-79%: Show as possibilities to choose from
- <50%: Don't show AI suggestion

**Suggestion Factors:**
- Content similarity to items in folder
- Domain matching (for links)
- Tag overlap
- User's recent filing patterns

---

### Recent Tracking

```
interface RecentFolders {
  folderIds: string[]          // Last 5-10 used folders
  updatedAt: Date
}

interface RecentTags {
  tagIds: string[]             // Last 10 used tags
  updatedAt: Date
}
```

**Update rules:**
- Add to front when used
- Remove duplicates
- Cap at max length
- Persist to localStorage

---

### Utility Functions

```
// Folder utils
getFolderPath(folders: Folder[], folderId: string): string
getFolderChildren(folders: Folder[], parentId: string): Folder[]
getFolderAncestors(folders: Folder[], folderId: string): Folder[]
searchFolders(folders: Folder[], query: string): Folder[]

// Tag utils
getTagByName(tags: Tag[], name: string): Tag | null
searchTags(tags: Tag[], query: string): Tag[]
getTagColor(tag: Tag): TagColorConfig

// Filing utils
fileItem(item: InboxItem, folderId: string): InboxItem
addTagToItem(item: InboxItem, tagId: string): InboxItem
removeTagFromItem(item: InboxItem, tagId: string): InboxItem

// Suggestion utils
getSuggestedFolder(item: InboxItem, folders: Folder[], history: FiledItem[]): FolderSuggestion | null
```

---

### Sample Data

Create sample folders and tags for development:

**Folders:**
- Work / Projects / Alpha
- Work / Projects / Beta
- Work / References
- Personal / Health
- Personal / Finance
- Research / PKM
- Research / AI
- Archive
- Unsorted

**Tags:**
- productivity (blue)
- urgent (red)
- reading (green)
- idea (yellow)
- meeting (purple)
- follow-up (orange)

---

### State Management

Filing state lives in the page component:

```
interface FilingState {
  folders: Folder[]
  tags: Tag[]
  recentFolders: string[]
  recentTags: string[]
}
```

Consider using a context if filing is needed across multiple components.

## Design System Alignment

- Tag colors chosen to work with warm beige background
- Folder icons use Lucide `Folder`, `FolderOpen`
- Path separator: " / " (with spaces)

## Acceptance Criteria

- [ ] `Folder` interface defined with all properties
- [ ] `Tag` interface defined with color support
- [ ] Item has `folderId` and `tagIds` properties
- [ ] `FolderSuggestion` interface for AI recommendations
- [ ] `TAG_COLORS` mapping defined
- [ ] Folder utility functions implemented
- [ ] Tag utility functions implemented
- [ ] Sample folders created (nested structure)
- [ ] Sample tags created with colors
- [ ] Recent tracking structure defined
- [ ] All types exported

## Next Prompt

**14-filing-panel.md** — Build the filing panel UI using this data model.
