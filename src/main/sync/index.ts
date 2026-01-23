/**
 * Sync Module
 *
 * Cross-device synchronization infrastructure.
 *
 * @module sync
 */

export {
  SyncEngine,
  getSyncEngine,
  initSyncEngine,
  type EncryptedSyncItem,
  type DecryptedSyncItem,
  type SyncEngineEvents
} from './engine'

export {
  SyncQueue,
  getSyncQueue,
  initSyncQueue,
  type QueueItem,
  type QueueEvents
} from './queue'

export {
  NetworkMonitor,
  getNetworkMonitor,
  isNetworkOnline,
  type NetworkEvents
} from './network'

export {
  WebSocketManager,
  getWebSocketManager,
  initWebSocketManager,
  type WebSocketConfig,
  type WebSocketEvents,
  type WebSocketMessage,
  type WebSocketState
} from './websocket'

export {
  withRetry,
  calculateBackoff,
  isRetryableError,
  createRetryableOperation,
  RetryError,
  DEFAULT_RETRY_CONFIG,
  type RetryConfig,
  type RetryOptions
} from './retry'

export {
  getSyncApiClient,
  SyncApiError,
  isSyncApiError,
  type SyncApiClient,
  type OAuthInitiateParams,
  type OAuthInitiateResponse,
  type OAuthExchangeParams
} from './api-client'

export {
  incrementClock,
  mergeClock,
  compareClock,
  clockDominates,
  emptyClock,
  type VectorClock
} from './vector-clock'
