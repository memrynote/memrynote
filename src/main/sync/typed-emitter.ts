/**
 * Typed Event Emitter
 *
 * A type-safe wrapper around Node.js EventEmitter.
 *
 * @module sync/typed-emitter
 */

import { EventEmitter } from 'events'

type EventArgs = unknown[]
type EventMap = Record<string, EventArgs>

/**
 * A type-safe event emitter that enforces event types at compile time.
 *
 * @example
 * ```typescript
 * interface MyEvents {
 *   'user:login': [userId: string, timestamp: number]
 *   'user:logout': [userId: string]
 * }
 *
 * class MyService extends TypedEmitter<MyEvents> {
 *   login(userId: string) {
 *     this.emit('user:login', userId, Date.now()) // Type-checked!
 *   }
 * }
 * ```
 */
export class TypedEmitter<T extends EventMap> extends EventEmitter {
  emit<K extends keyof T & string>(event: K, ...args: T[K]): boolean {
    return super.emit(event, ...args)
  }

  on<K extends keyof T & string>(event: K, listener: (...args: T[K]) => void): this {
    return super.on(event, listener)
  }

  once<K extends keyof T & string>(event: K, listener: (...args: T[K]) => void): this {
    return super.once(event, listener)
  }

  off<K extends keyof T & string>(event: K, listener: (...args: T[K]) => void): this {
    return super.off(event, listener)
  }

  removeListener<K extends keyof T & string>(event: K, listener: (...args: T[K]) => void): this {
    return super.removeListener(event, listener)
  }

  addListener<K extends keyof T & string>(event: K, listener: (...args: T[K]) => void): this {
    return super.addListener(event, listener)
  }

  removeAllListeners<K extends keyof T & string>(event?: K): this {
    return super.removeAllListeners(event)
  }

  listeners<K extends keyof T & string>(event: K): Array<(...args: T[K]) => void> {
    return super.listeners(event) as Array<(...args: T[K]) => void>
  }
}
