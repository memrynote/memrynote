# Feature Specification: Memry Core Platform

**Feature Branch**: `001-core-platform`
**Created**: 2025-12-16
**Status**: Draft
**Input**: Build Memry, an all-in-one local-first productivity platform combining note-taking, visual canvases, task management, and knowledge organization with E2EE and AI assistance.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Open Vault (Priority: P1)

A user wants to designate a folder on their computer as their personal knowledge vault. They open Memry for the first time, select or create a folder, and the application begins treating that folder as the source of truth for all their notes, files, and data.

**Why this priority**: The vault is the foundational concept—nothing else works without it. Users must be able to establish where their data lives before any other feature.

**Independent Test**: Can be fully tested by creating a new vault and verifying the folder structure is created correctly with default configuration files.

**Acceptance Scenarios**:

1. **Given** a fresh Memry installation, **When** the user launches the app, **Then** they are prompted to select or create a vault folder
2. **Given** the user selects an existing folder, **When** they confirm, **Then** the folder is initialized as a vault with a `.memry` configuration directory
3. **Given** the user has an existing Memry vault, **When** they launch the app, **Then** it automatically opens the last-used vault
4. **Given** a user with multiple vaults, **When** they access vault settings, **Then** they can switch between vaults or add new ones

---

### User Story 2 - Create and Edit Markdown Notes (Priority: P1)

A user wants to create a new note, write content using Markdown formatting, and have it automatically saved. They can add frontmatter metadata like tags and custom fields, and see their formatting rendered in real-time.

**Why this priority**: Note creation is the core value proposition. Without this, Memry has no content.

**Independent Test**: Can be tested by creating a note, adding text with Markdown formatting, closing and reopening it to verify persistence.

**Acceptance Scenarios**:

1. **Given** an open vault, **When** the user clicks "New Note" or presses keyboard shortcut, **Then** a new Markdown file is created with default frontmatter
2. **Given** a note open in editor, **When** the user types Markdown syntax, **Then** they see live preview of formatted content
3. **Given** a note with content, **When** the user stops typing, **Then** changes are automatically saved within 1 second
4. **Given** a note with YAML frontmatter, **When** the user edits metadata fields, **Then** the frontmatter is updated and parsed correctly
5. **Given** a user typing `[[`, **When** they continue typing, **Then** autocomplete suggests existing notes for wikilink creation

---

### User Story 3 - File System Watching & External Edits (Priority: P1)

A user edits their vault files using external tools like VS Code, Finder, or terminal commands. Memry detects these changes automatically and updates its view without requiring restart or manual refresh.

**Why this priority**: The "file system as source of truth" principle is non-negotiable. Users must trust that external editing works seamlessly.

**Independent Test**: Can be tested by editing a vault file in an external text editor and verifying Memry reflects the change within 1 second.

**Acceptance Scenarios**:

1. **Given** a vault is open in Memry, **When** a user creates a file in the vault folder using Finder/Explorer, **Then** Memry shows the new file within 1 second
2. **Given** a note is displayed in Memry, **When** the same file is modified in an external editor, **Then** Memry updates its view within 1 second
3. **Given** a file exists in the vault, **When** it is deleted via terminal command, **Then** Memry removes it from the file browser within 1 second
4. **Given** a file is renamed or moved externally, **When** Memry detects the change, **Then** links pointing to that file are updated or marked broken
5. **Given** a user has unsaved changes in Memry, **When** the same file is modified externally, **Then** Memry presents a conflict resolution dialog

---

### User Story 4 - Browse and Organize Files (Priority: P1)

A user navigates their vault using a file browser sidebar. They can create folders to organize notes, move files between folders, and see all file types in their vault—not just Markdown files.

**Why this priority**: Organization is essential for usability. Users need to find and structure their content.

**Independent Test**: Can be tested by creating folders, moving files between them, and verifying the file system reflects these changes.

**Acceptance Scenarios**:

1. **Given** an open vault, **When** the user views the sidebar, **Then** they see a hierarchical tree of all files and folders
2. **Given** the file browser, **When** the user drags a file to another folder, **Then** the file moves both in Memry and on disk
3. **Given** any file type in the vault, **When** the user views the file browser, **Then** the file appears with appropriate icon and is accessible
4. **Given** the file browser, **When** the user right-clicks, **Then** they can create new files, folders, rename, or delete items

