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

// =============================================================================
// API Client
// =============================================================================

export { SyncApiClient, SyncApiError, syncApi } from './api-client'
export type {
  ApiError,
  AuthResult,
  DevicePublic,
  RecoveryData,
  SignupResponse,
  MessageResponse,
  RefreshResponse,
} from './api-client'
