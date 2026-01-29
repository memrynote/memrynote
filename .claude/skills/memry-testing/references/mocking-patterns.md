# Mocking Patterns Reference

## Electron Mocks

**Source:** `tests/utils/mock-electron.ts`

### mockElectron

Complete Electron mock object for use with `vi.mock('electron')`.

```typescript
import { mockElectron, installElectronMocks } from '@tests/utils/mock-electron'

// Option 1: Install globally
installElectronMocks()

// Option 2: Manual mock
vi.mock('electron', () => mockElectron)
```

### MockBrowserWindow

Full BrowserWindow mock with state tracking.

```typescript
import { MockBrowserWindow } from '@tests/utils/mock-electron'

const window = new MockBrowserWindow({ width: 800, height: 600 })

window.show()
expect(window.isVisible()).toBe(true)

window.maximize()
expect(window.isMaximized()).toBe(true)

window.close()
expect(window.isDestroyed()).toBe(true)

// All methods are vi.fn() mocks
expect(window.loadURL).toHaveBeenCalled()
```

### MockWebContents

WebContents mock for IPC and script execution.

```typescript
const { webContents } = new MockBrowserWindow()

webContents.send('channel', data)
expect(webContents.send).toHaveBeenCalledWith('channel', data)

await webContents.executeJavaScript('code')
```

### mockShell

Shell API mock for external operations.

```typescript
import { mockShell } from '@tests/utils/mock-electron'

await mockShell.openExternal('https://example.com')
expect(mockShell.openExternal).toHaveBeenCalledWith('https://example.com')

mockShell.showItemInFolder('/path/to/file')
await mockShell.trashItem('/path/to/delete')
```

### mockDialog

Dialog API mock with configurable responses.

```typescript
import { mockDialog } from '@tests/utils/mock-electron'

// Default: returns non-canceled with mock paths
const result = await mockDialog.showOpenDialog({})
// { canceled: false, filePaths: ['/mock/selected/path'] }

// Custom response
mockDialog.showOpenDialog.mockResolvedValueOnce({
  canceled: true,
  filePaths: []
})

// Message box
mockDialog.showMessageBox.mockResolvedValueOnce({
  response: 1,  // Button index
  checkboxChecked: true
})
```

### mockApp

App API mock for application info and lifecycle.

```typescript
import { mockApp } from '@tests/utils/mock-electron'

mockApp.getPath('userData')  // '/mock/userData'
mockApp.getName()            // 'Memry'
mockApp.getVersion()         // '1.0.0'
mockApp.isReady()            // true

await mockApp.whenReady()
mockApp.quit()
```

### MockNotification

Notification mock for testing system notifications.

```typescript
import { MockNotification } from '@tests/utils/mock-electron'

const notification = new MockNotification({
  title: 'Test',
  body: 'Message'
})

notification.show()
expect(notification.show).toHaveBeenCalled()
expect(MockNotification.isSupported()).toBe(true)
```

### mockClipboard

Clipboard API mock.

```typescript
import { mockClipboard } from '@tests/utils/mock-electron'

mockClipboard.writeText('copied text')
expect(mockClipboard.writeText).toHaveBeenCalledWith('copied text')

mockClipboard.readText.mockReturnValue('clipboard content')
```

### resetElectronMocks()

Clears all Electron mock call history.

```typescript
import { resetElectronMocks } from '@tests/utils/mock-electron'

afterEach(() => resetElectronMocks())
```

---

## IPC Mocks

**Source:** `tests/utils/mock-ipc.ts`

### mockIpcMain

Mock ipcMain for testing handler registration.

```typescript
import { mockIpcMain, mockIpcRenderer } from '@tests/utils/mock-ipc'

// Register handler (simulates ipcMain.handle)
mockIpcMain.handle('notes:list', async (event, options) => {
  return { notes: [], total: 0 }
})

// Verify registration
expect(mockIpcMain.handle).toHaveBeenCalledWith('notes:list', expect.any(Function))

// Remove handler
mockIpcMain.removeHandler('notes:list')
```

