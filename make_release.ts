import { readFileSync } from "fs"
import { execSync } from "child_process"

function get_version() {
  const content = readFileSync("package.json", "utf-8")
  return JSON.parse(content).version
}

function extract_changelog(version) {
  const lines = readFileSync("CHANGELOG.md", "utf-8").split("\n")
  const header = `## ${version}`
  let inside = false
  const section = []

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (inside) break
      if (line.startsWith(header)) {
        inside = true
        continue
      }
    }
    if (inside) section.push(line)
  }

  if (!section.length) {
    console.error(`❌ Aucun changelog trouvé pour la version ${version}`)
    process.exit(1)
  }

  return section.join("\n").trim()
}

function run_command(command) {
  execSync(command, { stdio: "inherit" })
}

function get_branch() {
  return execSync("git rev-parse --abbrev-ref HEAD").toString().trim()
}

function tag_exists(version) {
  const tags = execSync("git tag").toString().split("\n")
  return tags.includes(version)
}

const version = get_version()
const changelog = extract_changelog(version)

console.log(`📦 Lancement de la release ${version}`)

// Vérifications préalables
const branch = get_branch()
if (branch !== "main") {
  console.error(`❌ Pas sur la branche 'main' (actuel : '${branch}')`)
  process.exit(1)
}

if (tag_exists(version)) {
  console.error(`❌ Le tag '${version}' existe déjà`)
  process.exit(1)
}

console.log(`📝 Changelog pour ${version}:`)
console.log(changelog)
console.log()

console.log(`🔖 Création du tag '${version}'`)
run_command(`git tag -a ${version} -m "Release ${version}"`)

console.log(`🚀 Push du tag (GitHub Actions créera automatiquement la release)`)
run_command(`git push origin ${version}`)

console.log(`\n✅ Tag ${version} créé avec succès !`)
