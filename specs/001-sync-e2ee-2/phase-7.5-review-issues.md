# Phase 7.5 Review Issues - File System Sync Integration

**Review Date:** 2026-01-31
**Scope:** Tasks T140a through T140v
**Status:** Review Complete - Issues Documented

---

## Quick Reference

| Priority | Count | Effort | Description |
|----------|-------|--------|-------------|
| P0 (Critical) | 3 | 13h | Must fix before production |
| P1 (High) | 4 | 24h | Fix before next release |
| P2 (Medium) | 5 | 16h | Plan for next sprint |
| P3 (Low) | 4 | 12h | Track in backlog |

**Total Estimated Effort:** ~65 hours

---

## P0: Critical Issues (Must Fix Before Production)

### ISSUE-001: CRDT Updates Without Signature Verification

**Severity:** Security - Medium (CVSS 5.9)
**Effort:** 4 hours
**Files:**
- `src/main/sync/crdt-sync-bridge.ts` (lines 415-418)

**Problem:**

CRDT updates received from the server are applied directly without signature verification:

```typescript
// Current code - NO SIGNATURE CHECK
for (const update of result.updates) {
  const bytes = base64ToUint8Array(update.updateData)
  this.crdtProvider.applyUpdate(noteId, bytes, 'remote')  // Applied without verification
}
```

**Risk:** A compromised or malicious sync server could inject arbitrary CRDT updates into user documents.

**Fix Required:**

1. Add signature field to CRDT update payloads from server
2. Verify signature before applying update using existing `verifyPayload()` pattern
3. Reject updates with invalid signatures

**Implementation Approach:**

```typescript
// Suggested fix
for (const update of result.updates) {
  // Verify signature before applying
  const isValid = await verifySignature(
    update.updateData,
    update.signature,
    update.signerDeviceId
  )

  if (!isValid) {
    console.error('[CrdtSyncBridge] Invalid signature on CRDT update, rejecting')
    continue
  }

  const bytes = base64ToUint8Array(update.updateData)
  this.crdtProvider.applyUpdate(noteId, bytes, 'remote')
}
```

**Acceptance Criteria:**
- [ ] CRDT updates include signature from originating device
- [ ] Signature verified before `Y.applyUpdate()` called
- [ ] Invalid signatures logged and rejected
- [ ] Test: tampered update is rejected

---

### ISSUE-002: N+1 Query Pattern in flushUpdates()

**Severity:** Performance-Critical
**Effort:** 3 hours
**Files:**
- `src/main/sync/crdt-sync-bridge.ts` (lines 85-109, 244-248)

**Problem:**

When flushing updates, each note triggers a separate database query:

```typescript
// Current: N database queries for N notes
const syncResults = await Promise.all(
  noteIds.map(async (noteId) => ({
    noteId,
    synced: await this.ensureNoteSynced(noteId)  // Calls getNoteById() each time
  }))
)
```

**Impact:**
- 100 notes = 100 database queries
- 1000 notes after offline = ~24 second sync delay
- Each `ensureNoteSynced()` calls `getNoteById()` or `getJournalEntryById()`

**Fix Required:**

Batch the database lookups:

```typescript
// Suggested fix - batch lookup
private async flushUpdates(): Promise<void> {
  const noteIds = [...this.pendingUpdates.keys()]
  const journalIds = noteIds.filter(id => this.isJournalId(id))
  const regularNoteIds = noteIds.filter(id => !this.isJournalId(id))

  // Batch fetch all notes in ONE query
  const [notes, journals] = await Promise.all([
    getNotesByIds(regularNoteIds),      // New batch function needed
    getJournalEntriesByIds(journalIds)  // New batch function needed
  ])

  // Create lookup maps
  const notesMap = new Map(notes.map(n => [n.id, n]))
  const journalsMap = new Map(journals.map(j => [j.id, j]))

  // Process with pre-fetched data
  for (const noteId of noteIds) {
    const data = this.isJournalId(noteId)
      ? journalsMap.get(noteId)
      : notesMap.get(noteId)

    if (data) {
      await this.queueForSync(noteId, data)
    }
  }
}
```

**Also Required:**

Add batch functions to vault layer:
- `src/main/vault/notes.ts`: Add `getNotesByIds(ids: string[])`
- `src/main/vault/journal.ts`: Add `getJournalEntriesByIds(ids: string[])`

