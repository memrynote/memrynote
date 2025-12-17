# Quickstart: Core Data Layer

**Feature**: Core Data Layer
**Date**: 2025-12-18
**Estimated Setup Time**: 30 minutes

## Prerequisites

- Node.js 20+ installed
- pnpm 8+ installed
- Git repository cloned
- Existing Memry frontend working (`pnpm dev` runs successfully)

## Step 1: Install Dependencies

```bash
# Install core data layer dependencies
pnpm add better-sqlite3 chokidar gray-matter nanoid electron-store zod

# Install dev dependencies
pnpm add -D @electron/rebuild @types/better-sqlite3 vitest
```

## Step 2: Configure Native Module Rebuilding

Add to `package.json`:

```json
{
  "scripts": {
    "postinstall": "electron-rebuild",
    "rebuild": "electron-rebuild -f -w better-sqlite3"
  }
}
```

Run the rebuild:

```bash
pnpm rebuild
```

## Step 3: Configure electron-vite

Update `electron.vite.config.ts` to externalize native modules:

```typescript
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        external: ['better-sqlite3']
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    plugins: [react()]
  }
});
```

## Step 4: Create Directory Structure

```bash
# Create main process directories
mkdir -p src/main/database/migrations/data
mkdir -p src/main/database/migrations/index
mkdir -p src/main/vault
mkdir -p src/main/ipc
mkdir -p src/main/lib

# Create renderer service directories
mkdir -p src/renderer/src/services
mkdir -p src/renderer/src/hooks
```

## Step 5: Initialize Database Module

Create `src/main/database/index.ts`:

```typescript
import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';

let dataDb: Database.Database | null = null;
let indexDb: Database.Database | null = null;

export function initDatabases(vaultPath: string): void {
  const memryDir = path.join(vaultPath, '.memry');

  // Initialize data.db (source of truth)
  dataDb = new Database(path.join(memryDir, 'data.db'));
  dataDb.pragma('journal_mode = WAL');
  dataDb.pragma('foreign_keys = ON');

  // Initialize index.db (rebuildable cache)
  indexDb = new Database(path.join(memryDir, 'index.db'));
  indexDb.pragma('journal_mode = WAL');

  // Run migrations
  runMigrations(dataDb, 'data');
  runMigrations(indexDb, 'index');
}

export function getDataDb(): Database.Database {
  if (!dataDb) throw new Error('Database not initialized');
  return dataDb;
}

export function getIndexDb(): Database.Database {
  if (!indexDb) throw new Error('Index database not initialized');
  return indexDb;
}

export function closeDatabases(): void {
  dataDb?.close();
  indexDb?.close();
  dataDb = null;
  indexDb = null;
}

function runMigrations(db: Database.Database, type: 'data' | 'index'): void {
  // Migration logic here
}
```

## Step 6: Set Up File Watcher

Create `src/main/vault/watcher.ts`:

```typescript
import chokidar from 'chokidar';
import type { FSWatcher } from 'chokidar';

let watcher: FSWatcher | null = null;

export function startWatching(
  vaultPath: string,
  callbacks: {
    onAdd: (path: string) => void;
    onChange: (path: string) => void;
    onUnlink: (path: string) => void;
  }
): void {
  watcher = chokidar.watch(vaultPath, {
    persistent: true,
    ignored: (filePath, stats) => {
      const basename = filePath.split('/').pop() || '';
      if (basename.startsWith('.')) return true;
      if (basename === 'node_modules') return true;
      return stats?.isFile() && !filePath.endsWith('.md');
    },
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 50
    },
    atomic: true,
    ignoreInitial: true,
    depth: 99,
    followSymlinks: false
  });

  watcher
    .on('add', callbacks.onAdd)
    .on('change', callbacks.onChange)
    .on('unlink', callbacks.onUnlink)
    .on('error', (error) => console.error('Watcher error:', error));
}

export function stopWatching(): Promise<void> {
  return watcher?.close() ?? Promise.resolve();
}
```

## Step 7: Register IPC Handlers

Update `src/main/index.ts`:

```typescript
import { app, BrowserWindow, ipcMain } from 'electron';
import { initDatabases, closeDatabases } from './database';
import { registerVaultHandlers } from './ipc/vault-handlers';
import { registerNotesHandlers } from './ipc/notes-handlers';
import { registerTasksHandlers } from './ipc/tasks-handlers';
import { registerSearchHandlers } from './ipc/search-handlers';

app.whenReady().then(() => {
  // Register all IPC handlers
  registerVaultHandlers();
  registerNotesHandlers();
  registerTasksHandlers();
  registerSearchHandlers();

  createWindow();
});

app.on('before-quit', () => {
  closeDatabases();
});
```

## Step 8: Update Preload Script

Update `src/preload/index.ts`:

