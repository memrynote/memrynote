# Phase 7.5 Quick Fix Reference

Quick reference for the most critical issues. See `phase-7.5-review-issues.md` for full details.

---

## P0 Critical (Do First)

### 1. CRDT Signature Verification
**File:** `src/main/sync/crdt-sync-bridge.ts:415-418`

```typescript
// ADD signature verification before this line:
this.crdtProvider.applyUpdate(noteId, bytes, 'remote')

// FIX: Verify signature first
const isValid = await verifySignature(update.updateData, update.signature, update.signerDeviceId)
if (!isValid) {
  console.error('[CrdtSyncBridge] Invalid signature, rejecting')
  continue
}
```

---

### 2. Batch Database Queries
**File:** `src/main/sync/crdt-sync-bridge.ts:244-248`

```typescript
// PROBLEM: N queries for N notes
noteIds.map(async (noteId) => await this.ensureNoteSynced(noteId))

// FIX: Batch fetch first
const notes = await getNotesByIds(noteIds)  // Need to create this function
const notesMap = new Map(notes.map(n => [n.id, n]))
// Then process with pre-fetched data
```

**Also add to:**
- `src/main/vault/notes.ts`: `getNotesByIds(ids: string[]): Promise<Note[]>`
- `src/main/vault/journal.ts`: `getJournalEntriesByIds(ids: string[]): Promise<JournalEntry[]>`

---

### 3. Document Eviction
**File:** `src/main/sync/crdt-provider.ts`

```typescript
// ADD these constants
private static readonly MAX_LOADED_DOCS = 500
private static readonly EVICTION_THRESHOLD_MS = 10 * 60 * 1000

// ADD eviction method
private async evictInactiveDocs(): Promise<void> {
  if (this.docs.size <= CrdtProvider.MAX_LOADED_DOCS) return

  const now = Date.now()
  for (const [noteId, entry] of this.docs) {
    if (now - entry.lastActivity > CrdtProvider.EVICTION_THRESHOLD_MS) {
      await this.compactDoc(noteId)
      this.destroyDoc(noteId)
    }
    if (this.docs.size <= CrdtProvider.MAX_LOADED_DOCS) break
  }
}

// ADD timer in initialize()
this.evictionTimer = setInterval(() => void this.evictInactiveDocs(), 60_000)
```

---

## P1 High Priority

### 4. Parallel Batch Processing
**File:** `src/main/sync/crdt-sync-bridge.ts:308`

```typescript
// BEFORE: Sequential
for (const batch of batches) {
  await client.pushCrdtUpdates(batch)
}

// AFTER: Parallel
await Promise.all(batches.map(batch => this.processBatchWithRetry(batch)))
```

---

### 5. Path Traversal Check
**File:** `src/main/vault/file-ops.ts`

```typescript
// ADD this function
export function isPathWithinVault(absolutePath: string, vaultPath: string): boolean {
  const resolved = path.resolve(absolutePath)
  const resolvedVault = path.resolve(vaultPath)
  return resolved.startsWith(resolvedVault + path.sep)
}

// USE before file writes
if (!isPathWithinVault(filePath, vaultPath)) {
  throw new Error('Path traversal blocked')
}
```

---

### 6. Listener Cleanup
**File:** `src/main/sync/crdt-sync-bridge.ts`

```typescript
// STORE references
private docUpdatedListener: ((p: any) => void) | null = null

// IN initialize():
this.docUpdatedListener = (payload) => { /* ... */ }
crdtProvider.on('crdt:doc-updated', this.docUpdatedListener)

// IN shutdown():
if (this.docUpdatedListener && this.crdtProvider) {
  this.crdtProvider.off('crdt:doc-updated', this.docUpdatedListener)
}
```

---

### 7. CRDT Size Limit
**File:** `src/main/sync/crdt-provider.ts:215`

```typescript
private static readonly MAX_UPDATE_SIZE = 10 * 1024 * 1024  // 10MB

applyUpdate(noteId: string, update: Uint8Array, origin: string): void {
  if (update.length > CrdtProvider.MAX_UPDATE_SIZE) {
    throw new Error(`Update too large: ${update.length} bytes`)
  }
  // ... rest of method
}
```

---

## Tests Needed (Critical)

Add to `src/main/sync/crdt-provider.test.ts`:

```typescript
describe('Security', () => {
  it('should reject oversized updates', () => {})
  it('should cleanup all Maps on destroy', () => {})
  it('should evict inactive documents', () => {})
})

describe('Conflict Detection', () => {
  it('should detect conflict within 5s window', () => {})
  it('should emit conflict event', () => {})
})
```

Add to `src/main/sync/crdt-sync-bridge.test.ts`:

```typescript
describe('Performance', () => {
  it('should batch database queries', () => {})
  it('should process batches in parallel', () => {})
})

describe('Security', () => {
  it('should verify signatures before applying', () => {})
})
```

---

## File Checklist

When working on these fixes, you'll modify:

- [ ] `src/main/sync/crdt-provider.ts` - Issues 3, 7, 8
- [ ] `src/main/sync/crdt-sync-bridge.ts` - Issues 1, 2, 4, 6
- [ ] `src/main/vault/file-ops.ts` - Issue 5
- [ ] `src/main/vault/notes.ts` - Issue 2 (add batch function)
- [ ] `src/main/vault/journal.ts` - Issue 2 (add batch function)
- [ ] `src/main/sync/crdt-provider.test.ts` - Tests
- [ ] `src/main/sync/crdt-sync-bridge.test.ts` - Tests
