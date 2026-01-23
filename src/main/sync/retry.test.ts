/**
 * Retry Utilities Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  calculateBackoff,
  withRetry,
  isRetryableError,
  RetryError,
  DEFAULT_RETRY_CONFIG
} from './retry'

describe('Retry Utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  describe('calculateBackoff', () => {
    it('should calculate exponential backoff correctly', () => {
      // #given
      const config = { ...DEFAULT_RETRY_CONFIG, jitterFactor: 0 }

      // #when / #then
      expect(calculateBackoff(0, config)).toBe(1000)
      expect(calculateBackoff(1, config)).toBe(2000)
      expect(calculateBackoff(2, config)).toBe(4000)
      expect(calculateBackoff(3, config)).toBe(8000)
    })

    it('should cap delay at maxDelayMs', () => {
      // #given
      const config = { ...DEFAULT_RETRY_CONFIG, jitterFactor: 0, maxDelayMs: 5000 }

      // #when
      const delay = calculateBackoff(10, config)

      // #then
      expect(delay).toBe(5000)
    })

    it('should apply jitter within expected range', () => {
      // #given
      const config = { ...DEFAULT_RETRY_CONFIG, jitterFactor: 0.1 }
      const baseDelay = 1000

      // #when
      const delays = Array.from({ length: 100 }, () => calculateBackoff(0, config))

      // #then
      const minExpected = baseDelay * 0.9
      const maxExpected = baseDelay * 1.1
      expect(delays.every((d) => d >= minExpected && d <= maxExpected)).toBe(true)
    })
  })

  describe('withRetry', () => {
    it('should return immediately on success', async () => {
      // #given
      const operation = vi.fn().mockResolvedValue('success')

      // #when
      const result = await withRetry(operation)

      // #then
      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(1)
    })

    it('should retry on failure and eventually succeed', async () => {
      // #given
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success')

      // #when
      const resultPromise = withRetry(operation, { maxRetries: 3 })

      await vi.runAllTimersAsync()
      const result = await resultPromise

      // #then
      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(3)
    })

    it('should throw RetryError after max retries', async () => {
      // #given
      const operation = vi.fn().mockRejectedValue(new Error('always fails'))

      // #when
      const promise = withRetry(operation, { maxRetries: 2 })

      // Catch the rejection to prevent unhandled rejection warning
      promise.catch(() => {})

      await vi.runAllTimersAsync()

      // #then
      await expect(promise).rejects.toBeInstanceOf(RetryError)
      expect(operation).toHaveBeenCalledTimes(3)
    })

    it('should call onRetry callback', async () => {
      // #given
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success')
      const onRetry = vi.fn()

      // #when
      const resultPromise = withRetry(operation, { maxRetries: 2, onRetry })
      await vi.runAllTimersAsync()
      await resultPromise

      // #then
      expect(onRetry).toHaveBeenCalledTimes(1)
      expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 0, expect.any(Number))
    })

    it('should stop retrying when shouldRetry returns false', async () => {
      // #given
      const operation = vi.fn().mockRejectedValue(new Error('non-retryable'))
      const shouldRetry = vi.fn().mockReturnValue(false)

      // #when
      const promise = withRetry(operation, { maxRetries: 3, shouldRetry })

      // Catch the rejection to prevent unhandled rejection warning
      promise.catch(() => {})

      await vi.runAllTimersAsync()

      // #then
      await expect(promise).rejects.toBeInstanceOf(RetryError)
      expect(operation).toHaveBeenCalledTimes(1)
      expect(shouldRetry).toHaveBeenCalledTimes(1)
    })
  })

  describe('isRetryableError', () => {
    it('should return true for network errors', () => {
      // #given
      const error = new Error('Connection refused')

      // #when / #then
      expect(isRetryableError(error)).toBe(true)
    })

    it('should return false for 4xx client errors except 408 and 429', () => {
      // #given
      const errors = [
        { message: 'Bad request', status: 400 },
        { message: 'Unauthorized', status: 401 },
        { message: 'Forbidden', status: 403 },
        { message: 'Not found', status: 404 }
      ].map((e) => Object.assign(new Error(e.message), { status: e.status }))

      // #when / #then
      errors.forEach((error) => {
        expect(isRetryableError(error)).toBe(false)
      })
    })

    it('should return true for 408 and 429 status codes', () => {
      // #given
      const error408 = Object.assign(new Error('Request Timeout'), { status: 408 })
      const error429 = Object.assign(new Error('Too Many Requests'), { status: 429 })

      // #when / #then
      expect(isRetryableError(error408)).toBe(true)
      expect(isRetryableError(error429)).toBe(true)
    })

    it('should return true for 5xx server errors', () => {
      // #given
      const error = Object.assign(new Error('Internal Server Error'), { status: 500 })

      // #when / #then
      expect(isRetryableError(error)).toBe(true)
    })

    it('should return false for non-retryable error messages', () => {
      // #given
      const error = new Error('Invalid request format')

      // #when / #then
      expect(isRetryableError(error)).toBe(false)
    })
  })
})
