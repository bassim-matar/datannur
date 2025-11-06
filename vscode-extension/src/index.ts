import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { SqlDatabase } from './sql-database'
import Logger from './logger'
import { registerTestCommand } from './test-runner'

function findPath(root: string, relatives: string[]): string | null {
  for (const rel of relatives) {
    const fullPath = path.join(root, rel)
    if (fs.existsSync(fullPath)) {
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
          return subdirPath
        }
      }
    }
  }
  return null
}

function enrichToolResult(toolName: string, resultText: string): string {
  try {
    const parsed: unknown = JSON.parse(resultText)

    if (typeof parsed !== 'object' || parsed === null) {
      return resultText
    }

    const obj = parsed as Record<string, unknown>

    // Case 1: SQL Error
    if ('error' in obj) {
      return JSON.stringify({
        ...obj,
        _meta: {
          status: 'error',
          interpretation:
            'Query failed. Check table/column names or simplify the query.',
          suggestion: 'Review the database schema and try a simpler approach.',
        },
      })
    }

    // Case 2: Empty results (SQL or SEARCH)
    const rows = 'rows' in obj ? obj.rows : undefined
    const message = 'message' in obj ? obj.message : undefined
    if (
      (Array.isArray(rows) && rows.length === 0) ||
      (typeof message === 'string' && message.includes('No results found'))
    ) {
      return JSON.stringify({
        ...obj,
        _meta: {
          status: 'empty',
          interpretation: 'Query executed successfully but returned NO DATA.',
          suggestion:
            toolName === 'datannur_search'
              ? 'Try different search terms or broader criteria.'
              : 'Check IDs, filters, or try different table/column names.',
          warning:
            '⚠️ DO NOT invent or assume data that was not returned. If no data was found, explicitly say so.',
        },
      })
    }

    // Case 3: Successful results with data
    if (Array.isArray(rows) && rows.length > 0) {
      const count =
        'count' in obj && typeof obj.count === 'number'
          ? obj.count
          : rows.length
      const meta: Record<string, unknown> = {
        status: 'success',
        count,
        instruction:
          '⚠️ CRITICAL: Use EXACT values from these rows. Copy names/IDs character-by-character. DO NOT paraphrase or invent data.',
      }

      // Add interpretation for large result sets
      if (rows.length >= 50) {
        meta.interpretation = `Showing ${rows.length} results. May be limited.`
        meta.suggestion =
          'Consider adding filters to narrow down results if needed.'
      }

      return JSON.stringify({ ...obj, _meta: meta })
    }

    // Case 4: SEARCH with multiple table results
    if (!('rows' in obj) && !('error' in obj)) {
      const tableCount = Object.keys(obj).filter(k => k !== 'message').length
      if (tableCount > 0) {
        const totalResults = Object.values(obj)
          .filter(Array.isArray)
          .reduce((sum: number, arr) => sum + arr.length, 0)

        return JSON.stringify({
          ...obj,
          _meta: {
            status: 'success',
            tables: tableCount,
            totalResults,
            interpretation: `Found results across ${tableCount} table(s).`,
          },
        })
      }
    }

    // Default: return as is
    return resultText
  } catch {
    // Not JSON or parsing failed - return as is
    return resultText
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]
  if (!workspaceFolder) {
    return
  }

  const workspaceRoot = workspaceFolder.uri.fsPath

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
    return
  }

  const db = new SqlDatabase(dbPath, schemasPath)

  // Initialize database asynchronously
  db.initialize()
    .then(() => {
      console.log('✅ datannur ready')
    })
    .catch((error: unknown) => {
      vscode.window.showErrorMessage(
        `Failed to load jsonjsdb: ${error instanceof Error ? error.message : String(error)}`,
      )
    })

  const toolExecuteSql = vscode.lm.registerTool('datannur_execute_sql', {
    async invoke(
      options: vscode.LanguageModelToolInvocationOptions<{ sql: string }>,
    ): Promise<vscode.LanguageModelToolResult> {
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
  } satisfies vscode.LanguageModelTool<{ sql: string }>)

  const toolSearch = vscode.lm.registerTool('datannur_search', {
    async invoke(
      options: vscode.LanguageModelToolInvocationOptions<{ query: string }>,
    ): Promise<vscode.LanguageModelToolResult> {
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
  } satisfies vscode.LanguageModelTool<{ query: string }>)

  context.subscriptions.push(toolExecuteSql, toolSearch)

  const handler: vscode.ChatRequestHandler = async (
    request: vscode.ChatRequest,
    chatContext: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken,
  ): Promise<void> => {
    Logger.logUserQuestion(request.prompt)
    stream.progress('Thinking...')

    try {
      // Try Copilot first, then fallback to any available model
      let models = await vscode.lm.selectChatModels({ vendor: 'copilot' })

      if (models.length === 0) {
        models = await vscode.lm.selectChatModels()
      }

      if (models.length === 0) {
        stream.markdown(
          '❌ No language model available. Install GitHub Copilot or another LLM extension (Continue, Cody, etc.).',
        )
        return
      }

      const model = models[0]

      // Build conversation with system prompt + schema + history
      const systemPromptPath = path.join(
        context.extensionPath,
        'out',
        'system-prompt.txt',
      )
      const systemPrompt = fs.readFileSync(systemPromptPath, 'utf-8')
      const schema = db.getSqlSchema()

      Logger.logPrompt(
        systemPrompt + '\n\n' + schema + '\n\nUser: ' + request.prompt,
      )

      let messages: vscode.LanguageModelChatMessage[] = [
        vscode.LanguageModelChatMessage.User(
          `${systemPrompt}\n\n# Database Schema\n${schema}`,
        ),
      ]

      // Add previous conversation history (limited to last 10 turns to avoid token explosion)
      // Each turn = 1 request + 1 response, so slice by -20 to get last 10 conversation pairs
      const maxHistoryTurns = 10
      const recentHistory = chatContext.history.slice(-(maxHistoryTurns * 2))

      for (const turn of recentHistory) {
        if (turn instanceof vscode.ChatRequestTurn) {
          messages.push(vscode.LanguageModelChatMessage.User(turn.prompt))
        } else if (turn instanceof vscode.ChatResponseTurn) {
          // Add assistant's previous response
          const response = turn.response
          if (response && response.length > 0) {
            const textParts = response
              .filter(
                (part): part is vscode.ChatResponseMarkdownPart =>
                  part instanceof vscode.ChatResponseMarkdownPart,
              )
              .map(part => part.value.value)
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
        tool.name.startsWith('datannur_'),
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

              // Enrich the result with metadata and interpretations
              const enrichedResult = enrichToolResult(toolCall.name, resultText)

              Logger.log(
                'TOOL_RESULT',
                `Result from ${toolCall.name}`,
                enrichedResult.length > 500
                  ? `${enrichedResult.substring(0, 500)}... (${enrichedResult.length} chars)`
                  : enrichedResult,
              )

              // Add anti-hallucination reminder after tool result
              const antiHallucinationReminder = `\n\n⚠️ CRITICAL INSTRUCTION - READ CAREFULLY:

1. The data above is the ONLY source of truth
2. You MUST copy names/values EXACTLY character-by-character (no translation, no paraphrasing, no summarizing)
3. If a dataset is named "Qualité de l'eau potable", say exactly "Qualité de l'eau potable" (not "Water Quality" or "Health Indicators")
4. If SQL returns 3 rows, list exactly 3 items with their exact names from the 'name' column
5. If the result is empty, say "No data found" - do NOT guess or invent similar items

FORBIDDEN: Inventing names like "Indicateurs de santé publique" when SQL returned "Qualité de l'eau potable"
REQUIRED: Exact copy-paste of all names/values from SQL results`

              // Add enriched tool result to messages
              messages.push(
                vscode.LanguageModelChatMessage.User([
                  new vscode.LanguageModelToolResultPart(toolCall.callId, [
                    new vscode.LanguageModelTextPart(
                      enrichedResult + antiHallucinationReminder,
                    ),
                  ]),
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
      Logger.log(
        'ERROR',
        'Chat request failed',
        error instanceof Error ? error.message : String(error),
      )
    }
  }

  const participant = vscode.chat.createChatParticipant(
    'datannur.catalog',
    handler,
  )

  participant.iconPath = vscode.Uri.joinPath(
    context.extensionUri,
    'out',
    'icon.png',
  )

  context.subscriptions.push(participant)

  // Register test command
  registerTestCommand(context)

  // Register debug command with captured variables
  const capturedInfo = { workspaceRoot, dbPath, schemasPath }
  context.subscriptions.push(
    vscode.commands.registerCommand('datannur.debugActivation', () => {
      vscode.window.showInformationMessage(
        `datannur active\nDB: ${capturedInfo.dbPath}\nSchemas: ${capturedInfo.schemasPath}`,
      )
    }),
  )
}

export function deactivate() {}
