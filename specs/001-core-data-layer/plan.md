# Implementation Plan: Core Data Layer

**Branch**: `001-core-data-layer` | **Date**: 2025-12-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-core-data-layer/spec.md`

## Summary

Build the foundational data layer for Memry that enables local-first storage with markdown files as the source of truth for notes, SQLite databases for structured data (tasks, projects, settings), and real-time file watching for external edit detection. The implementation uses better-sqlite3 for synchronous database operations in Electron's main process, chokidar for cross-platform file watching, and gray-matter for YAML frontmatter parsing.

## Technical Context

**Language/Version**: TypeScript 5.9+ with strict mode
**Primary Dependencies**:
- better-sqlite3 ^11.x (synchronous SQLite for Node.js)
- chokidar ^4.x (cross-platform file watching)
- gray-matter ^4.x (YAML frontmatter parsing)
- nanoid ^5.x (unique identifier generation)

**Storage**:
- SQLite via better-sqlite3 (two databases: index.db, data.db)
- File system via Node.js fs/promises
- Vault folder location stored in electron-store

**Testing**: Vitest for unit/integration tests, Playwright for E2E
**Target Platform**: Electron 38+ (macOS, Windows, Linux)
**Project Type**: Electron desktop application (main + renderer processes)

**Performance Goals**:
- Search results in <50ms for 10,000 notes
- File change detection within 500ms
- Initial indexing <5s for 1,000 files
- App startup to usable state <3s

**Constraints**:
- Main process handles all file/database operations
- Renderer communicates via IPC only
- Zero data loss tolerance
- Files must be portable markdown (no proprietary formats)

**Scale/Scope**:
- Support 10,000+ notes
- Support 1,000+ tasks
- Vault sizes up to 10GB (with attachments)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Implementation |
|-----------|--------|----------------|
| **I. Local-First Architecture** | PASS | All data stored in user-selected vault folder; app works fully offline; notes are plain markdown files |
| **II. E2EE** | N/A | Encryption layer is Phase 4 (separate feature); this phase focuses on local storage only |
| **III. No Vendor Lock-In** | PASS | Notes as .md files with standard YAML frontmatter; tasks exportable to JSON/CSV; no proprietary formats |
| **IV. Privacy by Design** | PASS | All data local; no network calls; no telemetry |
| **V. Offline-First** | PASS | No internet dependency; all features work offline |
| **VI. File System as Source of Truth** | PASS | Markdown files are authoritative for notes; index.db is rebuildable cache |
| **VII. Database for Structured Data** | PASS | Tasks, projects, settings stored in data.db as source of truth |
| **VIII. External Edit Detection** | PASS | chokidar watches vault for changes; automatic UI updates within 500ms |
| **IX. Rename Tracking** | PASS | UUID in frontmatter tracks identity; file path is display name only |
| **X. Single Source of Truth** | PASS | Each data type has exactly one authoritative location |

**Quality Standards Compliance**:
- Type Safety: All IPC messages validated with Zod schemas at boundaries
- Performance: FTS5 for search, debounced file watching, lazy loading
- Accessibility: Not applicable to backend (UI responsibility)
- Error Handling: Graceful degradation, automatic index recovery
- Defensive Coding: Path sanitization, input validation, operation timeouts

## Project Structure

### Documentation (this feature)

```text
specs/001-core-data-layer/
├── plan.md              # This file
├── research.md          # Phase 0 output - technology research
├── data-model.md        # Phase 1 output - entity schemas
├── quickstart.md        # Phase 1 output - setup guide
├── contracts/           # Phase 1 output - IPC API definitions
│   ├── vault-api.ts     # Vault management IPC
│   ├── notes-api.ts     # Note CRUD IPC
│   ├── tasks-api.ts     # Task CRUD IPC
│   └── search-api.ts    # Search IPC
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── main/
│   ├── index.ts                    # Electron main process entry
│   ├── database/
│   │   ├── index.ts                # Database initialization
│   │   ├── data-db.ts              # data.db operations (tasks, projects, settings)
│   │   ├── index-db.ts             # index.db operations (note cache, FTS)
│   │   ├── migrations/             # Database migrations
│   │   │   ├── data/               # data.db migrations
│   │   │   └── index/              # index.db migrations
│   │   └── schemas.ts              # TypeScript types for DB entities
│   ├── vault/
│   │   ├── index.ts                # Vault management entry
│   │   ├── watcher.ts              # chokidar file watcher
│   │   ├── file-ops.ts             # File CRUD operations
│   │   ├── frontmatter.ts          # gray-matter parsing/serialization
│   │   ├── rename-tracker.ts       # UUID-based rename detection
│   │   └── indexer.ts              # Initial vault indexing
│   ├── ipc/
│   │   ├── index.ts                # IPC handler registration
│   │   ├── vault-handlers.ts       # Vault IPC handlers
│   │   ├── notes-handlers.ts       # Notes IPC handlers
│   │   ├── tasks-handlers.ts       # Tasks IPC handlers
│   │   └── search-handlers.ts      # Search IPC handlers
│   └── lib/
│       ├── paths.ts                # Path utilities and sanitization
│       ├── id.ts                   # nanoid wrapper for UUID generation
│       └── errors.ts               # Custom error types
├── preload/
│   ├── index.ts                    # Preload script with IPC bridge
│   └── index.d.ts                  # TypeScript declarations
└── renderer/
    └── src/
        ├── services/
        │   ├── vault-service.ts    # Vault IPC client
        │   ├── notes-service.ts    # Notes IPC client
        │   ├── tasks-service.ts    # Tasks IPC client
        │   └── search-service.ts   # Search IPC client
        └── hooks/
            ├── use-vault.ts        # Vault state hook
            ├── use-notes.ts        # Notes state hook
            ├── use-tasks.ts        # Tasks state hook
            └── use-search.ts       # Search hook
