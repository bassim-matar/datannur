import db from '@db'
import { capitalize } from '@lib/util'

export default class Tags {
  static getFromEntities(entities) {
    const tagsDb = db.getAll('tag')
    const tagsById = {}

    let tags = JSON.parse(JSON.stringify(tagsDb))
    for (const tag of tags) {
      tag.nbInstitution = 0
      tag.nbFolder = 0
      tag.nbDataset = 0
      tagsById[tag.id] = tag
    }

    function incrementTagItemNb(items, entity) {
      if (!items) return
      for (const item of items) {
        for (const tag of item.tags) {
          tagsById[tag.id]['nb' + capitalize(entity)]++
        }
      }
    }
    incrementTagItemNb(entities.institutions, 'institution')
    incrementTagItemNb(entities.folders, 'folder')
    incrementTagItemNb(entities.datasets, 'dataset')

    for (const tag of tags) {
      tag.nbInstitution = tagsById[tag.id].nbInstitution
      tag.nbFolder = tagsById[tag.id].nbFolder
      tag.nbDataset = tagsById[tag.id].nbDataset
    }
    tags = tags.filter(
      tag => tag.nbInstitution > 0 || tag.nbFolder > 0 || tag.nbDataset > 0,
    )
    return tags
  }
}
