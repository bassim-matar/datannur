import vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import PromptLoader from './prompts'
import { SqlDatabase } from './sql-database'
import Logger from './logger'

function findPath(root: string, relatives: string[]): string | null {
  for (const rel of relatives) {
    const fullPath = path.join(root, rel)
    if (fs.existsSync(fullPath)) {
      console.log(`✅ Found: ${fullPath}`)
      return fullPath
    }
  }
  return null
}

function findDbPath(root: string, relatives: string[]): string | null {
  for (const rel of relatives) {
    const fullPath = path.join(root, rel)
    if (fs.existsSync(fullPath)) {
      // Check if this folder contains __table__.json directly
      const hasTableFile = fs.existsSync(path.join(fullPath, '__table__.json'))
      if (hasTableFile) {
        console.log(`✅ Found db: ${fullPath}`)
        return fullPath
      }

      // Otherwise, look for a subdirectory containing __table__.json
      const subdirs = fs
        .readdirSync(fullPath, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)

      for (const subdir of subdirs) {
        const subdirPath = path.join(fullPath, subdir)
        const hasTableFileInSubdir = fs.existsSync(
          path.join(subdirPath, '__table__.json'),
        )
        if (hasTableFileInSubdir) {
          console.log(`✅ Found db in subdirectory: ${subdirPath}`)
          return subdirPath
        }
      }
    }
  }
  return null
}

