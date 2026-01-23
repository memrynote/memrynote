/**
 * Retry Utilities
 *
 * Implements exponential backoff with jitter for sync operations.
 *
 * @module sync/retry
 */

export interface RetryConfig {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
  jitterFactor?: number
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 5,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitterFactor: 0.1
}

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

export function calculateBackoff(
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  const { baseDelayMs, maxDelayMs, backoffMultiplier, jitterFactor = 0.1 } = config

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