**Acceptance Criteria:**
- [ ] `getNotesByIds()` batch function created
- [ ] `getJournalEntriesByIds()` batch function created
- [ ] `flushUpdates()` uses batch lookup
- [ ] Test: 100 updates result in ≤2 database queries
- [ ] Performance test: 1000 notes sync in <5 seconds

---

### ISSUE-003: Missing Document Eviction Strategy

**Severity:** Memory-Critical
**Effort:** 6 hours
**Files:**
- `src/main/sync/crdt-provider.ts` (lines 72-88)

**Problem:**

Five Maps track document state but never evict inactive entries:

```typescript
private docs: Map<string, DocEntry> = new Map()           // Y.Doc instances
private docCreationLocks: Map<string, Promise<Y.Doc>> = new Map()
private externalChangeTimes: Map<string, number> = new Map()
private syncTimings: Map<string, NoteSyncTiming> = new Map()
private recentCrdtWrites: Map<string, number> = new Map()
```

**Memory Impact:**
| Notes | Memory | Risk |
|-------|--------|------|
| 500 | 6.2MB | Low |
| 1000 | 12.3MB | Medium |
| 5000 | 61.5MB | High |
| 10000 | 123MB | Critical (OOM) |

**Fix Required:**

Implement LRU eviction for inactive documents:

```typescript
// Add to CrdtProvider class
private static readonly MAX_LOADED_DOCS = 500
private static readonly EVICTION_THRESHOLD_MS = 10 * 60 * 1000  // 10 minutes

private evictInactiveDocs(): void {
  if (this.docs.size <= CrdtProvider.MAX_LOADED_DOCS) {
    return
  }

  const now = Date.now()
  const candidates: Array<[string, number]> = []

  for (const [noteId, entry] of this.docs) {
    if (now - entry.lastActivity > CrdtProvider.EVICTION_THRESHOLD_MS) {
      candidates.push([noteId, entry.lastActivity])
    }
  }

  // Sort by oldest first
  candidates.sort((a, b) => a[1] - b[1])

  // Evict oldest until under limit
  const toEvict = this.docs.size - CrdtProvider.MAX_LOADED_DOCS
  for (let i = 0; i < Math.min(toEvict, candidates.length); i++) {
    const [noteId] = candidates[i]
    // Compact before eviction to save state
    await this.compactDoc(noteId)
    this.destroyDoc(noteId)
  }
}

// Call eviction check periodically
private startEvictionTimer(): void {
  this.evictionTimer = setInterval(() => {
    void this.evictInactiveDocs()
  }, 60_000)  // Check every minute
}
```

**Acceptance Criteria:**
- [ ] `MAX_LOADED_DOCS` constant defined (default 500)
- [ ] `evictInactiveDocs()` method implemented
- [ ] Timer runs eviction check every minute
- [ ] Documents compacted before eviction
- [ ] All tracking Maps cleaned on eviction
- [ ] Test: Memory stays bounded after 1000 create/destroy cycles

---

## P1: High Priority Issues (Fix Before Next Release)

### ISSUE-004: Sequential Batch Processing

**Severity:** Performance
**Effort:** 1 hour
**Files:**
- `src/main/sync/crdt-sync-bridge.ts` (lines 308-354)

**Problem:**

Batches are processed sequentially, not in parallel:

```typescript
// Current: Sequential processing
for (const batch of batches) {
  // Each batch waits for previous to complete
  const result = await client.pushCrdtUpdates(batch)
  // ...
}
```

**Impact:**
- 200 updates = 4 batches
- Sequential: 400ms total
- Parallel: 100ms total (4x faster)

**Fix Required:**

```typescript
// Suggested fix - parallel processing
const batchResults = await Promise.all(
  batches.map(async (batch, index) => {
    try {
      return await this.processBatchWithRetry(batch)
    } catch (error) {
      console.error(`[CrdtSyncBridge] Batch ${index} failed:`, error)
      return { success: false, batch, error }
    }
  })
)
```

**Acceptance Criteria:**
- [ ] Batches processed in parallel
- [ ] Individual batch failures don't block others
- [ ] Test: 4 batches complete in ~1 RTT, not 4 RTTs

---

### ISSUE-005: Path Traversal Validation Missing

**Severity:** Security (CVSS 5.3)
**Effort:** 1 hour
**Files:**
- `src/main/vault/file-ops.ts`
- `src/main/vault/watcher.ts`

**Problem:**

No explicit validation that file paths remain within vault directory:

