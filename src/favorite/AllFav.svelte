<script>
  import Datatable from "@datatable/Datatable.svelte"
  import Column from "@js/Column"

  export let all_fav
  export let nb_item = false
  export let load_first = false

  all_fav.sort((a, b) => b.favorite_timestamp - a.favorite_timestamp)

  const columns = [
    Column.favorite(),
    Column.entity(),
    Column.name(),
    Column.description(),
    Column.folder_simple(),
    Column.time_ago("favorite_timestamp"),
    Column.timestamp("favorite_timestamp"),
  ]
</script>

  <Datatable
    entity="favorite"
    data={all_fav}
    sort_by_name={false}
    {columns}
    {load_first}
    bind:nb_item
  />
