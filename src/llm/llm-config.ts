/**
 * LLM Configuration
 * Settings for Infomaniak API and model selection
 */

export type LLMConfig = {
  baseURL: string
  proxyURL?: string
  isLocalProxy: boolean
  models: {
    text: string
    speech: string
  }
  maxTokens: number
  temperature: number
}

export type LLMCredentials = {
  apiKey: string
  productId: string
}

export type LLMStatus = {
  available: boolean
  configured: boolean
  siteKey?: string
  error?: string
}

// Detect environment
const isFileProtocol =
  typeof window !== 'undefined' && window.location.protocol === 'file:'
const isLocalhost =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'

// Determine proxy URL based on environment:
// - file:// protocol: no proxy available
// - localhost: local Python proxy
// - web server: PHP proxy
function getProxyURL(): string | undefined {
  if (isFileProtocol) return undefined
  if (isLocalhost) return 'http://localhost:3001'
  return '/api/llm'
}

/**
 * Default LLM configuration
 */
export const defaultLLMConfig: LLMConfig = {
  baseURL: 'https://api.infomaniak.com',
  proxyURL: getProxyURL(),
  isLocalProxy: isLocalhost && !isFileProtocol,
  models: {
    text: 'qwen3',
    speech: 'whisper',
  },
  maxTokens: 8192,
  temperature: 0.5,
}

// Session state (replaces per-request Turnstile tokens)
let turnstileSiteKey: string | null = null
let turnstileLoaded = false
let sessionToken: string | null = null
let sessionPending = false
let pendingResolvers: ((token: string | null) => void)[] = []
let turnstileToken: string | null = null
let turnstileTokenResolver: ((token: string) => void) | null = null

/**
 * Get LLM config
 */
export function getLLMConfig(): LLMConfig {
  return defaultLLMConfig
}

/**
 * Check if proxy is available
 */
export function isProxyAvailable(): boolean {
  return !!defaultLLMConfig.proxyURL
}

/**
 * Get current session token (for API requests)
 */
export function getSessionToken(): string | null {
  return sessionToken
}

/**
 * Check if running on local proxy (no session needed)
 */
export function isLocalProxy(): boolean {
  return defaultLLMConfig.isLocalProxy
}

/**
 * Create a session by validating Turnstile once
 * Call this when opening the chat panel
 */
export async function createSession(): Promise<boolean> {
  if (defaultLLMConfig.isLocalProxy) {
    return true // No session needed for local
  }

  // Already have a session
  if (sessionToken) {
    return true
  }

  // Session creation already in progress, wait for it
  if (sessionPending) {
    return new Promise(resolve => {
      pendingResolvers.push(token => resolve(!!token))
    })
  }

  sessionPending = true

  try {
    // Step 1: Load Turnstile and get a token
    const turnstileToken = await getTurnstileTokenOnce()
    if (!turnstileToken) {
      return false
    }

    // Step 2: Exchange Turnstile token for a session token
    const response = await fetch(`${defaultLLMConfig.proxyURL}/session.php`, {
      method: 'POST',
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'application/json',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'X-Turnstile-Token': turnstileToken,
      },
      body: JSON.stringify({}),
    })

    if (!response.ok) {
      return false
    }

    const result = (await response.json()) as {
      success: boolean
      sessionToken?: string
    }

    if (result.success && result.sessionToken) {
      sessionToken = result.sessionToken
      // Notify any waiting callers
      pendingResolvers.forEach(resolve => resolve(sessionToken))
      pendingResolvers = []
      return true
    }

    return false
  } catch {
    return false
  } finally {
    sessionPending = false
  }
}

/**
 * Get a Turnstile token (one-time, for session creation)
 */
async function getTurnstileTokenOnce(): Promise<string | null> {
  // Load Turnstile if not already loaded
  if (!turnstileLoaded) {
    const loaded = await loadTurnstile()
    if (!loaded) {
      return null
    }
  }

  // If token already received (callback fired before we started waiting)
  if (turnstileToken) {
    const token = turnstileToken
    turnstileToken = null
    return token
  }

  // Wait for token with timeout using the resolver
  return new Promise(resolve => {
    const timeout = setTimeout(() => {
      turnstileTokenResolver = null
      resolve(null)
    }, 30000) // 30s timeout

    turnstileTokenResolver = (token: string) => {
      clearTimeout(timeout)
      turnstileTokenResolver = null
      resolve(token)
    }
  })
}