```typescript
// Current: Only sanitizes filename characters
export function sanitizeFilename(filename: string): string {
  let sanitized = filename
    .replace(/[<>:"/\\|?*]/g, '')  // Removes path separators but...
    // ...doesn't validate final path is within vault
}
```

**Fix Required:**

Add path containment validation:

```typescript
// Add to file-ops.ts
export function isPathWithinVault(absolutePath: string, vaultPath: string): boolean {
  const resolved = path.resolve(absolutePath)
  const resolvedVault = path.resolve(vaultPath)
  return resolved.startsWith(resolvedVault + path.sep)
}

// Use before any file operation
export async function safeWriteFile(
  filePath: string,
  content: string,
  vaultPath: string
): Promise<void> {
  if (!isPathWithinVault(filePath, vaultPath)) {
    throw new Error(`Path traversal attempt blocked: ${filePath}`)
  }
  await atomicWrite(filePath, content)
}
```

**Acceptance Criteria:**
- [ ] `isPathWithinVault()` function created
- [ ] All file write operations validate path first
- [ ] Test: `../../../etc/passwd` style paths rejected
- [ ] Test: Symlink-based escapes rejected

---

### ISSUE-006: Test Coverage Critical Gaps

**Severity:** Quality
**Effort:** 20 hours
**Files:**
- `src/main/sync/crdt-provider.test.ts`
- `src/main/sync/crdt-sync-bridge.test.ts`

**Problem:**

Current test coverage: 4.6/10

**Missing Critical Tests:**

| Test Category | Count Needed | Priority |
|---------------|--------------|----------|
| Security validation | 4 | Critical |
| Memory leak regression | 3 | Critical |
| Conflict detection | 4 | High |
| Debounce timing | 4 | High |
| N+1 query prevention | 2 | High |
| Journal sync E2E | 3 | Medium |

**Tests to Add:**

```typescript
// 1. Security: Signature verification
it('should reject CRDT updates with invalid signatures', async () => {})
it('should reject oversized CRDT payloads (>10MB)', async () => {})
it('should reject path traversal in noteId', async () => {})

// 2. Memory: Leak prevention
it('should cleanup all Maps when document destroyed', async () => {})
it('should not accumulate memory over 1000 create/destroy cycles', async () => {})
it('should evict inactive documents after threshold', async () => {})

// 3. Conflict detection
it('should detect conflict when external + remote within 5s', async () => {})
it('should not detect conflict when updates >5s apart', async () => {})
it('should emit EXTERNAL_SYNC_CONFLICT event', async () => {})

// 4. Debounce timing
it('should wait 1500ms before flushing', async () => {})
it('should reset timer when new update arrives', async () => {})
it('should batch updates received during wait', async () => {})

// 5. N+1 prevention
it('should not exceed 2 queries when flushing 100 updates', async () => {})
```

**Acceptance Criteria:**
- [ ] 20 new tests added
- [ ] Assertion density increased to 3-5 per test
- [ ] All critical paths have negative tests
- [ ] CI passes with new tests

---

### ISSUE-007: Event Listener Cleanup Missing

**Severity:** Memory
**Effort:** 2 hours
**Files:**
- `src/main/sync/crdt-sync-bridge.ts` (lines 61-73)

**Problem:**

Event listeners registered in `initialize()` are never removed:

```typescript
// Current: Listeners registered but never cleaned up
crdtProvider.on('crdt:doc-updated', (payload) => {
  // ...
})

networkMonitor.on('sync:connectivity-changed', (isOnline) => {
  // ...
})
```

**Fix Required:**

```typescript
// Store listener references
private docUpdatedListener: ((payload: CrdtDocUpdatedPayload) => void) | null = null
private connectivityListener: ((isOnline: boolean) => void) | null = null

initialize(crdtProvider: CrdtProvider): void {
  // Store reference for cleanup
  this.docUpdatedListener = (payload) => {
    if (payload.origin !== 'remote') {
      this.onDocUpdated(payload.noteId, payload.update)
    }
  }
  crdtProvider.on('crdt:doc-updated', this.docUpdatedListener)

  // Similar for other listeners...
}

shutdown(): void {
  // Clean up listeners
  if (this.docUpdatedListener && this.crdtProvider) {
    this.crdtProvider.off('crdt:doc-updated', this.docUpdatedListener)
    this.docUpdatedListener = null
  }

  if (this.connectivityListener) {
    const networkMonitor = getNetworkMonitor()
    networkMonitor?.off('sync:connectivity-changed', this.connectivityListener)
    this.connectivityListener = null
  }

  // ... rest of shutdown
}
```

