# Data Model: Core Data Layer

**Feature**: Core Data Layer
**Date**: 2025-12-18
**Status**: Complete

## Overview

This document defines the data models for Memry's core data layer, including both file-based storage (notes, journal entries) and SQLite database storage (tasks, projects, settings).

---

## Storage Architecture

```
vault/                          # User-selected vault folder
├── notes/                      # User notes (markdown files)
│   ├── my-note.md
│   └── subfolder/
│       └── another-note.md
├── journal/                    # Daily journal entries
│   ├── 2025-12-18.md
│   └── 2025-12-17.md
├── attachments/                # Binary attachments
│   ├── images/
│   └── files/
└── .memry/                     # App data (hidden folder)
    ├── data.db                 # Source of truth: tasks, projects, settings
    ├── index.db                # Rebuildable: note cache, FTS index
    └── config.json             # Vault-specific configuration
```

---

## File-Based Entities

### Note

Notes are stored as markdown files with YAML frontmatter. The file system is the source of truth.

**File Location**: `vault/notes/**/*.md`

**Frontmatter Schema**:
```yaml
---
id: "a3b7c9d2e1f4"        # Required: Unique identifier (nanoid)
title: "My Note Title"     # Optional: Display title (defaults to filename)
created: "2025-12-18T10:00:00Z"   # Required: ISO 8601 timestamp
modified: "2025-12-18T15:30:00Z"  # Required: ISO 8601 timestamp
tags:                      # Optional: Array of tag strings
  - work
  - important
aliases:                   # Optional: Alternative titles for linking
  - "Old Title"
---

# Note content in markdown...
```

**TypeScript Interface**:
```typescript
interface NoteFrontmatter {
  id: string;
  title?: string;
  created: string;
  modified: string;
  tags?: string[];
  aliases?: string[];
  [key: string]: unknown;  // Allow custom properties
}

interface Note {
  id: string;
  path: string;           // Relative path from vault root
  title: string;          // From frontmatter or filename
  content: string;        // Markdown content (without frontmatter)
  frontmatter: NoteFrontmatter;
  created: Date;
  modified: Date;
  tags: string[];
  aliases: string[];
}
```

**Validation Rules**:
- `id`: 8-21 alphanumeric characters, generated if missing
- `title`: 1-200 characters, extracted from filename if missing
- `created`: Valid ISO 8601 datetime, set to file creation time if missing
- `modified`: Valid ISO 8601 datetime, updated on every save
- `tags`: Array of 1-50 character strings, lowercase normalized

---

### Journal Entry

Daily journal entries are specialized notes with date-based naming.

**File Location**: `vault/journal/YYYY-MM-DD.md`

**Frontmatter Schema**:
```yaml
---
id: "j2025-12-18"          # Required: Prefixed with 'j' + date
date: "2025-12-18"         # Required: ISO 8601 date
created: "2025-12-18T08:00:00Z"
modified: "2025-12-18T20:00:00Z"
mood: "good"               # Optional: User-defined mood
weather: "sunny"           # Optional: Weather note
---

# December 18, 2025

Today's journal content...
```

**TypeScript Interface**:
```typescript
interface JournalFrontmatter extends NoteFrontmatter {
  date: string;           // ISO 8601 date (YYYY-MM-DD)
  mood?: string;
  weather?: string;
}

interface JournalEntry {
  id: string;
  date: Date;
  path: string;
  content: string;
  frontmatter: JournalFrontmatter;
  created: Date;
  modified: Date;
}
```

---

## Database Entities

### data.db Schema

The `data.db` database stores structured data that doesn't benefit from file-based storage.

