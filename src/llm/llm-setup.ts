/**
 * LLM Setup Helper
 * Initialize Infomaniak API configuration via proxy server
 */

import { setProxyCredentials } from './llm-config'

/**
 * Setup Infomaniak LLM with API credentials from POC
 */
export async function setupFromPOC(): Promise<void> {
  const apiKey = 'your-api-key-here'
  const productId = 'your-product-id-here'

  const result = await setProxyCredentials(apiKey, productId)

  if (result.success) {
    console.log('✅ LLM configuré avec les credentials du POC')
  } else {
    console.error('❌ Erreur configuration LLM:', result.error)
  }
}

/**
 * Quick setup for development
 * Call this in browser console: setupLLM()
 */
if (typeof window !== 'undefined') {
  ;(window as { setupLLM?: () => Promise<void> }).setupLLM = setupFromPOC
}