/**
 * Load Turnstile widget (internal)
 */
async function loadTurnstile(): Promise<boolean> {
  if (turnstileLoaded) {
    return !!turnstileSiteKey
  }

  try {
    // Fetch siteKey from server
    const response = await fetch(`${defaultLLMConfig.proxyURL}/status.php`)
    if (!response.ok) {
      return false
    }

    const status = (await response.json()) as {
      enabled: boolean
      siteKey?: string
    }
    if (!status.enabled || !status.siteKey) {
      return false
    }

    turnstileSiteKey = status.siteKey

    // Load Turnstile script
    await loadTurnstileScript()

    // Render Turnstile widget
    renderTurnstile()

    turnstileLoaded = true
    return true
  } catch {
    return false
  }
}

function loadTurnstileScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src*="turnstile"]')) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src =
      'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Turnstile'))
    document.head.appendChild(script)
  })
}

function renderTurnstile(): void {
  if (!turnstileSiteKey || !window.turnstile) {
    return
  }

  // Create hidden container if not exists
  let container = document.getElementById('turnstile-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'turnstile-container'
    container.style.display = 'none'
    document.body.appendChild(container)
  }

  window.turnstile.render(container, {
    sitekey: turnstileSiteKey,
    callback: (token: string) => {
      // Resolve pending token request or store for later
      if (turnstileTokenResolver) {
        turnstileTokenResolver(token)
      } else {
        turnstileToken = token
      }
    },
  })
}

/**
 * Send API credentials to proxy server (local only)
 */
export async function setProxyCredentials(
  apiKey: string,
  productId: string,
): Promise<{ success: boolean; message?: string; error?: string }> {
  const proxyURL = defaultLLMConfig.proxyURL

  if (!proxyURL || !defaultLLMConfig.isLocalProxy) {
    return {
      success: false,
      error: 'Credentials can only be set on local proxy.',
    }
  }

  try {
    const response = await fetch(`${proxyURL}/set_keys`, {
      method: 'POST',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      headers: { 'Content-Type': 'application/json' },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      body: JSON.stringify({ api_key: apiKey, product_id: productId }),
    })

    if (!response.ok) {
      const error = (await response
        .json()
        .catch(() => ({ error: 'Unknown error' }))) as { error: string }
      return {
        success: false,
        error: error.error ?? 'Failed to save credentials',
      }
    }

    const result = (await response.json()) as { message: string }
    return { success: true, message: result.message }
  } catch (error) {
    return {
      success: false,
      error: `Cannot connect to proxy server: ${error}`,
    }
  }
}

/**
 * Check if credentials are configured in proxy
 */
export async function checkProxyStatus(): Promise<LLMStatus> {
  const proxyURL = defaultLLMConfig.proxyURL

  if (!proxyURL) {
    return {
      available: false,
      configured: false,
      error: 'Proxy URL not configured',
    }
  }

  try {
    const statusEndpoint = defaultLLMConfig.isLocalProxy
      ? `${proxyURL}/status`
      : `${proxyURL}/status.php`

    const response = await fetch(statusEndpoint)

    if (!response.ok) {
      return {
        available: false,
        configured: false,
        error: `Proxy not available (${response.status})`,
      }
    }

    const result = (await response.json()) as {
      configured?: boolean
      enabled?: boolean
      siteKey?: string
    }

    // Local proxy returns { configured }, PHP returns { enabled, siteKey }
    const configured = result.configured ?? result.enabled ?? false

    return {
      available: true,
      configured,
      siteKey: result.siteKey,
    }
  } catch {
    return {
      available: false,
      configured: false,
      error: 'Cannot connect to proxy server',
    }
  }
}

// Declare Turnstile types
declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string
          callback: (token: string) => void
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'expired-callback'?: () => void
        },
      ) => string
      reset: (widgetId?: string) => void
    }
  }
}
