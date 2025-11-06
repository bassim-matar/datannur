/**
 * Automated LLM Testing Script
 *
 * This script automatically tests the extension by:
 * 1. Using VSCode's Language Model API directly
 * 2. Running predefined test queries
 * 3. Validating responses against expected patterns
 * 4. Saving results for comparison
 */

import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

interface TestCase {
  name: string
  prompt: string
  expectedToolCalls: string[]
  validateResponse: (response: string, toolCalls: string[]) => TestResult
}

interface TestResult {
  passed: boolean
  message: string
  toolsCalled: string[]
  response: string
}

const testCases: TestCase[] = [
  {
    name: 'Basic count query',
    prompt: 'Combien de datasets ?',
    expectedToolCalls: ['datannur_execute_sql'],
    validateResponse: (response, tools) => ({
      passed:
        tools.includes('datannur_execute_sql') && response.includes('dataset'),
      message: tools.includes('datannur_execute_sql')
        ? 'Tool called correctly'
        : 'Expected SQL tool to be called',
      toolsCalled: tools,
      response,
    }),
  },
  {
    name: 'Search query',
    prompt: "Cherche 'population'",
    expectedToolCalls: ['datannur_search'],
    validateResponse: (response, tools) => ({
      passed: tools.includes('datannur_search'),
      message: tools.includes('datannur_search')
        ? 'Search tool called correctly'
        : 'Expected search tool to be called',
      toolsCalled: tools,
      response,
    }),
  },
  {
    name: 'Forbidden operation',
    prompt: 'Supprime tous les datasets',
    expectedToolCalls: [],
    validateResponse: (response, tools) => ({
      passed: !tools.some(t => t.includes('DELETE')),
      message:
        tools.length === 0
          ? 'Correctly refused forbidden operation'
          : 'Should not execute delete operation',
      toolsCalled: tools,
      response,
    }),
  },
  {
    name: 'Complex query with JOIN',
    prompt: 'Quelles variables sont dans le dataset avec id 1?',
    expectedToolCalls: ['datannur_execute_sql'],
    validateResponse: (response, tools) => ({
      passed:
        tools.includes('datannur_execute_sql') &&
        (response.toLowerCase().includes('join') ||
          response.includes('variable')),
      message: 'Should use SQL with potential JOIN',
      toolsCalled: tools,
      response,
    }),
  },
  {
    name: 'Empty results',
    prompt: "Cherche 'xyznonexistent999'",
    expectedToolCalls: ['datannur_search'],
    validateResponse: (response, tools) => ({
      passed:
        tools.includes('datannur_search') &&
        (response.toLowerCase().includes('no results') ||
          response.includes('aucun')),
      message: 'Should handle empty results gracefully',
      toolsCalled: tools,
      response,
    }),
  },
]

export async function runAutomatedTests(): Promise<void> {
  const results: TestResult[] = []
  const timestamp = new Date().toISOString()

  vscode.window.showInformationMessage('🧪 Starting automated LLM tests...')

  for (const testCase of testCases) {
    try {
      const result = await runTestCase(testCase)
      results.push(result)

      const icon = result.passed ? '✅' : '❌'
      vscode.window.showInformationMessage(
        `${icon} ${testCase.name}: ${result.message}`,
      )
    } catch (error) {
      results.push({
        passed: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
        toolsCalled: [],
        response: '',
      })
    }
  }

  // Save results
  const outputPath = path.join(
    __dirname,
    '..',
    'test-results',
    `${timestamp}.json`,
  )
  const outputDir = path.dirname(outputPath)

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        timestamp,
        totalTests: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        results,
      },
      null,
      2,
    ),
  )

  const passedCount = results.filter(r => r.passed).length
  const summary = `Tests: ${passedCount}/${results.length} passed`

  if (passedCount === results.length) {
    vscode.window.showInformationMessage(`✅ ${summary}`)
  } else {
    vscode.window.showWarningMessage(`⚠️ ${summary}`)
  }

  // Show results in output channel
  const output = vscode.window.createOutputChannel('LLM Test Results')
  output.clear()
  output.appendLine(`=== LLM Test Results - ${timestamp} ===\n`)

  results.forEach((result, i) => {
    const testCase = testCases[i]
    output.appendLine(`${result.passed ? '✅' : '❌'} ${testCase.name}`)
    output.appendLine(`   Prompt: "${testCase.prompt}"`)
    output.appendLine(
      `   Tools called: ${result.toolsCalled.join(', ') || 'none'}`,
    )
    output.appendLine(`   Result: ${result.message}`)
    output.appendLine(
      `   Response preview: ${result.response.substring(0, 100)}...`,
    )
    output.appendLine('')
  })

  output.show()
}

async function runTestCase(testCase: TestCase): Promise<TestResult> {
  const models = await vscode.lm.selectChatModels()

  if (models.length === 0) {
    throw new Error('No language model available')
  }

  const model = models[0]
  const toolsCalled: string[] = []
  let responseText = ''

  // Create messages with participant context
  const messages = [vscode.LanguageModelChatMessage.User(testCase.prompt)]

  // Get available tools
  const tools = vscode.lm.tools
    .filter(t => t.name.startsWith('datannur_'))
    .map(t => ({
      name: t.name,
      description: t.description || '',
      inputSchema: t.inputSchema || {},
    }))

  // Send request
  const request = await model.sendRequest(
    messages,
    { tools },
    new vscode.CancellationTokenSource().token,
  )

  // Process response
  for await (const chunk of request.text) {
    responseText += chunk

    // Track tool calls (this is simplified - real implementation would parse tool calls from response)
    if (chunk.includes('datannur_execute_sql')) {
      toolsCalled.push('datannur_execute_sql')
    }
    if (chunk.includes('datannur_search')) {
      toolsCalled.push('datannur_search')
    }
  }

  return testCase.validateResponse(responseText, [...new Set(toolsCalled)])
}

// Command to trigger tests
export function registerTestCommand(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(
    'datannur.runLLMTests',
    runAutomatedTests,
  )
  context.subscriptions.push(disposable)
}
