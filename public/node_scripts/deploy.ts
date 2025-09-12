import { execSync } from "child_process"
import { readFileSync, existsSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
process.chdir(join(__dirname, ".."))

const configPaths = [
  join(__dirname, "..", "data", "deploy.config.json"),
  join(__dirname, "..", "..", "deploy.config.json"),
]

let configPath: string | null = null
for (const path of configPaths) {
  if (existsSync(path)) {
    configPath = path
    break
  }
}

if (!configPath) {
  console.error("❌ No deploy config found!")
  console.log("📝 Create deploy.config.json from deploy.config.template.json")
  process.exit(1)
}

const config = JSON.parse(readFileSync(configPath, "utf8"))

console.log(`🚀 Deploying to ${config.name}`)

try {
  const deleteFlag = config.syncOption?.delete ? "--delete" : ""
  const excludes = config.ignore
    .map(pattern => `--exclude='${pattern}'`)
    .join(" ")
  const sshCmd = `ssh -i ${config.privateKeyPath} -p ${config.port}`

  execSync(
    `rsync -avz ${deleteFlag} ${excludes} -e "${sshCmd}" ./ ${config.username}@${config.host}:${config.remotePath}/`,
    { stdio: "inherit" }
  )
  console.log("✅ Deploy complete")
} catch (error) {
  console.error("❌ Deploy failed")
  process.exit(1)
}
