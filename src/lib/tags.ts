import db from '@db'

export default class Tags {
  static getFromEntities(entities) {
    const tagsDb = db.getAll('tag')
    const tagsById = {}

    let tags = JSON.parse(JSON.stringify(tagsDb))
    for (const tag of tags) {
      tag.nb_institution = 0
      tag.nb_folder = 0
      tag.nb_dataset = 0
      tagsById[tag.id] = tag
    }

    function incrementTagItemNb(items, entity) {
      if (!items) return
      for (const item of items) {
        for (const tag of item.tags) {
          tagsById[tag.id]['nb_' + entity]++
        }
      }
    }
    incrementTagItemNb(entities.institutions, 'institution')
    incrementTagItemNb(entities.folders, 'folder')
    incrementTagItemNb(entities.datasets, 'dataset')

    for (const tag of tags) {
      tag.nb_institution = tagsById[tag.id].nb_institution
      tag.nb_folder = tagsById[tag.id].nb_folder
      tag.nb_dataset = tagsById[tag.id].nb_dataset
    }
    tags = tags.filter(
      tag => tag.nb_institution > 0 || tag.nb_folder > 0 || tag.nb_dataset > 0,
    )
    return tags
  }
}
