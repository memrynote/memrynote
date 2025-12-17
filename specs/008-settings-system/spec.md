# Feature Specification: Settings System

**Feature Branch**: `008-settings-system`
**Created**: 2025-12-18
**Status**: Draft
**Input**: User description: "Build the settings system that manages user preferences, account settings, and application configuration"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Change App Theme (Priority: P1)

As a user, I want to change the app theme between light, dark, and system modes so that I can use the application comfortably in different lighting conditions and match my OS preferences.

**Why this priority**: Theme is a fundamental visual preference that affects every interaction with the application. Users expect immediate control over this basic accessibility feature.

**Independent Test**: Can be fully tested by opening settings, selecting a theme option, and verifying the UI updates immediately across all screens.

**Acceptance Scenarios**:

1. **Given** I am in the settings panel, **When** I select "Light" theme, **Then** the entire application immediately switches to light colors
2. **Given** I am in the settings panel, **When** I select "Dark" theme, **Then** the entire application immediately switches to dark colors
3. **Given** I am in the settings panel, **When** I select "System" theme, **Then** the application follows my operating system's theme setting
4. **Given** my OS theme changes while the app is running with "System" selected, **When** the OS switches between light/dark, **Then** the app theme updates automatically

---

### User Story 2 - Manage Sync Account and Devices (Priority: P1)

As a user, I want to view and manage my sync account including seeing connected devices and signing out, so that I maintain control over my data synchronization and account security.

**Why this priority**: Account management is critical for user security and data control. Users need visibility into which devices have access to their data.

**Independent Test**: Can be fully tested by viewing account details, seeing device list, and performing sign-out action.

**Acceptance Scenarios**:

1. **Given** I am signed into a sync account, **When** I open account settings, **Then** I see my email, authentication provider, and account creation date
2. **Given** I have multiple devices linked, **When** I view the device list, **Then** I see all devices with their names, platforms, and last sync times
3. **Given** I want to sign out, **When** I click sign out and confirm, **Then** all local synced data is cleared and I am returned to an unsynced state
4. **Given** I have another device linked, **When** I remove that device, **Then** it is unlinked from my account and no longer syncs

---

### User Story 3 - View Recovery Key (Priority: P1)

As a user, I want to view my recovery key again after initial setup so that I can secure my account backup in case I lose access to my devices.

**Why this priority**: Recovery key is the only way to regain access to encrypted data. Users must be able to retrieve it securely.

**Independent Test**: Can be fully tested by requesting recovery key view, completing re-authentication, and copying the key.

**Acceptance Scenarios**:

1. **Given** I am in sync settings, **When** I request to view my recovery key, **Then** I am prompted to re-authenticate for security
2. **Given** I have successfully re-authenticated, **When** the recovery key is displayed, **Then** I can copy it to my clipboard
3. **Given** the recovery key is displayed, **When** I close the dialog or navigate away, **Then** the key is no longer visible on screen

---

### User Story 4 - Change Vault Location (Priority: P1)

As a user, I want to change where my data vault is stored on my computer so that I can control where my notes and tasks are saved.

**Why this priority**: Vault location determines where all user data lives. Users may need to move data to different drives or cloud-synced folders.

**Independent Test**: Can be fully tested by selecting a new vault location and verifying data is accessible from the new location.

**Acceptance Scenarios**:

1. **Given** I am in data settings, **When** I click "Change Vault Location", **Then** I can browse and select a new folder
2. **Given** I have selected a new vault location, **When** the move completes, **Then** all my data is accessible from the new location
3. **Given** I am changing vault location, **When** I select a folder with existing data, **Then** I am warned and given options to merge or replace

---

### User Story 5 - Configure Keyboard Shortcuts (Priority: P1)

As a user, I want to customize keyboard shortcuts so that I can work more efficiently with my preferred key combinations.

**Why this priority**: Power users rely heavily on keyboard shortcuts. Customization is essential for productivity and accessibility.

**Independent Test**: Can be fully tested by rebinding a shortcut and verifying the new binding works throughout the app.

**Acceptance Scenarios**:

