/**
 * Infomaniak LLM API Client
 * Handles streaming chat completions and tool calls
 */

import { getLLMConfig } from './llm-config'

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  name?: string
  // eslint-disable-next-line @typescript-eslint/naming-convention
  tool_calls?: ToolCall[]
  // eslint-disable-next-line @typescript-eslint/naming-convention
  tool_call_id?: string
}

export type ToolCall = {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

export type ToolDefinition = {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: {
      type: 'object'
      properties: {
        [key: string]: { type: string; description: string; enum?: string[] }
      }
      required: string[]
    }
  }
}

export type ChatCompletionOptions = {
  model?: string
  messages: ChatMessage[]
  tools?: ToolDefinition[]
  temperature?: number
  maxTokens?: number
  stream?: boolean
  signal?: AbortSignal
  onChunk?: (chunk: string) => void
  onToolCall?: (toolCall: ToolCall) => Promise<unknown>
}

type SSEDelta = {
  content?: string
  // eslint-disable-next-line @typescript-eslint/naming-convention
  tool_calls?: Array<{
    index?: number
    id?: string
    function?: {
      name?: string
      arguments?: string
    }
  }>
}

type SSEParsed = {
  id?: string
  model?: string
  choices?: Array<{
    delta?: SSEDelta
    // eslint-disable-next-line @typescript-eslint/naming-convention
    finish_reason?: string
  }>
}

type ErrorResponse = {
  error: string
}

export type ChatCompletionResponse = {
  id: string
  model: string
  choices: Array<{
    index: number
    message: ChatMessage
    // eslint-disable-next-line @typescript-eslint/naming-convention
    finish_reason: string
  }>
  usage?: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    prompt_tokens: number
    // eslint-disable-next-line @typescript-eslint/naming-convention
    completion_tokens: number
    // eslint-disable-next-line @typescript-eslint/naming-convention
    total_tokens: number
  }
}

/**
 * Call Infomaniak LLM API with streaming support
 */
export async function chatCompletion(
  options: ChatCompletionOptions,
): Promise<ChatCompletionResponse | null> {
  const config = getLLMConfig()

  const {
    model = config.models.text,
    messages,
    tools,
    temperature = config.temperature,
    maxTokens = config.maxTokens,
    stream = true,
    signal,
    onChunk,
    onToolCall,
  } = options

  const payload = {
    model,
    messages,
    ...(tools && tools.length > 0 ? { tools } : {}),
    temperature,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    max_tokens: maxTokens,
    stream,
  }

  console.log('=== LLM REQUEST PAYLOAD ===')
  console.log('Model:', payload.model)
  console.log('Messages:', payload.messages.length)
  console.log('Tools:', payload.tools?.length ?? 0)
  console.log(
    '\nSystem prompt length:',
    payload.messages[0]?.content?.length ?? 0,
  )
  console.log('\nFull payload:', payload)
  console.log('=== END PAYLOAD ===\n')

  const useProxy = !!config.proxyURL

  if (!useProxy) {
    throw new Error(
      'Proxy server required. Please start the local proxy server.',
    )
  }

  const url = `${config.proxyURL}/api/chat/completions`

  try {
    const contentType = 'application/json'
    const accept = stream ? 'text/event-stream' : 'application/json'

    const headers = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': contentType,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Accept: accept,
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal,
    })

    if (!response.ok) {
      const error: ErrorResponse = (await response
        .json()
        .catch(() => ({ error: 'Unknown error' }))) as ErrorResponse
      throw new Error(
        `API Error: ${response.status} - ${JSON.stringify(error)}`,
      )
    }

    if (stream) {
      return await handleStreamingResponse(response, onChunk, onToolCall)
    } else {
      return (await response.json()) as ChatCompletionResponse
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error
    }
    console.error('LLM API Error:', error)
    throw error
  }
}

/**
 * Handle Server-Sent Events (SSE) streaming response
 */
