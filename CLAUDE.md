# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Memry is an Electron desktop application for personal knowledge management (PKM), combining task management, journaling, and note-taking. Built with React 19, TypeScript, and shadcn/ui components, it uses electron-vite for build tooling and features a VS Code-style tab system with split view support.

## Common Commands

```bash
pnpm dev              # Start development server with hot reload
pnpm start            # Preview production build
pnpm typecheck        # Check all TypeScript types (main + renderer)
pnpm typecheck:node   # Check main process types only
pnpm typecheck:web    # Check renderer process types only
pnpm lint             # Run ESLint with cache
pnpm format           # Format all files with Prettier
pnpm build:mac        # Build for macOS
pnpm build:win        # Build for Windows
pnpm build:linux      # Build for Linux
```

## Architecture

### Electron Process Model

- **Main Process** (`src/main/index.ts`): Node.js environment managing app lifecycle, window creation, and native APIs. Window controls (minimize/maximize/close) are handled via IPC.

- **Preload Script** (`src/preload/index.ts`): Secure bridge exposing `window.api` and `window.electron` to renderer. Add new IPC handlers here and update types in `src/preload/index.d.ts`.

- **Renderer Process** (`src/renderer/`): React app with no direct Node.js access. Uses custom traffic lights on macOS (native ones hidden).

### Frontend State Management

The app uses React Context for state management with several key providers:

- **TabProvider** (`contexts/tabs/`): VS Code-style tab system with split view support, tab persistence, pinning, and preview mode. Supports singleton tabs (only one instance allowed) for views like inbox, journal, tasks.

- **TasksProvider** (`contexts/tasks/`): Centralized task and project state management.

- **DragProvider** (`contexts/drag-context.tsx`): Global drag-drop context using @dnd-kit for task reordering, moving tasks between projects, and sidebar project reordering.

- **AIAgentProvider** (`contexts/ai-agent-context.tsx`): AI assistant panel state.

### Tab System Architecture

The tab system (`contexts/tabs/`) mirrors VS Code behavior:
- **Types**: `TabType` defines content types (inbox, tasks, note, journal, project, etc.)
- **Split View**: Horizontal splits with resizable panes, layout stored as recursive tree structure
- **Persistence**: Tab state persisted to localStorage with migrations support
- **Singleton Tabs**: Certain tab types (inbox, journal, tasks) only allow one instance

### Page Structure

Pages in `src/renderer/src/pages/`:
- `inbox.tsx` - Inbox for quick capture
- `tasks.tsx` - Task management with multiple views (all, today, upcoming, completed) and kanban/calendar views
- `journal.tsx` - Daily journaling with date navigation
- `note.tsx` - Individual note editor

### Custom Hooks

Key hooks in `src/renderer/src/hooks/`:
- `use-tab-keyboard-shortcuts.ts` - Tab navigation shortcuts
- `use-chord-shortcuts.ts` - Multi-key shortcut combinations
- `use-drag-handlers.ts` - Unified drag-drop handling
- `use-task-order.ts` - Task ordering persistence
- `use-task-selection.ts` - Multi-select for bulk operations

### Component Organization

```
src/renderer/src/
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── tabs/         # Tab bar, drag overlay, context menus
│   ├── tasks/        # Task components (kanban/, calendar/, filters/, completed/)
│   ├── keyboard/     # Keyboard shortcut components
│   └── split-view/   # Split view container
├── contexts/         # React contexts
├── hooks/            # Custom hooks
├── lib/              # Utilities (task-utils, fuzzy-search, natural-date-parser)
├── data/             # Sample data and type definitions
└── pages/            # Main page components
```

### Path Aliases

Both `@/` and `@renderer/` resolve to `src/renderer/src/`. Use `@/components`, `@/lib`, `@/hooks` for imports.

## Adding shadcn/ui Components

The project uses shadcn/ui with extended registries (configured in `components.json`):
- @alpine, @tailark, @magicui, @shadcn-form, @kokonutui, @diceui, @basecn, @animateui, @fancycomponents, @kibo-ui, @cult-ui

```bash
npx shadcn@latest add <component-name>
npx shadcn@latest add @magicui/<component-name>  # From specific registry
```

## IPC Communication Pattern

1. Define handler in `src/main/index.ts`:
```typescript
ipcMain.on('channel-name', (event, arg) => { /* handler */ })
```

2. Expose API in `src/preload/index.ts`:
```typescript
const api = {
  yourMethod: () => ipcRenderer.send('channel-name')
}
```

3. Update types in `src/preload/index.d.ts`

4. Use in renderer: `window.api.yourMethod()`

## Code Style Guidelines

- Use `const` arrow functions with type definitions
- Event handlers prefixed with `handle` (e.g., `handleClick`, `handleKeyDown`)
- Early returns for readability
- Tailwind classes for styling (no CSS files except for base styles)
- Accessibility attributes on interactive elements (tabindex, aria-label, keyboard handlers)

## Active Technologies
- TypeScript 5.9+ with strict mode (001-core-data-layer)

## Recent Changes
- 001-core-data-layer: Added TypeScript 5.9+ with strict mode
