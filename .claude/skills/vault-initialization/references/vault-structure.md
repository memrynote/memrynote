# Vault Directory Structure

## Overview

A Memry vault is a folder containing markdown files and a hidden `.memry` configuration directory.

## Directory Layout

```
vault-root/
├── .memry/                    # Hidden config directory
│   ├── config.json            # Vault settings (VaultConfig)
│   ├── data.db                # Primary SQLite (source of truth)
│   └── index.db               # Cache SQLite (FTS, note_cache)
├── notes/                     # Default note folder (configurable)
│   ├── note-title.md
│   └── subfolder/
│       └── nested-note.md
├── journal/                   # Daily entries (configurable)
│   ├── 2024-01-15.md
│   └── 2024-01-16.md
└── attachments/               # Per-note attachment storage
    └── {noteId}/
        └── {prefix}-{filename}
```

## config.json Schema

```json
{
  "excludePatterns": [".git", "node_modules", ".trash"],
  "defaultNoteFolder": "notes",
  "journalFolder": "journal",
  "attachmentsFolder": "attachments"
}
```

### Fields

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `excludePatterns` | `string[]` | `['.git', 'node_modules', '.trash']` | Paths to ignore during indexing |
| `defaultNoteFolder` | `string` | `'notes'` | Default folder for new notes |
| `journalFolder` | `string` | `'journal'` | Folder for daily journal entries |
| `attachmentsFolder` | `string` | `'attachments'` | Root folder for attachments |

## Path Resolution Functions

| Function | Location | Returns |
|----------|----------|---------|
| `getMemryDir(vaultPath)` | `init.ts` | `.memry` directory path |
| `getConfigPath(vaultPath)` | `init.ts` | `config.json` path |
| `getDataDbPath(vaultPath)` | `init.ts` | `data.db` path |
| `getIndexDbPath(vaultPath)` | `init.ts` | `index.db` path |

## Validation Functions

| Function | Purpose |
|----------|---------|
| `isVaultInitialized(path)` | Check if `.memry/config.json` exists |
| `isValidDirectory(path)` | Check path exists and is directory |
| `hasWritePermission(path)` | Verify write access |
| `validateVaultPath(path)` | Comprehensive path validation |

## Folder Creation

On vault initialization (`initVault`):
1. Create `.memry/` directory
2. Write default `config.json`
3. Create `notes/`, `journal/`, `attachments/` folders
4. Initialize both databases

The `VAULT_FOLDERS` constant defines required folders: `['notes', 'journal', 'attachments']`
