import { describe, it, expect } from 'vitest'
import {
  incrementClock,
  mergeClock,
  compareClock,
  clockDominates,
  emptyClock
} from './crypto'
import type { VectorClock } from './sync-api'

describe('Vector Clock Operations', () => {
  describe('emptyClock', () => {
    it('should return an empty object', () => {
      // #when
      const clock = emptyClock()

      // #then
      expect(clock).toEqual({})
      expect(Object.keys(clock)).toHaveLength(0)
    })
  })

  describe('incrementClock', () => {
    it('should initialize device counter to 1 for new device', () => {
      // #given
      const clock: VectorClock = {}

      // #when
      const result = incrementClock(clock, 'device-a')

      // #then
      expect(result).toEqual({ 'device-a': 1 })
    })

    it('should increment existing device counter', () => {
      // #given
      const clock: VectorClock = { 'device-a': 5 }

      // #when
      const result = incrementClock(clock, 'device-a')

      // #then
      expect(result).toEqual({ 'device-a': 6 })
    })

    it('should preserve other device counters', () => {
      // #given
      const clock: VectorClock = { 'device-a': 3, 'device-b': 7 }

      // #when
      const result = incrementClock(clock, 'device-a')

      // #then
      expect(result).toEqual({ 'device-a': 4, 'device-b': 7 })
    })

    it('should not mutate the original clock', () => {
      // #given
      const clock: VectorClock = { 'device-a': 5 }

      // #when
      incrementClock(clock, 'device-a')

      // #then
      expect(clock).toEqual({ 'device-a': 5 })
    })
  })

  describe('mergeClock', () => {
    it('should return empty clock when merging two empty clocks', () => {
      // #given
      const a: VectorClock = {}
      const b: VectorClock = {}

      // #when
      const result = mergeClock(a, b)

      // #then
      expect(result).toEqual({})
    })

    it('should take max values for each device', () => {
      // #given
      const a: VectorClock = { 'device-a': 5, 'device-b': 3 }
      const b: VectorClock = { 'device-a': 2, 'device-b': 7 }

      // #when
      const result = mergeClock(a, b)

      // #then
      expect(result).toEqual({ 'device-a': 5, 'device-b': 7 })
    })

    it('should include devices from both clocks', () => {
      // #given
      const a: VectorClock = { 'device-a': 5 }
      const b: VectorClock = { 'device-b': 7 }

      // #when
      const result = mergeClock(a, b)

      // #then
      expect(result).toEqual({ 'device-a': 5, 'device-b': 7 })
    })

    it('should handle one empty clock', () => {
      // #given
      const a: VectorClock = { 'device-a': 5, 'device-b': 3 }
      const b: VectorClock = {}

      // #when
      const result = mergeClock(a, b)

      // #then
      expect(result).toEqual({ 'device-a': 5, 'device-b': 3 })
    })

    it('should not mutate input clocks', () => {
      // #given
      const a: VectorClock = { 'device-a': 5 }
      const b: VectorClock = { 'device-a': 7 }

      // #when
      mergeClock(a, b)

      // #then
      expect(a).toEqual({ 'device-a': 5 })
      expect(b).toEqual({ 'device-a': 7 })
    })
  })

  describe('compareClock', () => {
    it('should return 0 for equal clocks', () => {
      // #given
      const a: VectorClock = { 'device-a': 5, 'device-b': 3 }
      const b: VectorClock = { 'device-a': 5, 'device-b': 3 }

      // #when
      const result = compareClock(a, b)

      // #then
      expect(result).toBe(0)
    })

    it('should return 0 for two empty clocks', () => {
      // #given
      const a: VectorClock = {}
      const b: VectorClock = {}

      // #when
      const result = compareClock(a, b)

      // #then
      expect(result).toBe(0)
    })

    it('should return 1 when a > b (a strictly dominates)', () => {
      // #given
      const a: VectorClock = { 'device-a': 5, 'device-b': 3 }
      const b: VectorClock = { 'device-a': 2, 'device-b': 1 }

      // #when
      const result = compareClock(a, b)

      // #then
      expect(result).toBe(1)
    })

    it('should return -1 when a < b (b strictly dominates)', () => {
      // #given
      const a: VectorClock = { 'device-a': 2, 'device-b': 1 }
      const b: VectorClock = { 'device-a': 5, 'device-b': 3 }

      // #when
      const result = compareClock(a, b)

      // #then
      expect(result).toBe(-1)
    })

    it('should return 0 for concurrent clocks (neither dominates)', () => {
      // #given
      const a: VectorClock = { 'device-a': 5, 'device-b': 1 }
      const b: VectorClock = { 'device-a': 2, 'device-b': 7 }

      // #when
      const result = compareClock(a, b)

      // #then
      expect(result).toBe(0)
    })

    it('should handle clocks with different device sets (a has more devices)', () => {
      // #given
      const a: VectorClock = { 'device-a': 5, 'device-b': 3 }
      const b: VectorClock = { 'device-a': 2 }

      // #when
      const result = compareClock(a, b)

      // #then
      expect(result).toBe(1)
    })

    it('should handle clocks with different device sets (b has more devices)', () => {
      // #given
      const a: VectorClock = { 'device-a': 2 }
      const b: VectorClock = { 'device-a': 5, 'device-b': 3 }

      // #when
      const result = compareClock(a, b)

      // #then
      expect(result).toBe(-1)
    })

    it('should return concurrent for clocks with disjoint device sets', () => {
      // #given
      const a: VectorClock = { 'device-a': 5 }
      const b: VectorClock = { 'device-b': 3 }

      // #when
      const result = compareClock(a, b)

      // #then
      expect(result).toBe(0)
    })
  })

  describe('clockDominates', () => {
    it('should return true when a dominates b (a >= b for all)', () => {
      // #given
      const a: VectorClock = { 'device-a': 5, 'device-b': 3 }
      const b: VectorClock = { 'device-a': 2, 'device-b': 1 }

      // #when
      const result = clockDominates(a, b)

      // #then
      expect(result).toBe(true)
    })

    it('should return true when clocks are equal', () => {
      // #given
      const a: VectorClock = { 'device-a': 5, 'device-b': 3 }
      const b: VectorClock = { 'device-a': 5, 'device-b': 3 }

      // #when
      const result = clockDominates(a, b)

      // #then
      expect(result).toBe(true)
    })

    it('should return false when a does not dominate b', () => {
      // #given
      const a: VectorClock = { 'device-a': 2, 'device-b': 1 }
      const b: VectorClock = { 'device-a': 5, 'device-b': 3 }

      // #when
      const result = clockDominates(a, b)

      // #then
      expect(result).toBe(false)
    })

    it('should return false for concurrent clocks', () => {
      // #given
      const a: VectorClock = { 'device-a': 5, 'device-b': 1 }
      const b: VectorClock = { 'device-a': 2, 'device-b': 7 }

      // #when
      const result = clockDominates(a, b)

      // #then
      expect(result).toBe(false)
    })

    it('should return true when a has device not in b', () => {
      // #given
      const a: VectorClock = { 'device-a': 5, 'device-b': 3 }
      const b: VectorClock = { 'device-a': 2 }

      // #when
      const result = clockDominates(a, b)

      // #then
      expect(result).toBe(true)
    })

    it('should return false when b has device not in a (0 < b[device])', () => {
      // #given
      const a: VectorClock = { 'device-a': 5 }
      const b: VectorClock = { 'device-a': 2, 'device-b': 3 }

      // #when
      const result = clockDominates(a, b)

      // #then
      expect(result).toBe(false)
    })

    it('should return true when any clock dominates empty clock', () => {
      // #given
      const a: VectorClock = { 'device-a': 1 }
      const b: VectorClock = {}

      // #when
      const result = clockDominates(a, b)

      // #then
      expect(result).toBe(true)
    })

    it('should return true when empty clock dominates empty clock', () => {
      // #given
      const a: VectorClock = {}
      const b: VectorClock = {}

      // #when
      const result = clockDominates(a, b)

      // #then
      expect(result).toBe(true)
    })
  })

  describe('vector clock scenarios', () => {
    it('should handle typical sync scenario: edit on device A', () => {
      // #given
      let clockA = emptyClock()

      // #when: device A makes an edit
      clockA = incrementClock(clockA, 'device-a')

      // #then
      expect(clockA).toEqual({ 'device-a': 1 })
    })

    it('should handle typical sync scenario: sync from A to B', () => {
      // #given
      const clockA: VectorClock = { 'device-a': 3 }
      let clockB: VectorClock = { 'device-a': 1, 'device-b': 2 }

      // #when: B receives update from A and merges
      clockB = mergeClock(clockB, clockA)

      // #then: B should have max of both
      expect(clockB).toEqual({ 'device-a': 3, 'device-b': 2 })
    })

    it('should detect conflict when both devices edit concurrently', () => {
      // #given: initial state on both devices
      const initial: VectorClock = { 'device-a': 1 }

      // #when: both devices edit independently
      const clockA = incrementClock(initial, 'device-a')
      const clockB = incrementClock(initial, 'device-b')

      // #then: clocks are concurrent (conflict)
      expect(compareClock(clockA, clockB)).toBe(0)
      expect(clockDominates(clockA, clockB)).toBe(false)
      expect(clockDominates(clockB, clockA)).toBe(false)
    })

    it('should resolve conflict by merge', () => {
      // #given: concurrent edits
      const clockA: VectorClock = { 'device-a': 2, 'device-b': 1 }
      const clockB: VectorClock = { 'device-a': 1, 'device-b': 2 }

      // #when: merge to resolve
      const merged = mergeClock(clockA, clockB)

      // #then: merged clock dominates both
      expect(clockDominates(merged, clockA)).toBe(true)
      expect(clockDominates(merged, clockB)).toBe(true)
      expect(merged).toEqual({ 'device-a': 2, 'device-b': 2 })
    })
  })
})
