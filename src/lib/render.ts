import db from '@db'
import { locale } from '@lib/constant'
import { copy_text_classes, copy_text_msg } from '@lib/copy-text'
import { getTimeAgo, dateToTimestamp } from '@lib/time'
import {
  link,
  wrapLongText,
  addIndend,
  entityToIconName,
  getPercent,
} from '@lib/util'

export function getNbValues(values, row) {
  if (values && values.length) return values.length
  if (row.nb_distinct) return row.nb_distinct
  return ''
}

const separator = ' | '

export default class Render {
  static parentsIndent(data, type, row) {
    return Render.tree(row._entity, [...data].reverse(), type)
  }
  static tree(entity, elements, type = 'normal') {
    let content = ''
    let level = 0
    for (const element of elements) {
      if (!element) continue
      let name = element.name
      if (level > 0 && type === 'export') name = separator + name
      content += link(entity + '/' + element.id, addIndend(name, level), entity)
      level += 1
    }
    return wrapLongText(`<div class="tree">${content}</div>`)
  }
  static withParentsFromId(entity, id, type) {
    if (id === null) return ''
    const element = db.get(entity, id)
    const parents = db.getParents(entity, id)
    const elements = [...parents, element].reverse()
    return Render.tree(entity, elements, type)
  }
  static firstParent(data, type, row) {
    if (data.length === 0) return wrapLongText()
    const parent = data.slice(-1)[0]
    return wrapLongText(link(row._entity + '/' + parent.id, parent.name))
  }
  static value(values, type, row) {
    if (!values || values === '' || values.length === 0) return wrapLongText()
    const nb_values = row.values.length
    let entity = 'dataset_id' in row ? 'variable' : 'modality'
    let tab = entity === 'variable' ? 'variable_values' : 'values'
    if (row._entity === 'metaVariable') {
      entity = 'metaVariable'
      tab = 'variable_metaValues'
    }
    let content = '<ul class="ul_value">'
    let i = 0
    for (const value of values) {
      let value_content = value.value
      if (value.description && value.description !== '') {
        value_content += ' : ' + value.description
      }
      if (i > 0 && type === 'export') value_content = separator + value_content
      content += '<li>' + value_content + '</li>'
      i += 1
    }
    if (nb_values > values.length) {
      const nb_other_values = nb_values - values.length
      const s = nb_other_values > 1 ? 's' : ''
      const text = link(
        `${entity}/${row.id}?tab=${tab}`,
        `... ${nb_other_values} autre${s} valeur${s}`,
        'value',
      )
      if (type === 'export') content += separator
      content += `<li><i>${text}</i></li>`
    }
    content += '</ul>'
    return wrapLongText(content)
  }
  static freqPreview(freq_data, type, row) {
    if (!freq_data || freq_data.length === 0) return ''

    let content = '<ul class="ul_value">'
    let i = 0

    for (const freq_item of freq_data) {
      const percent_display = getPercent(freq_item.freq / freq_item.total) // Pour l'affichage du texte
      const percent_background = getPercent(freq_item.freq / freq_item.max) // Pour la largeur du background
      const freq_num = Render.num(freq_item.freq, type)
      const percent_text = type === 'display' ? ` (${percent_display}%)` : ''

      let freq_content
      if (type === 'display') {
        // Nouveau layout : valeur à gauche, nombre à droite, background sur toute la largeur
        const freq_display = `
        <div class="freq_item_container">
          <div class="freq_background color_freq" style="width: ${percent_background}%"></div>
          <span class="freq_value">${freq_item.value}</span>
          <span class="freq_number">${freq_num}</span>
        </div>`
        freq_content = freq_display
      } else {
        freq_content = `${freq_item.value}: ${freq_num}${percent_text}`
      }

      if (i > 0 && type === 'export') freq_content = separator + freq_content
      content += '<li>' + freq_content + '</li>'
      i += 1
    }

    // Si il y a plus de fréquences que celles affichées
    const total_freq_count = db.getAll('freq', { variable: row }).length
    if (total_freq_count > freq_data.length) {
      const nb_other_freq = total_freq_count - freq_data.length
      const s = nb_other_freq > 1 ? 's' : ''
      const text = link(
        `variable/${row.id}?tab=freq`,
        `... ${nb_other_freq} autre${s} fréquence${s}`,
        'freq',
      )
      if (type === 'export') content += separator
      content += `<li><i>${text}</i></li>`
    }
    content += '</ul>'
    return wrapLongText(content)
  }
  static num(data, type = 'normal') {
    if (data === false || data === undefined || data === null) return ''
    if (['filter', 'sort', 'export'].includes(type)) return data
    return data.toLocaleString(locale)
  }
  static numNoEmpty(data, type = 'normal') {
    if (!data) return ''
    return Render.num(data, type)
  }
  static favorite(data, type, row, meta) {
    if (type === 'sort' || type === 'filter' || type === 'export') {
      return row.is_favorite ? 'favoris' : 'non favoris'
    }
    return `
      <span class="icon favorite ${data ? ' is-active' : ''}"
        data-id="${row.id}"
        data-entity="${row._entity}"
        data-is_favorite="${row.is_favorite}"
        data-col="${meta.col}"
        data-row="${meta.row}">
        <i class="fas fa-star"></i>
      </span>`
  }
  static icon(entity) {
    let class_names
    const icon = entityToIconName(entity)
    if (icon.startsWith('fa-brands')) {
      class_names = icon
    } else {
      class_names = `fas fa-${icon}`
    }
    return `<span class='icon icon_${entity}'><i class='${class_names}'></i></span>`
  }
  static modalitiesName(modalities) {
    if (!modalities || modalities.length === 0) return wrapLongText()
    const modalities_name = []
    for (const modality of modalities) {
      modalities_name.push(
        link('modality/' + modality.id, modality.name, 'modality'),
      )
    }
    return wrapLongText(modalities_name.join(' | '))
  }
  static nbValues(data, type, row, nb_value_max) {
    const nb_values = data
    let entity = 'dataset_id' in row ? 'variable' : 'modality'
    let tab = entity === 'variable' ? 'variable_values' : 'values'
    if (row._entity === 'metaVariable') {
      entity = 'metaVariable'
      tab = 'variable_metaValues'
    }
    if (type !== 'display') return nb_values
    const percent = getPercent(nb_values / nb_value_max)
    let content = Render.num(nb_values)
    if (nb_values) {
      content = link(`${entity}/${row.id}?tab=${tab}`, content)
    }
    return `${Render.numPercent(content, percent, 'value', type)}`
  }
  static nbDuplicate(nb_duplicate, type, row) {
    if (!nb_duplicate) return ''
    const percent = getPercent(nb_duplicate / row.nb_row)
    return `${Render.numPercent(nb_duplicate, percent, 'duplicate', type)}`
  }
  static nbMissing(nb_missing, type, row, stringify = true) {
    if (!row.nb_row) return ''
    if (!nb_missing) return ''
    const percent = getPercent(nb_missing / row.nb_row)
    const content = Render.numPercent(
      nb_missing,
      percent,
      'missing',
      type,
      true,
    )
    if (stringify) return `${content}`
    return content
  }
  static numPercent(data, percent, color_type, type, with_percent = false) {
    let display_value = Render.num(data, type)
    if (!display_value) return ''
    if (type === 'display' && with_percent) display_value += ` (${percent}%)`
    return `
    <div class="num_percent_container">
      <span class="num_percent color_${color_type} placeholder" style="width: 100%"></span>
      <span class="num_percent color_${color_type}" style="width: ${percent}%"></span>
    </div>
    <span class="num_percent_value">${display_value}</span>`
  }
  static tags(tags) {
    if (!tags || tags.length === 0) return wrapLongText()
    const tags_name = []
    for (const tag of tags) {
      tags_name.push(link('tag/' + tag.id, tag.name, 'tag'))
    }
    return wrapLongText(tags_name.join(' | '))
  }
  static copyCell(data, type) {
    if (!data) return wrapLongText()
    if (type !== 'display') return data
    return wrapLongText(
      `<span class="${copy_text_classes}" title="${copy_text_msg}">${data}</span>`,
    )
  }
  static datetime(data, type, row, option = null) {
    if (!data) return ''
    if (type !== 'display') return data

    let content_after = ''
    if (option?.estimation) {
      content_after = ` <span style="font-size: 12px;">(estim.)</span>`
    }
    const time_ago = getTimeAgo(data, true, true)
    const timestamp = dateToTimestamp(data, 'start')
    const content = `${time_ago}<br>${data}${content_after}`
    const percent = getPercent((new Date().getTime() - timestamp) / 31536000000)
    const entity = percent < 0 ? 'value' : 'doc'
    const percent_abs_inversed = 100 - Math.abs(percent)
    return `${Render.numPercent(content, percent_abs_inversed, entity, type)}`
  }
}