---

### User Story 5 - Search Across Vault (Priority: P1)

A user wants to find content quickly. They open a search interface, type keywords, and see results from note content, filenames, and metadata. Search works instantly even with thousands of files.

**Why this priority**: Search is the primary way users retrieve information. Without fast search, vaults become unusable at scale.

**Independent Test**: Can be tested by creating notes with specific keywords and verifying search returns accurate results within 1 second.

**Acceptance Scenarios**:

1. **Given** an open vault, **When** the user presses the search shortcut, **Then** a search interface appears with keyboard focus
2. **Given** the search input, **When** the user types keywords, **Then** results appear in real-time as they type
3. **Given** search results, **When** the user sees a result, **Then** they can see which file it's from and a content preview with highlighted matches
4. **Given** search results, **When** the user clicks or presses Enter on a result, **Then** the file opens at the matching location
5. **Given** a vault with 10,000+ files, **When** the user searches, **Then** results appear within 1 second

---

### User Story 6 - Link Notes with Wikilinks (Priority: P2)

A user creates connections between notes using `[[wikilink]]` syntax. When viewing a note, they can see all other notes that link back to it (backlinks). This creates a web of interconnected knowledge.

**Why this priority**: Linking is what transforms notes into a knowledge graph. It's the differentiating feature of PKM tools.

**Independent Test**: Can be tested by creating two notes, linking them, and verifying backlinks appear on both.

**Acceptance Scenarios**:

1. **Given** a note open in editor, **When** the user types `[[note name]]`, **Then** it becomes a clickable link to that note
2. **Given** Note A links to Note B, **When** the user views Note B, **Then** they see Note A listed in the backlinks panel
3. **Given** a wikilink with alias `[[note|Display Text]]`, **When** rendered, **Then** the display text shows but links to the actual note
4. **Given** a link to a non-existent note, **When** the user clicks it, **Then** they are prompted to create that note
5. **Given** notes in nested folders, **When** linking, **Then** wikilinks work regardless of folder structure

---

### User Story 7 - Encrypt Vault with Passphrase (Priority: P2)

A user wants to protect their vault with encryption. They set a passphrase, and all files are encrypted at rest. When they unlock the vault, files appear decrypted. If the vault is locked or the app closes, data remains encrypted on disk.

**Why this priority**: End-to-end encryption is a core non-negotiable principle. Users must trust their data is secure.

**Independent Test**: Can be tested by enabling encryption, verifying files on disk are unreadable, then unlocking and verifying content is accessible.

**Acceptance Scenarios**:

1. **Given** an unencrypted vault, **When** the user enables encryption in settings, **Then** they are prompted to create a passphrase
2. **Given** a passphrase is set, **When** encryption is enabled, **Then** all vault files are encrypted on disk
3. **Given** an encrypted vault, **When** the user opens Memry, **Then** they must enter their passphrase to unlock
4. **Given** an unlocked vault, **When** the user edits files, **Then** changes are encrypted before saving to disk
5. **Given** raw vault files viewed in external editor, **When** vault is encrypted, **Then** file contents appear as unintelligible encrypted data
6. **Given** a user forgets their passphrase, **When** they attempt to open the vault, **Then** they cannot access content (zero-knowledge)

---

### User Story 8 - View and Navigate Knowledge Graph (Priority: P2)

A user wants to visualize how their notes connect. They open a graph view showing notes as nodes and links as edges. They can zoom, pan, filter, and click nodes to navigate.

**Why this priority**: The graph view provides insight into knowledge structure and helps users discover forgotten connections.

**Independent Test**: Can be tested by creating interconnected notes and verifying the graph displays connections accurately.

**Acceptance Scenarios**:

1. **Given** a vault with linked notes, **When** the user opens graph view, **Then** they see nodes representing notes and edges representing links
2. **Given** the graph view, **When** the user clicks a node, **Then** that note opens in the editor
3. **Given** the graph view, **When** the user zooms or pans, **Then** the view responds smoothly
4. **Given** the graph view, **When** the user filters by tag or folder, **Then** only matching notes appear
5. **Given** a note open in editor, **When** the user opens local graph, **Then** they see only that note and its direct connections

