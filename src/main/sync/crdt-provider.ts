/**
 * CRDT Provider for Yjs Document Synchronization
 *
 * Manages Y.Doc instances per note in the main process.
 * Handles persistence via y-leveldb and coordinates with SyncEngine for encryption.
 *
 * T129: Create Main-Process Yjs Host
 * T130: Yjs Document Creation Per Note
 * T131: State Vector Tracking
 * T132: Incremental Update Encryption
 * T133: Snapshot Compaction
 * T134: y-leveldb Integration
 *
 * @module sync/crdt-provider
 */

import * as Y from 'yjs'
import { LeveldbPersistence } from 'y-leveldb'
import { app, BrowserWindow } from 'electron'
import path from 'path'

import { SyncChannels } from '@shared/contracts/ipc-sync'
import { uint8ArrayToBase64 } from '@shared/utils/encoding'
import { TypedEmitter } from './typed-emitter'
import type { SyncEngine } from './engine'

const SNAPSHOT_THRESHOLD = 100

export interface CrdtProviderEvents extends Record<string, unknown[]> {
  'crdt:doc-updated': [payload: { noteId: string; update: Uint8Array; origin: string }]
  'crdt:doc-synced': [payload: { noteId: string; timestamp: number }]
  'crdt:error': [payload: { noteId: string; error: Error }]
}

interface DocEntry {
  doc: Y.Doc
  updateCount: number
  lastActivity: number
}

export class CrdtProvider extends TypedEmitter<CrdtProviderEvents> {
  private docs: Map<string, DocEntry> = new Map()
  private docCreationLocks: Map<string, Promise<Y.Doc>> = new Map()
  private persistence: LeveldbPersistence | null = null
  private dbPath: string = ''
  private initialized = false
  private syncEngine: SyncEngine | null = null

  initialize(customDbPath?: string): void {
    if (this.initialized) {
      return
    }

    this.dbPath = customDbPath ?? path.join(app.getPath('userData'), 'yjs-store')
    this.persistence = new LeveldbPersistence(this.dbPath)
    this.initialized = true

    console.info('[CrdtProvider] Initialized at', this.dbPath)
  }

  setSyncEngine(engine: SyncEngine): void {
    this.syncEngine = engine
  }

  async getOrCreateDoc(noteId: string): Promise<Y.Doc> {
    this.ensureInitialized()

    const existing = this.docs.get(noteId)
    if (existing) {
      existing.lastActivity = Date.now()
      return existing.doc
    }

    const pendingCreation = this.docCreationLocks.get(noteId)
    if (pendingCreation) {
      return pendingCreation
    }

    const creationPromise = this.createDoc(noteId)
    this.docCreationLocks.set(noteId, creationPromise)

    try {
      return await creationPromise
    } finally {
      this.docCreationLocks.delete(noteId)
    }
  }

  private async createDoc(noteId: string): Promise<Y.Doc> {
    const doc = new Y.Doc({ guid: noteId })

    const storedDoc = await this.persistence!.getYDoc(noteId)
    if (storedDoc) {
      const update = Y.encodeStateAsUpdate(storedDoc)
      Y.applyUpdate(doc, update)
    } else {
      doc.getXmlFragment('content')
      doc.getMap('meta').set('created', Date.now())
    }

    doc.on('update', (update: Uint8Array, origin: unknown) => {
      this.handleDocUpdate(noteId, update, origin)
    })

    this.docs.set(noteId, {
      doc,
      updateCount: 0,
      lastActivity: Date.now()
    })

    return doc
  }

  private handleDocUpdate(noteId: string, update: Uint8Array, origin: unknown): void {
    const entry = this.docs.get(noteId)
    if (!entry) return

    entry.updateCount++
    entry.lastActivity = Date.now()

    if (origin !== 'remote' && origin !== 'persistence') {
      void this.persistence!.storeUpdate(noteId, update)
      this.emit('crdt:doc-updated', {
        noteId,
        update,
        origin: typeof origin === 'string' ? origin : 'local'
      })

      if (this.shouldCompact(noteId)) {
        void this.compactDoc(noteId)
      }
    }
  }

  applyUpdate(
    noteId: string,
    update: Uint8Array,
    origin: string = 'remote',
    sourceWindowId?: number
  ): void {
    const entry = this.docs.get(noteId)
    if (!entry) {
      console.warn('[CrdtProvider] Cannot apply update to unknown doc:', noteId)
      return
    }

    Y.applyUpdate(entry.doc, update, origin)

    void this.persistence!.storeUpdate(noteId, update)

    this.broadcastToWindows(noteId, update, sourceWindowId)
  }