**Acceptance Criteria:**
- [ ] All listener references stored in class properties
- [ ] `shutdown()` removes all listeners
- [ ] Test: No listener leaks after initialize/shutdown cycle

---

## P2: Medium Priority Issues (Plan for Next Sprint)

### ISSUE-008: Reactive-Only Garbage Collection

**Severity:** Performance
**Effort:** 3 hours
**Files:**
- `src/main/sync/crdt-provider.ts` (lines 207-211)

**Problem:**

GC only triggers when:
1. Document exceeds 1MB threshold, AND
2. An update occurs

Large idle documents never get GC'd.

**Fix Required:**

Add proactive GC scheduling:

```typescript
private startProactiveGC(): void {
  this.gcTimer = setInterval(() => {
    for (const [noteId, entry] of this.docs) {
      if (entry.lastSize > 512 * 1024) {  // 512KB threshold for proactive
        void this.garbageCollectDoc(noteId)
      }
    }
  }, 5 * 60 * 1000)  // Every 5 minutes
}
```

**Acceptance Criteria:**
- [ ] Proactive GC runs every 5 minutes
- [ ] Targets documents >512KB
- [ ] Does not block main thread
- [ ] Shutdown cleans up timer

---

### ISSUE-009: Layer Boundary Violations

**Severity:** Architecture
**Effort:** 4 hours
**Files:**
- `src/main/vault/watcher.ts` (imports from sync)
- `src/main/sync/crdt-sync-bridge.ts` (imports from vault)

**Problem:**

Bidirectional dependencies between layers:

```
vault/watcher.ts --> sync/crdt-provider.ts
sync/crdt-sync-bridge.ts --> vault/notes.ts
```

**Fix Approach:**

Option A: Event-based decoupling (Recommended)
```typescript
// Watcher emits events, orchestrator subscribes
watcher.on('file:changed', (event) => {
  crdtProvider.applyExternalFileChange(event)
})
```

Option B: Dependency injection
```typescript
// Pass callbacks instead of importing
constructor(private noteLoader: (id: string) => Promise<Note | null>) {}
```

**Acceptance Criteria:**
- [ ] No direct imports between vault and sync layers
- [ ] Communication via events or injected callbacks
- [ ] Test: Modules can be tested in isolation

---

### ISSUE-010: High Cyclomatic Complexity Methods

**Severity:** Maintainability
**Effort:** 4 hours
**Files:**
- `src/main/sync/crdt-sync-bridge.ts`: `pushUpdatesToServer` (14 branches)
- `src/main/vault/notes.ts`: `createNote` (15 branches)
- `src/main/vault/watcher.ts`: `handleMarkdownFileAdd` (12 branches)

**Fix Approach:**

Extract sub-methods:

```typescript
// Before: One method with 14 branches
private async pushUpdatesToServer(updates) {
  // 100+ lines with nested loops, try/catch, auth refresh
}

// After: Smaller focused methods
private async pushUpdatesToServer(updates) {
  const batches = this.createBatches(updates)
  return this.processBatchesInParallel(batches)
}

private async processBatchWithRetry(batch) {
  // Retry logic extracted
}

private async refreshAuthAndRetry(batch) {
  // Auth refresh extracted
}
```

**Acceptance Criteria:**
- [ ] No method exceeds 10 cyclomatic complexity
- [ ] Each extracted method has single responsibility
- [ ] Tests updated for new method structure

---

### ISSUE-011: CRDT Payload Size Not Limited

**Severity:** Security
**Effort:** 2 hours
**Files:**
- `src/main/sync/crdt-provider.ts` (lines 215-240)

**Problem:**

```typescript
applyUpdate(noteId: string, update: Uint8Array, origin: string): void {
  // No size validation!
  Y.applyUpdate(entry.doc, update, origin)
}
```

**Fix Required:**

```typescript
private static readonly MAX_UPDATE_SIZE = 10 * 1024 * 1024  // 10MB

applyUpdate(noteId: string, update: Uint8Array, origin: string): void {
  if (update.length > CrdtProvider.MAX_UPDATE_SIZE) {
    throw new Error(`CRDT update exceeds maximum size: ${update.length} bytes`)
  }

  const entry = this.docs.get(noteId)
  if (!entry) {
    console.warn('[CrdtProvider] Cannot apply update to unknown doc:', noteId)
    return
  }

  Y.applyUpdate(entry.doc, update, origin)
}
```