---

### User Story 9 - Create and Edit JSON Canvas (Priority: P3)

A user wants to create a visual canvas for brainstorming. They create a `.canvas` file, add text nodes, embed files and links, draw connections between nodes, and arrange everything spatially on an infinite canvas.

**Why this priority**: Canvas provides a different thinking modality than linear notes—essential for visual thinkers.

**Independent Test**: Can be tested by creating a canvas, adding nodes and edges, saving, and reopening to verify persistence.

**Acceptance Scenarios**:

1. **Given** an open vault, **When** the user creates a new canvas, **Then** a `.canvas` file is created using JSON Canvas format
2. **Given** an open canvas, **When** the user double-clicks empty space, **Then** a new text node is created at that position
3. **Given** canvas nodes, **When** the user drags from one node to another, **Then** an edge connection is created
4. **Given** the canvas, **When** the user drags a file from file browser, **Then** a file embed node is created
5. **Given** the canvas, **When** the user pans and zooms, **Then** the view responds smoothly with no boundaries
6. **Given** canvas edges, **When** the user selects an edge, **Then** they can add labels, change colors, or modify arrow styles

---

### User Story 10 - Manage Tasks Inline and Aggregated (Priority: P3)

A user creates tasks within their notes using checkbox syntax. These tasks are automatically extracted and aggregated into a unified task view. They can see all tasks across their vault, filter by due date or priority, and complete tasks from any view.

**Why this priority**: Task management integrates productivity with knowledge management, a key differentiator.

**Independent Test**: Can be tested by creating tasks in notes and verifying they appear in the aggregated task view.

**Acceptance Scenarios**:

1. **Given** a note open in editor, **When** the user types `- [ ] Task text`, **Then** an interactive checkbox is rendered
2. **Given** tasks exist across multiple notes, **When** the user opens Tasks view, **Then** all tasks are aggregated in one list
3. **Given** the task view, **When** the user clicks a task, **Then** they can see which note it belongs to and navigate there
4. **Given** a task with due date syntax, **When** viewed, **Then** the due date is parsed and displayed
5. **Given** a task is completed in any view, **When** saved, **Then** the checkbox state updates in the source note file
6. **Given** tasks with priorities, **When** viewing task list, **Then** users can sort by priority (P1-P4)

---

### User Story 11 - View Calendar with Tasks and Events (Priority: P3)

A user views their tasks and events in a calendar interface. Tasks with due dates appear on their respective days. Daily notes are linked to calendar dates. They can create new items directly from the calendar.

**Why this priority**: Calendar view provides temporal context for tasks and enables time-based planning.

**Independent Test**: Can be tested by creating tasks with due dates and verifying they appear on correct calendar dates.

**Acceptance Scenarios**:

1. **Given** the calendar view, **When** the user navigates months/weeks, **Then** they see tasks with due dates on appropriate days
2. **Given** a calendar day, **When** the user clicks it, **Then** they can create a daily note for that date or view existing one
3. **Given** a task on the calendar, **When** the user drags it to another day, **Then** the due date updates in the source note
4. **Given** daily note templates are configured, **When** a daily note is created, **Then** it uses the template
5. **Given** external calendar sync is enabled, **When** viewing calendar, **Then** external events appear alongside tasks

---

### User Story 12 - Use AI Assistant for Content (Priority: P4)

A user wants AI to help with their notes. They can ask questions about their vault content, get summaries of long documents, receive writing suggestions, and get automatic tag recommendations. AI processing defaults to local inference with cloud as opt-in.

**Why this priority**: AI augmentation adds significant value but is not required for core functionality.

**Independent Test**: Can be tested by invoking AI features and verifying responses are relevant and private by default.

**Acceptance Scenarios**:

