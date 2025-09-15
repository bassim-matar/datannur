import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { jsonjsdbWatcher } from 'jsonjsdb-builder'

const thisDirname = dirname(fileURLToPath(import.meta.url))
process.chdir(join(thisDirname, '..'))

const root = './data/'

await jsonjsdbWatcher.setDb(root + 'db')
await jsonjsdbWatcher.watch(root + '/db_source', true)
await jsonjsdbWatcher.updatePreview('preview', root + 'dataset')
