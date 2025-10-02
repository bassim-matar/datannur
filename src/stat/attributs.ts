import definition from './attributs-def'

export const attributs = {
  institution: ['tag', 'email', 'phone', 'level', 'name', 'description'],
  folder: [
    'frequency',
    'lastUpdate',
    'tag',
    'localisation',
    'surveyType',
    'deliveryFormat',
    'metadataPath',
    'gitCode',
    'level',
    'name',
    'description',
  ],
  tag: ['entity', 'level', 'name', 'description'],
  doc: ['docType', 'entity', 'docPath', 'lastUpdateDoc', 'name', 'description'],
  dataset: [
    'frequency',
    'lastUpdate',
    'tag',
    'localisation',
    'deliveryFormat',
    'variable',
    'nbRow',
    'name',
    'description',
  ],
  variable: ['type', 'modality', 'value', 'name', 'description'],
  modality: ['type', 'variable', 'value', 'name', 'description'],
  log: ['actionReadable', 'page', 'tab', 'search', 'timeAgo'],
}

const attributsFilled = {}
for (const [entity, value] of Object.entries(attributs)) {
  attributsFilled[entity] = value.map(key => {
    if (!(key in definition)) console.error(`key ${key} not found`)
    return { ...definition[key], key }
  })
}

export default attributsFilled
