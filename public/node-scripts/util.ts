import { execSync } from 'child_process'

export function formatWithPrettier(filePath: string): void {
  try {
    execSync(`npx prettier --write "${filePath}"`, { stdio: 'ignore' })
  } catch {
    // Prettier not available, skip formatting
  }
}