1. **Given** the AI panel is open, **When** the user asks a question, **Then** the AI responds based on vault content (RAG)
2. **Given** a long note is open, **When** the user requests summary, **Then** AI generates a concise summary
3. **Given** text is selected, **When** the user invokes writing assistant, **Then** AI offers suggestions for grammar, style, or continuation
4. **Given** a note with content, **When** the user requests tag suggestions, **Then** AI proposes relevant tags based on content
5. **Given** default settings, **When** AI features are used, **Then** processing happens locally without sending data externally
6. **Given** cloud AI is enabled, **When** data would leave device, **Then** a clear visual indicator warns the user

---

### User Story 13 - Quick Capture with Global Hotkey (Priority: P4)

A user has a sudden thought while working in another app. They press a global hotkey, a capture window appears, they type their thought and press Enter. The thought is saved to their inbox folder as a new note.

**Why this priority**: Quick capture enables seamless capture flow but requires core vault features first.

**Independent Test**: Can be tested by pressing global hotkey from outside Memry and verifying a new note appears in inbox.

**Acceptance Scenarios**:

1. **Given** Memry is running (even minimized), **When** user presses global capture hotkey, **Then** a small capture window appears instantly
2. **Given** the capture window, **When** user types and presses Enter, **Then** content is saved as new note in inbox folder
3. **Given** the capture window, **When** user presses Escape, **Then** the window closes without saving
4. **Given** captured notes in inbox, **When** user opens Memry, **Then** they see inbox items for processing
5. **Given** capture settings, **When** user configures, **Then** they can change default folder, add auto-tags, or set templates

---

### User Story 14 - Sync Vault Across Devices (Priority: P5)

A user wants their vault accessible on multiple devices. They enable sync, and changes propagate to their other devices. Sync is peer-to-peer where possible. All data remains encrypted during transit.

**Why this priority**: Multi-device sync is important but not required for single-device MVP.

**Independent Test**: Can be tested by making changes on one device and verifying they appear on another linked device.

**Acceptance Scenarios**:

1. **Given** sync is enabled on device A, **When** user sets up device B, **Then** they can link it to the same vault
2. **Given** devices are linked, **When** user creates a note on device A, **Then** it appears on device B within reasonable time
3. **Given** both devices edit the same note, **When** a conflict occurs, **Then** the system uses resolution strategy or prompts user
4. **Given** sync is in progress, **When** data transfers, **Then** it remains encrypted end-to-end
5. **Given** no internet connection, **When** user edits vault, **Then** changes queue and sync when connection returns

---

### User Story 15 - Preview and Play Media Files (Priority: P4)

A user adds images, audio, and video files to their vault. They can preview images inline in notes, play audio with waveform visualization, and watch videos with standard controls.

**Why this priority**: Media support enhances note-taking but is not required for core text functionality.

**Independent Test**: Can be tested by adding media files to vault and verifying they display/play correctly.

**Acceptance Scenarios**:

1. **Given** an image file in vault, **When** embedded in note with `![[image.png]]`, **Then** the image renders inline
2. **Given** an audio file in vault, **When** opened, **Then** it plays in built-in player with waveform and controls
3. **Given** a video file in vault, **When** opened, **Then** it plays with standard video controls
4. **Given** a PDF file in vault, **When** opened, **Then** it renders with page navigation
5. **Given** an image with EXIF data, **When** viewing metadata, **Then** photo information is extracted and displayed

---

### Edge Cases

- What happens when a user tries to create a note with the same name as an existing note?
  - System appends a number suffix (e.g., `Note 1.md`) and optionally prompts user
- How does the system handle corrupt or invalid Markdown frontmatter?
  - Parse what's valid, show warning for invalid sections, never lose content
- What happens when encryption is enabled on a vault with existing links?
  - Links continue to work; internal references use decrypted paths when unlocked
- How does search handle special characters or regex-like patterns?
  - Escape special characters by default; provide advanced mode for regex
- What happens when a user embeds a note into itself?
  - Detect circular embeds and show placeholder preventing infinite loop
- How does the system handle very large files (100MB+ videos)?
  - Stream content rather than loading into memory; show progress indicators
- What happens when file system watching encounters permission errors?
  - Log warning, notify user, continue watching accessible files
- How does the calendar handle tasks in different timezones?
  - Store in UTC, display in user's local timezone, respect daylight saving