  private broadcastToWindows(noteId: string, update: Uint8Array, excludeWindowId?: number): void {
    const updateBase64 = uint8ArrayToBase64(update)
    BrowserWindow.getAllWindows()
      .filter((w) => w.id !== excludeWindowId)
      .forEach((w) => {
        w.webContents.send(SyncChannels.events.YJS_UPDATE_RECEIVED, {
          noteId,
          update: updateBase64,
          sourceWindowId: excludeWindowId
        })
      })
  }

  getStateVector(noteId: string): Uint8Array {
    const entry = this.docs.get(noteId)
    if (!entry) {
      throw new Error(`Doc not found: ${noteId}`)
    }
    return Y.encodeStateVector(entry.doc)
  }

  encodeSnapshot(noteId: string): Uint8Array {
    const entry = this.docs.get(noteId)
    if (!entry) {
      throw new Error(`Doc not found: ${noteId}`)
    }
    return Y.encodeStateAsUpdate(entry.doc)
  }

  encodeDiff(noteId: string, clientStateVector: Uint8Array): Uint8Array {
    const entry = this.docs.get(noteId)
    if (!entry) {
      throw new Error(`Doc not found: ${noteId}`)
    }
    return Y.encodeStateAsUpdate(entry.doc, clientStateVector)
  }

  private shouldCompact(noteId: string): boolean {
    const entry = this.docs.get(noteId)
    return (entry?.updateCount ?? 0) >= SNAPSHOT_THRESHOLD
  }

  async compactDoc(noteId: string): Promise<void> {
    const entry = this.docs.get(noteId)
    if (!entry) return

    try {
      await this.persistence!.flushDocument(noteId)
      entry.updateCount = 0
      console.info('[CrdtProvider] Compacted doc:', noteId)

      this.queueSnapshotForSync(noteId)
    } catch (error) {
      console.error('[CrdtProvider] Compaction failed:', noteId, error)
      this.emit('crdt:error', { noteId, error: error as Error })
    }
  }

  private queueSnapshotForSync(noteId: string): void {
    if (!this.syncEngine) {
      return
    }

    // TODO: Queue snapshot for server sync when encryption is wired up
    this.emit('crdt:doc-synced', { noteId, timestamp: Date.now() })
  }

  destroyDoc(noteId: string): void {
    const entry = this.docs.get(noteId)
    if (!entry) return

    entry.doc.destroy()
    this.docs.delete(noteId)
  }

  async clearDoc(noteId: string): Promise<void> {
    this.destroyDoc(noteId)
    await this.persistence?.clearDocument(noteId)
  }

  getDoc(noteId: string): Y.Doc | undefined {
    return this.docs.get(noteId)?.doc
  }

  hasDoc(noteId: string): boolean {
    return this.docs.has(noteId)
  }

  getAllDocNames(): Promise<string[]> {
    this.ensureInitialized()
    return this.persistence!.getAllDocNames()
  }

  async shutdown(): Promise<void> {
    if (!this.initialized) return

    const flushPromises = Array.from(this.docs.keys()).map((noteId) =>
      this.persistence!.flushDocument(noteId)
    )
    await Promise.all(flushPromises)

    for (const entry of this.docs.values()) {
      entry.doc.destroy()
    }
    this.docs.clear()

    await this.persistence?.destroy()
    this.persistence = null
    this.initialized = false

    console.info('[CrdtProvider] Shut down')
  }

  private ensureInitialized(): void {
    if (!this.initialized || !this.persistence) {
      throw new Error('CrdtProvider not initialized')
    }
  }
}

let crdtProviderInstance: CrdtProvider | null = null

export function getCrdtProvider(): CrdtProvider | null {
  return crdtProviderInstance
}

export function initializeCrdtProvider(customDbPath?: string): CrdtProvider {
  if (!crdtProviderInstance) {
    crdtProviderInstance = new CrdtProvider()
  }
  crdtProviderInstance.initialize(customDbPath)
  return crdtProviderInstance
}

export async function shutdownCrdtProvider(): Promise<void> {
  if (crdtProviderInstance) {
    await crdtProviderInstance.shutdown()
    crdtProviderInstance = null
  }
}

export { base64ToUint8Array } from '@shared/utils/encoding'
