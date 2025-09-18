import { execSync } from 'child_process'

const current = execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
const defaultBranch = process.env.DEFAULT_BRANCH || 'main'

if (current === defaultBranch) {
  console.log(`Already on ${defaultBranch}`)
  process.exit(0)
}

console.log(`Cleaning up ${current}`)
execSync(`git checkout ${defaultBranch}`)
execSync(`git pull origin ${defaultBranch}`)
execSync(`git branch -d ${current}`)

console.log(`✔ Done: ${current} cleaned up`)
