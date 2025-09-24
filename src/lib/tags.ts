import db from '@db'

export default class Tags {
  static getFromEntities(entities) {
    const tags_db = db.getAll('tag')
    let tags_by_id = {}

    let tags = JSON.parse(JSON.stringify(tags_db))
    for (const tag of tags) {
      tag.nb_institution = 0
      tag.nb_folder = 0
      tag.nb_dataset = 0
      tags_by_id[tag.id] = tag
    }

    function increment_tag_item_nb(items, entity) {
      if (!items) return
      for (const item of items) {
        for (const tag of item.tags) {
          tags_by_id[tag.id]['nb_' + entity]++
        }
      }
    }
    increment_tag_item_nb(entities.institutions, 'institution')
    increment_tag_item_nb(entities.folders, 'folder')
    increment_tag_item_nb(entities.datasets, 'dataset')

    for (const tag of tags) {
      tag.nb_institution = tags_by_id[tag.id].nb_institution
      tag.nb_folder = tags_by_id[tag.id].nb_folder
      tag.nb_dataset = tags_by_id[tag.id].nb_dataset
    }
    tags = tags.filter(
      tag => tag.nb_institution > 0 || tag.nb_folder > 0 || tag.nb_dataset > 0,
    )
    return tags
  }
}
