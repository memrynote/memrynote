---
name: memry-testing
description: |
  Guide for Vitest testing patterns, mocking, and test utilities in Memry.
  Triggers: "write test", "add test", "test file", "mock", "vitest",
  "test database", "test IPC", "test component", "test hook", "renderWithProviders",
  "createTestDataDb", "mockIpcMain", "test vault", "vi.mock", "vi.spyOn"
---

# Memry Testing Guide

## Quick Reference

```bash
pnpm test                    # Run all tests
pnpm vitest <path>           # Run specific test file
pnpm vitest --project=main   # Run main process tests only
pnpm vitest --project=renderer  # Run renderer tests only
```

## Workspaces

| Workspace | Environment | Tests For | Setup Files |
|-----------|-------------|-----------|-------------|
| `shared` | node | Zod schemas, Drizzle queries | `setup.ts` |
| `main` | node | IPC handlers, database, vault | `setup.ts` |
| `renderer` | jsdom | React components, hooks | `setup.ts`, `setup-dom.ts` |

## Test File Organization

Tests are co-located with source files:
```
src/main/handlers/notes.ts
src/main/handlers/notes.test.ts    # Main process test
src/renderer/src/hooks/useNotes.ts
src/renderer/src/hooks/useNotes.test.ts  # Renderer test
```

## Core Test Utilities

### Database Utilities (`@tests/utils/test-db`)

| Function | Purpose |
|----------|---------|
| `createTestDataDb()` | In-memory data.db with migrations |
| `createTestIndexDb()` | In-memory index.db with migrations |
| `createTestDatabases()` | Both databases, returns `closeAll()` |
| `seedProjects(db, count)` | Seed sample projects |
| `seedTestData(db)` | Seed project + statuses + tasks |
| `seedInboxItem(db, opts)` | Seed single inbox item |

### IPC Utilities (`@tests/utils/mock-ipc`)

| Function | Purpose |
|----------|---------|
| `mockIpcMain` | Mock ipcMain with `handle`, `removeHandler` |
| `mockIpcRenderer` | Mock ipcRenderer with `invoke`, `send` |
| `invokeHandler(channel, ...args)` | Directly call registered handler |
| `registerTestHandler(channel, response)` | Set up handler response |
| `createIpcTestHarness()` | Auto-reset harness for beforeEach |

### React Testing (`@tests/utils/render`)

| Function | Purpose |
|----------|---------|
| `renderWithProviders(ui, opts)` | Render with QueryClient |
| `createTestQueryClient()` | QueryClient with retries disabled |
| `createWrapper(opts)` | Wrapper for `renderHook` |
| `configureMockApi(config)` | Set mock responses on window.api |

### Hook Testing (`@tests/utils/hook-test-wrapper`)

| Function | Purpose |
|----------|---------|
| `renderHookWithProviders(hook, opts)` | renderHook + providers + mockAPI |
| `createHookTestHarness(config)` | Auto-setup harness with beforeEach/afterEach |
| `createMockNote/Task/JournalEntry()` | Factory functions for mock data |

### Vault Utilities (`@tests/utils/test-vault`)

| Function | Purpose |
|----------|---------|
| `createTestVault(name)` | Temp vault dir with full structure |
| `createTestNote(vault, opts)` | Create note file in vault |
| `createTestJournalEntry(vault, date)` | Create journal entry file |

### Electron Mocks (`@tests/utils/mock-electron`)

| Export | Purpose |
|--------|---------|
| `MockBrowserWindow` | Window mock with state tracking |
| `mockShell` | Shell API (openExternal, trashItem) |
| `mockDialog` | Dialog API (showOpenDialog, etc.) |
| `mockApp` | App API (getPath, quit) |
| `mockElectron` | Complete Electron mock object |

## Common Patterns

### Database Test

```typescript
import { createTestDataDb, seedTestData } from '@tests/utils/test-db'

describe('TaskService', () => {
  let db: TestDb
  let cleanup: () => void

  beforeEach(() => {
    const result = createTestDataDb()
    db = result.db
    cleanup = result.close
  })

  afterEach(() => cleanup())

  it('creates a task', () => {
    const { projectId, statusIds } = seedTestData(db)
    // test with seeded data
  })
})
```

### IPC Handler Test

```typescript
import { mockIpcMain, invokeHandler } from '@tests/utils/mock-ipc'

describe('notes:list handler', () => {
  beforeEach(() => mockIpcMain._clearHandlers())

  it('returns notes', async () => {
    registerNotesHandlers(mockIpcMain, db)
    const result = await invokeHandler('notes:list', { limit: 10 })
    expect(result.notes).toHaveLength(0)
  })
})
```

### Component Test

```typescript
import { renderWithProviders, screen } from '@tests/utils/render'

it('renders note title', async () => {
  window.api.notes.get.mockResolvedValue({ id: '1', title: 'Test' })
  renderWithProviders(<NoteView noteId="1" />)
  expect(await screen.findByText('Test')).toBeInTheDocument()
})
```

### Hook Test

```typescript
import { renderHookWithProviders, waitFor } from '@tests/utils/hook-test-wrapper'

it('fetches notes', async () => {
  const { result, mockAPI } = renderHookWithProviders(() => useNotes())
  mockAPI.notes.list.mockResolvedValue({ notes: [{ id: '1' }] })

  await waitFor(() => expect(result.current.notes).toHaveLength(1))
})
```

### Timer Test

```typescript
beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

it('debounces search', async () => {
  vi.setSystemTime(new Date('2026-01-15'))
  // trigger debounced action
  vi.advanceTimersByTime(300)
  // assert
})
```

## Global Helpers (`setup.ts`)

```typescript
import { wait, createDeferred, testId } from '@tests/setup'

await wait(100)  // Promise-based delay
const { promise, resolve } = createDeferred<string>()
const id = testId('task')  // 'task_1234567890_abc123'
```

## References

- [Test Utilities Reference](references/test-utilities.md) - Detailed utility documentation
- [Mocking Patterns Reference](references/mocking-patterns.md) - Mock setup patterns
