import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { generateJsonjsdbStaticSite } from 'svelte-fileapp/ssg'

const thisDirname = dirname(fileURLToPath(import.meta.url))
const workingDir = join(thisDirname, '..')
const configPath = './data/static-make.config.json'

await generateJsonjsdbStaticSite(configPath, workingDir)