```

**Structure Decision**: Electron application with clear separation between main process (Node.js with file/database access) and renderer process (React UI). All data operations happen in main process; renderer communicates via IPC channels. Services in renderer wrap IPC calls; hooks provide React integration.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Two SQLite databases | Separation of rebuildable cache (index.db) from source-of-truth data (data.db) | Single database would mix transient and permanent data, complicating recovery |
| IPC abstraction layer | Type safety and validation at process boundary | Direct ipcRenderer calls would spread validation logic across components |

## Implementation Phases

### Phase 1: Database Foundation
1. Install better-sqlite3 with electron-rebuild configuration
2. Create database module with initialization logic
3. Implement data.db schema (tasks, projects, settings, inbox)
4. Implement index.db schema (note_cache, fts_notes)
5. Add migration system for schema versioning
6. Create IPC handlers for database operations

### Phase 2: Vault Management
1. Implement vault folder selection dialog
2. Store vault location in electron-store
3. Create vault structure initialization (.memry folder)
4. Implement vault loading on app startup
5. Add multi-vault support infrastructure

### Phase 3: File Operations
1. Implement note file CRUD with atomic writes
2. Add gray-matter frontmatter parsing/serialization
3. Implement UUID generation and tracking
4. Handle duplicate UUID detection
5. Add file path sanitization

### Phase 4: File Watching
1. Set up chokidar watcher with optimal configuration
2. Implement debounced event handling
3. Add rename detection using UUID matching
4. Create IPC events for file change notifications
5. Handle exclusion patterns (.git, node_modules)

### Phase 5: Indexing & Search
1. Implement initial vault indexing
2. Create FTS5 full-text search index
3. Add incremental index updates on file changes
4. Implement search API with ranking
5. Add progress reporting for initial index

### Phase 6: Recovery & Resilience
1. Implement index corruption detection
2. Add automatic index rebuild from files
3. Create data.db backup strategy
4. Add error recovery for common failures
5. Implement atomic file writes with temp files

## Dependencies

```json
{
  "dependencies": {
    "better-sqlite3": "^11.7.0",
    "chokidar": "^4.0.3",
    "gray-matter": "^4.0.3",
    "nanoid": "^5.0.9",
    "electron-store": "^10.0.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@electron/rebuild": "^3.7.1",
    "@types/better-sqlite3": "^7.6.12",
    "vitest": "^2.1.0"
  }
}
```

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| better-sqlite3 native binding issues with electron-vite | Medium | High | Use @electron/rebuild; test on all platforms early |
| Large vault performance degradation | Low | Medium | Implement lazy loading; use FTS5; add pagination |
| File watcher resource exhaustion | Low | Medium | Use chokidar v4 efficiency improvements; increase inotify limits on Linux |
| Concurrent file access conflicts | Medium | Medium | Use atomic writes; implement file locking strategy |
| Index corruption on unexpected shutdown | Medium | High | Design index as fully rebuildable; use WAL mode |
