/**
 * Retry Utilities
 *
 * Implements exponential backoff with jitter for sync operations.
 *
 * @module sync/retry
 */

const DEFAULT_MAX_RETRIES = 5
const DEFAULT_BASE_DELAY_MS = 1000
const DEFAULT_MAX_DELAY_MS = 30000
const DEFAULT_BACKOFF_MULTIPLIER = 2
const DEFAULT_JITTER_FACTOR = 0.1

export interface RetryConfig {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
  jitterFactor?: number
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: DEFAULT_MAX_RETRIES,
  baseDelayMs: DEFAULT_BASE_DELAY_MS,
  maxDelayMs: DEFAULT_MAX_DELAY_MS,
  backoffMultiplier: DEFAULT_BACKOFF_MULTIPLIER,
  jitterFactor: DEFAULT_JITTER_FACTOR
}

/**
 * Error thrown when all retry attempts are exhausted.
 */
export class RetryError extends Error {
  constructor(
    message: string,
    public readonly attempts: number,
    public readonly lastError: Error
  ) {
    super(message)
    this.name = 'RetryError'
  }
}

/**
 * Calculate the delay before the next retry attempt using exponential backoff with jitter.
 *
 * @param attempt - The current attempt number (0-indexed)
 * @param config - Retry configuration
 * @returns Delay in milliseconds
 */
export function calculateBackoff(
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  const { baseDelayMs, maxDelayMs, backoffMultiplier, jitterFactor = DEFAULT_JITTER_FACTOR } = config

  const exponentialDelay = baseDelayMs * Math.pow(backoffMultiplier, attempt)
  const cappedDelay = Math.min(exponentialDelay, maxDelayMs)
  const jitter = cappedDelay * jitterFactor * (Math.random() * 2 - 1)

  return Math.round(cappedDelay + jitter)
}

export interface RetryOptions extends Partial<RetryConfig> {
  shouldRetry?: (error: Error, attempt: number) => boolean
  onRetry?: (error: Error, attempt: number, delayMs: number) => void
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Execute an operation with automatic retry on failure.
 *
 * @param operation - The async operation to execute
 * @param options - Retry options including shouldRetry predicate and onRetry callback
 * @returns The operation result
 * @throws RetryError if all attempts fail
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config: RetryConfig = {
    ...DEFAULT_RETRY_CONFIG,
    ...options
  }

  const { shouldRetry, onRetry } = options
  let lastError: Error = new Error('Unknown error')

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt >= config.maxRetries) {
        break
      }

      if (shouldRetry && !shouldRetry(lastError, attempt)) {
        break
      }

      const delayMs = calculateBackoff(attempt, config)

      if (onRetry) {
        onRetry(lastError, attempt, delayMs)
      }

      await sleep(delayMs)
    }
  }

  throw new RetryError(
    `Operation failed after ${config.maxRetries + 1} attempts: ${lastError.message}`,
    config.maxRetries + 1,
    lastError
  )
}

/**
 * Determine if an error should trigger a retry.
 * Returns false for client errors (4xx) except timeout (408) and rate limit (429).
 *
 * @param error - The error to check
 * @returns true if the error is retryable
 */
export function isRetryableError(error: Error): boolean {
  if ('status' in error && typeof (error as { status: unknown }).status === 'number') {
    const status = (error as { status: number }).status
    if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
      return false
    }
  }

  const message = error.message.toLowerCase()
  const nonRetryablePatterns = [
    'invalid',
    'unauthorized',
    'forbidden',
    'not found',
    'bad request'
  ]

  return !nonRetryablePatterns.some((pattern) => message.includes(pattern))
}

/**
 * Create a wrapped operation that automatically retries on failure.
 *
 * @param operation - The operation to wrap
 * @param config - Optional retry configuration overrides
 * @returns A function that executes the operation with retry
 */
export function createRetryableOperation<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): () => Promise<T> {
  return () =>
    withRetry(operation, {
      ...config,
      shouldRetry: isRetryableError
    })
}
