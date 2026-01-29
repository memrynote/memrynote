# CRDT Provider Reference

## Y.Doc Management

### Document Lifecycle

```typescript
class CrdtProvider {
  private docs: Map<string, Y.Doc> = new Map();
  private persistence: LeveldbPersistence;

  async getDoc(noteId: string): Promise<Y.Doc> {
    if (this.docs.has(noteId)) {
      return this.docs.get(noteId)!;
    }

    const doc = new Y.Doc();

    // Load from persistence
    await this.persistence.bindState(noteId, doc);

    // Set up update listener
    doc.on('update', (update, origin) => {
      if (origin !== 'remote' && origin !== 'persistence') {
        this.onLocalUpdate(noteId, update);
      }
    });

    this.docs.set(noteId, doc);
    return doc;
  }

  async closeDoc(noteId: string): Promise<void> {
    const doc = this.docs.get(noteId);
    if (doc) {
      await this.persistence.clearState(noteId);
      doc.destroy();
      this.docs.delete(noteId);
    }
  }
}
```

### Document Cleanup
- Call `closeDoc()` when note is closed
- `destroy()` the Y.Doc to free memory
- Clear persistence binding to flush changes

## LevelDB Persistence

### Setup
```typescript
import { LeveldbPersistence } from 'y-leveldb';

const persistence = new LeveldbPersistence(dbPath);
```

### Binding State
```typescript
// Bind doc to persistence (loads existing state)
await persistence.bindState(noteId, doc);

// Persistence auto-saves on updates
doc.on('update', (update) => {
  // LeveldbPersistence handles this automatically
});
```

### Manual Flush
```typescript
// Force flush pending writes
await persistence.flushDocument(noteId);
```

## Update Handling

### Origin Filtering

Critical to prevent update loops:

```typescript
doc.on('update', (update: Uint8Array, origin: unknown) => {
  // Skip remote updates (already applied)
  if (origin === 'remote') return;

  // Skip persistence updates (loading from disk)
  if (origin === 'persistence') return;

  // This is a local edit - sync it
  this.pushUpdate(noteId, update);
});
```

### Applying Remote Updates
```typescript
function applyRemoteUpdate(noteId: string, update: Uint8Array) {
  const doc = this.docs.get(noteId);
  if (!doc) return;

  // Use 'remote' origin to prevent re-sync
  Y.applyUpdate(doc, update, 'remote');
}
```

### Merging Updates
```typescript
// Merge multiple updates into one
const merged = Y.mergeUpdates([update1, update2, update3]);

// Apply merged update
Y.applyUpdate(doc, merged, 'remote');
```

## Snapshots

### Creating Snapshots
```typescript
function createSnapshot(noteId: string): Uint8Array {
  const doc = this.docs.get(noteId);
  if (!doc) throw new Error('Doc not found');

  // Full state vector
  return Y.encodeStateAsUpdate(doc);
}
```

### Applying Snapshots
```typescript
function applySnapshot(noteId: string, snapshot: Uint8Array) {
  const doc = this.docs.get(noteId);
  if (!doc) throw new Error('Doc not found');

  Y.applyUpdate(doc, snapshot, 'remote');
}
```

### State Vector for Incremental Sync
```typescript
// Get state vector (what we have)
const stateVector = Y.encodeStateVector(doc);

// Request only updates we don't have
const missingUpdates = await api.pullUpdates(noteId, stateVector);

// Apply missing updates
for (const update of missingUpdates) {
  Y.applyUpdate(doc, update, 'remote');
}
```

## Cross-Window Sync

For Electron with multiple windows:

### Main Process (Hub)
```typescript
// Receive update from one window
ipcMain.handle('crdt:localUpdate', async (event, noteId, update) => {
  // Broadcast to other windows
  for (const window of BrowserWindow.getAllWindows()) {
    if (window.webContents !== event.sender) {
      window.webContents.send('crdt:remoteUpdate', noteId, update);
    }
  }

  // Push to server
  await syncBridge.pushUpdate(noteId, update);
});
```

### Renderer Process
```typescript
// Send local updates to main
doc.on('update', (update, origin) => {
  if (origin !== 'remote') {
    window.api.crdtLocalUpdate(noteId, update);
  }
});

// Receive updates from other windows
window.api.onCrdtRemoteUpdate((noteId, update) => {
  const doc = this.docs.get(noteId);
  if (doc) {
    Y.applyUpdate(doc, update, 'remote');
  }
});
```

## Compaction

### When to Compact
- Document size exceeds threshold (e.g., 1MB)
- On explicit user action (export, backup)
- Periodically (e.g., daily)

### Compaction Process
```typescript
async function compactDoc(noteId: string) {
  const doc = this.docs.get(noteId);
  if (!doc) return;

  // Create fresh snapshot
  const snapshot = Y.encodeStateAsUpdate(doc);

  // Clear persistence
  await this.persistence.clearDocument(noteId);

  // Re-apply snapshot (compacted)
  const newDoc = new Y.Doc();
  Y.applyUpdate(newDoc, snapshot);

  // Bind new doc
  await this.persistence.bindState(noteId, newDoc);
  this.docs.set(noteId, newDoc);
}
```

## Shutdown Handling

```typescript
async function shutdown() {
  // Stop accepting new updates
  this.isShuttingDown = true;

  // Flush all pending writes
  for (const noteId of this.docs.keys()) {
    await this.persistence.flushDocument(noteId);
  }

  // Close persistence
  await this.persistence.destroy();

  // Destroy all docs
  for (const doc of this.docs.values()) {
    doc.destroy();
  }
  this.docs.clear();
}
```
