# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Memry is an Electron desktop application built with React, TypeScript, and shadcn/ui components. It uses electron-vite for build tooling and follows a standard Electron architecture with main process, renderer process, and preload script separation.

## Common Commands

### Development
```bash
pnpm dev              # Start development server with hot reload
pnpm start            # Preview production build
```

### Type Checking
```bash
pnpm typecheck        # Check all TypeScript types (main + renderer)
pnpm typecheck:node   # Check main process types only
pnpm typecheck:web    # Check renderer process types only
```

### Code Quality
```bash
pnpm lint             # Run ESLint with cache
pnpm format           # Format all files with Prettier
```

### Building
```bash
pnpm build            # Type check + build for all platforms
pnpm build:mac        # Build for macOS
pnpm build:win        # Build for Windows
pnpm build:linux      # Build for Linux
pnpm build:unpack     # Build unpacked directory (for testing)
```

## Architecture

### Electron Process Model

The application follows Electron's multi-process architecture:

- **Main Process** (`src/main/index.ts`): Node.js environment, manages app lifecycle, window creation, and native APIs. Communicates with renderer via IPC.

- **Preload Script** (`src/preload/index.ts`): Secure bridge between main and renderer. Uses `contextBridge` to expose Electron APIs to renderer. Extend the `api` object here to add custom IPC handlers.

- **Renderer Process** (`src/renderer/`): Browser environment running React app with no direct access to Node.js APIs. Must use APIs exposed through preload script.

### Frontend Architecture

- **UI Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4 (via `@tailwindcss/vite`) with shadcn/ui component library
- **Component System**: shadcn/ui "New York" style with multiple registry sources configured
- **Path Aliases**:
  - `@/` and `@renderer/` both resolve to `src/renderer/src/`
  - Use `@/components`, `@/lib`, `@/lib/hooks` for imports

### Project Structure

```
src/
├── main/           # Electron main process (Node.js)
├── preload/        # Preload scripts (context bridge)
└── renderer/       # React frontend
    └── src/
        ├── components/
        │   ├── ui/          # shadcn/ui components
        │   ├── app-sidebar.tsx
        │   ├── nav-*.tsx    # Navigation components
        │   └── team-switcher.tsx
        ├── lib/
        │   ├── hooks/       # Custom React hooks
        │   └── utils.ts     # cn() and utilities
        └── assets/          # CSS and static assets
```

## Adding shadcn/ui Components

The project uses shadcn/ui with extended registries configured in `components.json`:
- @alpine, @tailark, @magicui, @shadcn-form, @kokonutui, @diceui, @basecn, @animateui, @fancycomponents

Install components with:
```bash
npx shadcn@latest add <component-name>
# Or from a specific registry:
npx shadcn@latest add @magicui/<component-name>
```

Components are added to `src/renderer/src/components/ui/` and use the New York style with CSS variables enabled.

## IPC Communication Pattern

When adding main/renderer communication:

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

3. Update TypeScript types in `src/preload/index.d.ts`

4. Use in renderer via `window.api.yourMethod()`

## Build Configuration

- **electron-vite**: Handles bundling with separate configs for main, preload, and renderer
- **Vite plugins**: React plugin + Tailwind CSS plugin in renderer
- **electron-builder**: Configured via `electron-builder.yml` for packaging
- Package manager: **pnpm** (check `pnpm-lock.yaml` before using npm/yarn)

## Development Notes

- Use `pnpm` as the package manager (required by pnpm workspace setup)
- The main process has HMR support via electron-vite
- Renderer runs on a dev server with React Fast Refresh
- DevTools open automatically with F12 in development
- External links automatically open in system browser (handled in main process)
