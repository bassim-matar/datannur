import {
  isMobile,
  link,
  wrapLongText,
  getPercent,
  pluralize,
  capitalize,
} from '@lib/util'
import { getTimeAgo, getDatetime, dateToTimestamp } from '@lib/time'
import { entityNames, entityToIcon } from '@lib/constant'
import Render from '@lib/render'

export default class Column {
  static id() {
    return {
      data: 'id',
      title: Render.icon('internalId') + 'Identifiant',
      name: 'id',
      tooltip: 'Identifiant unique',
      filterType: 'input',
      hasLongText: true,
      render: Render.copyCell,
    }
  }
  static name(entity = null, name = null, option = null) {
    const icon = entity || 'name'
    const titleName = name || 'Nom'
    if (option === null) option = {}
    if (!('withLink' in option)) option.withLink = true
    return {
      data: 'name',
      title: Render.icon(icon) + titleName,
      name: 'name',
      tooltip: 'Nom',
      filterType: 'input',
      hasLongText: true,
      render: (data, type, row) => {
        let indent = null
        let text
        if (!option.withLink) {
          text = data
        } else if (option.withIndent && !row.noIndent) {
          text = link(row._entity + '/' + row.id, data, row._entity)
          indent = row?.parentsRelative?.length - row?.minimumDeep
        } else {
          text = link(row._entity + '/' + row.id, data, row._entity)
        }
        if (option.linkSameEntityTab && row.nbChild > 0) {
          text = link(
            row._entity + '/' + row.id + '?tab=' + row._entity + 's',
            data,
            row._entity,
          )
        }
        text = `<strong class="var_main_col">${text}</strong>`
        if (row._deleted) {
          text = `<span class="deleted">${data}</span>`
        }
        return wrapLongText(text, indent)
      },
    }
  }
  static originalName() {
    return {
      data: 'original_name',
      title: Render.icon('name') + "Nom d'origine",
      hasLongText: true,
      filterType: 'input',
      tooltip: "Nom d'origine avant renommage",
      render: data => wrapLongText(data),
    }
  }
  static entity() {
    return {
      data: '_entityClean',
      name: 'entity',
      title: Render.icon('entity') + 'Entité',
      defaultContent: '',
      tooltip: 'Entité',
      filterType: 'select',
      render: (data, type, row) => {
        if (!data) return ''
        if (type === 'sort' || type === 'export' || type === 'filter') {
          return data
        }
        return `
          <span class="icon icon_${row._entity}">
            <i class="fas fa-${entityToIcon[row._entity] || row._entity}"></i>
          </span>
          <span>${data}</span>`
      },
    }
  }
  static parentEntity() {
    return {
      data: 'parentName',
      name: 'parentEntity',
      title: Render.icon('entity') + 'Partie de',
      defaultContent: '',
      hasLongText: true,
      tooltip: "Partie de l'entité",
      filterType: 'input',
      render: (data, type, row) => {
        if (!data) return ''
        if (type === 'sort' || type === 'export' || type === 'filter') {
          return `${row.parentEntityClean} | ${row.parentName}`
        }
        return wrapLongText(`
          <span class="icon icon_${row.parentEntity}">
            <i class="fas fa-${
              entityToIcon[row.parentEntity] || row.parentEntity
            }"></i>
          </span>
          <span>${link(
            `${row.parentEntity}/${row.parent_entity_id}`,
            row.parentName,
            row.parentEntity,
          )}</span>`)
      },
    }
  }
  static folder(folderIdVar = 'folder_id', folderNameVar = 'folderName') {
    const render = (data, type, row) => {
      const folderId = row[folderIdVar]
      const folderName = row[folderNameVar]
      return isMobile
        ? wrapLongText(link('folder/' + folderId, folderName))
        : Render.withParentsFromId('folder', folderId, type)
    }
    return {
      data: folderNameVar,
      title: Render.icon('folder') + 'Dossier',
      defaultContent: '',
      hasLongText: true,
      tooltip: 'Dossier',
      render,
    }
  }
  static folderSimple() {
    return {
      data: 'folder_id',
      title: Render.icon('folder') + 'Dossier',
      defaultContent: '',
      hasLongText: true,
      tooltip: 'Dossier',
      render: (data, type, row) => {
        if (!data) return ''
        return wrapLongText(link('folder/' + data, row.folderName))
      },
    }
  }
  static parents(entity) {
    const render = isMobile ? Render.firstParent : Render.parentsIndent
    return {
      data: 'parents',
      title: Render.icon(`folderTree${capitalize(entity)}`) + 'Partie de',
      hasLongText: true,
      tooltip: 'Eléments parents',
      render,
    }
  }
  static datasetType() {
    return {
      data: 'typeClean',
      title: Render.icon('type') + 'Type',
      defaultContent: '',
      name: 'type',
      filterType: 'select',
      tooltip: 'Type de dataset',
    }
  }
  static datatype() {
    return {
      data: 'typeClean',
      title: Render.icon('type') + 'Type',
      defaultContent: '',
      name: 'type',
      filterType: 'select',
      tooltip: 'Type de données',
    }
  }
  static description() {
    return {
      data: 'description',
      defaultContent: '',
      title: Render.icon('description') + 'Description',
      hasLongText: true,
      filterType: 'input',
      tooltip: 'Description',
      render: data => wrapLongText(data),
    }
  }
  static tag() {
    return {
      data: 'tags',
      title: Render.icon('tag') + 'Mots clés',
      defaultContent: '',
      hasLongText: true,
      tooltip: 'Mots clés directement associés',
      name: 'tag',
      render: Render.tags,
    }
  }
  static owner() {
    const render = (data, type, row) =>
      isMobile
        ? wrapLongText(link(`institution/${row.owner_id}`, row.ownerName))
        : Render.withParentsFromId('institution', row.owner_id, type)
    return {
      data: 'ownerName',
      title: Render.icon('institution') + entityNames.owner,
      defaultContent: '',
      hasLongText: true,
      tooltip: 'Institution propriétaire',
      render,
    }
  }
  static manager() {
    const render = (data, type, row) =>
      isMobile
        ? wrapLongText(link(`institution/${row.manager_id}`, row.managerName))
        : Render.withParentsFromId('institution', row.manager_id, type)
    return {
      data: 'managerName',
      title: Render.icon('institution') + entityNames.manager,
      defaultContent: '',
      hasLongText: true,
      tooltip: 'Institution gestionnaire',
      render,
    }
  }
  static modality() {
    return {
      data: 'modalities',
      title: Render.icon('modality') + 'Modalité',
      defaultContent: '',
      tooltip: 'Modalités',
      render: Render.modalitiesName,
    }
  }
  static value() {
    return {
      data: 'value',
      defaultContent: '',
      title: Render.icon('value') + 'Valeur',
      hasLongText: true,
      tooltip: 'Valeur',
      render: data => wrapLongText(data),
    }
  }
  static nbValues(nbValueMax) {
    return {
      data: 'nbValue',
      name: 'value',
      title: Render.icon('value') + 'Nb',
      defaultContent: '',
      filterType: 'input',
      tooltip: 'Nombre de valeurs',
      render: (data, type, row) => Render.nbValues(data, type, row, nbValueMax),
    }
  }
  static valuesPreview() {
    return {
      data: 'valuesPreview',
      title: Render.icon('value') + 'Valeurs',
      hasLongText: true,
      defaultContent: '',
      tooltip: 'Valeurs',
      render: Render.value,
    }
  }
  static nbDuplicates() {
    return {
      data: 'nb_duplicate',
      defaultContent: '',
      filterType: 'input',
      title: Render.icon('duplicate') + 'Doublons',
      tooltip: 'Nombre de valeurs dupliquées',
      render: Render.nbDuplicate,
    }
  }
  static nbMissing() {
    return {
      data: 'nb_missing',
      defaultContent: '',
      filterType: 'input',
      title: Render.icon('missing') + 'Manquant',
      tooltip: 'Nombre de valeurs manquantes',
      render: Render.nbMissing,
    }
  }
  static freq() {
    return {
      data: 'freqPreview',
      title: Render.icon('freq') + 'Fréquence',
      defaultContent: '',
      hasLongText: true,
      tooltip: 'Aperçu des données de fréquence',
      render: Render.freqPreview,
    }
  }
  static nbRow(nbRowMax) {
    return {
      data: 'nb_row',
      title: Render.icon('nb_row') + 'Lignes',
      filterType: 'input',
      defaultContent: '',
      tooltip: 'Nombre de lignes',
      render: (data, type) => {
        if (type !== 'display') {
          return data === '' || data === null ? 0 : parseInt(data)
        }
        if (!data) return ''
        const percent = getPercent(data / nbRowMax)
        return `${Render.numPercent(data, percent, 'nb_row', type)}`
      },
    }
  }
  static nbSources(nbSourcesMax, entity) {
    return {
      data: 'sourceIds',
      title: Render.icon('nbSource') + 'In',
      filterType: 'input',
      defaultContent: '',
      tooltip: `Nombre de ${entity}s sources (en amont)`,
      render: (data, type, row) => {
        if (!data || (!data.length && !data.size)) return ''
        const nb = data.length || data.size
        if (type !== 'display') return nb
        const percent = getPercent(nb / nbSourcesMax)
        const content = link(`${entity}/${row.id}?tab=${entity}s`, nb)
        return `${Render.numPercent(content, percent, 'nbSource', type)}`
      },
    }
  }
  static nbDerived(nbDerivedMax, entity) {
    return {
      data: 'derivedIds',
      title: Render.icon('nbDerived') + 'Out',
      filterType: 'input',
      defaultContent: '',
      tooltip: `Nombre de ${entity}s dérivées (en aval)`,
      render: (data, type, row) => {
        if (!data || (!data.length && !data.size)) return ''
        const nb = data.length || data.size
        if (type !== 'display') return nb
        const percent = getPercent(nb / nbDerivedMax)
        const content = link(`${entity}/${row.id}?tab=${entity}s`, nb)
        return `${Render.numPercent(content, percent, 'nbDerived', type)}`
      },
    }
  }
  static frequency() {
    return {
      data: 'updating_each',
      name: 'frequency',
      defaultContent: '',
      filterType: 'select',
      title: Render.icon('frequency') + 'Fréquence',
      tooltip: 'Fréquence de mise à jour',
    }
  }
  static lastUpdate() {
    return {
      data: 'last_update_date',
      name: 'last_update',
      defaultContent: '',
      title: Render.icon('date') + 'Mise à jour',
      filterType: 'input',
      tooltip: 'Date de dernière mise à jour',
      render: (data, type, row) => Render.datetime(data, type, row),
    }
  }
  static nextUpdate() {
    return {
      data: 'nextUpdateDate',
      name: 'next_update',
      defaultContent: '',
      title: Render.icon('date') + 'Prochaine',
      filterType: 'input',
      tooltip: 'Date de prochaine mise à jour estimée',
      render: (data, type, row) =>
        Render.datetime(data, type, row, { estimation: true }),
    }
  }
  static favorite() {
    return {
      data: 'isFavorite',
      title: Render.icon('favorite') + "<span class='hidden'>favorite</span>",
      name: 'isFavorite',
      width: '20px',
      tooltip: 'Favoris',
      filterType: 'select',
      render: Render.favorite,
    }
  }
  static level(levelMax = null) {
    let render = (data, type, row) => row.parents?.length + 1
    if (levelMax) {
      render = (data, type, row) => {
        const value = row.parents?.length + 1
        if (!value) return ''
        const percent = getPercent(value / levelMax)
        return `${Render.numPercent(value, percent, 'key', type)}`
      }
    }
    return {
      data: 'id',
      title: Render.icon('level') + "<span class='hidden'>level</span>",
      defaultContent: '',
      name: 'level',
      filterType: 'input',
      width: '20px',
      tooltip: "Niveau de profondeur de l'arborecence",
      render,
    }
  }
  static localisation() {
    return {
      data: 'localisation',
      title: Render.icon('localisation') + 'Localisation',
      defaultContent: '',
      tooltip: 'Localisation géographique des données',
      render: data => {
        if (!data) return ''
        return data
      },
    }
  }
  static deliveryFormat() {
    return {
      data: 'delivery_format',
      title: Render.icon('delivery_format') + 'Format livraison',
      defaultContent: '',
      filterType: 'select',
      tooltip: 'Format de livraison des données',
    }
  }
  static period() {
    return {
      data: 'period',
      title: Render.icon('dateRange') + 'Période',
      defaultContent: '',
      tooltip: 'Période couverte par les données',
      render: (data, type, row) => {
        if (!data) return ''
        if (type !== 'display') return data
        let text = data
        if (row.periodDuration) text += '<br>' + row.periodDuration
        return text
      },
    }
  }
  static startDate() {
    return {
      data: 'start_date',
      title: Render.icon('dateRange') + 'Début',
      defaultContent: '',
      dateType: 'start',
      filterType: 'input',
      tooltip: 'Date de début de validité',
      render: (data, type) => {
        if (!['sort', 'filter'].includes(type)) return data
        if (!data) data = 1000
        return dateToTimestamp(data, 'start')
      },
    }
  }
  static endDate() {
    return {
      data: 'end_date',
      title: Render.icon('dateRange') + 'Fin',
      defaultContent: '',
      dateType: 'end',
      filterType: 'input',
      tooltip: 'Date de fin de validité',
      render: (data, type) => {
        if (!['sort', 'filter'].includes(type)) return data
        if (!data) data = 9999
        return dateToTimestamp(data, 'end')
      },
    }
  }
  static dataset(parentName) {
    return {
      data: 'datasetName',
      title: Render.icon('dataset') + 'Dataset',
      hasLongText: true,
      tooltip: 'Dataset',
      render: (data, type, row) =>
        wrapLongText(
          link(parentName + '/' + row[parentName + '_id'], data, 'dataset'),
        ),
    }
  }
  static dataPath() {
    return {
      data: 'data_path',
      title: Render.icon('data_path') + 'Emplacement',
      defaultContent: '',
      tooltip: 'Emplacement des données',
      render: Render.copyCell,
    }
  }
  static docPath() {
    return {
      data: 'path',
      name: 'docPath',
      title: Render.icon('link') + 'Lien',
      defaultContent: '',
      hasLongText: true,
      tooltip: 'Emplacement du doc',
      render: data => {
        return wrapLongText(`<a href="${data}" target="_blanck">${data}</a>`)
      },
    }
  }
  static nbDoc(entity, total, withName = false) {
    return {
      data: 'docsRecursive',
      title:
        Render.icon('doc') +
        (withName ? 'Docs' : "<span class='hidden'>nbDocs</span>"),
      filterType: 'input',
      defaultContent: '',
      fromLength: true,
      tooltip: 'Nombre de docs',
      render: (data, type, row) => {
        if (!data.length) return ''
        const content = link(entity + '/' + row.id + '?tab=docs', data.length)
        const percent = getPercent(data.length / total)
        return `${Render.numPercent(content, percent, 'doc', type)}`
      },
    }
  }
  static nbDocRecursive(entity, total) {
    return {
      data: 'nbDocRecursive',
      title: Render.icon('doc') + "<span class='hidden'>nbDocs</span>",
      filterType: 'input',
      tooltip: 'Nombre de docs',
      render: (data, type, row) => {
        if (!data) return ''
        const content = link(entity + '/' + row.id + '?tab=docs', data)
        const percent = getPercent(data / total)
        return `${Render.numPercent(content, percent, 'doc', type)}`
      },
    }
  }
  static nbChildRecursive(entity, total, linkPath = null) {
    if (!linkPath) linkPath = entity + '/'
    const entityPlural = pluralize(entity)
    return {
      data: 'nbChildRecursive',
      title:
        Render.icon(entity) +
        `<span class='hidden'>nb${capitalize(entityPlural)}</span>`,
      filterType: 'input',
      tooltip: "Nombre d'éléments de type " + entity,
      render: (data, type, row) => {
        if (!data) return ''
        const content = link(linkPath + row.id + `?tab=${entityPlural}`, data)
        const percent = getPercent(data / total)
        return `${Render.numPercent(content, percent, entity, type)}`
      },
    }
  }
  static nbFolderRecursive(entity, total) {
    return {
      data: 'nbFolderRecursive',
      title: Render.icon('folder') + "<span class='hidden'>nbFolders</span>",
      filterType: 'input',
      tooltip: 'Nombre de dossiers',
      render: (data, type, row) => {
        if (!data) return ''
        const content = link(`${entity}/${row.id}?tab=folders`, data)
        const percent = getPercent(data / total)
        return `${Render.numPercent(content, percent, 'folder', type)}`
      },
    }
  }
  static nbDatasetRecursive(entity, total) {
    return {
      data: 'nbDatasetRecursive',
      title: Render.icon('dataset') + "<span class='hidden'>nbDatasets</span>",
      filterType: 'input',
      tooltip: 'Nombre de datasets',
      render: (data, type, row) => {
        if (!data) return ''
        const content = link(entity + '/' + row.id + '?tab=datasets', data)
        const percent = getPercent(data / total)
        return `${Render.numPercent(content, percent, 'dataset', type)}`
      },
    }
  }
  static nbVariable(entity, total, option) {
    if (!option) option = {}
    if (!('linkPath' in option)) option.linkPath = entity + '/'
    if (!('tab' in option)) option.tab = 'variables'
    if (!('showTitle' in option)) option.showTitle = false
    const title = option.showTitle
      ? 'Variables'
      : `<span class='hidden'>nbVariables</span>`
    return {
      data: 'nbVariable' + (option.recursive ? 'Recursive' : ''),
      title: Render.icon('variable') + title,
      name: 'variable',
      filterType: 'input',
      tooltip: 'Nombre de variables',
      render: (data, type, row) => {
        if (!data) return ''
        const content = link(
          option.linkPath + row.id + `?tab=${option.tab}`,
          data,
        )
        const percent = getPercent(data / total)
        return `${Render.numPercent(content, percent, 'variable', type)}`
      },
    }
  }
  static metaFolder() {
    return {
      data: 'metaFolder_id',
      title: Render.icon('folder') + 'Dossier',
      tooltip: 'Dossier',
      render: data => link('metaFolder/' + data, data),
    }
  }
  static timestamp(options = null) {
    if (!options) options = {}
    if (!('varName' in options)) options.varName = 'timestamp'
    if (!('title' in options)) options.title = 'Moment'
    if (!('tooltip' in options)) options.tooltip = "moment de l'ajout"
    return {
      data: options.varName,
      title: Render.icon('date') + options.title,
      defaultContent: '',
      type: 'num',
      filterType: 'input',
      tooltip: options.tooltip,
      render: (data, type) => {
        if (!data) return ''
        if (type === 'sort') return data
        if (type !== 'display') return getDatetime(data)
        let datetime = getDatetime(data)
        if (datetime.includes(' 00:00:00') || datetime.includes(' 01:00:00'))
          datetime = datetime.split(' ')[0]

        if (datetime.length > 12) {
          datetime = `<span style="font-size: 12px";>${datetime}</span>`
        }

        let timeAgo = getTimeAgo(data)

        if (timeAgo.length > 18) {
          timeAgo = `<span style="font-size: 12px";>${timeAgo}</span>`
        }

        const percent = getPercent((new Date().getTime() - data) / 31536000000)
        const entity = percent < 0 ? 'value' : 'doc'
        const percentAbsInversed = 100 - Math.abs(percent)
        const content = `${timeAgo}<br>${datetime}`
        return `${Render.numPercent(content, percentAbsInversed, entity, type)}`
      },
    }
  }
  static isKey() {
    return {
      data: 'key',
      title: Render.icon('key') + 'Clé',
      defaultContent: '',
      filterType: 'select',
      tooltip: 'Clé primaire ou partie de clé primaire',
      render: (data, type) => {
        if (!data) return ''
        if (type === 'filter' || type === 'sort') return data
        return `<i class="fas fa-key"></i>`
      },
    }
  }
  static metaLocalisation() {
    return {
      data: 'metaLocalisation',
      title: Render.icon('localisation') + 'Localisation',
      filterType: 'select',
      defaultContent: '',
      tooltip: 'Localisation (dans les données ou dans le schéma',
      render: data => {
        if (!data) return ''
        return data
      },
    }
  }
  static inherited() {
    return {
      data: 'inherited',
      title: Render.icon('diagram') + 'Hérité',
      defaultContent: '',
      tooltip: "Element direct (vide) ou hérité d'un sous-élément (hérité)",
    }
  }
  static lineageType() {
    return {
      data: 'lineageType',
      title: Render.icon('diagram') + 'Relation',
      defaultContent: '',
      filterType: 'select',
      tooltip: 'Source (parent) ou dérivé (enfant)',
      render: data => {
        if (!data) return ''
        if (data === 'derived') return 'Dérivé'
        if (data === 'source') return 'Source'
      },
    }
  }
}
