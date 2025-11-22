/**
 * LLM Configuration
 * Settings for Infomaniak API and model selection
 */

export type LLMConfig = {
  baseURL: string
  proxyURL?: string
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

/**
 * Default LLM configuration
 */
export const defaultLLMConfig: LLMConfig = {
  baseURL: 'https://api.infomaniak.com',
  proxyURL:
    typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:3001'
      : undefined,
  models: {
    text: 'qwen3',
    speech: 'whisper',
  },
  maxTokens: 8192,
  temperature: 0.5,
}

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
 * Send API credentials to proxy server
 */
export async function setProxyCredentials(
  apiKey: string,
  productId: string,
): Promise<{ success: boolean; message?: string; error?: string }> {
  const proxyURL = defaultLLMConfig.proxyURL

  if (!proxyURL) {
    return {
      success: false,
      error: 'Proxy server not available. Please start the proxy server.',
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
export async function checkProxyStatus(): Promise<{
  available: boolean
  configured: boolean
  error?: string
}> {
  const proxyURL = defaultLLMConfig.proxyURL

  if (!proxyURL) {
    return {
      available: false,
      configured: false,
      error: 'Proxy URL not configured',
    }
  }

  try {
    const response = await fetch(`${proxyURL}/status`)

    if (!response.ok) {
      return {
        available: true,
        configured: false,
        error: 'Failed to check status',
      }
    }

    const result = (await response.json()) as { configured: boolean }
    return { available: true, configured: result.configured }
  } catch {
    return {
      available: false,
      configured: false,
      error: `Cannot connect to proxy server`,
    }
  }
}