```typescript
import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

const api = {
  // Window controls
  windowMinimize: () => ipcRenderer.send('window-minimize'),
  windowMaximize: () => ipcRenderer.send('window-maximize'),
  windowClose: () => ipcRenderer.send('window-close'),

  // Vault operations
  vault: {
    select: (path?: string) => ipcRenderer.invoke('vault:select', { path }),
    getStatus: () => ipcRenderer.invoke('vault:get-status'),
    getConfig: () => ipcRenderer.invoke('vault:get-config'),
  },

  // Notes operations
  notes: {
    create: (input: unknown) => ipcRenderer.invoke('notes:create', input),
    get: (id: string) => ipcRenderer.invoke('notes:get', id),
    update: (input: unknown) => ipcRenderer.invoke('notes:update', input),
    delete: (id: string) => ipcRenderer.invoke('notes:delete', id),
    list: (options?: unknown) => ipcRenderer.invoke('notes:list', options),
  },

  // Tasks operations
  tasks: {
    create: (input: unknown) => ipcRenderer.invoke('tasks:create', input),
    get: (id: string) => ipcRenderer.invoke('tasks:get', id),
    update: (input: unknown) => ipcRenderer.invoke('tasks:update', input),
    complete: (input: unknown) => ipcRenderer.invoke('tasks:complete', input),
    list: (options?: unknown) => ipcRenderer.invoke('tasks:list', options),
  },

  // Search operations
  search: {
    query: (input: unknown) => ipcRenderer.invoke('search:query', input),
    quick: (input: unknown) => ipcRenderer.invoke('search:quick', input),
  },

  // Event subscriptions
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.on(channel, (_, ...args) => callback(...args));
  },
  off: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },
};

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('electron', electronAPI);
  contextBridge.exposeInMainWorld('api', api);
}
```

## Step 9: Create TypeScript Declarations

Update `src/preload/index.d.ts`:

```typescript
import { ElectronAPI } from '@electron-toolkit/preload';

interface WindowAPI {
  windowMinimize: () => void;
  windowMaximize: () => void;
  windowClose: () => void;
}

interface VaultAPI {
  select: (path?: string) => Promise<unknown>;
  getStatus: () => Promise<unknown>;
  getConfig: () => Promise<unknown>;
}

interface NotesAPI {
  create: (input: unknown) => Promise<unknown>;
  get: (id: string) => Promise<unknown>;
  update: (input: unknown) => Promise<unknown>;
  delete: (id: string) => Promise<unknown>;
  list: (options?: unknown) => Promise<unknown>;
}

interface TasksAPI {
  create: (input: unknown) => Promise<unknown>;
  get: (id: string) => Promise<unknown>;
  update: (input: unknown) => Promise<unknown>;
  complete: (input: unknown) => Promise<unknown>;
  list: (options?: unknown) => Promise<unknown>;
}

interface SearchAPI {
  query: (input: unknown) => Promise<unknown>;
  quick: (input: unknown) => Promise<unknown>;
}

interface API extends WindowAPI {
  vault: VaultAPI;
  notes: NotesAPI;
  tasks: TasksAPI;
  search: SearchAPI;
  on: (channel: string, callback: (...args: unknown[]) => void) => void;
  off: (channel: string, callback: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: API;
  }
}
```

## Step 10: Verify Setup

```bash
# Run type check
pnpm typecheck

# Run development server
pnpm dev

# Test that the app starts without errors
# Open DevTools (F12) and check for any module loading errors
```

## Troubleshooting

### "Cannot find module 'better-sqlite3'"

Run the rebuild script:
```bash
pnpm rebuild
```

### "SQLITE_MISUSE: Database is closed"

Ensure databases are initialized before any IPC handlers are called:
```typescript
// In main/index.ts, init databases before registering handlers
app.whenReady().then(async () => {
  await initFromStoredVault(); // Load previously selected vault
  registerHandlers();
  createWindow();
});
```

### "EMFILE: too many open files" (Linux)

Increase inotify limit:
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Native module errors on different Node version

Clear and rebuild:
```bash
rm -rf node_modules
pnpm install
pnpm rebuild
```

## Next Steps

1. Implement initial migration schemas (see `data-model.md`)
2. Implement vault selection UI
3. Connect existing TasksProvider to real database
4. Add file watcher integration with UI updates
5. Implement search functionality

## File Checklist

After completing setup, you should have:

```
src/main/
├── index.ts                    ✓ Updated with IPC handlers
├── database/
│   ├── index.ts               ✓ Database initialization
│   ├── migrations/
│   │   ├── data/              □ Migration files
│   │   └── index/             □ Migration files
├── vault/
│   ├── watcher.ts             ✓ File watcher setup
├── ipc/
│   ├── vault-handlers.ts      □ To implement
│   ├── notes-handlers.ts      □ To implement
│   ├── tasks-handlers.ts      □ To implement
│   └── search-handlers.ts     □ To implement
src/preload/
├── index.ts                    ✓ Updated with IPC bridge
└── index.d.ts                  ✓ Updated with types
```
