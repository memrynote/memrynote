# File Watching

## Overview

The `VaultWatcher` class monitors the vault directory for external file changes using chokidar.

## VaultWatcher Class

```typescript
// src/main/vault/watcher.ts
class VaultWatcher {
  private watcher: FSWatcher | null
  private vaultPath: string
  private excludePatterns: string[]
  private debouncedChange: ReturnType<typeof createPathDebouncer>

  start(options: WatcherOptions): void
  stop(): void
  isWatching(): boolean
}

interface WatcherOptions {
  vaultPath: string
  excludePatterns: string[]
  onError?: (error: Error) => void
}
```

## Singleton Pattern

```typescript
let watcherInstance: VaultWatcher | null = null

function startWatcher(options: WatcherOptions): void
function stopWatcher(): void
function getWatcher(): VaultWatcher | null
```

## Debouncing

The watcher uses path-based debouncing to prevent duplicate events:

```typescript
function createPathDebouncer(delay: number) {
  // Returns debounced function that:
  // 1. Tracks pending changes per path
  // 2. Delays execution by `delay` ms
  // 3. Only fires once per path within window
}
```

Default delay: 300ms

This handles:
- Multiple rapid saves
- Editor backup/temp file patterns
- Rename detection (add + delete within window)

## Event Handlers

### Markdown Files

```typescript
handleMarkdownFileAdd(path: string)
// 1. Parse file content
// 2. Ensure frontmatter
// 3. Add to note_cache
// 4. Queue FTS update
// 5. Emit 'note:created' event

handleMarkdownFileChange(path: string)
// 1. Parse updated content
// 2. Update note_cache
// 3. Queue FTS update
// 4. Emit 'note:updated' event
```

### Non-Markdown Files

```typescript
handleNonMarkdownFileAdd(path: string)
// 1. Get file stats
// 2. Add to note_cache as 'file' type

handleNonMarkdownFileChange(path: string)
// 1. Update stats in note_cache
```

### Delete Handler

```typescript
handleFileDelete(path: string)
// 1. Remove from note_cache
// 2. Remove from FTS
// 3. Emit 'note:deleted' event
```

## Journal Detection

```typescript
function isJournalPath(path: string): boolean
// Checks if path matches journal folder pattern

function extractJournalDate(path: string): string | null
// Extracts YYYY-MM-DD from journal filename
```

## Excluded Patterns

Files matching these patterns are ignored:
- `.git/`
- `node_modules/`
- `.trash/`
- Any pattern in `config.excludePatterns`

## Chokidar Configuration

```typescript
chokidar.watch(vaultPath, {
  ignored: (path) => shouldIgnore(path, excludePatterns),
  persistent: true,
  ignoreInitial: true,  // Don't fire for existing files
  awaitWriteFinish: {
    stabilityThreshold: 100,
    pollInterval: 50
  }
})
```

## Event Emission

External changes emit events to the renderer:

```typescript
function emitEvent(type: string, data: unknown) {
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send('vault:fileEvent', { type, data })
  })
}
```

## Lifecycle

1. **Start** - Called when vault opens (`openVault`)
2. **Running** - Watches for changes, emits events
3. **Stop** - Called when vault closes (`closeVault`)

Watcher must be stopped before closing databases to prevent race conditions.
