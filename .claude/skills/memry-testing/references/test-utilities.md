# Test Utilities Reference

## Database Utilities

**Source:** `tests/utils/test-db.ts`

### createTestDataDb()

Creates an in-memory SQLite database equivalent to `data.db` with all migrations applied.

```typescript
import { createTestDataDb, TestDb, TestDatabaseResult } from '@tests/utils/test-db'

const { db, sqlite, close } = createTestDataDb()
// db: Drizzle ORM instance with schema
// sqlite: Raw better-sqlite3 instance
// close: Cleanup function

afterEach(() => close())
```

### createTestIndexDb()

Creates an in-memory SQLite database equivalent to `index.db` (search index, FTS5).

```typescript
import { createTestIndexDb } from '@tests/utils/test-db'

const { db, close } = createTestIndexDb()
```

### createTestDatabases()

Creates both data and index databases for integration tests.

```typescript
import { createTestDatabases } from '@tests/utils/test-db'

const { data, index, closeAll } = createTestDatabases()
// data.db, index.db available
// closeAll() cleans up both

afterEach(() => closeAll())
```

### Seeding Functions

```typescript
import {
  seedInboxProject,
  seedProjects,
  seedTestData,
  seedInboxItem,
  seedInboxItems,
  seedInboxItemTags,
  seedInboxStats
} from '@tests/utils/test-db'

// Required for tasks (creates inbox project)
const inboxId = seedInboxProject(db)

// Create N sample projects
const projectIds = seedProjects(db, 3)  // ['project-0', 'project-1', 'project-2']

// Full test data setup
const { projectId, statusIds, taskIds } = seedTestData(db)
// statusIds: { todo, inProgress, done }
// taskIds: ['task-1', 'task-2']

// Inbox items
const itemId = seedInboxItem(db, {
  id: 'custom-id',
  type: 'link',
  title: 'Test Link',
  content: 'Description',
  sourceUrl: 'https://example.com',
  metadata: { key: 'value' }
})

// Multiple inbox items
const itemIds = seedInboxItems(db, [
  { type: 'note', title: 'Note 1' },
  { type: 'link', title: 'Link 1', sourceUrl: 'https://...' }
])

// Tags for inbox item
seedInboxItemTags(db, itemId, ['tag1', 'tag2'])

// Inbox stats for date
seedInboxStats(db, '2026-01-15', {
  captureCountLink: 5,
  processedCount: 3
})
```

### SeedInboxItemOptions

```typescript
interface SeedInboxItemOptions {
  id?: string
  type?: string           // 'note' | 'link' | 'image' | etc.
  title?: string
  content?: string
  createdAt?: string      // ISO timestamp
  filedAt?: string
  filedTo?: string
  filedAction?: string
  snoozedUntil?: string
  snoozeReason?: string
  archivedAt?: string
  sourceUrl?: string
  metadata?: Record<string, unknown>
}
```

---

## Vault Utilities

**Source:** `tests/utils/test-vault.ts`

### createTestVault()

Creates a temporary vault directory with the full Memry structure.

```typescript
import { createTestVault, TestVaultResult } from '@tests/utils/test-vault'

const vault = createTestVault('my-test')
// vault.path         - Root directory
// vault.memryDir     - .memry folder
// vault.notesDir     - notes folder
// vault.journalDir   - journal folder
// vault.attachmentsDir - attachments folder
// vault.dataDbPath   - Path to data.db
// vault.indexDbPath  - Path to index.db
// vault.configPath   - Path to config.json
// vault.cleanup()    - Removes temp directory

afterEach(() => vault.cleanup())
```

### createTestNote()

Creates a markdown note file with frontmatter.

```typescript
import { createTestNote, CreateNoteOptions } from '@tests/utils/test-vault'

const filePath = createTestNote(vault, {
  id: 'note-123',        // optional, auto-generated
  title: 'My Note',      // required
  content: '# Hello',    // optional
  tags: ['tag1', 'tag2'], // optional
  folder: 'subfolder',   // optional, relative to notesDir
  properties: {          // optional, extra frontmatter
    status: 'draft',
    priority: 1
  }
})
```

### createTestJournalEntry()

Creates a journal entry file in the correct year/month structure.

```typescript
import { createTestJournalEntry } from '@tests/utils/test-vault'

const filePath = createTestJournalEntry(vault, '2026-01-15', 'Journal content here')
// Creates: journal/2026/01/2026-01-15.md
```

### readTestNote()

Reads and parses a note file for assertions.

```typescript
import { readTestNote } from '@tests/utils/test-vault'

const { frontmatter, content } = readTestNote(filePath)
expect(frontmatter.title).toBe('My Note')
expect(content).toContain('Hello')
```

