/**
 * T108: LinkingSession Durable Object
 *
 * Manages real-time coordination for device linking flow.
 * Handles WebSocket connections for both initiator and new device,
 * broadcasting status updates and managing session expiry.
 *
 * Routes:
 * - POST /init - Initialize session metadata and set expiry alarm
 * - POST /broadcast - Send status update to all connected clients
 * - GET /ws?role=initiator|new_device - WebSocket upgrade
 */

type ClientMessage = { type: 'ping' } | { type: 'subscribe' }

type ServerMessage =
  | { type: 'pong' }
  | { type: 'connected'; role: string }
  | { type: 'status_changed'; status: string }
  | { type: 'session_expired' }
  | { type: 'error'; code: string; message: string }

interface SessionMetadata {
  sessionId: string
  userId: string
  expiresAt: number
}

interface ConnectionMeta {
  role: 'initiator' | 'new_device'
  connectedAt: number
}

export class LinkingSession implements DurableObject {
  private state: DurableObjectState

  constructor(state: DurableObjectState, env: unknown) {
    void env
    this.state = state
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/init' && request.method === 'POST') {
      return this.handleInit(request)
    }

    if (url.pathname === '/broadcast' && request.method === 'POST') {
      return this.handleBroadcast(request)
    }

    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocketUpgrade(request)
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  private async handleInit(request: Request): Promise<Response> {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!this.isValidInitRequest(body)) {
      return new Response(JSON.stringify({ error: 'Invalid init payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { sessionId, userId, expiresAt } = body

    await this.state.storage.put<SessionMetadata>('metadata', {
      sessionId,
      userId,
      expiresAt
    })

    const alarmTime = new Date(expiresAt)
    await this.state.storage.setAlarm(alarmTime)

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  private async handleBroadcast(request: Request): Promise<Response> {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!this.isValidBroadcastRequest(body)) {
      return new Response(JSON.stringify({ error: 'Invalid broadcast payload: requires status' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { status } = body

    const message: ServerMessage = {
      type: 'status_changed',
      status
    }

    const sentCount = this.broadcastToAll(message)

    return new Response(JSON.stringify({ sent: sentCount }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  private async handleWebSocketUpgrade(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const role = url.searchParams.get('role')

    if (role !== 'initiator' && role !== 'new_device') {
      return new Response(JSON.stringify({ error: 'Invalid role parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const metadata = await this.state.storage.get<SessionMetadata>('metadata')
    if (!metadata) {
      return new Response(JSON.stringify({ error: 'Session not initialized' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (Date.now() > metadata.expiresAt) {
      return new Response(JSON.stringify({ error: 'Session expired' }), {
        status: 410,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const pair = new WebSocketPair()
    const [client, server] = [pair[0], pair[1]]

    const meta: ConnectionMeta = {
      role,
      connectedAt: Date.now()
    }

    this.state.acceptWebSocket(server, [role])

    await this.state.storage.put(`connection:${role}`, meta)

    const connectedMessage: ServerMessage = {
      type: 'connected',
      role
    }
    server.send(JSON.stringify(connectedMessage))

    return new Response(null, { status: 101, webSocket: client })
  }

  webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): void {
    if (typeof message !== 'string') return

    let parsed: ClientMessage
    try {
      parsed = JSON.parse(message) as ClientMessage
    } catch {
      this.sendError(ws, 'INVALID_MESSAGE', 'Invalid JSON')
      return
    }

    switch (parsed.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' } satisfies ServerMessage))
        break

      case 'subscribe':
        break

      default:
        this.sendError(ws, 'UNKNOWN_MESSAGE', 'Unknown message type')
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string): Promise<void> {
    void code
    void reason

    const tags = this.state.getTags(ws)
    const role = tags[0]

    if (role) {
      await this.state.storage.delete(`connection:${role}`)
    }

    ws.close()
  }

  async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
    void error

    const tags = this.state.getTags(ws)
    const role = tags[0]

    if (role) {
      await this.state.storage.delete(`connection:${role}`)
    }

    ws.close()
  }

  async alarm(): Promise<void> {
    const expiredMessage: ServerMessage = {
      type: 'session_expired'
    }

    this.broadcastToAll(expiredMessage)

    const sockets = this.state.getWebSockets()
    for (const socket of sockets) {
      try {
        socket.close(1000, 'Session expired')
      } catch {
        // Socket may already be closed
      }
    }

    await this.state.storage.deleteAll()
  }

  private broadcastToAll(message: ServerMessage): number {
    const sockets = this.state.getWebSockets()
    let sentCount = 0

    for (const socket of sockets) {
      try {
        socket.send(JSON.stringify(message))
        sentCount++
      } catch {
        // Socket may be closed; hibernation API handles cleanup
      }
    }

    return sentCount
  }

  private sendError(ws: WebSocket, code: string, message: string): void {
    const errorMessage: ServerMessage = { type: 'error', code, message }
    ws.send(JSON.stringify(errorMessage))
  }

  private isValidInitRequest(
    body: unknown
  ): body is { sessionId: string; userId: string; expiresAt: number } {
    if (typeof body !== 'object' || body === null) return false
    const obj = body as Record<string, unknown>
    return (
      typeof obj.sessionId === 'string' &&
      typeof obj.userId === 'string' &&
      typeof obj.expiresAt === 'number'
    )
  }

  private isValidBroadcastRequest(body: unknown): body is { status: string } {
    if (typeof body !== 'object' || body === null) return false
    const obj = body as Record<string, unknown>
    return typeof obj.status === 'string'
  }
}
