/**
 * Vector Clock Operations
 *
 * Re-exports vector clock operations from shared contracts.
 * This file exists at the path specified in T040 (src/main/sync/vector-clock.ts)
 * while the actual implementation lives in @shared/contracts/crypto.ts for reuse
 * across both client and server.
 *
 * @module sync/vector-clock
 */

export {
  incrementClock,
  mergeClock,
  compareClock,
  clockDominates,
  emptyClock
} from '@shared/contracts/crypto'

export type { VectorClock } from '@shared/contracts/sync-api'
