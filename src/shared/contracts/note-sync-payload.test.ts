import { describe, it, expect } from 'vitest'
import {
  NoteSyncPayloadSchema,
  JournalSyncPayloadSchema,
  parseNoteSyncPayload,
  parseJournalSyncPayload
} from './note-sync-payload'

describe('NoteSyncPayloadSchema', () => {
  describe('validation', () => {
    it('should accept valid note payload with all fields', () => {
      // #given
      const payload = {
        id: 'note-123',
        title: 'Test Note',
        path: 'notes/test.md',
        created: '2024-01-15T10:00:00.000Z',
        modified: '2024-01-15T14:00:00.000Z',
        tags: ['tag1', 'tag2'],
        aliases: ['alias1'],
        emoji: '📝',
        properties: { status: 'draft', priority: 1 }
      }

      // #when
      const result = NoteSyncPayloadSchema.safeParse(payload)

      // #then
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe('note-123')
        expect(result.data.title).toBe('Test Note')
        expect(result.data.tags).toEqual(['tag1', 'tag2'])
        expect(result.data.emoji).toBe('📝')
      }
    })

    it('should accept minimal note payload with defaults', () => {
      // #given
      const payload = {
        id: 'note-456',
        title: 'Minimal Note',
        path: 'notes/minimal.md',
        created: '2024-01-15T10:00:00.000Z',
        modified: '2024-01-15T14:00:00.000Z'
      }

      // #when
      const result = NoteSyncPayloadSchema.safeParse(payload)

      // #then
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.tags).toEqual([])
        expect(result.data.aliases).toEqual([])
        expect(result.data.emoji).toBeUndefined()
        expect(result.data.properties).toEqual({})
      }
    })

    it('should accept null emoji', () => {
      // #given
      const payload = {
        id: 'note-789',
        title: 'No Emoji Note',
        path: 'notes/no-emoji.md',
        created: '2024-01-15T10:00:00.000Z',
        modified: '2024-01-15T14:00:00.000Z',
        emoji: null
      }

      // #when
      const result = NoteSyncPayloadSchema.safeParse(payload)

      // #then
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.emoji).toBeNull()
      }
    })

    it('should reject payload missing required fields', () => {
      // #given
      const payload = {
        id: 'note-invalid',
        title: 'Invalid Note'
        // missing path, created, modified
      }

      // #when
      const result = NoteSyncPayloadSchema.safeParse(payload)

      // #then
      expect(result.success).toBe(false)
    })

    it('should reject empty id', () => {
      // #given
      const payload = {
        id: '',
        title: 'Test',
        path: 'notes/test.md',
        created: '2024-01-15T10:00:00.000Z',
        modified: '2024-01-15T14:00:00.000Z'
      }

      // #when
      const result = NoteSyncPayloadSchema.safeParse(payload)

      // #then
      expect(result.success).toBe(false)
    })

    it('should reject invalid datetime format for created', () => {
      // #given
      const payload = {
        id: 'note-123',
        title: 'Test',
        path: 'notes/test.md',
        created: 'not-a-date',
        modified: '2024-01-15T14:00:00.000Z'
      }

      // #when
      const result = NoteSyncPayloadSchema.safeParse(payload)

      // #then
      expect(result.success).toBe(false)
    })

    it('should accept datetime with timezone offset', () => {
      // #given
      const payload = {
        id: 'note-tz',
        title: 'Timezone Test',
        path: 'notes/tz.md',
        created: '2024-01-15T10:00:00+05:30',
        modified: '2024-01-15T14:00:00-08:00'
      }

      // #when
      const result = NoteSyncPayloadSchema.safeParse(payload)

      // #then
      expect(result.success).toBe(true)
    })
  })

  describe('parseNoteSyncPayload', () => {
    it('should return parsed payload for valid data', () => {
      // #given
      const data = {
        id: 'n1',
        title: 'Test',
        path: 'notes/test.md',
        created: '2024-01-01T00:00:00.000Z',
        modified: '2024-01-01T00:00:00.000Z'
      }

      // #when
      const result = parseNoteSyncPayload(data)

      // #then
      expect(result).not.toBeNull()
      expect(result?.id).toBe('n1')
      expect(result?.tags).toEqual([])
    })

    it('should return null for invalid data', () => {
      // #given
      const data = { invalid: true }

      // #when
      const result = parseNoteSyncPayload(data)

      // #then
      expect(result).toBeNull()
    })
  })
})

describe('JournalSyncPayloadSchema', () => {
  describe('validation', () => {
    it('should accept valid journal payload with all fields', () => {
      // #given
      const payload = {
        id: 'j2024-01-15',
        date: '2024-01-15',
        created: '2024-01-15T08:00:00.000Z',
        modified: '2024-01-15T20:00:00.000Z',
        tags: ['daily', 'work'],
        properties: { mood: 'happy', energy: 8 }
      }

      // #when
      const result = JournalSyncPayloadSchema.safeParse(payload)

      // #then
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe('j2024-01-15')
        expect(result.data.date).toBe('2024-01-15')
        expect(result.data.tags).toEqual(['daily', 'work'])
        expect(result.data.properties).toEqual({ mood: 'happy', energy: 8 })
      }
    })

    it('should accept minimal journal payload with defaults', () => {
      // #given
      const payload = {
        id: 'j2024-02-20',
        date: '2024-02-20',
        created: '2024-02-20T09:00:00.000Z',
        modified: '2024-02-20T21:00:00.000Z'
      }

      // #when
      const result = JournalSyncPayloadSchema.safeParse(payload)

      // #then
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.tags).toEqual([])
        expect(result.data.properties).toEqual({})
      }
    })

    it('should reject payload missing required fields', () => {
      // #given
      const payload = {
        id: 'j2024-03-01'
        // missing date, created, modified
      }

      // #when
      const result = JournalSyncPayloadSchema.safeParse(payload)

      // #then
      expect(result.success).toBe(false)
    })

    it('should reject invalid date format', () => {
      // #given
      const payload = {
        id: 'j-invalid',
        date: '01-15-2024',
        created: '2024-01-15T08:00:00.000Z',
        modified: '2024-01-15T20:00:00.000Z'
      }

      // #when
      const result = JournalSyncPayloadSchema.safeParse(payload)

      // #then
      expect(result.success).toBe(false)
    })

    it('should reject invalid datetime for created', () => {
      // #given
      const payload = {
        id: 'j2024-01-15',
        date: '2024-01-15',
        created: 'yesterday',
        modified: '2024-01-15T20:00:00.000Z'
      }

      // #when
      const result = JournalSyncPayloadSchema.safeParse(payload)

      // #then
      expect(result.success).toBe(false)
    })
  })

  describe('parseJournalSyncPayload', () => {
    it('should return parsed payload for valid data', () => {
      // #given
      const data = {
        id: 'j2024-05-10',
        date: '2024-05-10',
        created: '2024-05-10T00:00:00.000Z',
        modified: '2024-05-10T23:59:59.000Z'
      }

      // #when
      const result = parseJournalSyncPayload(data)

      // #then
      expect(result).not.toBeNull()
      expect(result?.id).toBe('j2024-05-10')
      expect(result?.date).toBe('2024-05-10')
      expect(result?.tags).toEqual([])
    })

    it('should return null for invalid data', () => {
      // #given
      const data = { foo: 'bar' }

      // #when
      const result = parseJournalSyncPayload(data)

      // #then
      expect(result).toBeNull()
    })
  })
})