```sql
-- Enable WAL mode for better performance
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- Schema version tracking
CREATE TABLE schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Projects: containers for tasks
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#6366f1',
  icon TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_inbox INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  modified_at TEXT NOT NULL DEFAULT (datetime('now')),
  archived_at TEXT
);

-- Default inbox project
INSERT INTO projects (id, name, is_inbox, position)
VALUES ('inbox', 'Inbox', 1, 0);

-- Custom statuses per project
CREATE TABLE statuses (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6b7280',
  position INTEGER NOT NULL DEFAULT 0,
  is_default INTEGER NOT NULL DEFAULT 0,
  is_done INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tasks
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status_id TEXT REFERENCES statuses(id) ON DELETE SET NULL,
  parent_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,
  priority INTEGER NOT NULL DEFAULT 0,  -- 0=none, 1=low, 2=medium, 3=high
  position INTEGER NOT NULL DEFAULT 0,

  due_date TEXT,                         -- ISO 8601 date
  due_time TEXT,                         -- HH:mm format
  start_date TEXT,                       -- ISO 8601 date

  -- Repeat configuration (JSON)
  repeat_config TEXT,                    -- JSON: { type, interval, days[], endDate }
  repeat_from TEXT,                      -- 'due' | 'completion'

  -- Completion tracking
  completed_at TEXT,
  archived_at TEXT,

  -- Timestamps
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  modified_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Task-Note links
CREATE TABLE task_notes (
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  note_id TEXT NOT NULL,                 -- References note frontmatter id
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (task_id, note_id)
);

-- Task tags
CREATE TABLE task_tags (
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (task_id, tag)
);

-- Inbox items (quick capture before filing)
CREATE TABLE inbox_items (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,                    -- 'text' | 'link' | 'voice' | 'image'
  content TEXT NOT NULL,                 -- Text content or file path
  metadata TEXT,                         -- JSON: { url, title, thumbnail } for links
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  filed_at TEXT                          -- When moved to note/task
);

-- App settings
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,                   -- JSON-encoded value
  modified_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Saved filters
CREATE TABLE saved_filters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  config TEXT NOT NULL,                  -- JSON filter configuration
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for common queries
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status_id);
CREATE INDEX idx_tasks_parent ON tasks(parent_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_completed ON tasks(completed_at);
CREATE INDEX idx_inbox_type ON inbox_items(type);
```

---

### index.db Schema

The `index.db` database is a rebuildable cache for note metadata and full-text search.

```sql
PRAGMA journal_mode = WAL;

-- Schema version
CREATE TABLE schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Note metadata cache (rebuildable from files)
CREATE TABLE note_cache (
  id TEXT PRIMARY KEY,                   -- From frontmatter
  path TEXT NOT NULL UNIQUE,             -- Relative path from vault
  title TEXT NOT NULL,
  content_hash TEXT NOT NULL,            -- For change detection
  word_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  modified_at TEXT NOT NULL,
  indexed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tags extracted from notes
CREATE TABLE note_tags (
  note_id TEXT NOT NULL REFERENCES note_cache(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (note_id, tag)
);

-- Wiki links between notes
CREATE TABLE note_links (
  source_id TEXT NOT NULL REFERENCES note_cache(id) ON DELETE CASCADE,
  target_id TEXT,                        -- NULL if target doesn't exist
  target_title TEXT NOT NULL,            -- Original link text
  PRIMARY KEY (source_id, target_title)
);

-- Full-text search index
CREATE VIRTUAL TABLE fts_notes USING fts5(
  id UNINDEXED,
  title,
  content,
  tags,
  tokenize='porter unicode61'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER note_cache_insert AFTER INSERT ON note_cache BEGIN
  INSERT INTO fts_notes (id, title, content, tags)
  SELECT NEW.id, NEW.title, '', '';
END;

CREATE TRIGGER note_cache_delete AFTER DELETE ON note_cache BEGIN
  DELETE FROM fts_notes WHERE id = OLD.id;
END;

-- Indexes
CREATE INDEX idx_note_cache_path ON note_cache(path);
CREATE INDEX idx_note_cache_modified ON note_cache(modified_at);
CREATE INDEX idx_note_tags_tag ON note_tags(tag);
CREATE INDEX idx_note_links_target ON note_links(target_id);
```

---

## TypeScript Interfaces

### Task Entity

```typescript
interface RepeatConfig {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number;
  days?: number[];           // For weekly: 0=Sun, 1=Mon, etc.
  dayOfMonth?: number;       // For monthly
  endDate?: string;          // ISO 8601 date
}

interface Task {
  id: string;
  projectId: string;
  statusId: string | null;
  parentId: string | null;

  title: string;
  description: string | null;
  priority: 0 | 1 | 2 | 3;
  position: number;

  dueDate: string | null;
  dueTime: string | null;
  startDate: string | null;

  repeatConfig: RepeatConfig | null;
  repeatFrom: 'due' | 'completion' | null;

  completedAt: Date | null;
  archivedAt: Date | null;

  createdAt: Date;
  modifiedAt: Date;

  // Relations (loaded separately)
  subtasks?: Task[];
  linkedNotes?: string[];    // Note IDs
  tags?: string[];
}
```

### Project Entity

```typescript
interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  position: number;
  isInbox: boolean;
  createdAt: Date;
  modifiedAt: Date;
  archivedAt: Date | null;

  // Relations
  statuses?: Status[];
  taskCount?: number;
}

interface Status {
  id: string;
  projectId: string;
  name: string;
  color: string;
  position: number;
  isDefault: boolean;
  isDone: boolean;
  createdAt: Date;
}
```

### Inbox Item Entity

