import { readFileSync } from "fs"
import { execSync } from "child_process"

function get_version() {
  const content = readFileSync("package.json", "utf-8")
  return JSON.parse(content).version
}

function run_command(command) {
  execSync(command, { stdio: "inherit" })
}

function get_branch() {
  return execSync("git rev-parse --abbrev-ref HEAD").toString().trim()
}

function tag_exists(version) {
  const tags = execSync("git tag").toString().split("\n")
  return tags.includes(`v${version}`)
}

const version = get_version()

console.log(`📦 Starting release ${version}`)

const branch = get_branch()
if (branch !== "main") {
  console.error(`❌ Not on 'main' branch (current: '${branch}')`)
  process.exit(1)
}

if (tag_exists(version)) {
  console.error(`❌ Tag 'v${version}' already exists`)
  process.exit(1)
}

console.log(`🔖 Creating tag 'v${version}'`)
run_command(`git tag -a v${version} -m "Release v${version}"`)

console.log(`🚀 Pushing tag (GitHub Actions will create the release with changelog notes)`)
run_command(`git push origin v${version}`)

console.log(`\n✅ Tag v${version} created successfully!`)
console.log(`📋 The release will be created automatically with the changelog notes from CHANGELOG.md`)
