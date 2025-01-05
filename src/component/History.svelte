<script>
  import Column from "@js/Column"
  import Render from "@js/Render"
  import { wrap_long_text } from "@js/util"
  import Datatable from "@datatable/Datatable.svelte"

  let { history } = $props()

  const history_sorted = [...history]

  function sort_history(to_sort) {
    if (to_sort.length === 0) return
    to_sort.sort((a, b) => b.timestamp - a.timestamp)
  }
  sort_history(history_sorted)

  function define_columns() {
    return [
      {
        data: "type",
        title: Render.icon("type") + "Type",
        defaultContent: "",
        name: "history_type",
        filter_type: "select",
        tooltip: "Type de modification",
      },
      Column.entity(),
      Column.name(),
      {
        data: "variable",
        title: Render.icon("variable") + "Variable",
        defaultContent: "",
        name: "variable",
        filter_type: "input",
        tooltip: "Nom de la variable",
      },
      {
        data: "old_value",
        title: Render.icon("old_value") + "Ancienne valeur",
        defaultContent: "",
        name: "Ancienne valeur",
        filter_type: "input",
        tooltip: "Etat avant modification",
        render: data => wrap_long_text(data),
      },
      {
        data: "new_value",
        title: Render.icon("old_value") + "Nouvelle valeur",
        defaultContent: "",
        name: "Nouvelle valeur",
        filter_type: "input",
        tooltip: "Etat après modification",
        render: data => wrap_long_text(data),
      },
      Column.timestamp(),
    ]
  }
  const columns = define_columns()
</script>

<Datatable entity="history" data={history_sorted} {columns} />
