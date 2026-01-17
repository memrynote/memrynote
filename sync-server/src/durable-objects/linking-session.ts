/**
 * LinkingSession Durable Object
 *
 * Manages real-time WebSocket communication between existing and new device
 * during the QR code device linking flow.
 *
 * The D1 database stores the persistent session state, while this Durable Object
 * handles the real-time WebSocket notifications between devices.
 *
 * @module durable-objects/linking-session
 */

import type { Env } from '../index'

// =============================================================================
// Types
// =============================================================================

/**
 * WebSocket message types
 */
export interface LinkingMessage {
  type: 'scanned' | 'approved' | 'expired' | 'connected' | 'error'
  payload?: {
    newDevicePublicKey?: string
    deviceName?: string
    devicePlatform?: string
    error?: string
  }
}

/**
 * Session state stored in Durable Object storage
 */
interface SessionState {
  sessionId: string
  userId: string
  token: string // One-time token for QR code validation
  status: 'pending' | 'scanned' | 'approved' | 'completed' | 'expired'
  createdAt: number
  expiresAt: number
}

// =============================================================================
// LinkingSession Durable Object
// =============================================================================

/**
 * Durable Object for managing device linking sessions.
 *
 * Handles:
 * - WebSocket connections from existing and new devices
 * - Real-time notifications when scan/approval occurs
 * - Session expiration via alarms
 */
export class LinkingSession implements DurableObject {
  private existingDeviceSocket: WebSocket | null = null
  private newDeviceSocket: WebSocket | null = null
  private state: DurableObjectState
  private env: Env

  constructor(state: DurableObjectState, env: Env) {
    this.state = state
    this.env = env
  }

