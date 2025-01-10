<script>
  import { wrap_long_text } from "@js/util"
  import Datatable from "@datatable/Datatable.svelte"
  import Render from "@js/Render"
  import Column from "@js/Column"
  import { entity_names } from "@js/constant"

  let { logs } = $props()

  for (const log of logs) {
    log._entity_clean = log.entity ? entity_names[log.entity] : ""
    log._entity = log.entity
  }

  let columns = [
    {
      data: "action",
      title: Render.icon("log") + "Log",
      tooltip: "Action",
      render: data => {
        return wrap_long_text(data ? data : "")
      },
    },
    Column.entity(),
    {
      data: "element",
      title: Render.icon("entity") + "Element",
      defaultContent: "",
      tooltip: "Element impliqué",
      render: data => wrap_long_text(data ? data : ""),
    },
    Column.timestamp(),
  ]
</script>

<Datatable entity="log" data={logs} {columns} />