async function handleStreamingResponse(
  response: Response,
  onChunk?: (chunk: string) => void,
  onToolCall?: (toolCall: ToolCall) => Promise<unknown>,
): Promise<ChatCompletionResponse | null> {
  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''
  let fullText = ''
  const currentToolCalls: ToolCall[] = []
  let responseMetadata: Partial<ChatCompletionResponse> = {}

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (value) {
        buffer += decoder.decode(value, { stream: !done })
      }

      const lines = buffer.split('\n')
      buffer = done ? '' : (lines[lines.length - 1] ?? '')
      const linesToProcess = done ? lines : lines.slice(0, -1)

      for (const line of linesToProcess) {
        if (!line.startsWith('data: ')) continue

        const data = line.slice(6).trim()
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data) as SSEParsed

          if (!responseMetadata.id) {
            responseMetadata = {
              id: parsed.id ?? 'unknown',
              model: parsed.model ?? 'unknown',
            }
          }

          const delta = parsed.choices?.[0]?.delta
          const finishReason = parsed.choices?.[0]?.finish_reason

          if (delta?.content) {
            fullText += delta.content
            onChunk?.(delta.content)
          }

          if (delta?.tool_calls) {
            for (const toolCallDelta of delta.tool_calls) {
              const index: number = toolCallDelta.index ?? 0

              if (!currentToolCalls[index]) {
                currentToolCalls[index] = {
                  id: toolCallDelta.id ?? '',
                  type: 'function',
                  function: {
                    name: toolCallDelta.function?.name ?? '',
                    arguments: '',
                  },
                }
              }

              const existingCall = currentToolCalls[index]
              if (toolCallDelta.function?.arguments && existingCall) {
                existingCall.function.arguments +=
                  toolCallDelta.function.arguments
              }
            }
          }

          if (finishReason === 'tool_calls' && onToolCall) {
            for (const toolCall of currentToolCalls) {
              await onToolCall(toolCall)
            }
          }
        } catch (e) {
          console.warn('Failed to parse SSE line:', line, e)
        }
      }

      if (done) break
    }

    return {
      id: responseMetadata.id ?? 'unknown',
      model: responseMetadata.model ?? 'unknown',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: fullText,
            ...(currentToolCalls.length > 0
              ? // eslint-disable-next-line @typescript-eslint/naming-convention
                { tool_calls: currentToolCalls }
              : {}),
          },
          // eslint-disable-next-line @typescript-eslint/naming-convention
          finish_reason: currentToolCalls.length > 0 ? 'tool_calls' : 'stop',
        },
      ],
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error
    }
    console.error('Streaming error:', error)
    throw error
  } finally {
    reader.releaseLock()
  }
}

/**
 * Simple non-streaming chat completion
 */
export async function chat(
  messages: ChatMessage[],
  options?: Partial<ChatCompletionOptions>,
): Promise<string> {
  const response = await chatCompletion({
    messages,
    stream: false,
    ...options,
  })

  return response?.choices[0]?.message?.content ?? ''
}

/**
 * Streaming chat with callback
 */
export async function chatStream(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  options?: Partial<ChatCompletionOptions>,
): Promise<string> {
  let fullText = ''

  await chatCompletion({
    messages,
    stream: true,
    onChunk: chunk => {
      fullText += chunk
      onChunk(chunk)
    },
    ...options,
  })

  return fullText
}

/**
 * Speech-to-Text using Whisper API
 */
export type TranscriptionResponse = {
  text: string
}

export async function transcribeAudio(
  audioBlob: Blob,
): Promise<TranscriptionResponse> {
  const config = getLLMConfig()

  const useProxy = !!config.proxyURL

  if (!useProxy) {
    throw new Error(
      'Proxy server required. Please start the local proxy server.',
    )
  }

  const uploadURL = `${config.proxyURL}/api/audio/transcriptions`

  const formData = new FormData()
  formData.append('file', audioBlob, 'audio.webm')
  formData.append('model', 'whisper')
  formData.append('language', 'fr')
  formData.append('response_format', 'text')

  try {
    const uploadResponse = await fetch(uploadURL, {
      method: 'POST',
      body: formData,
    })

    if (!uploadResponse.ok) {
      const error: ErrorResponse = (await uploadResponse
        .json()
        .catch(() => ({ error: 'Upload failed' }))) as ErrorResponse
      throw new Error(
        `Upload Error: ${uploadResponse.status} - ${JSON.stringify(error)}`,
      )
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const responseData = (await uploadResponse.json()) as { batch_id: string }
    const batchId = responseData.batch_id

    const resultURL = `${config.proxyURL}/api/audio/results/${batchId}`

    for (let i = 0; i < 120; i++) {
      await new Promise(resolve => setTimeout(resolve, 500))

      const resultResponse = await fetch(resultURL, {
        method: 'GET',
      })

      if (!resultResponse.ok) {
        throw new Error(`Result Error: ${resultResponse.status}`)
      }

      const result = (await resultResponse.json()) as {
        status: string
        data?: string
        error?: string
      }

      if (result.status === 'done' || result.status === 'success') {
        return { text: result.data ?? '' }
      } else if (result.status === 'error') {
        throw new Error(result.error ?? 'Transcription failed')
      }
    }

    throw new Error('Transcription timeout')
  } catch (error) {
    console.error('Whisper API Error:', error)
    throw error
  }
}
