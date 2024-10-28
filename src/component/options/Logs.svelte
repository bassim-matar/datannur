<script>
  import { wrap_long_text } from "@js/util"
  import Datatable from "@datatable/Datatable.svelte"
  import Render from "@js/Render"
  import Column from "@js/Column"

  let { logs } = $props()

  let columns = [
    {
      data: "action",
      title: Render.icon("log") + "Log",
      render: data => {
        return wrap_long_text(data ? data : "")
      },
    },
    {
      data: "element",
      title: Render.icon("entity") + "Element",
      defaultContent: "",
      render: data => wrap_long_text(data ? data : ""),
    },
    Column.time_ago(),
    Column.timestamp(),
  ]
</script>

<Datatable entity="log" data={logs} sort_by_name={false} {columns} />
