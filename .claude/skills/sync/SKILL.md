---
name: sync
description: |
  Use when working with sync, CRDT, Yjs, E2E encryption, device linking, vector clocks,
  offline queue, conflict resolution, note synchronization, real-time collaboration,
  sync bridge, debouncing, batching, sequence numbers, key derivation, signing,
  XChaCha20, Argon2id, Ed25519, X25519, keychain, session refresh, or sync API.
---

# Memry Sync System

## Architecture Overview

Memry uses a three-layer sync architecture:

| Layer | Technology | Scope |
|-------|------------|-------|
| CRDT | Yjs + LevelDB | Note content (rich text, blocks) |
| Vector Clocks | SQLite + API | Items (tasks, metadata, settings) |
| E2E Encryption | XChaCha20-Poly1305 + Ed25519 | All synced data |

## Key Files

| File | Purpose |
|------|---------|
| `src/main/sync/crdt-sync-bridge.ts` | CRDT ↔ API bridge, debouncing, offline queue |
| `src/main/sync/crdt-provider.ts` | Yjs document management, LevelDB persistence |
| `src/main/sync/sync-service.ts` | Main sync orchestrator |
| `src/main/sync/sync-api.ts` | API client for sync endpoints |
| `src/main/crypto/encryption-service.ts` | E2E encryption, key management |
| `src/main/crypto/device-linking.ts` | Device pairing via QR/ECDH |
| `src/shared/types/sync.ts` | Shared sync types |

## CRDT Sync Bridge

The bridge (`crdt-sync-bridge.ts`) manages:

### Debouncing & Batching
- Updates debounced (300ms default) to reduce API calls
- Multiple updates batched into single push
- Sequence numbers ensure ordering

### Offline Queue
- Failed pushes queued for retry
- Automatic retry on reconnection
- Queue persisted across restarts

### Key Patterns
```typescript
// Singleton access
const bridge = CrdtSyncBridge.getInstance(syncApi, crdtProvider);

// Push updates (debounced internally)
await bridge.pushUpdate(noteId, update);

// Pull and apply remote changes
await bridge.pullUpdates(noteId);

// Session refresh on 401
bridge.refreshSession(); // Re-authenticates and retries
```

## Yjs Integration

The `CrdtProvider` manages Y.Doc lifecycle:

### Document Management
- One Y.Doc per note, loaded on demand
- LevelDB persistence for offline access
- Cross-window sync via IPC

### Update Handling
```typescript
// Listen with origin filtering (avoid echo)
doc.on('update', (update, origin) => {
  if (origin !== 'remote') {
    bridge.pushUpdate(noteId, update);
  }
});

// Apply remote updates
Y.applyUpdate(doc, update, 'remote');
```

### Snapshots
- Full state snapshots for initial sync
- Incremental updates after first sync
- Compaction on large document size

See [references/crdt-provider.md](references/crdt-provider.md) for details.

## Encryption Flow

### Two-Layer Encryption
1. **Content encryption**: XChaCha20-Poly1305 with content key
2. **Key encryption**: Content key encrypted with vault key

### Key Hierarchy
```
Master Password
    ↓ Argon2id
Vault Key (256-bit)
    ↓ HKDF
├── Content Key (per-item encryption)
├── Auth Key (API authentication)
└── Signing Key (Ed25519 for integrity)
```

### Signing
All sync payloads signed with Ed25519:
- Prevents tampering
- Verifies sender identity
- Signature included in encrypted payload

See [references/encryption.md](references/encryption.md) for details.

## API Integration

### Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/sync/push` | POST | Push item changes |
| `/sync/pull` | POST | Pull item changes |
| `/crdt/push` | POST | Push CRDT updates |
| `/crdt/pull` | POST | Pull CRDT updates |
| `/crdt/snapshot` | POST | Push/pull full snapshots |
| `/auth/refresh` | POST | Refresh session token |
| `/link/initiate` | POST | Start device linking |
| `/link/complete` | POST | Complete device linking |

See [references/sync-api.md](references/sync-api.md) for request/response types.

## Common Patterns

### Error Handling
```typescript
try {
  await syncApi.pushCrdtUpdate(payload);
} catch (error) {
  if (error.status === 401) {
    await refreshSession();
    // Retry automatically
  } else if (error.status === 409) {
    // Conflict - pull and merge
    await pullAndMerge(noteId);
  } else {
    // Queue for retry
    offlineQueue.add(payload);
  }
}
```

### Event Emitters
```typescript
// Sync status events
syncBridge.on('syncStart', () => updateUI('syncing'));
syncBridge.on('syncComplete', () => updateUI('synced'));
syncBridge.on('syncError', (err) => updateUI('error', err));
syncBridge.on('offline', () => updateUI('offline'));
```

## References

- [CRDT Provider Details](references/crdt-provider.md)
- [Sync API Reference](references/sync-api.md)
- [Encryption Patterns](references/encryption.md)
