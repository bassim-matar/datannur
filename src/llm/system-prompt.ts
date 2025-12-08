import promptTemplate from '@llm-prompt/_system-prompt.md?raw'
import systemInstructions from '@llm-prompt/system-instructions.md?raw'
import toolsGuidelines from '@llm-prompt/tools-guidelines.md?raw'
import schemaDoc from '@llm-prompt/schema.md?raw'

let cachedPrompt: string | null = null
let cachedDate: string | null = null

export function buildSystemPrompt(): string {
  const dateOnly = new Date().toISOString().split('T')[0]
  if (cachedPrompt && cachedDate === dateOnly) return cachedPrompt

  const placeholders = new Map([
    ['date', dateOnly],
    ['system-instructions', systemInstructions],
    ['schema', schemaDoc],
    ['tools-guidelines', toolsGuidelines],
  ])

  cachedDate = dateOnly
  cachedPrompt = promptTemplate.replace(
    /\{\{(\w[\w-]*)\}\}/g,
    (match, key) => placeholders.get(key) ?? match,
  )

  return cachedPrompt
}
