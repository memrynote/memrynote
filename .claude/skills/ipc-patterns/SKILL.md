---
name: ipc-patterns
description: |
  Use when creating IPC handlers, defining contracts, adding Zod validation,
  exposing APIs in preload bridge, or defining channel constants.
  Triggers: "IPC handler", "ipcMain.handle", "ipcRenderer.invoke", "Zod validation",
  "preload bridge", "channel constants", "createValidatedHandler", "contract schema"
---

# IPC Patterns

## Architecture

3-layer pattern: **Contracts** → **Handlers** → **Preload**

```
src/shared/contracts/<domain>-api.ts   # Schemas, types, channel constants
src/shared/ipc-channels.ts             # Channel constants (single source of truth)
src/main/ipc/<domain>-handlers.ts      # Main process handlers
src/preload/index.ts                   # Expose to renderer
```

## Adding a New IPC Handler

### Checklist

1. **Define channel constant** in `src/shared/ipc-channels.ts`
2. **Create Zod schema** in `src/shared/contracts/<domain>-api.ts`
3. **Register handler** in `src/main/ipc/<domain>-handlers.ts`
4. **Register in index** in `src/main/ipc/index.ts`
5. **Expose in preload** in `src/preload/index.ts`
6. **Add types** in `src/preload/index.d.ts`

### 1. Channel Constants

```typescript
// src/shared/ipc-channels.ts
export const DomainChannels = {
  invoke: {
    CREATE: 'domain:create',
    GET: 'domain:get',
    UPDATE: 'domain:update',
    DELETE: 'domain:delete'
  },
  events: {
    CREATED: 'domain:created',
    UPDATED: 'domain:updated'
  }
} as const

export type DomainInvokeChannel = (typeof DomainChannels.invoke)[keyof typeof DomainChannels.invoke]
export type DomainEventChannel = (typeof DomainChannels.events)[keyof typeof DomainChannels.events]
```

### 2. Contract Schema

```typescript
// src/shared/contracts/domain-api.ts
import { z } from 'zod'
import { DomainChannels } from '../ipc-channels'
export { DomainChannels }

export const DomainCreateSchema = z.object({
  name: z.string().min(1).max(200),
  value: z.number().optional()
})

export type DomainCreateInput = z.infer<typeof DomainCreateSchema>

export interface DomainCreateResponse {
  success: boolean
  data: Domain | null
  error?: string
}
```

### 3. Handler Registration

```typescript
// src/main/ipc/domain-handlers.ts
import { ipcMain } from 'electron'
import { DomainChannels, DomainCreateSchema } from '@shared/contracts/domain-api'
import { createValidatedHandler, createHandler, createStringHandler } from './validate'

export function registerDomainHandlers(): void {
  ipcMain.handle(
    DomainChannels.invoke.CREATE,
    createValidatedHandler(DomainCreateSchema, async (input) => {
      return domainService.create(input)
    })
  )

  ipcMain.handle(
    DomainChannels.invoke.GET,
    createStringHandler(async (id) => {
      return domainService.getById(id)
    })
  )

  ipcMain.handle(
    DomainChannels.invoke.LIST,
    createHandler(async () => {
      return domainService.list()
    })
  )
}
```

### 4. Preload Exposure

```typescript
// src/preload/index.ts
import { DomainChannels } from '@shared/ipc-channels'

const api = {
  domain: {
    create: (input: DomainCreateInput) =>
      ipcRenderer.invoke(DomainChannels.invoke.CREATE, input),
    get: (id: string) =>
      ipcRenderer.invoke(DomainChannels.invoke.GET, id),
    list: () =>
      ipcRenderer.invoke(DomainChannels.invoke.LIST)
  }
}
```

## Validation Helpers

| Helper | Use Case | Signature |
|--------|----------|-----------|
| `createValidatedHandler` | Zod schema validation | `(schema, handler) => IpcHandler` |
| `createHandler` | No input required | `(handler) => IpcHandler` |
| `createStringHandler` | Single string parameter | `(handler) => IpcHandler` |
| `createValidatedHandlerWithEvent` | Schema + IpcMainInvokeEvent access | `(schema, handler) => IpcHandler` |

See [Validation Helpers Reference](references/validation-helpers.md) for full signatures.

## Response Pattern

Standard success/error format:

```typescript
interface Response<T> {
  success: boolean
  data: T | null
  error?: string
}
```

## Event Emission

```typescript
// Main process emits
import { BrowserWindow } from 'electron'

function emitEvent<T>(channel: string, payload: T): void {
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send(channel, payload)
  })
}

// Usage in handler
emitEvent(DomainChannels.events.CREATED, { id, name })
```

## Key Files

| Purpose | Path |
|---------|------|
| Channel constants | `src/shared/ipc-channels.ts` |
| Validation helpers | `src/main/ipc/validate.ts` |
| Example contract | `src/shared/contracts/notes-api.ts` |
| Example handlers | `src/main/ipc/notes-handlers.ts` |
| Preload bridge | `src/preload/index.ts` |
| Type definitions | `src/preload/index.d.ts` |