export function activate(context: vscode.ExtensionContext) {
  console.log('🟢 jsonjsdb extension is activating...')

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]
  if (!workspaceFolder) {
    vscode.window.showWarningMessage('No workspace folder open')
    return
  }

  const workspaceRoot = workspaceFolder.uri.fsPath

  // Initialize logger (output channel by default, file logging opt-in)
  Logger.initialize(workspaceRoot)
  Logger.log('INIT', 'Extension activating', { workspaceRoot })

  const dbPath = findDbPath(workspaceRoot, [
    'data/db',
    'public/data/db',
    'app/data/db',
  ])

  const schemasPath = findPath(workspaceRoot, [
    'schemas',
    'public/schemas',
    'app/schemas',
  ])

  if (!dbPath || !schemasPath) {
    vscode.window.showErrorMessage('Could not find data/db or schemas folder')
    return
  }

  const db = new SqlDatabase(dbPath, schemasPath)

  // Initialize database asynchronously
  db.initialize()
    .then(() => {
      vscode.window.showInformationMessage('jsonjsdb SQL database loaded!')
      console.log('✅ Database ready')
    })
    .catch(error => {
      vscode.window.showErrorMessage(
        `Failed to load jsonjsdb: ${error instanceof Error ? error.message : String(error)}`,
      )
    })

  const toolExecuteSql = vscode.lm.registerTool('datannur_execute_sql', {
    async invoke(
      options: vscode.LanguageModelToolInvocationOptions<{ sql: string }>,
    ) {
      const sql = options.input.sql ?? ''
      try {
        const result = db.executeQuery(sql)
        return new vscode.LanguageModelToolResult([
          new vscode.LanguageModelTextPart(result),
        ])
      } catch (error) {
        return new vscode.LanguageModelToolResult([
          new vscode.LanguageModelTextPart(
            `Error: ${error instanceof Error ? error.message : String(error)}`,
          ),
        ])
      }
    },
  })

  const toolGetStats = vscode.lm.registerTool('datannur_get_stats', {
    async invoke() {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(db.getStats()),
      ])
    },
  })

  const toolSearch = vscode.lm.registerTool('datannur_search', {
    async invoke(
      options: vscode.LanguageModelToolInvocationOptions<{ query: string }>,
    ) {
      const query = options.input.query ?? ''
      try {
        Logger.logSearch(query)
        const result = db.search(query)
        Logger.logResult(result)
        return new vscode.LanguageModelToolResult([
          new vscode.LanguageModelTextPart(result),
        ])
      } catch (error) {
        return new vscode.LanguageModelToolResult([
          new vscode.LanguageModelTextPart(
            `Error: ${error instanceof Error ? error.message : String(error)}`,
          ),
        ])
      }
    },
  })

  context.subscriptions.push(toolExecuteSql, toolGetStats, toolSearch)

  // List of our tool names for filtering
  const ourToolNames = [
    'datannur_execute_sql',
    'datannur_search',
    'datannur_get_stats',
  ]

  Logger.log(
    'DATANNUR_TOOLS',
    'Our registered datannur tools',
    JSON.stringify(ourToolNames),
  )
  console.log('✅ datannur tools registered:', ourToolNames)

  // Debug: List all tools grouped by prefix
  const allToolsGrouped = vscode.lm.tools.reduce(
    (acc, tool) => {
      const prefix = tool.name.split('_')[0]
      if (!acc[prefix]) acc[prefix] = []
      acc[prefix].push(tool.name)
      return acc
    },
    {} as Record<string, string[]>,
  )

  console.log('📋 All registered tools by prefix:')
  Object.keys(allToolsGrouped)
    .sort()
    .forEach(prefix => {
      console.log(
        `  ${prefix}_ (${allToolsGrouped[prefix].length}):`,
        allToolsGrouped[prefix],
      )
    })

  console.log(
    '🔧 All tools:',
    vscode.lm.tools.map(t => t.name),
  )

  const participant = vscode.chat.createChatParticipant(
    'datannur.catalog',
    async (request, chatContext, stream, token) => {
      Logger.logUserQuestion(request.prompt)
      console.log('💬 Chat:', request.prompt)
      stream.progress('Thinking...')

      try {
        // Try Copilot first, then fallback to any available model
        let models = await vscode.lm.selectChatModels({ vendor: 'copilot' })

        if (models.length === 0) {
          console.log('ℹ️ No Copilot model found, trying other vendors...')
          models = await vscode.lm.selectChatModels()
        }

        if (models.length === 0) {
          stream.markdown(
            '❌ No language model available. Install GitHub Copilot or another LLM extension (Continue, Cody, etc.).',
          )
          return
        }

        const model = models[0]
        console.log(
          '🤖 Using model:',
          model.name,
          model.family,
          model.version,
          `(${model.vendor})`,
        )

        // Build conversation with system prompt + schema + history
        const systemPrompt = PromptLoader.getSystemPrompt()
        const schema = db.getSqlSchema()

        // Log the system prompt
        Logger.logPrompt(
          systemPrompt + '\n\n' + schema + '\n\nUser: ' + request.prompt,
        )

        // Build messages with conversation history
        let messages: vscode.LanguageModelChatMessage[] = [
          vscode.LanguageModelChatMessage.User(systemPrompt + '\n\n' + schema),
        ]

        // Add previous conversation history
        for (const turn of chatContext.history) {
          if (turn instanceof vscode.ChatRequestTurn) {
            messages.push(vscode.LanguageModelChatMessage.User(turn.prompt))
          } else if (turn instanceof vscode.ChatResponseTurn) {
            // Add assistant's previous response
            const response = turn.response
            if (response && response.length > 0) {
              const textParts = response
                .filter(part => part instanceof vscode.ChatResponseMarkdownPart)
                .map(
                  part => (part as vscode.ChatResponseMarkdownPart).value.value,
                )
                .join('\n')
              if (textParts) {
                messages.push(
                  vscode.LanguageModelChatMessage.Assistant(textParts),
                )
              }
            }
          }
        }

        // Add current user message
        messages.push(vscode.LanguageModelChatMessage.User(request.prompt))

        // Get tools from registered tools
        const tools = vscode.lm.tools.filter(tool =>
          ourToolNames.includes(tool.name),
        )

        Logger.log(
          'TOOLS',
          'Available tools for this request',
          JSON.stringify(tools.map(t => t.name)),
        )

        // Send request with tools - LLM can call them as needed
        // Use tail-recursive loop to handle multi-step tool calls (Microsoft pattern)
        let fullResponse = ''
        const runWithTools = async (): Promise<void> => {
          const response = await model.sendRequest(messages, { tools }, token)

          // Collect tool calls and text from response
          const toolCalls: vscode.LanguageModelToolCallPart[] = []
          let responseText = ''

          for await (const fragment of response.stream) {
            if (fragment instanceof vscode.LanguageModelTextPart) {
              responseText += fragment.value
              fullResponse += fragment.value
              stream.markdown(fragment.value)
            } else if (fragment instanceof vscode.LanguageModelToolCallPart) {
              toolCalls.push(fragment)
            }
          }

          // If LLM called tools, invoke them and continue with results
          if (toolCalls.length > 0) {
            // Log all tool calls
            for (const toolCall of toolCalls) {
              Logger.log(
                'TOOL_CALL',
                'LLM called tool',
                JSON.stringify({ name: toolCall.name, input: toolCall.input }),
              )
              console.log('🔧 Tool call:', toolCall.name, toolCall.input)
            }

            // Build messages with tool calls
            messages = [
              ...messages,
              vscode.LanguageModelChatMessage.Assistant(toolCalls),
            ]

            // Invoke each tool and add results to messages
            for (const toolCall of toolCalls) {
              try {
                const toolResult = await vscode.lm.invokeTool(
                  toolCall.name,
                  {
                    toolInvocationToken: undefined,
                    input: toolCall.input,
                  },
                  token,
                )

                // Log tool result
                const resultText = toolResult.content
                  .map(part =>
                    part instanceof vscode.LanguageModelTextPart
                      ? part.value
                      : '',
                  )
                  .join('')
                Logger.log(
                  'TOOL_RESULT',
                  `Result from ${toolCall.name}`,
                  resultText.length > 500
                    ? `${resultText.substring(0, 500)}... (${resultText.length} chars)`
                    : resultText,
                )

                // Add tool result to messages
                messages.push(
                  vscode.LanguageModelChatMessage.User([
                    new vscode.LanguageModelToolResultPart(
                      toolCall.callId,
                      toolResult.content,
                    ),
                  ]),
                )
              } catch (error) {
                const errorMsg = `⚠️ Tool error: ${error instanceof Error ? error.message : String(error)}`
                stream.markdown(`\n\n${errorMsg}`)
                Logger.log('TOOL_ERROR', errorMsg)
              }
            }

            // Recursively call runWithTools to process tool results
            return runWithTools()
          }

          // No more tool calls - we're done
          Logger.log(
            'RESPONSE_COMPLETE',
            'No more tool calls',
            responseText.length > 0
              ? `Generated ${responseText.length} chars`
              : 'No text generated in final response',
          )
        }

        await runWithTools()

        Logger.log('LLM_RESPONSE', 'Full response', fullResponse)
      } catch (error) {
        stream.markdown(
          `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    },
  )

  participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'icon.png')

  context.subscriptions.push(participant)

  console.log('✅ Chat participant registered')
}

export function deactivate() {
  console.log('🔴 jsonjsdb extension deactivated')
}
