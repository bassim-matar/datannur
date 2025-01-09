<script>
  import { diffWords } from "diff"
  import Column from "@js/Column"
  import Render from "@js/Render"
  import { wrap_long_text } from "@js/util"
  import Datatable from "@datatable/Datatable.svelte"
  import { entity_to_icon } from "@js/constant"

  let { history } = $props()

  const history_sorted = [...history]

  function sort_history(to_sort) {
    if (to_sort.length === 0) return
    to_sort.sort((a, b) => b.timestamp - a.timestamp)
  }
  sort_history(history_sorted)

  function highlight_diff(a, b) {
    if (!a && !b) return ""
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
        name: "history_type",
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
          if (type === "sort" || type === "export" || type === "filter") {
            return data
          }
          return `
          <span class="icon icon_${data}" title="${data}">
            <i class="fas fa-${entity_to_icon[data] || data}"></i>
          </span>
          <span>${data}</span>`
        },
      },
      {
        data: "type",
        title: Render.icon("update") + "Valeur",
        defaultContent: "",
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
      Column.timestamp(),
      {
        data: "time",
        title: Render.icon("date") + "temps",
        defaultContent: "",
        filter_type: "select",
        tooltip: "passé ou futur",
      },
    ]
  }
  const columns = define_columns()
</script>

<Datatable entity="history" data={history_sorted} {columns} />