  /**
   * Handle incoming requests to the Durable Object.
   */
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    // WebSocket upgrade
    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocketUpgrade(request, url)
    }

    // HTTP endpoints for internal communication
    switch (url.pathname) {
      case '/init':
        return this.handleInit(request)
      case '/validate-token':
        return this.handleValidateToken(request)
      case '/notify-scanned':
        return this.handleNotifyScanned(request)
      case '/notify-approved':
        return this.handleNotifyApproved()
      case '/notify-expired':
        return this.handleNotifyExpired()
      case '/status':
        return this.handleStatus()
      default:
        return new Response('Not found', { status: 404 })
    }
  }

  // ---------------------------------------------------------------------------
  // WebSocket Handling
  // ---------------------------------------------------------------------------

  /**
   * Handle WebSocket upgrade request from devices.
   */
  private async handleWebSocketUpgrade(request: Request, url: URL): Promise<Response> {
    const role = url.searchParams.get('role') // 'existing' or 'new'

    if (!role || (role !== 'existing' && role !== 'new')) {
      return new Response('Invalid role. Must be "existing" or "new"', { status: 400 })
    }

    // Check session state
    const session = await this.state.storage.get<SessionState>('session')
    if (!session) {
      return new Response('Session not found', { status: 404 })
    }

    if (session.expiresAt < Date.now()) {
      return new Response('Session expired', { status: 410 })
    }

    // Create WebSocket pair
    const pair = new WebSocketPair()
    const [client, server] = Object.values(pair)

    // Accept the WebSocket
    this.state.acceptWebSocket(server, [role])

    // Store connection based on role
    if (role === 'existing') {
      // Close existing connection if any
      if (this.existingDeviceSocket) {
        try {
          this.existingDeviceSocket.close(1000, 'New connection established')
        } catch {
          // Ignore errors closing old socket
        }
      }
      this.existingDeviceSocket = server
    } else {
      // Close existing new device connection if any
      if (this.newDeviceSocket) {
        try {
          this.newDeviceSocket.close(1000, 'New connection established')
        } catch {
          // Ignore errors closing old socket
        }
      }
      this.newDeviceSocket = server
    }

    // Send welcome message
    const welcomeMessage: LinkingMessage = {
      type: 'connected',
      payload: {}
    }
    server.send(JSON.stringify(welcomeMessage))

    return new Response(null, { status: 101, webSocket: client })
  }

  /**
   * Handle incoming WebSocket messages.
   */
  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    try {
      const data = JSON.parse(message as string) as { type: string }

      switch (data.type) {
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }))
          break
        default:
          // Unknown message type - ignore
          break
      }
    } catch {
      // Invalid message format - ignore
    }
  }

  /**
   * Handle WebSocket close event.
   */
  async webSocketClose(ws: WebSocket): Promise<void> {
    if (ws === this.existingDeviceSocket) {
      this.existingDeviceSocket = null
    } else if (ws === this.newDeviceSocket) {
      this.newDeviceSocket = null
    }
  }

  /**
   * Handle WebSocket error event.
   */
  async webSocketError(ws: WebSocket): Promise<void> {
    if (ws === this.existingDeviceSocket) {
      this.existingDeviceSocket = null
    } else if (ws === this.newDeviceSocket) {
      this.newDeviceSocket = null
    }
  }

  // ---------------------------------------------------------------------------
  // HTTP Endpoints (Internal)
  // ---------------------------------------------------------------------------

  /**
   * Initialize session state in Durable Object.
   * Called when a new linking session is created via the HTTP endpoint.
   */
  private async handleInit(request: Request): Promise<Response> {
    const body = (await request.json()) as {
      sessionId: string
      userId: string
      token: string
      expiresAt: number
    }

    const session: SessionState = {
      sessionId: body.sessionId,
      userId: body.userId,
      token: body.token,
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: body.expiresAt
    }

    await this.state.storage.put('session', session)

    // Set alarm for expiration
    await this.state.storage.setAlarm(body.expiresAt)

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  /**
   * Validate the one-time token from QR code scan.
   * Uses constant-time comparison to prevent timing attacks.
   */
  private async handleValidateToken(request: Request): Promise<Response> {
    const body = (await request.json()) as { token: string }

    const session = await this.state.storage.get<SessionState>('session')
    if (!session) {
      return new Response(JSON.stringify({ valid: false, error: 'Session not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (session.expiresAt < Date.now()) {
      return new Response(JSON.stringify({ valid: false, error: 'Session expired' }), {
        status: 410,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (session.status !== 'pending') {
      return new Response(JSON.stringify({ valid: false, error: 'Session already used' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Constant-time comparison to prevent timing attacks
    const storedToken = session.token
    const providedToken = body.token

    if (storedToken.length !== providedToken.length) {
      return new Response(JSON.stringify({ valid: false, error: 'Invalid token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    let isValid = true
    for (let i = 0; i < storedToken.length; i++) {
      if (storedToken[i] !== providedToken[i]) {
        isValid = false
      }
    }

    if (!isValid) {
      return new Response(JSON.stringify({ valid: false, error: 'Invalid token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ valid: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  /**
   * Notify existing device that QR code was scanned by new device.
   */
  private async handleNotifyScanned(request: Request): Promise<Response> {
    const body = (await request.json()) as {
      newDevicePublicKey: string
      deviceName?: string
      devicePlatform?: string
    }

    // Update session status
    const session = await this.state.storage.get<SessionState>('session')
    if (session) {
      session.status = 'scanned'
      await this.state.storage.put('session', session)
    }

    // Notify existing device via WebSocket
    if (this.existingDeviceSocket) {
      const message: LinkingMessage = {
        type: 'scanned',
        payload: {
          newDevicePublicKey: body.newDevicePublicKey,
          deviceName: body.deviceName,
          devicePlatform: body.devicePlatform
        }
      }
      try {
        this.existingDeviceSocket.send(JSON.stringify(message))
      } catch {
        // Socket might be closed
        this.existingDeviceSocket = null
      }
    }

    return new Response(JSON.stringify({ notified: !!this.existingDeviceSocket }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  /**
   * Notify new device that linking was approved.
   */
  private async handleNotifyApproved(): Promise<Response> {
    // Update session status
    const session = await this.state.storage.get<SessionState>('session')
    if (session) {
      session.status = 'approved'
      await this.state.storage.put('session', session)
    }

    // Notify new device via WebSocket
    if (this.newDeviceSocket) {
      const message: LinkingMessage = {
        type: 'approved'
      }
      try {
        this.newDeviceSocket.send(JSON.stringify(message))
      } catch {
        // Socket might be closed
        this.newDeviceSocket = null
      }
    }

    return new Response(JSON.stringify({ notified: !!this.newDeviceSocket }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  /**
   * Notify all connected devices that session has expired.
   */
  private async handleNotifyExpired(): Promise<Response> {
    const message: LinkingMessage = { type: 'expired' }
    const messageStr = JSON.stringify(message)

    // Notify both devices
    if (this.existingDeviceSocket) {
      try {
        this.existingDeviceSocket.send(messageStr)
        this.existingDeviceSocket.close(1000, 'Session expired')
      } catch {
        // Ignore
      }
      this.existingDeviceSocket = null
    }

    if (this.newDeviceSocket) {
      try {
        this.newDeviceSocket.send(messageStr)
        this.newDeviceSocket.close(1000, 'Session expired')
      } catch {
        // Ignore
      }
      this.newDeviceSocket = null
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  /**
   * Get current session status.
   */
  private async handleStatus(): Promise<Response> {
    const session = await this.state.storage.get<SessionState>('session')

    if (!session) {
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(
      JSON.stringify({
        ...session,
        existingDeviceConnected: !!this.existingDeviceSocket,
        newDeviceConnected: !!this.newDeviceSocket
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }

  // ---------------------------------------------------------------------------
  // Alarm Handler
  // ---------------------------------------------------------------------------

  /**
   * Handle alarm for session expiration.
   */
  async alarm(): Promise<void> {
    const session = await this.state.storage.get<SessionState>('session')

    if (session && session.status !== 'completed') {
      // Mark as expired
      session.status = 'expired'
      await this.state.storage.put('session', session)

      // Notify connected devices
      await this.handleNotifyExpired()
    }
  }
}