---

## React Testing Utilities

**Source:** `tests/utils/render.tsx`

### renderWithProviders()

Renders a React component with QueryClientProvider.

```typescript
import { renderWithProviders, screen, waitFor } from '@tests/utils/render'

const { queryClient, getByText, rerender } = renderWithProviders(
  <MyComponent prop="value" />,
  { queryClient: customClient }  // optional
)

expect(screen.getByText('Hello')).toBeInTheDocument()
```

### createTestQueryClient()

Creates a QueryClient optimized for testing.

```typescript
import { createTestQueryClient } from '@tests/utils/render'

const queryClient = createTestQueryClient()
// - retry: false (no retries)
// - refetchOnWindowFocus: false
// - staleTime: 0
// - gcTime: Infinity (no garbage collection)
```

### createWrapper()

Creates a wrapper function for `renderHook`.

```typescript
import { renderHook } from '@testing-library/react'
import { createWrapper } from '@tests/utils/render'

const { result } = renderHook(() => useMyHook(), {
  wrapper: createWrapper({ queryClient })
})
```

### Mock API Configuration

```typescript
import { getMockApi, resetMockApi, configureMockApi } from '@tests/utils/render'

// Get current mock
const api = getMockApi()
expect(api.notes.list).toHaveBeenCalled()

// Reset all mocks
resetMockApi()

// Configure responses
configureMockApi({
  'notes.list': { notes: [{ id: '1' }], total: 1, hasMore: false },
  'notes.get': (id) => id === '1' ? mockNote : null,
  'tasks.create': { success: true, task: mockTask }
})
```

---

## Hook Testing Utilities

**Source:** `tests/utils/hook-test-wrapper.tsx`

### renderHookWithProviders()

Renders a hook with all providers and returns mockAPI for assertions.

```typescript
import { renderHookWithProviders, waitFor } from '@tests/utils/hook-test-wrapper'

const { result, mockAPI, queryClient } = renderHookWithProviders(
  () => useNotes({ folder: 'notes' }),
  {
    mockAPI: {
      notes: {
        list: vi.fn().mockResolvedValue({ notes: mockNotes })
      }
    }
  }
)

await waitFor(() => expect(result.current.isLoading).toBe(false))
expect(mockAPI.notes.list).toHaveBeenCalledWith({ folder: 'notes' })
```

### createHookTestHarness()

Creates a reusable test harness with automatic setup/teardown.

```typescript
import { createHookTestHarness } from '@tests/utils/hook-test-wrapper'

describe('useNotes', () => {
  const harness = createHookTestHarness({
    notes: { list: vi.fn().mockResolvedValue({ notes: [] }) }
  })

  it('fetches notes', () => {
    const { result } = renderHook(() => useNotes(), {
      wrapper: harness.getWrapper()
    })
    expect(harness.getMockAPI().notes.list).toHaveBeenCalled()
  })
})
```

### Mock Data Factories

```typescript
import {
  createMockNote,
  createMockTask,
  createMockJournalEntry,
  createMockInboxItem,
  createMockBookmark,
  createMockReminder
} from '@tests/utils/hook-test-wrapper'

const note = createMockNote({
  id: 'note-1',
  title: 'Custom Title',
  tags: ['important']
})

const task = createMockTask({
  projectId: 'project-1',
  statusId: 'status-todo',
  dueDate: '2026-01-20'
})

const entry = createMockJournalEntry({
  date: '2026-01-15',
  content: 'Today I...'
})
```

### Async Utilities

```typescript
import { wait, waitForQueryToSettle, advanceTimersAndFlush } from '@tests/utils/hook-test-wrapper'

// Wait for time to pass
await wait(100)

// Wait for React Query to settle
await waitForQueryToSettle(queryClient)

// Advance fake timers and flush promises
vi.useFakeTimers()
await advanceTimersAndFlush(300)
vi.useRealTimers()
```

---

## Global Test Helpers

**Source:** `tests/setup.ts`

### wait()

Promise-based delay for async testing.

```typescript
import { wait } from '@tests/setup'

await wait(100)  // Wait 100ms
```

### createDeferred()

Creates a deferred promise for controlling async flow in tests.

```typescript
import { createDeferred } from '@tests/setup'

const deferred = createDeferred<string>()

// Start async operation that uses deferred.promise
someAsyncOperation(deferred.promise)

// Later, resolve or reject
deferred.resolve('value')
// or
deferred.reject(new Error('failed'))
```

### testId()

Generates unique test IDs with optional prefix.

```typescript
import { testId } from '@tests/setup'

const id = testId('note')  // 'note_1704067200000_abc123def'
const taskId = testId()    // 'test_1704067200000_xyz789abc'
```