1. **Given** I am in keyboard settings, **When** I view the shortcut list, **Then** I see all available shortcuts with their current key bindings
2. **Given** I want to change a shortcut, **When** I click on it and press a new key combination, **Then** the shortcut is rebound to my new keys
3. **Given** I try to bind a key already in use, **When** a conflict exists, **Then** I am warned and can choose to override or cancel
4. **Given** I have customized shortcuts, **When** I click "Reset to Defaults", **Then** all shortcuts return to their original bindings

---

### User Story 6 - Adjust Text Size and Font (Priority: P2)

As a user, I want to adjust text size and font preferences so that the application is comfortable to read for my vision needs.

**Why this priority**: Typography preferences are important for accessibility and comfort during extended use.

**Independent Test**: Can be fully tested by changing font size/family and verifying text updates throughout the application.

**Acceptance Scenarios**:

1. **Given** I am in general settings, **When** I adjust the font size slider, **Then** all text in the application resizes immediately
2. **Given** I am in general settings, **When** I select a different font family, **Then** the application text updates to the new font
3. **Given** I have accessibility needs, **When** I enable reduced motion, **Then** animations throughout the app are minimized

---

### User Story 7 - Configure Global Capture Shortcut (Priority: P2)

As a user, I want to set a global keyboard shortcut for quick capture so that I can add items to my inbox from anywhere on my computer.

**Why this priority**: Global capture is a key productivity feature that requires system-level shortcut registration.

**Independent Test**: Can be fully tested by setting a global shortcut and triggering it from outside the application.

**Acceptance Scenarios**:

1. **Given** I am in keyboard settings, **When** I set a global capture shortcut, **Then** the system registers this shortcut
2. **Given** I have set a global shortcut, **When** I press it from any application, **Then** the capture window appears
3. **Given** the app doesn't have accessibility permissions, **When** I try to set a global shortcut, **Then** I am guided to grant the required permission

---

### User Story 8 - Enable/Disable Sync Features (Priority: P2)

As a user, I want to enable or disable sync features so that I can control whether my data is synchronized across devices.

**Why this priority**: Users need control over sync behavior for privacy, offline use, or performance reasons.

**Independent Test**: Can be fully tested by toggling sync on/off and verifying sync behavior changes accordingly.

**Acceptance Scenarios**:

1. **Given** sync is enabled, **When** I toggle sync off, **Then** the app stops syncing and works locally only
2. **Given** sync is disabled, **When** I toggle sync on, **Then** the app resumes syncing with my account
3. **Given** I am viewing sync settings, **When** I check sync status, **Then** I see current sync state and last sync time

---

### User Story 9 - Manage Tags (Priority: P2)

As a user, I want to manage my tags (rename, delete, merge) so that I can keep my organization system clean and consistent.

**Why this priority**: Tag management is essential for users who organize content with tags. Accumulated tags need maintenance over time.

**Independent Test**: Can be fully tested by renaming a tag and verifying all tagged items update, or merging tags and seeing combined results.

**Acceptance Scenarios**:

1. **Given** I have existing tags, **When** I view tag management, **Then** I see all tags with their usage counts
2. **Given** I want to rename a tag, **When** I edit the tag name, **Then** all items with that tag update to the new name
3. **Given** I want to merge tags, **When** I merge tag A into tag B, **Then** all items tagged A become tagged B and tag A is removed
4. **Given** I want to delete a tag, **When** I delete it, **Then** the tag is removed from all items

---

### User Story 10 - Set Default Project for New Tasks (Priority: P2)

As a user, I want to set a default project for new tasks so that tasks I create are automatically assigned to my most-used project.

**Why this priority**: Reduces friction in task creation by pre-selecting a common project.

**Independent Test**: Can be fully tested by setting a default project and creating a new task to verify it's assigned automatically.

**Acceptance Scenarios**:

1. **Given** I am in task settings, **When** I select a default project, **Then** the setting is saved
2. **Given** I have a default project set, **When** I create a new task without specifying a project, **Then** it is assigned to the default project
3. **Given** I have a default project set, **When** I create a task and manually select a different project, **Then** my selection overrides the default

---

### User Story 11 - Export All Data (Priority: P3)

As a user, I want to export all my data so that I have a backup or can migrate to another application.

**Why this priority**: Data portability is important for user trust but is not needed for daily use.

**Independent Test**: Can be fully tested by initiating export and verifying the downloaded file contains all user data.

