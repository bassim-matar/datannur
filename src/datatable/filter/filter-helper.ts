import jQuery from 'jquery'
import { UrlParam } from '@lib/url-param'
import { date_to_timestamp } from '@lib/time'

export default class FilterHelper {
  table_id: string
  filters: any
  filter_table_id: string
  on_update_filter_count: (count: number) => void
  datatable: any
  history_search: any
  constructor(table_id, entity, on_update_filter_count) {
    this.table_id = table_id
    this.filters = {}
    this.filter_table_id = 'tab_' + entity
    this.on_update_filter_count = on_update_filter_count
  }
  init(datatable) {
    this.datatable = datatable
    this.history_search = this.getHistory()
    datatable.columns().every(index => {
      this.initColumn(datatable.column(index), index)
    })
  }
  initColumn(column, column_num) {
    const id = 'datatables_title_' + this.table_id + '_filter_' + column_num
    const filter_elem = jQuery('#' + id)
    const filter_container = filter_elem.parent()
    const column_attr = column.settings().init().columns[column_num]
    const column_date_type = column_attr?.date_type
    const filter_type = column_attr?.filter_type
    let unique_values = column.data().unique()

    if (
      filter_type === 'select' ||
      (filter_type !== 'input' &&
        unique_values.length < 10 &&
        Array.isArray(unique_values[0]) &&
        typeof unique_values[0] !== 'object' &&
        Array.isArray(unique_values[1]) &&
        typeof unique_values[1] !== 'object')
    ) {
      let options = '<option value="">- - -</option>'
      if (column.header().innerHTML.includes('icon_favorite')) {
        for (const val of ['favoris', 'non favoris']) {
          options += '<option value="' + val + '">' + val + '</option>'
        }
      } else {
        unique_values = unique_values.map(val =>
          [null, undefined].includes(val) ? '' : val,
        )
        unique_values.sort().each(function (val, j) {
          if (val === '') {
            options += '<option value="__empty__"></option>'
          } else {
            if (val === true) val = 'vrai'
            if (val === false) val = 'faux'
            if (typeof val === 'string' && val.includes('span>'))
              val = val.split('span>')[1].trim()
            options += '<option value="' + val + '">' + val + '</option>'
          }
        })
      }
      const select = jQuery(
        `<select required name="${id}" id="${id}">${options}</select>`,
      )
      filter_container.html('')
      const select_wrap = jQuery('<div class="select"></div>')
      select_wrap.appendTo(filter_container)
      select.appendTo(select_wrap)
      select.on('change', event => {
        const elem = jQuery(event.target)
        let val = jQuery.fn.dataTable.util.escapeRegex(elem.val())
        if (val === true) val = 'vrai'
        if (val === false) val = 'faux'

        if (val === '__empty__') {
          column.search('^$', true, false).draw()
        } else {
          column.search(val ? '^' + val : '', true, false).draw()
        }
        this.updateFilterUrl(column_num, val)
        this.updateFilterCount()
      })

      const col_filter_url = this.getColFilterUrl(column_num)

      if (col_filter_url) {
        select.val(col_filter_url.replaceAll('\\', ''))
        column
          .search(col_filter_url ? '^' + col_filter_url : '', true, false)
          .draw()
        this.updateFilterCount()
      } else if (column.search() !== '') {
        select.val(column.search().split('^')[1]).trigger('change')
      }
    } else {
      filter_elem.on('keyup', event => {
        const elem = jQuery(event.target)
        const clear_btn = elem.parent().children('.btn_clear_input')
        const search_icon = elem.parent().children('.search_icon')
        if (elem.val() === '') {
          clear_btn.hide()
          search_icon.show()
        } else {
          clear_btn.show()
          search_icon.hide()
        }

        if (column_num in this.filters) {
          this.searchEquationEnd(column_num, column)
          this.updateFilterHistory(column_num, '')
        }

        let value = elem.val()

        if (value && column_date_type) {
          if (value.charCodeAt(0) > 47 && value.charCodeAt(0) < 58) {
            const timestamp = date_to_timestamp(value, column_date_type)
            if (![NaN, undefined].includes(timestamp)) {
              value = timestamp.toString()
            }
          } else {
            value =
              value[0] + date_to_timestamp(value.slice(1), column_date_type)
          }
        }

        if (
          value &&
          (value.startsWith('>') ||
            value.startsWith('<') ||
            value.startsWith('=') ||
            value.startsWith('!'))
        ) {
          column.search('')
          this.searchEquationStart(column_num, value)
        } else {
          column.search(value)
        }
        column.draw()
        this.updateFilterUrl(column_num, elem.val())
        this.updateFilterCount()
      })

      const col_filter_url = this.getColFilterUrl(column_num)
      const col_history = this.getFilterHistory(column_num)
      if (col_filter_url) {
        filter_elem.val(col_filter_url).trigger('keyup')
      } else if (
        col_history?.special_search &&
        col_history?.special_search !== ''
      ) {
        filter_elem.val(col_history?.special_search).trigger('keyup')
      } else if (column.search() !== '') {
        filter_elem.val(column.search()).trigger('keyup')
      }
    }
  }
  cleanString(value) {
    return value.toString().trim().toLowerCase()
  }
  searchEquationStart(column_num, search) {
    let dt = jQuery.fn.dataTable
    this.filters[column_num] = dt.ext.search.length
    dt.ext.search.push((settings, data) => {
      if (settings.nTable.id !== this.table_id) return true
      if (!search || search.slice(1).trim() === '') return true
      const value = data[column_num].replaceAll(' ', '')
      const search_value = search.slice(1).trim()
      if (search.startsWith('<')) {
        return parseInt(value) < parseInt(search_value)
      } else if (search.startsWith('>')) {
        return parseInt(value) > parseInt(search_value)
      } else if (search.startsWith(`=""`) || search.startsWith(`=''`)) {
        return this.cleanString(value) === ''
      } else if (search.startsWith(`!""`) || search.startsWith(`!''`)) {
        return this.cleanString(value) !== ''
      } else if (search.startsWith('=')) {
        return this.cleanString(value) === this.cleanString(search_value)
      } else if (search.startsWith('!')) {
        return !this.cleanString(value).includes(this.cleanString(search_value))
      }
      return true
    })
  }
  updateSearchFilters(position) {
    if (!this.filters) return
    for (const [col_num, filter_position] of Object.entries(this.filters)) {
      if (filter_position > position) {
        this.filters[col_num] -= 1
      }
    }
  }
  searchEquationEnd(column_num, column) {
    const dt = jQuery.fn.dataTable
    dt.ext.search.splice(this.filters[column_num], 1)
    this.updateSearchFilters(this.filters[column_num])
    delete this.filters[column_num]
  }
  destroy() {
    const dt = jQuery.fn.dataTable
    const to_remove = Object.values(this.filters)
    dt.ext.search = dt.ext.search.filter((v, i) => to_remove.indexOf(i) === -1)
  }
  getHistory() {
    const json_str = localStorage.getItem(
      'DataTables_history_search_' + this.table_id,
    )
    if (!json_str) return null
    return JSON.parse(json_str)
  }
  getFilterHistory(col_num) {
    const col_data = this.history_search?.columns[col_num]
    if (!col_data) return {}
    return col_data
  }
  updateFilterHistory(col_num, value) {
    if (!this.history_search) {
      this.history_search = {
        columns: {},
      }
    }
    let col_data = this.history_search.columns[col_num]
    if (!col_data) {
      col_data = {}
      this.history_search.columns[col_num] = col_data
    }
    col_data.special_search = value
    localStorage.setItem(
      'DataTables_history_search_' + this.table_id,
      JSON.stringify(this.history_search),
    )
  }
  updateFilterUrl(col_num, value) {
    const col_id = this.filter_table_id + '_' + col_num
    if ([undefined, null, NaN, ''].includes(value)) {
      UrlParam.delete(col_id)
    } else {
      UrlParam.set(col_id, value)
    }
  }
  getColFilterUrl(col_num) {
    const col_id = this.filter_table_id + '_' + col_num
    const value = UrlParam.get(col_id)
    if (!value) return false
    return value
  }
  updateFilterCount() {
    let nb_active = 0
    for (const key in UrlParam.getAllParams()) {
      if (key.startsWith(this.filter_table_id + '_')) {
        nb_active += 1
      }
    }
    this.on_update_filter_count(nb_active)
  }
  removeAll() {
    for (const key in UrlParam.getAllParams()) {
      if (key.startsWith(this.filter_table_id + '_')) {
        const col_num = key.split(this.filter_table_id + '_')[1]
        const id = 'datatables_title_' + this.table_id + '_filter_' + col_num
        jQuery('#' + id)
          .val('')
          .trigger('keyup')
          .trigger('change')
      }
    }
  }
  getBtnInfoPopup(action = () => {}) {
    return {
      text: `<span class="icon"><i class="fa-solid fa-magnifying-glass-plus"></i></span>`,
      action,
      className: 'search_option',
      footer: false,
    } as any
  }
}