```typescript
interface LinkMetadata {
  url: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  siteName?: string;
}

interface InboxItem {
  id: string;
  type: 'text' | 'link' | 'voice' | 'image';
  content: string;
  metadata: LinkMetadata | null;
  createdAt: Date;
  filedAt: Date | null;
}
```

### Settings Entity

```typescript
interface AppSettings {
  // Appearance
  theme: 'light' | 'dark' | 'system';
  fontSize: number;

  // Editor
  spellCheck: boolean;
  autoSave: boolean;
  autoSaveInterval: number;

  // Tasks
  defaultProject: string;
  showCompletedTasks: boolean;
  archiveCompletedAfterDays: number;

  // Search
  searchIncludeArchived: boolean;

  // Vault
  excludePatterns: string[];
}

// Stored as key-value pairs in settings table
type SettingKey = keyof AppSettings;
```

---

## Relationships

```
┌─────────────────────────────────────────────────────────────────────┐
│                           VAULT (File System)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐    links to    ┌──────────┐                          │
│  │   Note   │ ──────────────▶│   Note   │                          │
│  │   (.md)  │◀────────────── │   (.md)  │   (wiki links)           │
│  └────┬─────┘                └──────────┘                          │
│       │                                                             │
│       │ has tags                                                    │
│       ▼                                                             │
│  ┌──────────┐                                                       │
│  │   Tags   │                                                       │
│  └──────────┘                                                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          data.db (SQLite)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐   contains    ┌──────────┐   has child   ┌─────────┐ │
│  │ Project  │ ─────────────▶│   Task   │ ────────────▶ │  Task   │ │
│  └────┬─────┘               └────┬─────┘               │(subtask)│ │
│       │                          │                      └─────────┘ │
│       │ has statuses             │ links to                         │
│       ▼                          ▼                                  │
│  ┌──────────┐              ┌──────────┐                             │
│  │  Status  │              │   Note   │  (via note_id)              │
│  └──────────┘              └──────────┘                             │
│                                                                      │
│  ┌──────────┐                                                       │
│  │  Inbox   │ ─────▶ can become Task or Note                        │
│  │   Item   │                                                       │
│  └──────────┘                                                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         index.db (SQLite)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐   indexed in   ┌─────────────┐                    │
│  │ note_cache  │ ──────────────▶│  fts_notes  │                    │
│  └──────┬──────┘                └─────────────┘                    │
│         │                                                           │
│         │ extracted from files                                      │
│         ▼                                                           │
│  ┌─────────────┐              ┌─────────────┐                      │
│  │ note_tags   │              │ note_links  │                      │
│  └─────────────┘              └─────────────┘                      │
│                                                                      │
│  (All data rebuildable from vault files)                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Migration Strategy

### Initial Migration (v1)

```typescript
// src/main/database/migrations/data/001_initial.ts
export const up = (db: Database) => {
  db.exec(`
    -- All CREATE TABLE statements from data.db schema above
  `);
};

export const down = (db: Database) => {
  db.exec(`
    DROP TABLE IF EXISTS task_notes;
    DROP TABLE IF EXISTS task_tags;
    DROP TABLE IF EXISTS tasks;
    DROP TABLE IF EXISTS statuses;
    DROP TABLE IF EXISTS projects;
    DROP TABLE IF EXISTS inbox_items;
    DROP TABLE IF EXISTS saved_filters;
    DROP TABLE IF EXISTS settings;
    DROP TABLE IF EXISTS schema_version;
  `);
};
```

### Migration Runner

```typescript
interface Migration {
  version: number;
  name: string;
  up: (db: Database) => void;
  down: (db: Database) => void;
}

function runMigrations(db: Database, migrations: Migration[]): void {
  const currentVersion = getCurrentVersion(db);

  const pendingMigrations = migrations
    .filter(m => m.version > currentVersion)
    .sort((a, b) => a.version - b.version);

  db.transaction(() => {
    for (const migration of pendingMigrations) {
      migration.up(db);
      db.prepare('INSERT INTO schema_version (version) VALUES (?)')
        .run(migration.version);
    }
  })();
}
```

---

## Validation

All entity validation uses Zod schemas at system boundaries:

```typescript
import { z } from 'zod';

export const TaskCreateSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1).max(500),
  description: z.string().max(10000).optional(),
  priority: z.number().int().min(0).max(3).default(0),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dueTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  parentId: z.string().optional()
});

export const NoteCreateSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string(),
  tags: z.array(z.string().max(50)).max(50).optional(),
  folder: z.string().optional()  // Subfolder path
});

export type TaskCreateInput = z.infer<typeof TaskCreateSchema>;
export type NoteCreateInput = z.infer<typeof NoteCreateSchema>;
```
