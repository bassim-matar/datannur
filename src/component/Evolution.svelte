<script>
  import { page_name } from "@js/store"
  import Column from "@js/Column"
  import Render from "@js/Render"
  import { wrap_long_text } from "@js/util"
  import { highlight_diff } from "@js/Evolution"
  import {
    entity_to_icon,
    column_clean_names,
    column_icons,
    is_big_limit,
  } from "@js/constant"
  import Options from "@js/Options"
  import Datatable from "@datatable/Datatable.svelte"

  let { evolutions } = $props()

  let evolution_summary = $state(Options.get("evolution_summary"))

  function sort_evolutions(to_sort) {
    if (to_sort.length === 0) return
    to_sort.sort((a, b) => b.timestamp - a.timestamp)
  }

  function filter_evolutions(to_filter) {
    if (to_filter.length === 0) return

    const detail_entities = [
      "dataset",
      "variable",
      "modality",
      "value",
    ]

    const detail_rows = to_filter.filter(
      evo => detail_entities.includes(evo.entity),
    )
    const main_rows = to_filter.filter(
      evo => !detail_entities.includes(evo.entity),
    )
         
    return main_rows
  }

  const detail_pages = [
    "dataset",
    "datasets",
    "variable",
    "variables",
    "modality",
    "modalities",
    "favorite"
  ]
  const filter_evolution =
    evolution_summary &&
    !detail_pages.includes($page_name) &&
    evolutions.length > is_big_limit

  const evolutions_sorted = filter_evolution
    ? filter_evolutions([...evolutions])
    : [...evolutions]

  sort_evolutions(evolutions_sorted)

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

          const diff = highlight_diff(row.old_value, row.new_value, row.variable)
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
