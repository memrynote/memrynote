/**
 * Sync Module
 *
 * Central export point for sync-related functionality.
 *
 * @module main/sync
 */

// =============================================================================
// Vector Clock
// =============================================================================

export {
  // Types
  ClockComparison,
  // Basic operations
  createClock,
  incrementClock,
  getTime,
  getDevices,
  // Merge operations
  mergeClock,
  updateClockFromRemote,
  // Comparison operations
  compareClock,
  isAncestor,
  isConcurrent,
  dominates,
  // Serialization
  serializeClock,
  deserializeClock,
  // Utilities
  clockSum,
  clockMax,
  isEmptyClock,
  copyClock,
  removeDevice,
} from './vector-clock'
