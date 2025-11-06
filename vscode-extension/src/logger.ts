import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'

class Logger {
  private static logFilePath: string | null = null
  private static outputChannel: vscode.LogOutputChannel | null = null

  static initialize(workspaceRoot: string): void {
    // Create VS Code output channel (always enabled)
    this.outputChannel = vscode.window.createOutputChannel('Datannur', {
      log: true,
    })

    // File logging is opt-in via environment variable
    const enableFileLogging = process.env.DATANNUR_LOG_FILE === 'true'

    if (enableFileLogging) {
      try {
        const logDir = path.join(workspaceRoot, '.vscode')
        if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir, { recursive: true })
        }
        this.logFilePath = path.join(logDir, 'datannur-debug.log')

        const separator = `\n${'='.repeat(80)}\n=== New Session - ${new Date().toISOString()} ===\n${'='.repeat(80)}\n\n`

        if (fs.existsSync(this.logFilePath)) {
          fs.appendFileSync(this.logFilePath, separator)
        } else {
          fs.writeFileSync(this.logFilePath, separator)
        }

        console.log('📋 Logger: file logging enabled')
        this.outputChannel.info('File logging enabled')
      } catch (error) {
        console.warn(
          '[Logger] Cannot write to log file (no write permissions?):',
          error,
        )
        this.logFilePath = null
      }
    } else {
      console.log(
        '📋 Logger: output channel only (set DATANNUR_LOG_FILE=true for file logging)',
      )
      this.outputChannel.info(
        'Output channel logging enabled (set DATANNUR_LOG_FILE=true for file logging)',
      )
    }
  }

  static log(category: string, message: string, data?: unknown): void {
    const timestamp = new Date().toISOString()
    const header = `[${category}] ${message}`

    // Always log to output channel
    if (this.outputChannel) {
      if (data !== undefined) {
        const dataStr =
          typeof data === 'string' ? data : JSON.stringify(data, null, 2)
        this.outputChannel.info(`${header}\n${dataStr}`)
      } else {
        this.outputChannel.info(header)
      }
    }

    // Also log to console for developer tools
    console.log(`[${timestamp}] ${header}`)
    if (data !== undefined) {
      console.log(data)
    }

    // File logging (opt-in only)
    if (this.logFilePath) {
      try {
        let logEntry = `[${timestamp}] ${header}\n`
        if (data !== undefined) {
          logEntry += `Data: ${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}\n`
        }
        logEntry += '\n'

        fs.appendFileSync(this.logFilePath, logEntry)
      } catch (error) {
        console.warn('[Logger] Cannot append to log file:', error)
      }
    }
  }

  static logUserQuestion(question: string): void {
    this.log('USER_QUESTION', question)
  }

  static logPlan(plan: string): void {
    this.log('LLM_PLAN', 'Generated plan', plan)
  }

  static logPrompt(prompt: string): void {
    // Only write prompt file if file logging is enabled
    if (!this.logFilePath) return

    try {
      const promptFilePath = this.logFilePath.replace(
        'datannur-debug.log',
        'datannur-llm-prompt.txt',
      )
      fs.writeFileSync(promptFilePath, prompt, 'utf-8')
    } catch (error) {
      console.warn('[Logger] Cannot write prompt file:', error)
    }
  }

  static logSqlQuery(sql: string): void {
    this.log('SQL_QUERY', 'Executing SQL', sql)
  }

  static logSearch(searchTerm: string): void {
    this.log('SEARCH', 'Executing search', searchTerm)
  }

  static logStats(): void {
    this.log('STATS', 'Getting statistics')
  }

  static logResult(result: string): void {
    const preview =
      result.length > 500 ? result.substring(0, 500) + '...[TRUNCATED]' : result
    this.log('QUERY_RESULT', `Result (${result.length} chars)`, preview)
  }

  static logError(error: string | Error): void {
    this.log(
      'ERROR',
      error instanceof Error ? error.message : error,
      error instanceof Error ? error.stack : undefined,
    )
  }

  static logAnswer(answer: string): void {
    this.log('LLM_ANSWER', 'Final answer generated', answer.substring(0, 300))
  }
}

export default Logger
