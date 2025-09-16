import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { JsonjsdbBuilder } from 'jsonjsdb-builder'

const thisDirname = dirname(fileURLToPath(import.meta.url))
process.chdir(join(thisDirname, '..'))

const root = './data/'

const builder = new JsonjsdbBuilder()
await builder.setOutputDb(root + 'db')
await Promise.all([
  builder.updateDb(root + '/db_source'),
  builder.updatePreview('preview', root + 'dataset'),
  builder.updateMdDir('md_doc', root + 'md'),
])
builder.watchDb(root + '/db_source')