### invokeHandler()

Directly invoke a registered handler for testing.

```typescript
import { invokeHandler, registerTestHandler } from '@tests/utils/mock-ipc'

// Set up handler in your test
registerNotesHandlers(mockIpcMain, db)

// Invoke and test
const result = await invokeHandler<NotesListResponse>('notes:list', { limit: 10 })
expect(result.notes).toHaveLength(5)
```

### registerTestHandler()

Register a test handler with a static response or function.

```typescript
import { registerTestHandler } from '@tests/utils/mock-ipc'

// Static response
registerTestHandler('notes:get', { id: '1', title: 'Test Note' })

// Dynamic response
registerTestHandler('notes:get', (event, id) => {
  if (id === '1') return { id: '1', title: 'Note 1' }
  return null
})
```

### createIpcTestHarness()

Creates a test harness with automatic cleanup.

```typescript
import { createIpcTestHarness } from '@tests/utils/mock-ipc'

describe('Notes Handlers', () => {
  const {
    mockIpcMain,
    mockIpcRenderer,
    invokeHandler,
    registerTestHandler,
    createMockIpcMainInvokeEvent
  } = createIpcTestHarness()

  it('handles notes:list', async () => {
    registerNotesHandlers(mockIpcMain, db)
    const result = await invokeHandler('notes:list', {})
    expect(result.notes).toEqual([])
  })
})
```

### createMockIpcMainInvokeEvent()

Creates a mock IPC event for handler testing.

```typescript
import { createMockIpcMainInvokeEvent } from '@tests/utils/mock-ipc'

const event = createMockIpcMainInvokeEvent(1)
// event.sender.id = 1
// event.sender.send = vi.fn()
// event.senderFrame.url = 'file:///mock/index.html'
// event.preventDefault = vi.fn()
```

---

## window.api Mocking

**Source:** `tests/setup-dom.ts`

### Default Setup

The renderer workspace automatically mocks `window.api` via `setup-dom.ts`.

```typescript
// Already available in renderer tests
window.api.notes.list.mockResolvedValue({ notes: [], total: 0, hasMore: false })
window.api.tasks.create.mockResolvedValue({ success: true, task: mockTask })
```

### Customizing Responses

```typescript
beforeEach(() => {
  window.api.notes.list.mockResolvedValue({
    notes: [
      { id: '1', title: 'Note 1' },
      { id: '2', title: 'Note 2' }
    ],
    total: 2,
    hasMore: false
  })
})
```

### Event Subscription Mocks

Event subscriptions return unsubscribe functions.

```typescript
const unsubscribe = vi.fn()
window.api.onNoteCreated.mockReturnValue(unsubscribe)

// Component subscribes
const cleanup = window.api.onNoteCreated(callback)

// Verify subscription
expect(window.api.onNoteCreated).toHaveBeenCalledWith(callback)

// Test cleanup
cleanup()
expect(unsubscribe).toHaveBeenCalled()
```

### createMockApi()

Export for creating fresh mock API instances.

```typescript
import { createMockApi } from '@tests/setup-dom'

const freshApi = createMockApi()
window.api = freshApi
```

---

## Type-Safe Mocks

**Source:** `tests/utils/type-safe-mocks.ts`

### createNotesMock()

Creates a type-checked mock for NotesClientAPI.

```typescript
import { createNotesMock, TypeSafeNotesAPI } from '@tests/utils/type-safe-mocks'

const notesMock: TypeSafeNotesAPI = createNotesMock({
  list: vi.fn().mockResolvedValue({
    notes: [{ id: '1', title: 'Test' }],
    total: 1,
    hasMore: false
  }),
  get: vi.fn().mockImplementation((id) =>
    Promise.resolve(id === '1' ? { id: '1', title: 'Test' } : null)
  )
})

// TypeScript error if signature doesn't match real API!
```

