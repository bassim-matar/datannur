<script>
  import Column from "@js/Column"
  import Datatable from "@datatable/Datatable.svelte"

  let { history } = $props()

  const history_sorted = [...history]

  function sort_history(to_sort) {
    if (to_sort.length === 0) return
    to_sort.sort((a, b) => a.timestamp > b.timestamp)
  }
  sort_history(history_sorted)

  function define_columns() {
    return []
  }
  const columns = define_columns()
</script>

<Datatable entity="history" data={history_sorted} {columns} />
