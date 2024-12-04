<script>
  import Datatable from "@datatable/Datatable.svelte"
  import Column from "@js/Column"

  let { all_fav } = $props()

  all_fav.sort((a, b) => b.favorite_timestamp - a.favorite_timestamp)

  const columns = [
    Column.entity(),
    Column.name(),
    Column.description(),
    Column.folder_simple(),
    Column.timestamp("favorite_timestamp"),
    Column.favorite(),
  ]
</script>

<Datatable entity="favorite" data={all_fav} sort_by_name={false} {columns} />
