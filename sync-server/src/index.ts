/**
 * Memry Sync Server
 *
 * Cloudflare Workers API for sync and E2EE operations.
 * Uses Hono.js framework with D1 (metadata) and R2 (encrypted blobs).
 *
 * @module sync-server
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

// Type definitions for Cloudflare bindings
export interface Env {
  // D1 Database
  DB: D1Database

  // R2 Bucket for encrypted blobs
  BLOB_BUCKET: R2Bucket

  // Durable Objects
  USER_STATE: DurableObjectNamespace
  LINKING_SESSION: DurableObjectNamespace

  // Environment variables
  ENVIRONMENT: string

  // Secrets (set via wrangler secret put)
  JWT_SECRET: string
  OAUTH_GOOGLE_CLIENT_SECRET?: string
  OAUTH_APPLE_CLIENT_SECRET?: string
  OAUTH_GITHUB_CLIENT_SECRET?: string
  RESEND_API_KEY?: string
}

// Create Hono app with environment bindings
const app = new Hono<{ Bindings: Env }>()

// Global middleware
app.use('*', logger())
app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'app://memry'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
)

// Health check endpoint
app.get('/', (c) => {
  return c.json({
    name: 'memry-sync',
    version: '1.0.0',
    status: 'healthy',
    environment: c.env.ENVIRONMENT,
  })
})

// API version prefix
const api = new Hono<{ Bindings: Env }>()

// Mount API routes
// Routes will be added in Phase 2
api.get('/status', (c) => {
  return c.json({ status: 'ok' })
})

// Mount API under /api/v1
app.route('/api/v1', api)

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err)
  return c.json(
    {
      error: 'Internal server error',
      message: c.env.ENVIRONMENT === 'development' ? err.message : undefined,
    },
    500
  )
})

// Export for Cloudflare Workers
export default app

// Durable Object exports (placeholders - will be implemented in Phase 2)
export class UserSyncState implements DurableObject {
  constructor(
    private state: DurableObjectState,
    private env: Env
  ) {}

  async fetch(request: Request): Promise<Response> {
    return new Response('UserSyncState placeholder', { status: 200 })
  }
}

export class LinkingSession implements DurableObject {
  constructor(
    private state: DurableObjectState,
    private env: Env
  ) {}

  async fetch(request: Request): Promise<Response> {
    return new Response('LinkingSession placeholder', { status: 200 })
  }
}
