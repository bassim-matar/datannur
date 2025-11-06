import * as fs from 'fs'
import * as path from 'path'

class PromptLoader {
  private static promptsDir = path.join(__dirname, 'prompts')

  private static loadPrompt(filename: string): string {
    const filePath = path.join(this.promptsDir, filename)
    return fs.readFileSync(filePath, 'utf-8')
  }

  static getSystemPrompt(): string {
    return this.loadPrompt('system.txt')
  }
}

export default PromptLoader
