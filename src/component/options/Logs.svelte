<script>
  import { wrap_long_text } from "@js/util"
  import Datatable from "@datatable/Datatable.svelte"
  import Render from "@js/Render"
  import Column from "@js/Column"

  export let logs
  export let nb_item = false
  export let load_first = false

  $: data_update_key = logs.length

  let columns = [
    {
      data: "action",
      title: Render.icon("log") + "Log",
      render: data => {
        if (!data) return ""
        return wrap_long_text(data)
      },
    },
    {
      data: "element",
      title: Render.icon("entity") + "Element",
      defaultContent: "",
      render: data => wrap_long_text(data),
    },
    Column.time_ago(),
    Column.timestamp(),
  ]
</script>

<Datatable
  entity="log"
  data={logs}
  sort_by_name={false}
  {columns}
  {load_first}
  {data_update_key}
  bind:nb_item
/>
