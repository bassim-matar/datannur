import { readFileSync } from 'fs'
import { execSync } from 'child_process'

function getVersion() {
  const content = readFileSync('../package.json', 'utf-8')
  return JSON.parse(content).version
}

function runCommand(command: string) {
  execSync(command, { stdio: 'inherit' })
}

function getBranch() {
  return execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
}

function tagExists(version: string) {
  try {
    execSync(`git rev-parse v${version}`, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function hasUncommittedChanges() {
  try {
    const status = execSync('git status --porcelain').toString().trim()
    return status.length > 0
  } catch {
    return false
  }
}

const version = getVersion()

console.log(`📦 Starting release ${version}`)

const branch = getBranch()
if (branch !== 'main') {
  console.error(`❌ Not on 'main' branch (current: '${branch}')`)
  process.exit(1)
}

if (hasUncommittedChanges()) {
  console.error(
    `❌ You have uncommitted changes. Please commit or stash them first.`
  )
  process.exit(1)
}

if (tagExists(version)) {
  console.error(`❌ Tag 'v${version}' already exists`)
  process.exit(1)
}

console.log(`🔖 Creating tag 'v${version}'`)
runCommand(`git tag -a v${version} -m "Release v${version}"`)

console.log(
  `🚀 Pushing tag (GitHub Actions will create the release with changelog notes)`
)
runCommand(`git push origin v${version}`)

console.log(`\n✅ Tag v${version} created successfully!`)
console.log(
  `📋 The release will be created automatically with the changelog notes from CHANGELOG.md`
)