**Acceptance Scenarios**:

1. **Given** I am in data settings, **When** I click "Export All Data", **Then** I can choose an export format and destination
2. **Given** export is in progress, **When** the export completes, **Then** I receive a file containing all my notes, tasks, and settings
3. **Given** I have exported data, **When** I open the export file, **Then** the data is in a readable format (JSON or structured folder)

---

### User Story 12 - Import Data from Other Apps (Priority: P3)

As a user, I want to import data from other applications so that I can migrate my existing notes and tasks to this app.

**Why this priority**: Useful for onboarding but not critical for daily operation.

**Independent Test**: Can be fully tested by importing a sample file from a supported format and verifying data appears correctly.

**Acceptance Scenarios**:

1. **Given** I am in data settings, **When** I click "Import Data", **Then** I see supported import formats
2. **Given** I select a file to import, **When** import completes, **Then** the imported items appear in my inbox or notes
3. **Given** there are conflicts during import, **When** duplicates are detected, **Then** I can choose to skip, merge, or replace

---

### User Story 13 - Configure AI Features (Priority: P3)

As a user, I want to enable/disable AI features and configure API keys so that I can control AI usage and costs.

**Why this priority**: AI features are optional enhancements, not core functionality.

**Independent Test**: Can be fully tested by enabling AI, entering an API key, and testing the connection.

**Acceptance Scenarios**:

1. **Given** I am in AI settings, **When** I toggle AI features, **Then** AI-powered features are enabled or disabled throughout the app
2. **Given** AI is enabled, **When** I enter an API key, **Then** the key is stored securely and masked in the UI
3. **Given** I have entered an API key, **When** I click "Test Connection", **Then** I see whether the key is valid

---

### User Story 14 - Set Up Integrations (Priority: P3)

As a user, I want to set up integrations with external services (calendar, etc.) so that my data can flow between applications.

**Why this priority**: Integrations extend functionality but are not required for core use.

**Independent Test**: Can be fully tested by connecting a calendar integration and verifying data syncs.

**Acceptance Scenarios**:

1. **Given** I am in integrations settings, **When** I view available integrations, **Then** I see a list of supported external services
2. **Given** I want to connect a service, **When** I authenticate with it, **Then** the integration is established
3. **Given** an integration is connected, **When** I disconnect it, **Then** the link is removed and data stops syncing

---

### User Story 15 - Configure Backup Settings (Priority: P3)

As a user, I want to configure automatic local backups so that my data is protected against loss.

**Why this priority**: Backups provide peace of mind but are not required for regular operation.

**Independent Test**: Can be fully tested by enabling backups and verifying backup files are created.

**Acceptance Scenarios**:

1. **Given** I am in data settings, **When** I enable automatic backups, **Then** the app begins creating periodic backups
2. **Given** backups are enabled, **When** I configure backup frequency, **Then** backups occur at the specified interval
3. **Given** I have backups, **When** I view backup history, **Then** I see a list of available backups with dates

---

### Edge Cases

- What happens when settings storage becomes corrupted?
  - System detects corruption and restores defaults while notifying the user
- How does the system handle conflicts between synced settings and local settings?
  - Most recent modification wins, with device-specific settings taking precedence for hardware-related preferences
- What happens when a user tries to set an invalid shortcut (reserved by OS)?
  - System rejects the binding and explains why
- How does the system behave when vault location becomes inaccessible (drive removed)?
  - System gracefully informs the user and allows them to select a new location
- What happens if API key is invalid or quota exceeded?
  - System disables AI features and notifies the user with actionable guidance

## Requirements *(mandatory)*

### Functional Requirements

**General/Appearance**
- **FR-001**: System MUST support three theme modes: light, dark, and system-following
- **FR-002**: System MUST apply theme changes immediately without requiring restart
- **FR-003**: System MUST support font size adjustment (small, medium, large)
- **FR-004**: System MUST support font family selection (system, serif, sans-serif, monospace)
- **FR-005**: System MUST support accent color customization
- **FR-006**: System MUST support reduced motion preference for accessibility

**Account Management**
- **FR-007**: System MUST display account information (email, auth provider, creation date)
- **FR-008**: System MUST display storage usage relative to account limits
- **FR-009**: System MUST provide sign-out functionality with confirmation
- **FR-010**: System MUST clear all local synced data upon sign-out

