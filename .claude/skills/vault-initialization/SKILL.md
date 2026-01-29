---
name: vault-initialization
description: |
  Guide for vault setup, configuration, and database initialization in Memry.
  Triggers: "create vault", "open vault", "vault setup", "initialize vault",
  "vault config", "vault database", "VaultStatus", "VaultConfig", "initVault",
  "openVault", "closeVault", "selectVault", "vault lifecycle"
---

# Vault Initialization

## Directory Structure

Vaults use this layout:
```
vault-root/
├── .memry/
│   ├── config.json      # Vault configuration
│   ├── data.db          # Source of truth (notes, tasks, journal)
│   └── index.db         # Rebuildable cache (FTS, note_cache)
├── notes/               # Default note folder
├── journal/             # Daily entries (YYYY-MM-DD.md)
└── attachments/         # Per-note attachment folders
```

## Core Types

```typescript
interface VaultStatus {
  isOpen: boolean
  path: string | null
  isIndexing: boolean
  indexProgress: number  // 0-100
  error: string | null
}

interface VaultConfig {
  excludePatterns: string[]   // Default: ['.git', 'node_modules', '.trash']
  defaultNoteFolder: string   // Default: 'notes'
  journalFolder: string       // Default: 'journal'
  attachmentsFolder: string   // Default: 'attachments'
}
```

## Key Functions

| Function | Location | Purpose |
|----------|----------|---------|
| `initVault(path)` | `src/main/vault/init.ts` | Create .memry dir, config.json, databases |
| `openVault(path)` | `src/main/vault/index.ts` | Open existing vault, init DBs, start watcher |
| `closeVault()` | `src/main/vault/index.ts` | Stop watcher, close DBs, reset status |
| `selectVault(path)` | `src/main/vault/index.ts` | UI-facing: validate, init if needed, open |
| `autoOpenLastVault()` | `src/main/vault/index.ts` | Restore last vault on app start |

## Initialization Sequence

1. **Validate path** - Check directory exists and is writable
2. **Create structure** - `.memry/`, config.json, default folders
3. **Initialize databases**:
   - `data.db` first (source of truth)
   - `index.db` second (cache layer)
4. **Run migrations** via Drizzle
5. **Start file watcher** if opening existing vault
6. **Index vault** if index.db is empty/stale

## IPC Channels

```typescript
// Handlers in src/main/ipc/vault-handlers.ts
'vault:select'      // Select/create vault
'vault:close'       // Close current vault
'vault:getStatus'   // Get VaultStatus
'vault:onStatusChange'  // Subscribe to status updates
'vault:reindex'     // Trigger full reindex
```

## Electron Store Schema

```typescript
// src/main/store.ts
{
  currentVault: string | null,  // Path to last opened vault
  vaults: VaultInfo[]           // All known vaults
}

interface VaultInfo {
  path: string
  name: string
  lastOpened: number
  isDefault: boolean
  noteCount: number
  taskCount: number
}
```

## Common Patterns

### Opening a Vault
```typescript
const result = await selectVault(path)
if (!result.success) {
  // Handle error: result.error
}
// Vault is now open, status emitted to renderer
```

### Status Updates
```typescript
// Main process emits via emitStatusChanged()
// Renderer subscribes via window.api.vault.onStatusChange(callback)
```

## Reference Files

- [Vault Structure](references/vault-structure.md) - Directory layout details
- [Database Setup](references/database-setup.md) - Two-database architecture