- What happens when offline with pending sync changes?
  - Queue changes locally, sync when connection restores, resolve conflicts if needed
- How does the system handle a vault on a network drive with latency?
  - Increase file watch debounce, show sync status, handle disconnection gracefully

---

## Requirements *(mandatory)*

### Functional Requirements

#### Vault & File Management
- **FR-001**: System MUST allow users to select or create a folder as their vault
- **FR-002**: System MUST initialize vaults with a `.memry` configuration directory
- **FR-003**: System MUST display all files in the vault regardless of type
- **FR-004**: System MUST support hierarchical folder organization
- **FR-005**: System MUST detect file system changes within 1 second
- **FR-006**: System MUST reconcile external file creations, modifications, deletions, renames, and moves
- **FR-007**: System MUST present conflict resolution UI when external and internal changes conflict

#### Note Editing
- **FR-008**: System MUST create Markdown files with YAML frontmatter
- **FR-009**: System MUST parse frontmatter and extract metadata (title, tags, aliases, dates, custom fields)
- **FR-010**: System MUST auto-save note changes within 1 second of last keystroke
- **FR-011**: System MUST render Markdown preview in real-time
- **FR-012**: System MUST support Markdown extensions: wikilinks, task checkboxes, callouts, embeds

#### Linking & Knowledge Graph
- **FR-013**: System MUST parse `[[wikilink]]` syntax and create navigable links
- **FR-014**: System MUST support alias syntax `[[note|Display Text]]`
- **FR-015**: System MUST track and display backlinks for each note
- **FR-016**: System MUST support transclusion with `![[embed]]` syntax
- **FR-017**: System MUST render interactive graph visualization of note connections
- **FR-018**: System MUST support hierarchical tags in frontmatter with `/` separator

#### Canvas
- **FR-019**: System MUST create and edit `.canvas` files following JSON Canvas specification
- **FR-020**: System MUST support text, file embed, link, and group node types
- **FR-021**: System MUST support edge connections with labels and styling
- **FR-022**: Canvas MUST support infinite pan and zoom

#### Task Management
- **FR-023**: System MUST parse `- [ ]` and `- [x]` checkbox syntax in Markdown
- **FR-024**: System MUST aggregate tasks from all notes into unified views
- **FR-025**: System MUST parse task metadata: due dates, priorities (P1-P4), and status
- **FR-026**: System MUST support multiple task views: list, kanban, calendar, gantt
- **FR-027**: Task completion in any view MUST update the source note file

#### Calendar
- **FR-028**: System MUST display calendar view with tasks on their due dates
- **FR-029**: System MUST support daily note creation linked to calendar dates
- **FR-030**: System MUST support daily note templates
- **FR-031**: System MUST optionally sync with external calendars (Google, Outlook, Apple)

#### Search
- **FR-032**: System MUST provide full-text search across all text content
- **FR-033**: System MUST provide filename search for all file types
- **FR-034**: System MUST return search results within 1 second for vaults up to 10,000 files
- **FR-035**: System MUST highlight search matches in results and opened files
- **FR-036**: System MUST support filters by file type, folder, tags, and date ranges

#### Encryption
- **FR-037**: System MUST encrypt all vault files at rest when encryption is enabled
- **FR-038**: System MUST derive encryption key from user passphrase
- **FR-039**: Encryption keys MUST never leave the user's device
- **FR-040**: System MUST require passphrase to unlock encrypted vault
- **FR-041**: System MUST provide transparent encryption—files appear decrypted when unlocked
- **FR-042**: System MUST support optional hardware key (YubiKey) for encryption

#### AI Assistant
- **FR-043**: System MUST default to local AI inference
- **FR-044**: System MUST require explicit opt-in for cloud AI processing
- **FR-045**: System MUST display clear indicator when data would leave device
- **FR-046**: System MUST support: summarization, writing assistance, semantic search, tag suggestions, Q&A over vault
- **FR-047**: System MUST function fully without any AI features enabled

#### Quick Capture
- **FR-048**: System MUST respond to global hotkey for quick capture
- **FR-049**: System MUST save captured content to designated inbox folder
- **FR-050**: Quick capture MUST work when main window is minimized or closed