**Sync and Devices**
- **FR-011**: System MUST display list of linked devices with names, platforms, and last sync times
- **FR-012**: System MUST allow removal of non-current devices
- **FR-013**: System MUST display recovery key only after successful re-authentication
- **FR-014**: System MUST allow manual sync triggering
- **FR-015**: System MUST allow enabling/disabling sync functionality

**Editor Preferences**
- **FR-016**: System MUST support editor width options (narrow, medium, wide)
- **FR-017**: System MUST support spell check toggle
- **FR-018**: System MUST support auto-save with configurable delay
- **FR-019**: System MUST support word count display toggle

**Task Preferences**
- **FR-020**: System MUST allow setting a default project for new tasks
- **FR-021**: System MUST allow configuring default task sort order
- **FR-022**: System MUST allow setting week start day (Sunday or Monday)
- **FR-023**: System MUST allow configuring stale inbox threshold

**Keyboard Shortcuts**
- **FR-024**: System MUST display all available shortcuts with current bindings
- **FR-025**: System MUST allow rebinding shortcuts via key capture
- **FR-026**: System MUST detect and warn about shortcut conflicts
- **FR-027**: System MUST provide reset-to-defaults functionality
- **FR-028**: System MUST support global shortcuts (with appropriate OS permissions)

**AI Features**
- **FR-029**: System MUST allow enabling/disabling AI features globally
- **FR-030**: System MUST support API key entry with secure masked display
- **FR-031**: System MUST provide connection test functionality
- **FR-032**: System MUST store API keys securely (not in plain text)

**Data Management**
- **FR-033**: System MUST display current vault location
- **FR-034**: System MUST allow changing vault location with data migration
- **FR-035**: System MUST support data export in portable format
- **FR-036**: System MUST support data import from common formats
- **FR-037**: System MUST provide cache clearing functionality
- **FR-038**: System MUST provide search index rebuild functionality

**Tag Management**
- **FR-039**: System MUST display all tags with usage counts
- **FR-040**: System MUST allow renaming tags (updating all tagged items)
- **FR-041**: System MUST allow merging tags
- **FR-042**: System MUST allow deleting tags

**Advanced**
- **FR-043**: System MUST support developer tools toggle
- **FR-044**: System MUST provide reset all settings functionality with confirmation
- **FR-045**: System MUST auto-repair corrupted settings on detection

### Key Entities

- **Settings**: Collection of user preferences organized by category (appearance, editor, tasks, sync, AI, privacy). Persists across sessions and syncs across devices (except device-specific overrides).

- **Account**: User's sync account information including authentication method, creation date, and storage usage. Links to multiple devices.

- **Device**: Represents a synced device with platform info and sync status. One device is marked as current; others can be removed remotely.

- **Keyboard Shortcuts**: Named key bindings organized by category (navigation, editor, tabs, view, global). Supports custom overrides while maintaining defaults.

- **Tags**: User-defined labels for organizing content. Tracked with usage counts; support rename, merge, and delete operations.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can find and change any setting within 3 clicks from the settings panel
- **SC-002**: Theme changes apply instantly (under 100ms perceived delay)
- **SC-003**: Settings persist correctly across 100% of app restarts
- **SC-004**: Users can successfully export and re-import their data with zero data loss
- **SC-005**: 95% of users can customize keyboard shortcuts without consulting help documentation
- **SC-006**: Account sign-out completely clears local data with no residual sensitive information
- **SC-007**: Recovery key retrieval requires re-authentication 100% of the time
- **SC-008**: System recovers from settings corruption automatically without user intervention
- **SC-009**: Settings sync across devices within 30 seconds of change
- **SC-010**: Users can complete vault location change (including data migration) without data loss

## Assumptions

- Users have a single vault location at a time (no multi-vault support)
- OAuth provider profile pictures are available for display
- OS provides APIs for global shortcut registration (with appropriate permissions)
- Keychain/credential storage is available on all supported platforms
- Import formats include at minimum: Notion export, Obsidian vault, plain JSON
- Export format is human-readable (JSON or structured folder)
- Settings sync is near real-time when both sync is enabled and devices are online
- Device-specific settings (like vault location) override synced settings
