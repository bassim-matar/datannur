import { execSync } from 'child_process'

const dry = process.env.DRY === '1'
const defaultBranch = process.env.DEFAULT_BRANCH || 'main'

function sh(cmd: string, capture = false): string {
  if (dry && !capture) {
    console.log('+ ' + cmd)
    return ''
  }
  return execSync(cmd, { stdio: capture ? 'pipe' : 'inherit' })
    .toString()
    .trim()
}

const current = sh('git rev-parse --abbrev-ref HEAD', true)
const target = process.env.BRANCH || current

if (target === defaultBranch) {
  console.log(`Already on ${defaultBranch}, nothing to do.`)
  process.exit(0)
}

console.log('\n› Fetch')
sh('git fetch origin --prune')

console.log(`\n› Checkout ${defaultBranch}`)
sh(`git checkout ${defaultBranch}`)
sh(`git pull origin ${defaultBranch} --ff-only`)

function existsLocal(name: string) {
  try {
    execSync(`git show-ref --verify --quiet refs/heads/${name}`)
    return true
  } catch {
    return false
  }
}
function existsRemote(name: string) {
  try {
    execSync(`git ls-remote --exit-code --heads origin ${name}`, {
      stdio: 'ignore',
    })
    return true
  } catch {
    return false
  }
}

if (existsLocal(target)) {
  console.log(`\n› Delete local ${target}`)
  try {
    sh(`git branch -d ${target}`)
  } catch {
    console.log('Local branch not merged. Use -D manually if intentional.')
  }
}

if (existsRemote(target)) {
  console.log(`\n› Delete remote ${target}`)
  try {
    sh(`git push origin --delete ${target}`)
  } catch {
    console.log('Remote delete skipped (permission or already gone).')
  }
}

console.log(`\n✔ Done: ${target}`)
if (dry) console.log('DRY MODE: nothing executed')