#### Media Support
- **FR-051**: System MUST display images inline when embedded in notes
- **FR-052**: System MUST play audio files with waveform visualization
- **FR-053**: System MUST play video files with standard controls
- **FR-054**: System MUST render PDFs with page navigation
- **FR-055**: System MUST extract text from PDFs for search indexing

#### Sync
- **FR-056**: System MUST optionally sync vault across user's devices
- **FR-057**: Sync MUST keep data encrypted end-to-end in transit
- **FR-058**: System MUST resolve conflicts using appropriate strategy or user prompt
- **FR-059**: System MUST queue changes when offline and sync when connected

#### User Experience
- **FR-060**: System MUST provide keyboard shortcuts for all primary actions
- **FR-061**: System MUST support light and dark themes
- **FR-062**: System MUST maintain consistent UI across Windows, macOS, and Linux
- **FR-063**: System MUST meet WCAG 2.1 AA accessibility standards

### Key Entities

- **Vault**: A designated folder on the user's file system that contains all their knowledge. Has path, encryption status, last opened timestamp, and configuration.

- **Note**: A Markdown file within the vault. Has path, frontmatter metadata (title, tags, aliases, dates, custom fields), content, and computed backlinks.

- **Canvas**: A JSON Canvas file within the vault. Contains nodes (text, file, link, group) and edges with their positions, dimensions, and connections.

- **Task**: An inline checkbox item extracted from notes. Has content, source note, line number, completion status, due date, priority, and tags.

- **Link**: A connection between notes. Has source note, target note, anchor text, and type (wikilink or embed).

- **Tag**: A hierarchical label applied to notes. Has name, parent tag (if nested), and associated notes.

- **File**: Any file in the vault. Has path, type, size, created date, modified date, and indexed content (if text-based).

- **DailyNote**: A Markdown note linked to a calendar date. Has date, template reference, and associated tasks/events.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create their first note within 30 seconds of opening a new vault
- **SC-002**: External file changes are reflected in Memry within 1 second
- **SC-003**: Search returns results within 1 second for vaults with 10,000+ files
- **SC-004**: Users can navigate from any note to a linked note in one click
- **SC-005**: Encrypted vaults cannot be read without the correct passphrase (zero-knowledge verification)
- **SC-006**: The application starts and becomes usable within 3 seconds on standard hardware
- **SC-007**: UI interactions feel instant with responses under 100 milliseconds
- **SC-008**: Users can complete all primary actions using only keyboard shortcuts
- **SC-009**: Tasks created in notes appear in aggregated views immediately
- **SC-010**: Graph view displays note connections accurately with no missing links
- **SC-011**: AI features work offline using local inference with no external data transmission by default
- **SC-012**: Quick capture from global hotkey to saved note completes in under 2 seconds
- **SC-013**: The application handles vaults with 10,000+ files without performance degradation
- **SC-014**: Cross-device sync propagates changes within 30 seconds when online
- **SC-015**: 90% of users can find a specific note using search on first attempt

---

## Assumptions

1. **Primary Platform**: Desktop (Windows, macOS, Linux) is the primary target; mobile is secondary
2. **Internet Connectivity**: Core features work fully offline; only sync and cloud AI require internet
3. **Storage**: Users have sufficient local disk space for their vault; application does not manage storage quotas
4. **File System**: The underlying file system supports file watching and atomic operations
5. **Hardware**: Standard consumer hardware (4GB+ RAM, modern CPU); no specialized hardware required except optional YubiKey
6. **Browser Extensions**: Web clipper requires separate browser extension development
7. **External Calendar APIs**: Calendar sync requires OAuth integration with respective providers
8. **AI Models**: Local AI requires user to have compatible local inference runtime; app provides guidance but doesn't bundle models

---

## Dependencies

1. **Constitution Compliance**: Implementation must adhere to Memry Constitution v1.0.0 principles
2. **JSON Canvas Specification**: Canvas feature follows the Obsidian JSON Canvas specification
3. **File System Access**: Requires permissions to read/write designated vault folder
4. **System Tray**: Quick capture requires system tray/menu bar presence
5. **Global Hotkeys**: Capture feature depends on OS-level hotkey registration
