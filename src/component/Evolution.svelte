<script>
  import { diffWords } from "diff"
  import Column from "@js/Column"
  import Render from "@js/Render"
  import { wrap_long_text } from "@js/util"
  import { get_period } from "@js/Time"
  import {
    entity_to_icon,
    column_clean_names,
    column_icons,
  } from "@js/constant"
  import Datatable from "@datatable/Datatable.svelte"

  let { evolutions } = $props()

  const evolutions_sorted = [...evolutions]

  function sort_evolutions(to_sort) {
    if (to_sort.length === 0) return
    to_sort.sort((a, b) => b.timestamp - a.timestamp)
  }
  sort_evolutions(evolutions_sorted)

  function parse_date(dateString) {
    const parts = dateString.split("/")
    if (parts.length !== 3) return null
    const [year, month, day] = parts.map(Number)
    if (year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return new Date(year, month - 1, day)
    }
    return null
  }

  function highlight_diff(a, b) {
    if (!a && !b) return ""

    if (!isNaN(a) && !isNaN(b)) {
      const oldVal = parseFloat(a)
      const newVal = parseFloat(b)
      const diff = newVal - oldVal
      const percentageChange =
        oldVal !== 0 ? ((diff / oldVal) * 100).toFixed(1) : "∞"
      const diffClass =
        diff > 0 ? "highlight_diff_add" : "highlight_diff_delete"

      return `${newVal.toLocaleString()} 
        <br><span class="${diffClass}">${diff > 0 ? "+" : ""}${diff.toLocaleString()} | 
        ${diff > 0 ? "+" : ""}${percentageChange}%</span>
    `
    }

    const oldDate = parse_date(a)
    const newDate = parse_date(b)

    if (oldDate && newDate) {
      const diffDays = Math.ceil((newDate - oldDate) / (1000 * 60 * 60 * 24))
      const diffClass =
        diffDays > 0 ? "highlight_diff_add" : "highlight_diff_delete"

      const diff_relative = get_period(a, b, true)

      return `
        ${b} <span class="${diffClass}">${diffDays > 0 ? "+" : ""}${diff_relative}</span>
        <br>${a}
    `
    }

    a = a ? a.toString() : ""
    b = b ? b.toString() : ""
    const diff = diffWords(a, b)
    return diff
      .map(part => {
        if (part.added) {
          return `<span class="highlight_diff_add">${part.value}</span>`
        } else if (part.removed) {
          return `<span class="highlight_diff_delete">${part.value}</span>`
        } else {
          return `<span>${part.value}</span>`
        }
      })
      .join("")
  }

  function define_columns() {
    return [
      Column.favorite(),
      {
        data: "type_clean",
        title: Render.icon("type"),
        defaultContent: "",
        name: "evolution_type",
        width: "20px",
        filter_type: "select",
        tooltip: "Type de modification",
        render: (data, type, row) => {
          if (type === "sort" || type === "export" || type === "filter") {
            return data
          }
          return `
          <span class="icon icon_${row.type}" title="${data}">
            <i class="fas fa-${entity_to_icon[row.type]}"></i>
          </span>
          <span style="display: none;">${data}</span>`
        },
      },
      Column.entity(),
      Column.name(),
      Column.parent_entity(),
      {
        data: "variable",
        title: Render.icon("variable") + "Variable",
        defaultContent: "",
        name: "variable",
        filter_type: "input",
        tooltip: "Nom de la variable",
        render: (data, type) => {
          if (!data) return ""

          let column_clean_name = data
          if (column_clean_names[data])
            column_clean_name = column_clean_names[data]
          else if (Column[data.toLowerCase()])
            column_clean_name = Column[data.toLowerCase()]?.name

          if (type === "sort" || type === "export" || type === "filter") {
            return column_clean_name
          }

          let icon = data
          if (column_icons[data]) icon = column_icons[data]

          return `
          <div style="display: flex; align-items: center;">
            <span class="icon icon_${icon}" title="${data}">
              <i class="fas fa-${entity_to_icon[icon] || icon}"></i>
            </span>
            <span style="font-size: 13px;">${column_clean_name}</span>
          </div>`
        },
      },
      {
        data: "type",
        title: Render.icon("update") + "Valeur",
        defaultContent: "",
        has_long_text: true,
        name: "value",
        filter_type: "input",
        tooltip: "Valeur de la variable",
        render: (data, type, row) => {
          if (!row.old_value && !row.new_value) {
            return ""
          }
          if (row.old_value === row.new_value)
            return wrap_long_text(row.old_value)

          const diff = highlight_diff(row.old_value, row.new_value)
          if (type === "sort" || type === "export" || type === "filter") {
            return diff
          }
          return wrap_long_text(diff)
        },
      },
      {
        data: "time",
        title: Render.icon("date"),
        defaultContent: "",
        filter_type: "select",
        tooltip: "passé ou futur",
        render: (data, type) => {
          if (type === "sort" || type === "export" || type === "filter") {
            return data
          }
          return `<span style="display: none;">${data}</span>`
        },
      },
      Column.timestamp(),
    ]
  }
  const columns = define_columns()
</script>

<Datatable entity="evolution" data={evolutions_sorted} {columns} />
