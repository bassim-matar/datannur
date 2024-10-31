import jQuery from "jquery"
import { url_param } from "@js/url_param"
import { date_to_timestamp } from "@js/Time"

export default class Filter_helper {
  constructor(table_id, entity, on_update_filter_count) {
    this.table_id = table_id
    this.filters = {}
    this.filter_table_id = "tab_" + entity
    this.on_update_filter_count = on_update_filter_count
  }
  init(datatable) {
    this.datatable = datatable
    const that = this
    this.history_search = this.get_history()
    let count = 0
    datatable.columns().every(function () {
      that.init_column(this, count)
      count += 1
    })
  }
  init_column(column, column_num) {
    const that = this
    const id = "datatables_title_" + this.table_id + "_filter_" + column_num
    const filter_elem = jQuery("#" + id)
    const filter_container = filter_elem.parent()
    const column_attr = column.settings().init().columns[column_num]
    const column_date_type = column_attr?.date_type
    const filter_type = column_attr?.filter_type
    let unique_values = column.data().unique()

    if (
      filter_type === "select" ||
      (filter_type !== "input" &&
        unique_values.length < 10 &&
        typeof unique_values[0] !== "Array" &&
        typeof unique_values[0] !== "object" &&
        typeof unique_values[1] !== "Array" &&
        typeof unique_values[1] !== "object")
    ) {
      let options = '<option value="">- - -</option>'
      if (column.header().innerHTML.includes("icon_favorite")) {
        for (const val of ["favoris", "non favoris"]) {
          options += '<option value="' + val + '">' + val + "</option>"
        }
      } else {
        unique_values = unique_values.map(val =>
          [null, undefined].includes(val) ? "" : val
        )
        unique_values.sort().each(function (val, j) {
          if (val === "") {
            options += '<option value="__empty__"></option>'
          } else {
            if (val === true) val = "vrai"
            if (val === false) val = "faux"
            if (typeof val === "string" && val.includes("span>"))
              val = val.split("span>")[1].trim()
            options += '<option value="' + val + '">' + val + "</option>"
          }
        })
      }
      const select = jQuery(
        `<select required name="${id}" id="${id}">${options}</select>`
      )
      filter_container.html("")
      const select_wrap = jQuery('<div class="select"></div>')
      select_wrap.appendTo(filter_container)
      select.appendTo(select_wrap)
      select.on("change", function () {
        let val = jQuery.fn.dataTable.util.escapeRegex(jQuery(this).val())
        if (val === true) val = "vrai"
        if (val === false) val = "faux"

        if (val === "__empty__") {
          column.search("^$", true, false).draw()
        } else {
          column.search(val ? "^" + val : "", true, false).draw()
        }
        that.update_filter_url(column_num, val)
        that.update_filter_count()
      })

      const col_filter_url = this.get_col_filter_url(column_num)

      if (col_filter_url) {
        select.val(col_filter_url.replaceAll("\\", ""))
        column
          .search(col_filter_url ? "^" + col_filter_url : "", true, false)
          .draw()
        that.update_filter_count()
      } else if (column.search() !== "") {
        select.val(column.search().split("^")[1]).trigger("change")
      }
    } else {
      filter_elem.on("keyup", function () {
        const clear_btn = jQuery(this).parent().children(".btn_clear_input")
        const search_icon = jQuery(this).parent().children(".search_icon")
        if (this.value === "") {
          clear_btn.hide()
          search_icon.show()
        } else {
          clear_btn.show()
          search_icon.hide()
        }

        if (column_num in that.filters) {
          that.search_equation_end(column_num, column)
          that.update_filter_history(column_num, "")
        }

        let value = this.value

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
          (value.startsWith(">") ||
            value.startsWith("<") ||
            value.startsWith("=") ||
            value.startsWith("!"))
        ) {
          column.search("")
          that.search_equation_start(column_num, value)
        } else {
          column.search(value)
        }
        column.draw()
        that.update_filter_url(column_num, this.value)
        that.update_filter_count()
      })

      const col_filter_url = this.get_col_filter_url(column_num)
      const col_history = this.get_filter_history(column_num)
      if (col_filter_url) {
        filter_elem.val(col_filter_url).trigger("keyup")
      } else if (
        col_history?.special_search &&
        col_history?.special_search !== ""
      ) {
        filter_elem.val(col_history?.special_search).trigger("keyup")
      } else if (column.search() !== "") {
        filter_elem.val(column.search()).trigger("keyup")
      }
    }
  }
  clean_string(value) {
    return value.toString().trim().toLowerCase()
  }
  search_equation_start(column_num, search) {
    let dt = jQuery.fn.dataTable
    this.filters[column_num] = dt.ext.search.length
    dt.ext.search.push((settings, data) => {
      if (settings.nTable.id !== this.table_id) return true
      if (!search || search.slice(1).trim() === "") return true
      const value = data[column_num].replaceAll(" ", "")
      const search_value = search.slice(1).trim()
      if (search.startsWith("<")) {
        return parseInt(value) < parseInt(search_value)
      } else if (search.startsWith(">")) {
        return parseInt(value) > parseInt(search_value)
      } else if (search.startsWith(`=""`) || search.startsWith(`=''`)) {
        return this.clean_string(value) === ""
      } else if (search.startsWith(`!""`) || search.startsWith(`!''`)) {
        return this.clean_string(value) !== ""
      } else if (search.startsWith("=")) {
        return this.clean_string(value) === this.clean_string(search_value)
      } else if (search.startsWith("!")) {
        return !this.clean_string(value).includes(
          this.clean_string(search_value)
        )
      }
      return true
    })
  }
  update_search_filters(position) {
    if (!this.filters) return
    for (const [col_num, filter_position] of Object.entries(this.filters)) {
      if (filter_position > position) {
        this.filters[col_num] -= 1
      }
    }
  }
  search_equation_end(column_num, column) {
    const dt = jQuery.fn.dataTable
    dt.ext.search.splice(this.filters[column_num], 1)
    this.update_search_filters(this.filters[column_num])
    delete this.filters[column_num]
  }
  destroy() {
    const dt = jQuery.fn.dataTable
    const to_remove = Object.values(this.filters)
    dt.ext.search = dt.ext.search.filter((v, i) => to_remove.indexOf(i) === -1)
  }
  get_history() {
    const json_str = localStorage.getItem(
      "DataTables_history_search_" + this.table_id
    )
    if (!json_str) return null
    return JSON.parse(json_str)
  }
  get_filter_history(col_num) {
    const col_data = this.history_search?.columns[col_num]
    if (!col_data) return {}
    return col_data
  }
  update_filter_history(col_num, value) {
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
      "DataTables_history_search_" + this.table_id,
      JSON.stringify(this.history_search)
    )
  }
  update_filter_url(col_num, value) {
    const col_id = this.filter_table_id + "_" + col_num
    if ([undefined, null, NaN, ""].includes(value)) {
      url_param.delete(col_id)
    } else {
      url_param.set(col_id, value)
    }
  }
  get_col_filter_url(col_num) {
    const col_id = this.filter_table_id + "_" + col_num
    const value = url_param.get(col_id)
    if (!value) return false
    return value
  }
  update_filter_count() {
    let nb_active = 0
    for (const key in url_param.get_all_params()) {
      if (key.startsWith(this.filter_table_id + "_")) {
        nb_active += 1
      }
    }
    this.on_update_filter_count(nb_active)
  }
  remove_all() {
    for (const key in url_param.get_all_params()) {
      if (key.startsWith(this.filter_table_id + "_")) {
        const col_num = key.split(this.filter_table_id + "_")[1]
        const id = "datatables_title_" + this.table_id + "_filter_" + col_num
        jQuery("#" + id)
          .val("")
          .trigger("keyup")
          .trigger("change")
      }
    }
  }
}