**Acceptance Criteria:**
- [ ] `MAX_UPDATE_SIZE` constant defined
- [ ] Size check before `Y.applyUpdate()`
- [ ] Test: Oversized update rejected with error

---

### ISSUE-012: LevelDB Store Unencrypted at Rest

**Severity:** Security (Low - local data)
**Effort:** 3 hours
**Files:**
- `src/main/sync/crdt-provider.ts` (line 93)

**Problem:**

CRDT state stored in LevelDB without encryption:

```typescript
this.persistence = new LeveldbPersistence(this.dbPath)
```

**Fix Approach:**

Consider `level-encrypt` or custom encryption layer:

```typescript
import { encrypt, decrypt } from '../crypto/encryption'

// Custom persistence wrapper
class EncryptedLeveldbPersistence {
  async storeUpdate(noteId: string, update: Uint8Array): Promise<void> {
    const encrypted = await encrypt(update, this.encryptionKey)
    await this.db.put(noteId, encrypted)
  }

  async getYDoc(noteId: string): Promise<Y.Doc> {
    const encrypted = await this.db.get(noteId)
    const decrypted = await decrypt(encrypted, this.encryptionKey)
    // Apply to doc...
  }
}
```

**Acceptance Criteria:**
- [ ] CRDT data encrypted before LevelDB write
- [ ] Decrypted on read
- [ ] Key derived from master key
- [ ] Migration path for existing unencrypted data

---

## P3: Low Priority Issues (Track in Backlog)

### ISSUE-013: Singleton Pattern Abuse

**Files:** All sync modules use module-level singletons

**Problem:** Makes testing and hot-reloading difficult.

**Fix:** Consider dependency injection container.

---

### ISSUE-014: DRY Violations in Event Emission

**Files:** Multiple files duplicate `BrowserWindow.getAllWindows().forEach(...)` pattern.

**Fix:** Use shared `emitToAllWindows()` utility consistently.

---

### ISSUE-015: Large File Sizes

**Files:**
- `watcher.ts`: 779+ lines
- `sync-handlers.ts`: 1000+ lines

**Fix:** Split by domain/responsibility.

---

### ISSUE-016: Floating Promises

**Files:** 8 instances of `void` statements suppressing promise handling.

**Fix:** Add explicit error handling or document why fire-and-forget is acceptable.

---

## Incomplete Tasks from Phase 7.5

### T140u: Garbage Collection for Documents >1MB

**Status:** Partially Implemented

**What Exists:**
- `garbageCollectDoc()` method exists
- Triggered reactively when `shouldGarbageCollect()` returns true

**What's Missing:**
- No scheduled background GC
- No configuration for thresholds
- See ISSUE-008 for fix

---

### T140v: Snapshot Compression with pako/fflate

**Status:** ✅ Complete

**Implementation:**
- `compressSnapshot()` and `decompressSnapshot()` implemented
- Uses pako with zlib header (0x78)
- Backward compatibility with `maybeDecompress()`
- Tests verify ~60% compression ratio

---

## How to Use This Document

1. **Pick an issue** to work on by priority (P0 first)
2. **Read the full issue** including problem, fix approach, and acceptance criteria
3. **Create a branch** named `fix/issue-XXX-brief-description`
4. **Implement the fix** following the suggested approach
5. **Add tests** per acceptance criteria
6. **Mark acceptance criteria** as done when complete
7. **Create PR** referencing this issue number

---

## Tracking

| Issue | Status | Assignee | PR |
|-------|--------|----------|-----|
| ISSUE-001 | Not Started | | |
| ISSUE-002 | Not Started | | |
| ISSUE-003 | Not Started | | |
| ISSUE-004 | Not Started | | |
| ISSUE-005 | Not Started | | |
| ISSUE-006 | Not Started | | |
| ISSUE-007 | Not Started | | |
| ISSUE-008 | Not Started | | |
| ISSUE-009 | Not Started | | |
| ISSUE-010 | Not Started | | |
| ISSUE-011 | Not Started | | |
| ISSUE-012 | Not Started | | |
| ISSUE-013 | Backlog | | |
| ISSUE-014 | Backlog | | |
| ISSUE-015 | Backlog | | |
| ISSUE-016 | Backlog | | |
