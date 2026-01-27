declare module 'y-leveldb' {
  import * as Y from 'yjs'

  export const PREFERRED_TRIM_SIZE: number

  export interface LeveldbPersistenceOptions {
    Level?: unknown
    levelOptions?: Record<string, unknown>
  }

  export class LeveldbPersistence {
    constructor(location: string, opts?: LeveldbPersistenceOptions)

    flushDocument(docName: string): Promise<void>

    getYDoc(docName: string): Promise<Y.Doc | null>

    getStateVector(docName: string): Promise<Uint8Array | null>

    storeUpdate(docName: string, update: Uint8Array): Promise<number>

    getDiff(docName: string, stateVector: Uint8Array): Promise<Uint8Array>

    clearDocument(docName: string): Promise<void>

    setMeta(docName: string, metaKey: string, value: unknown): Promise<void>

    delMeta(docName: string, metaKey: string): Promise<void>

    getMeta(docName: string, metaKey: string): Promise<unknown>

    getAllDocNames(): Promise<string[]>

    getAllDocStateVectors(): Promise<Map<string, Uint8Array>>

    getMetas(docName: string): Promise<Map<string, unknown>>

    destroy(): Promise<void>

    clearAll(): Promise<void>
  }
}
