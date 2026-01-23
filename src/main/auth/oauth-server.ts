/**
 * OAuth Localhost HTTP Server
 *
 * Creates a temporary localhost HTTP server to receive OAuth callbacks.
 * Used for desktop OAuth flows where the browser redirects back to the app.
 */

import * as http from 'node:http'
import { URL } from 'node:url'
import { EventEmitter } from 'node:events'

export interface OAuthServerConfig {
  /** Timeout in milliseconds (default: 5 minutes) */
  timeout?: number
  /** Expected state parameter for CSRF validation */
  expectedState?: string
  /** Path to listen on (default: /oauth/callback) */
  callbackPath?: string
}

export interface OAuthResult {
  code: string
  state: string
}

export interface OAuthError {
  error: string
  errorDescription?: string
}

export type OAuthServerEvent = 'success' | 'error' | 'timeout' | 'close'

const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000
const DEFAULT_CALLBACK_PATH = '/oauth/callback'

const SUCCESS_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Authentication Successful</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      text-align: center;
      background: white;
      padding: 40px 60px;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    .checkmark {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: #10b981;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .checkmark svg { width: 40px; height: 40px; }
    h1 { color: #1f2937; margin: 0 0 10px; font-size: 24px; }
    p { color: #6b7280; margin: 0; font-size: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="checkmark">
      <svg fill="none" stroke="white" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
      </svg>
    </div>
    <h1>Authentication Successful</h1>
    <p>You can close this window and return to Memry.</p>
  </div>
</body>
</html>
`

const ERROR_HTML = (message: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Authentication Failed</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }
    .container {
      text-align: center;
      background: white;
      padding: 40px 60px;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    .error-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: #ef4444;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .error-icon svg { width: 40px; height: 40px; }
    h1 { color: #1f2937; margin: 0 0 10px; font-size: 24px; }
    p { color: #6b7280; margin: 0; font-size: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="error-icon">
      <svg fill="none" stroke="white" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </div>
    <h1>Authentication Failed</h1>
    <p>${message}</p>
  </div>
</body>
</html>
`

export class OAuthServer extends EventEmitter {
  private server: http.Server | null = null
  private timeoutId: ReturnType<typeof setTimeout> | null = null
  private resolveCode: ((result: OAuthResult) => void) | null = null
  private rejectCode: ((error: Error) => void) | null = null
  private _port: number = 0
  private closed = false

  private readonly config: Required<OAuthServerConfig>

  constructor(config: OAuthServerConfig = {}) {
    super()
    this.config = {
      timeout: config.timeout ?? DEFAULT_TIMEOUT_MS,
      expectedState: config.expectedState ?? '',
      callbackPath: config.callbackPath ?? DEFAULT_CALLBACK_PATH
    }
  }

  get port(): number {
    return this._port
  }

  get callbackUrl(): string {
    return `http://localhost:${this._port}${this.config.callbackPath}`
  }

  async start(): Promise<number> {
    if (this.server) {
      throw new Error('Server already started')
    }

    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => this.handleRequest(req, res))

      this.server.on('error', (err) => {
        this.cleanup()
        reject(err)
      })

      this.server.listen(0, '127.0.0.1', () => {
        const address = this.server?.address()
        if (typeof address === 'object' && address !== null) {
          this._port = address.port
          this.startTimeout()
          resolve(this._port)
        } else {
          reject(new Error('Failed to get server address'))
        }
      })
    })
  }

  waitForCode(): Promise<OAuthResult> {
    if (this.closed) {
      return Promise.reject(new Error('Server is closed'))
    }

    return new Promise((resolve, reject) => {
      this.resolveCode = resolve
      this.rejectCode = reject
    })
  }

  close(): void {
    if (this.closed) return
    this.closed = true
    this.cleanup()
    this.emit('close')
  }

  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    const reqUrl = new URL(req.url ?? '/', `http://localhost:${this._port}`)

    if (reqUrl.pathname !== this.config.callbackPath) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('Not Found')
      return
    }

    const code = reqUrl.searchParams.get('code')
    const state = reqUrl.searchParams.get('state')
    const error = reqUrl.searchParams.get('error')
    const errorDescription = reqUrl.searchParams.get('error_description')

    if (error) {
      const errorObj: OAuthError = {
        error,
        errorDescription: errorDescription ?? undefined
      }
      this.emit('error', errorObj)
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(ERROR_HTML(errorDescription ?? error))
      this.rejectCode?.(
        new Error(`OAuth error: ${error} - ${errorDescription ?? 'No description'}`)
      )
      this.close()
      return
    }

    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/html' })
      res.end(ERROR_HTML('Missing authorization code'))
      this.rejectCode?.(new Error('Missing authorization code'))
      this.close()
      return
    }

    if (this.config.expectedState && state !== this.config.expectedState) {
      res.writeHead(400, { 'Content-Type': 'text/html' })
      res.end(ERROR_HTML('Invalid state parameter'))
      this.rejectCode?.(new Error('Invalid state parameter - possible CSRF attack'))
      this.close()
      return
    }

    const result: OAuthResult = { code, state: state ?? '' }
    this.emit('success', result)
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(SUCCESS_HTML)
    this.resolveCode?.(result)
    this.close()
  }

  private startTimeout(): void {
    this.timeoutId = setTimeout(() => {
      this.emit('timeout')
      this.rejectCode?.(new Error('OAuth timeout - no callback received'))
      this.close()
    }, this.config.timeout)
  }

  private cleanup(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
    if (this.server) {
      this.server.close()
      this.server = null
    }
  }
}

export async function createOAuthServer(config?: OAuthServerConfig): Promise<OAuthServer> {
  const server = new OAuthServer(config)
  await server.start()
  return server
}
