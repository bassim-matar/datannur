import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
// @ts-expect-error - File copied during build to app/node-scripts/spa-core/
import { generateJsonjsdbStaticSite } from './spa-core/ssg-jsonjsdb.ts'

const thisDirname = dirname(fileURLToPath(import.meta.url))
const workingDir = join(thisDirname, '..')
const configPath = './data/static-make.config.json'

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
await generateJsonjsdbStaticSite(configPath, workingDir)
