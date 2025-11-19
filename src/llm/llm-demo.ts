/**
 * LLM Demo & Testing
 * Quick examples to test the LLM integration
 */

import { setupFromPOC } from './llm-setup'
import { chat, chatStream, chatCompletion } from './llm-client'
import { getToolDefinitions, executeTool } from './llm-tools'
import { buildLLMContext } from './llm-context'
import type { ChatMessage } from './llm-client'

/**
 * Demo 1: Simple question
 */
export async function demoSimpleChat() {
  console.log('=== Demo 1: Simple Chat ===')

  const response = await chat([
    { role: 'user', content: 'Bonjour, peux-tu te présenter ?' },
  ])

  console.log('Response:', response)
}

/**
 * Demo 2: Streaming chat
 */
export async function demoStreamingChat() {
  console.log('=== Demo 2: Streaming Chat ===')

  let fullResponse = ''

  await chatStream(
    [
      {
        role: 'user',
        content: "Explique-moi ce qu'est datannur en 3 phrases.",
      },
    ],
    chunk => {
      fullResponse += chunk
      void (process.stdout?.write?.(chunk) ?? console.log(chunk))
    },
  )

  console.log('\n\nFull response:', fullResponse)
}

/**
 * Demo 3: Query with tools
 */
export async function demoWithTools() {
  console.log('=== Demo 3: Chat with Tools ===')

  const messages: ChatMessage[] = [
    { role: 'user', content: 'Combien y a-t-il de datasets de type panel ?' },
  ]

  await chatCompletion({
    messages,
    tools: getToolDefinitions(),
    stream: true,
    onChunk: chunk => {
      void (process.stdout?.write?.(chunk) ?? console.log(chunk))
    },
    onToolCall: async toolCall => {
      console.log('\n🔧 Tool call:', toolCall.function.name)
      console.log('Parameters:', toolCall.function.arguments)

      const params = JSON.parse(toolCall.function.arguments) as Record<
        string,
        unknown
      >
      const result = executeTool(toolCall.function.name, params)

      console.log('Result:', result)
      return result
    },
  })
}

/**
 * Demo 4: Context-aware query
 */
export async function demoContextAware() {
  console.log('=== Demo 4: Context-Aware Query ===')

  const context = buildLLMContext({ includeFullData: false })
  console.log('Context stats:', context.stats)

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `Context: ${JSON.stringify(context, null, 2)}`,
    },
    {
      role: 'user',
      content: 'Donne-moi un résumé des données disponibles dans le catalogue.',
    },
  ]

  await chatStream(messages, chunk => {
    void (process.stdout?.write?.(chunk) ?? console.log(chunk))
  })
}

/**
 * Demo 5: Multi-turn conversation with tools
 */
export async function demoConversation() {
  console.log('=== Demo 5: Multi-turn Conversation ===')

  const messages: ChatMessage[] = []

  const questions = [
    'Combien de datasets avons-nous ?',
    'Et combien sont de type panel ?',
    'Montre-moi 3 exemples de datasets panel',
  ]

  for (const question of questions) {
    console.log(`\n👤 User: ${question}`)
    messages.push({ role: 'user', content: question })

    let assistantResponse = ''

    await chatCompletion({
      messages,
      tools: getToolDefinitions(),
      stream: true,
      onChunk: chunk => {
        assistantResponse += chunk
        void (process.stdout?.write?.(chunk) ?? console.log(chunk))
      },
      onToolCall: async toolCall => {
        console.log(`\n🔧 [${toolCall.function.name}]`)
        const params = JSON.parse(toolCall.function.arguments) as Record<
          string,
          unknown
        >
        const result = executeTool(toolCall.function.name, params)

        messages.push({
          role: 'tool',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          content: JSON.stringify(result),
        })

        return result
      },
    })

    if (assistantResponse) {
      messages.push({ role: 'assistant', content: assistantResponse })
    }

    console.log('\n')
  }
}

/**
 * Run all demos
 */
export async function runAllDemos() {
  // Setup API credentials
  setupFromPOC()

  try {
    await demoSimpleChat()
    await new Promise(resolve => setTimeout(resolve, 1000))

    await demoStreamingChat()
    await new Promise(resolve => setTimeout(resolve, 1000))

    await demoWithTools()
    await new Promise(resolve => setTimeout(resolve, 1000))

    await demoContextAware()
    await new Promise(resolve => setTimeout(resolve, 1000))

    await demoConversation()
  } catch (error) {
    console.error('Demo error:', error)
  }
}

// Export for browser console
if (typeof window !== 'undefined') {
  ;(
    window as {
      demoSimpleChat?: () => Promise<void>
      demoStreamingChat?: () => Promise<void>
      demoWithTools?: () => Promise<void>
      demoContextAware?: () => Promise<void>
      demoConversation?: () => Promise<void>
      runAllDemos?: () => Promise<void>
    }
  ).demoSimpleChat = demoSimpleChat
  ;(window as { demoStreamingChat?: () => Promise<void> }).demoStreamingChat =
    demoStreamingChat
  ;(window as { demoWithTools?: () => Promise<void> }).demoWithTools =
    demoWithTools
  ;(window as { demoContextAware?: () => Promise<void> }).demoContextAware =
    demoContextAware
  ;(window as { demoConversation?: () => Promise<void> }).demoConversation =
    demoConversation
  ;(window as { runAllDemos?: () => Promise<void> }).runAllDemos = runAllDemos
}
