# Validation Helpers Reference

Located at `src/main/ipc/validate.ts`.

## createValidatedHandler

Validates input against a Zod schema before calling the handler.

```typescript
function createValidatedHandler<TSchema extends z.ZodSchema, TResult>(
  schema: TSchema,
  handler: (input: z.infer<TSchema>) => TResult | Promise<TResult>
): (event: IpcMainInvokeEvent, rawInput: unknown) => Promise<TResult>
```

**Usage:**

```typescript
ipcMain.handle(
  NotesChannels.invoke.CREATE,
  createValidatedHandler(NoteCreateSchema, async (input) => {
    // input is typed as z.infer<typeof NoteCreateSchema>
    return notesService.create(input)
  })
)
```

**Error handling:** Throws `Error` with formatted validation message on schema failure:
```
Validation failed: title: Required, content: Expected string, received number
```

---

## createHandler

For handlers that take no input parameters.

```typescript
function createHandler<TResult>(
  handler: () => TResult | Promise<TResult>
): (event: IpcMainInvokeEvent) => Promise<TResult>
```

**Usage:**

```typescript
ipcMain.handle(
  NotesChannels.invoke.GET_TAGS,
  createHandler(async () => {
    return tagsService.getAllWithCounts()
  })
)
```

---

## createStringHandler

Convenience wrapper for handlers that take a single string parameter (IDs, paths).

```typescript
function createStringHandler<TResult>(
  handler: (input: string) => TResult | Promise<TResult>
): (event: IpcMainInvokeEvent, rawInput: unknown) => Promise<TResult>
```

**Usage:**

```typescript
ipcMain.handle(
  NotesChannels.invoke.GET,
  createStringHandler(async (id) => {
    return notesService.getById(id)
  })
)

ipcMain.handle(
  NotesChannels.invoke.DELETE,
  createStringHandler(async (id) => {
    return notesService.delete(id)
  })
)
```

**Implementation:** Internally uses `createValidatedHandler(z.string(), handler)`.

---

## createValidatedHandlerWithEvent

Same as `createValidatedHandler` but passes the `IpcMainInvokeEvent` to the handler.
Use when you need access to the event (e.g., for `event.sender`).

```typescript
function createValidatedHandlerWithEvent<TSchema extends z.ZodSchema, TResult>(
  schema: TSchema,
  handler: (input: z.infer<TSchema>, event: IpcMainInvokeEvent) => TResult | Promise<TResult>
): (event: IpcMainInvokeEvent, rawInput: unknown) => Promise<TResult>
```

**Usage:**

```typescript
ipcMain.handle(
  SomeChannels.invoke.ACTION,
  createValidatedHandlerWithEvent(ActionSchema, async (input, event) => {
    const webContents = event.sender
    // Use webContents for targeted responses
    return actionService.perform(input)
  })
)
```

---

## When to Use Each

| Scenario | Helper |
|----------|--------|
| Complex input object | `createValidatedHandler` |
| No input | `createHandler` |
| Single string (ID, path) | `createStringHandler` |
| Need IpcMainInvokeEvent | `createValidatedHandlerWithEvent` |

## Error Propagation

All helpers propagate errors from the handler to the renderer. Catch and transform errors in the handler if you need custom error responses:

```typescript
createValidatedHandler(Schema, async (input) => {
  try {
    return { success: true, data: await service.action(input) }
  } catch (error) {
    return { success: false, data: null, error: error.message }
  }
})
```