### createTasksMock()

Creates a type-checked mock for TasksClientAPI.

```typescript
import { createTasksMock } from '@tests/utils/type-safe-mocks'

const tasksMock = createTasksMock({
  list: vi.fn().mockResolvedValue({ tasks: [], total: 0, hasMore: false }),
  complete: vi.fn().mockResolvedValue({ success: true })
})
```

### createTypeSafeAPI()

Creates a complete type-safe window.api mock.

```typescript
import { createTypeSafeAPI, TypeSafeWindowAPI } from '@tests/utils/type-safe-mocks'

const api: TypeSafeWindowAPI = createTypeSafeAPI({
  notes: {
    list: vi.fn().mockResolvedValue({ notes: mockNotes })
  },
  tasks: {
    getStats: vi.fn().mockResolvedValue({ completed: 5, total: 10 })
  }
})

// Assign to window
Object.defineProperty(window, 'api', { value: api, writable: true })
```

### Type Utilities

```typescript
import { MockedAPI, PartialMockedAPI } from '@tests/utils/type-safe-mocks'

// Full mock - all methods required
type FullNotesMock = MockedAPI<NotesClientAPI>

// Partial mock - only override what you need
type PartialNotesMock = PartialMockedAPI<NotesClientAPI>
```

---

## Timer Mocking

### Basic Timer Control

```typescript
beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

it('debounces input', async () => {
  const { result } = renderHookWithProviders(() => useDebouncedSearch())

  act(() => {
    result.current.setQuery('test')
  })

  // Not called yet
  expect(mockAPI.search.query).not.toHaveBeenCalled()

  // Advance past debounce delay
  act(() => {
    vi.advanceTimersByTime(300)
  })

  expect(mockAPI.search.query).toHaveBeenCalledWith('test')
})
```

### System Time Control

```typescript
it('uses correct date', () => {
  vi.setSystemTime(new Date('2026-01-15T10:00:00Z'))

  const result = getFormattedDate()
  expect(result).toBe('January 15, 2026')
})
```

### Timer + Promises

```typescript
import { advanceTimersAndFlush } from '@tests/utils/hook-test-wrapper'

it('handles async debounce', async () => {
  vi.useFakeTimers()

  triggerDebouncedAction()

  // Advance timers AND flush promise queue
  await advanceTimersAndFlush(300)

  expect(mockFn).toHaveBeenCalled()

  vi.useRealTimers()
})
```

---

## Spy Patterns

### Function Spying

```typescript
const spy = vi.spyOn(module, 'functionName')
spy.mockReturnValue('mocked')

expect(spy).toHaveBeenCalledWith(arg1, arg2)
expect(spy).toHaveBeenCalledTimes(1)

spy.mockRestore()
```

### Type-Safe Spies with satisfies

```typescript
import type { NoteService } from '@/services/notes'

const mockNoteService = {
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
} satisfies Partial<NoteService>

// TypeScript ensures mock matches real interface
```

### Console Spying

```typescript
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

// Run code that logs errors
await expectAsync(brokenFunction()).toThrow()

expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('error message'))

consoleSpy.mockRestore()
```

### Module Mocking

```typescript
vi.mock('@/services/notes', () => ({
  noteService: {
    create: vi.fn().mockResolvedValue({ id: '1' }),
    list: vi.fn().mockResolvedValue([])
  }
}))

// Access the mock
import { noteService } from '@/services/notes'
const mockedService = vi.mocked(noteService)

mockedService.create.mockResolvedValueOnce({ id: 'custom' })
```

### Partial Module Mocking

```typescript
vi.mock('@/utils/dates', async () => {
  const actual = await vi.importActual<typeof import('@/utils/dates')>('@/utils/dates')
  return {
    ...actual,
    formatDate: vi.fn().mockReturnValue('mocked date')
  }
})
```
