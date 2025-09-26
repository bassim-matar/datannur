import jQuery from 'jquery'
import type { Api } from 'datatables.net'
import { UrlParam } from '@lib/url-param'
import { dateToTimestamp } from '@lib/time'

interface FilterHistory {
  columns: Record<number, { specialSearch?: string }>
}

interface ButtonInfo {
  text: string
  action: () => void
  footer: boolean
}

export default class FilterHelper {
  tableId: string
  filters: Record<number, number>
  filterTableId: string
  onUpdateFilterCount: (count: number) => void
  datatable: Api
  historySearch: FilterHistory | null
  constructor(tableId, entity, onUpdateFilterCount) {
    this.tableId = tableId
    this.filters = {}
    this.filterTableId = 'tab_' + entity
    this.onUpdateFilterCount = onUpdateFilterCount
  }
  init(datatable) {
    this.datatable = datatable
    this.historySearch = this.getHistory()
    datatable.columns().every(index => {
      this.initColumn(datatable.column(index), index)
    })
  }
  initColumn(column, columnNum) {
    const id = 'datatables_title_' + this.tableId + '_filter_' + columnNum
    const filterElem = jQuery('#' + id)
    const filterContainer = filterElem.parent()
    const columnAttr = column.settings().init().columns[columnNum]
    const columnDateType = columnAttr?.dateType
    const filterType = columnAttr?.filterType
    let uniqueValues = column.data().unique()

    if (
      filterType === 'select' ||
      (filterType !== 'input' &&
        uniqueValues.length < 10 &&
        Array.isArray(uniqueValues[0]) &&
        typeof uniqueValues[0] !== 'object' &&
        Array.isArray(uniqueValues[1]) &&
        typeof uniqueValues[1] !== 'object')
    ) {
      let options = '<option value="">- - -</option>'
      if (column.header().innerHTML.includes('icon_favorite')) {
        for (const val of ['favoris', 'non favoris']) {
          options += '<option value="' + val + '">' + val + '</option>'
        }
      } else {
        uniqueValues = uniqueValues.map(val =>
          [null, undefined].includes(val) ? '' : val,
        )
        uniqueValues.sort().each(function (val) {
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
      filterContainer.html('')
      const selectWrap = jQuery('<div class="select"></div>')
      selectWrap.appendTo(filterContainer)
      select.appendTo(selectWrap)
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
        this.updateFilterUrl(columnNum, val)
        this.updateFilterCount()
      })

      const colFilterUrl = this.getColFilterUrl(columnNum)

      if (colFilterUrl) {
        select.val(colFilterUrl.replaceAll('\\', ''))
        column
          .search(colFilterUrl ? '^' + colFilterUrl : '', true, false)
          .draw()
        this.updateFilterCount()
      } else if (column.search() !== '') {
        select.val(column.search().split('^')[1]).trigger('change')
      }
    } else {
      filterElem.on('keyup', event => {
        const elem = jQuery(event.target)
        const clearBtn = elem.parent().children('.btn_clear_input')
        const searchIcon = elem.parent().children('.search_icon')
        if (elem.val() === '') {
          clearBtn.hide()
          searchIcon.show()
        } else {
          clearBtn.show()
          searchIcon.hide()
        }

        if (columnNum in this.filters) {
          this.searchEquationEnd(columnNum)
          this.updateFilterHistory(columnNum, '')
        }

        let value = elem.val()

        if (value && columnDateType) {
          if (value.charCodeAt(0) > 47 && value.charCodeAt(0) < 58) {
            const timestamp = dateToTimestamp(value, columnDateType)
            if (![NaN, undefined].includes(timestamp)) {
              value = timestamp.toString()
            }
          } else {
            value = value[0] + dateToTimestamp(value.slice(1), columnDateType)
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
          this.searchEquationStart(columnNum, value)
        } else {
          column.search(value)
        }
        column.draw()
        this.updateFilterUrl(columnNum, elem.val())
        this.updateFilterCount()
      })

      const colFilterUrl = this.getColFilterUrl(columnNum)
      const colHistory = this.getFilterHistory(columnNum)
      if (colFilterUrl) {
        filterElem.val(colFilterUrl).trigger('keyup')
      } else if (
        colHistory?.specialSearch &&
        colHistory?.specialSearch !== ''
      ) {
        filterElem.val(colHistory?.specialSearch).trigger('keyup')
      } else if (column.search() !== '') {
        filterElem.val(column.search()).trigger('keyup')
      }
    }
  }
  cleanString(value) {
    return value.toString().trim().toLowerCase()
  }
  searchEquationStart(columnNum, search) {
    const dt = jQuery.fn.dataTable
    this.filters[columnNum] = dt.ext.search.length
    dt.ext.search.push((settings, data) => {
      if (settings.nTable.id !== this.tableId) return true
      if (!search || search.slice(1).trim() === '') return true
      const value = data[columnNum].replaceAll(' ', '')
      const searchValue = search.slice(1).trim()
      if (search.startsWith('<')) {
        return parseInt(value) < parseInt(searchValue)
      } else if (search.startsWith('>')) {
        return parseInt(value) > parseInt(searchValue)
      } else if (search.startsWith(`=""`) || search.startsWith(`=''`)) {
        return this.cleanString(value) === ''
      } else if (search.startsWith(`!""`) || search.startsWith(`!''`)) {
        return this.cleanString(value) !== ''
      } else if (search.startsWith('=')) {
        return this.cleanString(value) === this.cleanString(searchValue)
      } else if (search.startsWith('!')) {
        return !this.cleanString(value).includes(this.cleanString(searchValue))
      }
      return true
    })
  }
  updateSearchFilters(position) {
    if (!this.filters) return
    for (const [colNum, filterPosition] of Object.entries(this.filters)) {
      if (filterPosition > position) {
        this.filters[colNum] -= 1
      }
    }
  }
  searchEquationEnd(columnNum) {
    const dt = jQuery.fn.dataTable
    dt.ext.search.splice(this.filters[columnNum], 1)
    this.updateSearchFilters(this.filters[columnNum])
    delete this.filters[columnNum]
  }
  destroy() {
    const dt = jQuery.fn.dataTable
    const toRemove = Object.values(this.filters)
    dt.ext.search = dt.ext.search.filter((v, i) => toRemove.indexOf(i) === -1)
  }
  getHistory() {
    const jsonStr = localStorage.getItem(
      'DataTables_history_search_' + this.tableId,
    )
    if (!jsonStr) return null
    return JSON.parse(jsonStr)
  }
  getFilterHistory(colNum) {
    const colData = this.historySearch?.columns[colNum]
    if (!colData) return {}
    return colData
  }
  updateFilterHistory(colNum, value) {
    if (!this.historySearch) {
      this.historySearch = {
        columns: {},
      }
    }
    let colData = this.historySearch.columns[colNum]
    if (!colData) {
      colData = {}
      this.historySearch.columns[colNum] = colData
    }
    colData.specialSearch = value
    localStorage.setItem(
      'DataTables_history_search_' + this.tableId,
      JSON.stringify(this.historySearch),
    )
  }
  updateFilterUrl(colNum, value) {
    const colId = this.filterTableId + '_' + colNum
    if ([undefined, null, NaN, ''].includes(value)) {
      UrlParam.delete(colId)
    } else {
      UrlParam.set(colId, value)
    }
  }
  getColFilterUrl(colNum) {
    const colId = this.filterTableId + '_' + colNum
    const value = UrlParam.get(colId)
    if (!value) return false
    return value
  }
  updateFilterCount() {
    let nbActive = 0
    for (const key in UrlParam.getAllParams()) {
      if (key.startsWith(this.filterTableId + '_')) {
        nbActive += 1
      }
    }
    this.onUpdateFilterCount(nbActive)
  }
  removeAll() {
    for (const key in UrlParam.getAllParams()) {
      if (key.startsWith(this.filterTableId + '_')) {
        const colNum = key.split(this.filterTableId + '_')[1]
        const id = 'datatables_title_' + this.tableId + '_filter_' + colNum
        jQuery('#' + id)
          .val('')
          .trigger('keyup')
          .trigger('change')
      }
    }
  }
  getBtnInfoPopup(action = () => {}): ButtonInfo {
    return {
      text: `<span class="icon"><i class="fa-solid fa-magnifying-glass-plus"></i></span>`,
      action,
      footer: false,
    }
  }
}
