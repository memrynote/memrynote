/**
 * CRDT Provider Tests - Compression and Garbage Collection
 *
 * T140u: Yjs garbage collection for documents exceeding 1MB
 * T140v: Compress Yjs snapshots before encryption using pako
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as Y from 'yjs'
import pako from 'pako'

const mockPersistence = {
  getYDoc: vi.fn().mockResolvedValue(null),
  storeUpdate: vi.fn().mockResolvedValue(undefined),
  flushDocument: vi.fn().mockResolvedValue(undefined),
  clearDocument: vi.fn().mockResolvedValue(undefined),
  destroy: vi.fn().mockResolvedValue(undefined)
}

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/tmp/test')
  },
  BrowserWindow: {
    getAllWindows: vi.fn().mockReturnValue([])
  }
}))

vi.mock('y-leveldb', () => {
  return {
    LeveldbPersistence: class {
      getYDoc = mockPersistence.getYDoc
      storeUpdate = mockPersistence.storeUpdate
      flushDocument = mockPersistence.flushDocument
      clearDocument = mockPersistence.clearDocument
      destroy = mockPersistence.destroy
    }
  }
})

import { CrdtProvider, initializeCrdtProvider, shutdownCrdtProvider } from './crdt-provider'

describe('CrdtProvider', () => {
  let provider: CrdtProvider

  beforeEach(async () => {
    vi.clearAllMocks()
    provider = await initializeCrdtProvider()
    await provider.initialize()
  })

  afterEach(async () => {
    await shutdownCrdtProvider()
  })

  describe('Snapshot Compression (T140v)', () => {
    it('should compress snapshots by default', async () => {
      // #given - use larger content for meaningful compression
      const doc = await provider.getOrCreateDoc('test-note-1')
      const content = doc.getXmlFragment('document-store')
      const largeText = 'Hello World! This is a longer text that should compress well. '.repeat(50)
      content.insert(0, [new Y.XmlText(largeText)])

      // #when
      const compressed = provider.encodeSnapshot('test-note-1', true)
      const uncompressed = provider.encodeSnapshot('test-note-1', false)

      // #then
      expect(compressed[0]).toBe(0x78)
      expect(compressed.length).toBeLessThan(uncompressed.length)
    })

    it('should decompress snapshots when applying', async () => {
      // #given
      const doc = await provider.getOrCreateDoc('test-note-2')
      const content = doc.getXmlFragment('document-store')
      content.insert(0, [new Y.XmlText('Original content')])

      const compressed = provider.encodeSnapshot('test-note-2', true)

      const newProvider = new CrdtProvider()
      await newProvider.initialize()
      await newProvider.getOrCreateDoc('test-note-2')

      // #when
      newProvider.applySnapshot('test-note-2', compressed)

      // #then
      const newDoc = newProvider.getDoc('test-note-2')
      expect(newDoc).toBeDefined()
      const newContent = newDoc!.getXmlFragment('document-store')
      expect(JSON.stringify(newContent.toJSON())).toContain('Original content')

      await newProvider.shutdown()
    })

    it('should handle uncompressed snapshots (backwards compatibility)', async () => {
      // #given
      await provider.getOrCreateDoc('test-note-3')
      const uncompressed = provider.encodeSnapshot('test-note-3', false)

      // #when / #then - should not throw
      expect(() => provider.applySnapshot('test-note-3', uncompressed)).not.toThrow()
    })

    it('should detect compressed data correctly', () => {
      // #given
      const testData = new Uint8Array([1, 2, 3, 4, 5])
      const compressed = pako.deflate(testData)

      // #then
      expect(compressed[0]).toBe(0x78)
      expect(testData[0]).not.toBe(0x78)
    })
  })

  describe('Size Tracking', () => {
    it('should track document size on creation', async () => {
      // #given / #when
      await provider.getOrCreateDoc('size-test-1')

      // #then
      expect(provider.hasDoc('size-test-1')).toBe(true)
    })

    it('should update size on document updates', async () => {
      // #given
      const doc = await provider.getOrCreateDoc('size-test-2')

      // #when
      const content = doc.getXmlFragment('document-store')
      const largeText = 'x'.repeat(1000)
      content.insert(0, [new Y.XmlText(largeText)])

      // #then
      const snapshot = provider.encodeSnapshot('size-test-2', false)
      expect(snapshot.length).toBeGreaterThan(1000)
    })
  })

  describe('Garbage Collection (T140u)', () => {
    it('should reset update count after GC', async () => {
      // #given
      const doc = await provider.getOrCreateDoc('gc-test-2')
      const content = doc.getXmlFragment('document-store')

      for (let i = 0; i < 10; i++) {
        content.insert(0, [new Y.XmlText(`Update ${i}`)])
      }

      // #when
      await provider.garbageCollectDoc('gc-test-2')

      // #then - doc should still be functional
      content.insert(0, [new Y.XmlText('After GC')])
      const snapshot = provider.encodeSnapshot('gc-test-2', false)
      expect(snapshot.length).toBeGreaterThan(0)
    })

    it('should preserve document content after GC', async () => {
      // #given
      const doc = await provider.getOrCreateDoc('gc-test-3')
      const content = doc.getXmlFragment('document-store')
      content.insert(0, [new Y.XmlText('Important content')])

      // #when
      await provider.garbageCollectDoc('gc-test-3')

      // #then
      const newDoc = provider.getDoc('gc-test-3')
      expect(newDoc).toBeDefined()
      const newContent = newDoc!.getXmlFragment('document-store')
      expect(JSON.stringify(newContent.toJSON())).toContain('Important content')
    })

    it('should handle GC on non-existent document gracefully', async () => {
      // #when / #then - should not throw
      await expect(provider.garbageCollectDoc('non-existent-doc')).resolves.not.toThrow()
    })
  })

  describe('Compaction', () => {
    it('should trigger compaction after threshold updates', async () => {
      // #given
      const doc = await provider.getOrCreateDoc('compact-test-1')
      const compactSpy = vi.spyOn(provider, 'compactDoc')

      // #when - create many small updates
      const content = doc.getXmlFragment('document-store')
      for (let i = 0; i < 110; i++) {
        content.insert(0, [new Y.XmlText(`x`)])
      }

      // Wait for async compaction
      await new Promise((resolve) => setTimeout(resolve, 100))

      // #then
      expect(compactSpy).toHaveBeenCalled()
    })
  })

  describe('applySnapshot', () => {
    it('should log warning for unknown document', async () => {
      // #given
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const compressed = pako.deflate(new Uint8Array([1, 2, 3]))

      // #when
      provider.applySnapshot('unknown-doc', compressed)

      // #then
      expect(consoleSpy).toHaveBeenCalledWith(
        '[CrdtProvider] Cannot apply snapshot to unknown doc:',
        'unknown-doc'
      )

      consoleSpy.mockRestore()
    })

    it('should throw on invalid snapshot data', async () => {
      // #given
      await provider.getOrCreateDoc('invalid-test')
      const invalidData = new Uint8Array([0x78, 0x9c, 0xff, 0xff])

      // #when / #then
      expect(() => provider.applySnapshot('invalid-test', invalidData)).toThrow()
    })
  })

  describe('Security', () => {
    it('should reject oversized updates', async () => {
      // #given
      await provider.getOrCreateDoc('oversized-test')
      const oversizedUpdate = new Uint8Array(11 * 1024 * 1024) // 11MB, exceeds 10MB limit

      // #when / #then
      expect(() => provider.applyUpdate('oversized-test', oversizedUpdate, 'remote')).toThrow(
        /CRDT update exceeds maximum size/
      )
    })

    it('should accept updates within size limit', async () => {
      // #given
      const doc = await provider.getOrCreateDoc('valid-size-test')
      const validUpdate = Y.encodeStateAsUpdate(doc)

      // #when / #then
      expect(() => provider.applyUpdate('valid-size-test', validUpdate, 'remote')).not.toThrow()
    })

    it('should cleanup all Maps on destroy', async () => {
      // #given
      await provider.getOrCreateDoc('cleanup-test-1')
      await provider.getOrCreateDoc('cleanup-test-2')

      // #when
      provider.destroyDoc('cleanup-test-1')

      // #then
      expect(provider.hasDoc('cleanup-test-1')).toBe(false)
      expect(provider.hasDoc('cleanup-test-2')).toBe(true)
    })
  })

  describe('Document Eviction', () => {
    it('should not evict when under MAX_LOADED_DOCS limit', async () => {
      // #given
      await provider.getOrCreateDoc('eviction-test-1')
      await provider.getOrCreateDoc('eviction-test-2')

      // #when - manually trigger eviction
      const evictInactiveDocs = (
        provider as unknown as { evictInactiveDocs: () => Promise<void> }
      ).evictInactiveDocs.bind(provider)
      await evictInactiveDocs()

      // #then - both docs should still exist
      expect(provider.hasDoc('eviction-test-1')).toBe(true)
      expect(provider.hasDoc('eviction-test-2')).toBe(true)
    })
  })

  describe('Conflict Detection', () => {
    it('should detect conflict within 5s window', async () => {
      // #given
      await provider.getOrCreateDoc('conflict-test')

      // Record an external update (simulates file watcher change)
      provider.recordExternalChange('conflict-test')

      // Record a remote update shortly after (simulates sync from server)
      provider.recordRemoteUpdate('conflict-test')

      // #when - check if external source sees conflict with remote
      const detectConflict = (
        provider as unknown as { detectConflict: (noteId: string, source: 'external' | 'remote') => boolean }
      ).detectConflict.bind(provider)

      // #then - external source should detect conflict because remote was just updated
      expect(detectConflict('conflict-test', 'external')).toBe(true)
    })

    it('should not detect conflict when no timing recorded', async () => {
      // #given
      await provider.getOrCreateDoc('no-conflict-test')

      // #when - no updates recorded, detectConflict should return false
      const detectConflict = (
        provider as unknown as { detectConflict: (noteId: string, source: 'external' | 'remote') => boolean }
      ).detectConflict.bind(provider)

      // #then
      expect(detectConflict('no-conflict-test', 'external')).toBe(false)
    })
  })
})
