/**
 * LLM Integration Module
 *
 * Provides tools and context for LLM interaction with the data catalog
 */

export {
  getLLMConfig,
  setProxyCredentials,
  checkProxyStatus,
  isProxyAvailable,
  isLocalProxy,
  createSession,
  getSessionToken,
  hasSession,
  clearSession,
} from './llm-config'
export { llmTools, getToolDefinitions, executeTool } from './llm-tools'
export { chatCompletion, chat, chatStream } from './llm-client'
export type { LLMConfig, LLMStatus } from './llm-config'
export type { LLMTool, ToolDefinition } from './llm-tools'
export type { ChatMessage, ChatCompletionOptions, ToolCall } from './llm-client'
