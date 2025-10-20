import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
// @ts-expect-error - File copied during build
import { generateJsonjsdbStaticSite } from './spa-core/ssg/index.ts'

const thisDirname = dirname(fileURLToPath(import.meta.url))
const workingDir = join(thisDirname, '..')
const configPath = './data/static-make.config.json'

await (
  generateJsonjsdbStaticSite as (
    configPath: string,
    workingDir?: string,
  ) => Promise<void>
)(configPath, workingDir)
