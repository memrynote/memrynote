# Sync API Reference

## Authentication Endpoints

### POST /auth/login
```typescript
// Request
interface LoginRequest {
  email: string;
  password: string;
  deviceId: string;
}

// Response
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
}
```

### POST /auth/refresh
```typescript
// Request
interface RefreshRequest {
  refreshToken: string;
  deviceId: string;
}

// Response
interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
```

## Item Sync Endpoints

### POST /sync/push
Push item changes to server.

```typescript
// Request
interface SyncPushRequest {
  items: SyncItemPush[];
  deviceId: string;
  clientTime: number;
}

interface SyncItemPush {
  id: string;
  type: 'task' | 'note' | 'journal' | 'tag' | 'setting';
  version: number;
  deleted: boolean;
  encryptedData: string; // Base64
  signature: string;     // Ed25519 signature
  updatedAt: number;
}

// Response
interface SyncPushResponse {
  accepted: string[];    // IDs accepted
  conflicts: SyncConflict[];
  serverTime: number;
}

interface SyncConflict {
  id: string;
  serverVersion: number;
  clientVersion: number;
  resolution: 'server_wins' | 'client_wins' | 'merge_required';
}
```

### POST /sync/pull
Pull item changes from server.

```typescript
// Request
interface SyncPullRequest {
  lastSyncTime: number;
  deviceId: string;
  types?: string[];      // Filter by type
}

// Response
interface SyncPullResponse {
  items: SyncItemPull[];
  serverTime: number;
  hasMore: boolean;
  cursor?: string;
}

interface SyncItemPull {
  id: string;
  type: string;
  version: number;
  deleted: boolean;
  encryptedData: string;
  signature: string;
  updatedAt: number;
  createdBy: string;     // Device ID
}
```

## CRDT Endpoints

### POST /crdt/push
Push CRDT updates for notes.

```typescript
// Request
interface CrdtPushRequest {
  noteId: string;
  updates: CrdtUpdatePush[];
  deviceId: string;
}

interface CrdtUpdatePush {
  sequenceNumber: number;
  encryptedUpdate: string; // Base64 encrypted Yjs update
  signature: string;
  timestamp: number;
}

// Response
interface CrdtPushResponse {
  accepted: number[];    // Sequence numbers accepted
  lastServerSequence: number;
  conflicts?: CrdtConflict[];
}

interface CrdtConflict {
  clientSequence: number;
  serverSequence: number;
  resolution: 'rebase_required';
}
```

### POST /crdt/pull
Pull CRDT updates for notes.

```typescript
// Request
interface CrdtPullRequest {
  noteId: string;
  afterSequence: number; // Only updates after this sequence
  stateVector?: string;  // Base64 Yjs state vector for diffing
  deviceId: string;
}

// Response
interface CrdtPullResponse {
  updates: CrdtUpdatePull[];
  lastSequence: number;
  hasMore: boolean;
}

interface CrdtUpdatePull {
  sequenceNumber: number;
  encryptedUpdate: string;
  signature: string;
  timestamp: number;
  deviceId: string;
}
```

### POST /crdt/snapshot
Push or pull full document snapshot.

```typescript
// Request (push)
interface CrdtSnapshotPushRequest {
  noteId: string;
  encryptedSnapshot: string;
  signature: string;
  baseSequence: number;
  deviceId: string;
}

// Request (pull)
interface CrdtSnapshotPullRequest {
  noteId: string;
  deviceId: string;
}

// Response
interface CrdtSnapshotResponse {
  encryptedSnapshot: string;
  signature: string;
  sequence: number;
  timestamp: number;
}
```

## Device Linking Endpoints

### POST /link/initiate
Start device linking process.

```typescript
// Request
interface LinkInitiateRequest {
  deviceId: string;
  publicKey: string;     // X25519 public key (Base64)
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'web';
}

// Response
interface LinkInitiateResponse {
  linkCode: string;      // 6-digit code for QR/manual entry
  expiresAt: number;
  linkId: string;
}
```

### POST /link/complete
Complete device linking.

```typescript
// Request
interface LinkCompleteRequest {
  linkCode: string;
  deviceId: string;
  publicKey: string;
  encryptedVaultKey: string; // Vault key encrypted with shared secret
}

// Response
interface LinkCompleteResponse {
  success: boolean;
  linkedDeviceId: string;
  encryptedVaultKey?: string; // If this device is receiving the key
}
```

## IPC Channels

### Main → Renderer
```typescript
// Sync status updates
'sync:status': (status: 'idle' | 'syncing' | 'error' | 'offline') => void;
'sync:progress': (current: number, total: number) => void;
'sync:error': (error: { code: string; message: string }) => void;

// CRDT updates from other devices
'crdt:remoteUpdate': (noteId: string, update: Uint8Array) => void;

// Conflict notifications
'sync:conflict': (conflict: SyncConflict) => void;
```

### Renderer → Main
```typescript
// Trigger sync
'sync:trigger': () => Promise<void>;
'sync:cancel': () => void;

// CRDT operations
'crdt:localUpdate': (noteId: string, update: Uint8Array) => Promise<void>;
'crdt:getDoc': (noteId: string) => Promise<Uint8Array>; // Returns snapshot
'crdt:closeDoc': (noteId: string) => Promise<void>;
```

## Error Handling

### HTTP Status Codes
| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process response |
| 400 | Bad request | Log error, don't retry |
| 401 | Unauthorized | Refresh token, retry |
| 403 | Forbidden | Re-authenticate |
| 409 | Conflict | Pull changes, merge, retry |
| 429 | Rate limited | Exponential backoff |
| 500 | Server error | Retry with backoff |
| 503 | Service unavailable | Queue for later |

### Error Response Format
```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  retryAfter?: number; // Seconds
}
```

### Common Error Codes
- `AUTH_EXPIRED`: Token expired, refresh needed
- `AUTH_INVALID`: Invalid credentials
- `SYNC_CONFLICT`: Version conflict detected
- `CRDT_SEQUENCE_GAP`: Missing updates, pull required
- `ENCRYPTION_FAILED`: Decryption/verification failed
- `DEVICE_NOT_LINKED`: Device not authorized
- `RATE_LIMITED`: Too many requests
