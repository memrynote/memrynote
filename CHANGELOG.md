# Changelog

All notable changes to memry are documented here.
Format: date-based entries grouped by merged PR.

## 2026-03-12 — Graph View (#100)

### Added
- Add interactive knowledge graph with note/tag/project nodes, filtering panel, and local graph sidebar
- Add graph IPC pipeline and Drizzle queries for node/edge data
- Add inline #tag system in editor with space-to-complete and clickable color-synced pills
- Extract inline #tags from markdown body into tag index
- Promote tags to first-class graph nodes linked by entity-tag edges
- Add Instrument Serif and JetBrains Mono font families
- Add outline panel with sticky pin-on-click and smooth fade-out
- Eliminate theme flash with synchronous preload bootstrap

### Fixed
- Fix graph node layout: pre-compute ForceAtlas2, spread nodes to prevent hub collapse
- Fix sigma.refresh() crash in LayoutManager
- Guard graph reducers against stale edge/node references
- Fix graph settings reactivity for layout, labels, and repulsion controls
- Fix UI state not resetting when switching vaults
- Fix pending tag colors for optimistic tag creation

### Changed
- Convert graph controls to collapsible gear-icon drawer
- Aggregate task tags in sidebar tag counts
- Move action icons to layout top-right with hover outline
- Add animated hover dimming to graph nodes

## 2026-03-10 — Inbox Redesign (#99)

### Added
- Add triage mode with AI note suggestions
- Add capture source tracking for inbox items
- Add duplicate detection for text and URL captures
- Add undo toasts, processing streak badge, and triage celebration
- Add inbox health metrics with ArcGauge and AgeStrata visualizations
- Add bulk archive functionality
- Add convert-to-task IPC for inbox items

### Fixed
- Fix reminder items not opening their target in triage view

### Changed
- Split inbox.tsx monolith into focused modules
- Move appearance settings to dedicated Appearance section

### Performance
- Memoize TriageItemCard with GPU-accelerated transitions

## 2026-03-09 — Global Search (#97)

### Added
- Add command palette with Cmd+K shortcut
- Add FTS5 search backend with fuzzy fallback
- Add search IPC handlers and preload bridge
- Add recent-searches persistence

## 2026-03-03 — Sync E2EE (#95)

### Added
- Add end-to-end encrypted sync with XChaCha20-Poly1305, Ed25519, and BIP39 recovery phrase
- Add Cloudflare Workers sync server with D1 database and R2 blob storage
- Add Google OAuth sign-in with passwordless email OTP
- Add CRDT sync via Yjs for real-time note collaboration
- Add device linking with QR code, SAS verification, and IP binding
- Add key rotation wizard with vault key re-wrapping
- Add device management panel with revocation
- Add sync status indicator in sidebar and settings
- Add sync activity history panel
- Add attachment sync with upload/download progress overlay
- Add storage quota handling with usage bar in settings
- Add recovery phrase input for re-linking devices
- Add TLS certificate pinning and CSP security headers
- Add sign-out dialog with data cleanup
- Add offline clock management for deviceless editing
- Add multi-version crypto decryption for forward compatibility
- Add corrupt data detection with re-fetch recovery
- Add graceful shutdown with final push before quit
- Add structured logging via electron-log with scoped loggers
- Add extractErrorMessage utility for IPC error sanitization

### Fixed
- Fix CRDT doc lifecycle against double-close and reopened docs
- Fix sync replay loop with fresh payload, dedup, and replay-as-success
- Fix token rotation UNIQUE constraint collisions with retry
- Fix timing oracle in /recovery endpoint
- Fix crypto constant-time comparison, key zeroing, and KDF contexts
- Fix server auth: persist refresh hash, bind setup token, rate limits
- Fix D1 schema missing CASCADE and NOT NULL constraints
- Fix sync loop from content writeback with TTL-based ignore
- Fix clipboard leak after recovery phrase copy

### Changed
- Replace console.* with scoped electron-log loggers across codebase
- Extract SyncItemHandler strategy pattern for per-type sync handlers
- Extract ContentSyncService base class for note/journal sync

### Performance
- Parallelize sync snapshots and prefetch pull pages
- Cache device public keys during pull cycle
- Skip push when sync queue is empty

## 2026-01-06 — Folder View (#94)

### Added
- Add core data layer with Drizzle ORM, vault management, and FTS indexing
- Add notes system with CRUD, properties, wiki links, backlinks, and virtualized tree
- Add task management with projects, kanban view, due dates, priorities, and repeat config
- Add journal with daily entries, focus mode, year view, and auto-save
- Add inbox capture for text, images, voice, and social media posts
- Add quick capture window with global keyboard shortcut
- Add inbox filing to folders, notes, and task conversion
- Add AI-powered filing and folder suggestions with sqlite-vec embeddings
- Add reminder system for notes, journals, and highlights
- Add folder view with table, column resize/reorder, and formula columns
- Add folder view sorting, filtering, grouping, and keyboard navigation
- Add multiple named views per folder with .folder.md persistence
- Add note templates with folder defaults and duplication
- Add note export and version history (snapshots)
- Add note attachments with upload and delete
- Add tags system with sidebar drill-down navigation
- Add bookmarks and emoji support for notes
- Add reveal-in-sidebar and native context menus
- Add drag-and-drop file import in sidebar

### Changed
- Consolidate notes hooks into TanStack Query with optimistic updates
- Memoize property cells and group header rows in folder view
