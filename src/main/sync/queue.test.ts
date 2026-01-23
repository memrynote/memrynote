/**
 * Sync Queue Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SyncQueue } from './queue'

vi.mock('electron', () => ({
  BrowserWindow: {
    getAllWindows: vi.fn().mockReturnValue([])
  }
}))

const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockResolvedValue([]),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  where: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockReturnThis()
}

vi.mock('../database/client', () => ({
  getDatabase: () => mockDb
}))

vi.mock('uuid', () => ({
  v4: () => 'test-uuid-1234'
}))

describe('SyncQueue', () => {
  let queue: SyncQueue

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb.orderBy.mockResolvedValue([])
    queue = new SyncQueue()
  })

  describe('initialize', () => {
    it('should load items from database on initialize', async () => {
      // #given
      const dbItems = [
        {
          id: 'item-1',
          type: 'task',
          itemId: 'task-123',
          operation: 'create',
          payload: '{}',
          priority: 0,
          attempts: 0,
          lastAttempt: null,
          errorMessage: null,
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      ]
      mockDb.orderBy.mockResolvedValue(dbItems)

      // #when
      await queue.initialize()

      // #then
      expect(queue.size()).toBe(1)
      expect(queue.get('item-1')).toBeTruthy()
    })
  })

  describe('add', () => {
    it('should add item to queue and persist to database', async () => {
      // #given
      await queue.initialize()

      // #when
      const item = await queue.add('task', 'task-123', 'create', '{"title":"Test"}')

      // #then
      expect(item.id).toBe('test-uuid-1234')
      expect(item.type).toBe('task')
      expect(item.itemId).toBe('task-123')
      expect(item.operation).toBe('create')
      expect(item.payload).toBe('{"title":"Test"}')
      expect(mockDb.insert).toHaveBeenCalled()
    })

    it('should emit sync:item-added event', async () => {
      // #given
      await queue.initialize()
      const onItemAdded = vi.fn()
      queue.on('sync:item-added', onItemAdded)

      // #when
      await queue.add('task', 'task-123', 'create', '{}')

      // #then
      expect(onItemAdded).toHaveBeenCalledWith(expect.objectContaining({ type: 'task' }))
    })

    it('should emit sync:queue-changed event', async () => {
      // #given
      await queue.initialize()
      const onQueueChanged = vi.fn()
      queue.on('sync:queue-changed', onQueueChanged)

      // #when
      await queue.add('task', 'task-123', 'create', '{}')

      // #then
      expect(onQueueChanged).toHaveBeenCalledWith(1)
    })
  })

  describe('remove', () => {
    it('should remove item from queue and database', async () => {
      // #given
      await queue.initialize()
      await queue.add('task', 'task-123', 'create', '{}')
      mockDb.where.mockResolvedValue(undefined)

      // #when
      const result = await queue.remove('test-uuid-1234')

      // #then
      expect(result).toBe(true)
      expect(queue.size()).toBe(0)
      expect(mockDb.delete).toHaveBeenCalled()
    })

    it('should return false for non-existent item', async () => {
      // #given
      await queue.initialize()

      // #when
      const result = await queue.remove('non-existent')

      // #then
      expect(result).toBe(false)
    })

    it('should emit sync:item-removed event', async () => {
      // #given
      await queue.initialize()
      await queue.add('task', 'task-123', 'create', '{}')
      const onItemRemoved = vi.fn()
      queue.on('sync:item-removed', onItemRemoved)

      // #when
      await queue.remove('test-uuid-1234')

      // #then
      expect(onItemRemoved).toHaveBeenCalledWith('test-uuid-1234')
    })
  })

  describe('updateAttempt', () => {
    it('should increment attempts and update lastAttempt', async () => {
      // #given
      await queue.initialize()
      await queue.add('task', 'task-123', 'create', '{}')

      // #when
      const item = await queue.updateAttempt('test-uuid-1234', 'Network error')

      // #then
      expect(item?.attempts).toBe(1)
      expect(item?.lastAttempt).toBeTruthy()
      expect(item?.errorMessage).toBe('Network error')
    })

    it('should return null for non-existent item', async () => {
      // #given
      await queue.initialize()

      // #when
      const result = await queue.updateAttempt('non-existent')

      // #then
      expect(result).toBeNull()
    })
  })

  describe('peek', () => {
    it('should return highest priority item', async () => {
      // #given
      const dbItems = [
        {
          id: 'low-priority',
          type: 'task',
          itemId: 'task-1',
          operation: 'update',
          payload: '{}',
          priority: 0,
          attempts: 0,
          lastAttempt: null,
          errorMessage: null,
          createdAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'high-priority',
          type: 'task',
          itemId: 'task-2',
          operation: 'create',
          payload: '{}',
          priority: 10,
          attempts: 0,
          lastAttempt: null,
          errorMessage: null,
          createdAt: '2024-01-01T00:00:01.000Z'
        }
      ]
      mockDb.orderBy.mockResolvedValue(dbItems)
      await queue.initialize()

      // #when
      const item = queue.peek()

      // #then
      expect(item?.id).toBe('high-priority')
    })

    it('should return null for empty queue', async () => {
      // #given
      await queue.initialize()

      // #when
      const item = queue.peek()

      // #then
      expect(item).toBeNull()
    })
  })

  describe('getAll', () => {
    it('should return items sorted by priority then createdAt', async () => {
      // #given
      const dbItems = [
        {
          id: 'item-1',
          type: 'task',
          itemId: 'task-1',
          operation: 'update',
          payload: '{}',
          priority: 0,
          attempts: 0,
          lastAttempt: null,
          errorMessage: null,
          createdAt: '2024-01-01T00:00:02.000Z'
        },
        {
          id: 'item-2',
          type: 'task',
          itemId: 'task-2',
          operation: 'create',
          payload: '{}',
          priority: 10,
          attempts: 0,
          lastAttempt: null,
          errorMessage: null,
          createdAt: '2024-01-01T00:00:01.000Z'
        },
        {
          id: 'item-3',
          type: 'task',
          itemId: 'task-3',
          operation: 'delete',
          payload: '{}',
          priority: 0,
          attempts: 0,
          lastAttempt: null,
          errorMessage: null,
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      ]
      mockDb.orderBy.mockResolvedValue(dbItems)
      await queue.initialize()

      // #when
      const items = queue.getAll()

      // #then
      expect(items[0].id).toBe('item-2')
      expect(items[1].id).toBe('item-3')
      expect(items[2].id).toBe('item-1')
    })
  })

  describe('clear', () => {
    it('should remove all items', async () => {
      // #given
      const dbItems = [
        {
          id: 'item-1',
          type: 'task',
          itemId: 'task-1',
          operation: 'update',
          payload: '{}',
          priority: 0,
          attempts: 0,
          lastAttempt: null,
          errorMessage: null,
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      ]
      mockDb.orderBy.mockResolvedValue(dbItems)
      await queue.initialize()

      // #when
      await queue.clear()

      // #then
      expect(queue.size()).toBe(0)
      expect(queue.isEmpty()).toBe(true)
    })
  })
})
