<script lang="ts">
  import Datatable from "@datatable/Datatable.svelte"
  import Column from "@lib/Column"

  let { all_fav } = $props()

  all_fav.sort((a, b) => b.favorite_timestamp - a.favorite_timestamp)

  const columns = [
    Column.favorite(),
    Column.entity(),
    Column.name(),
    Column.description(),
    Column.folder_simple(),
    Column.timestamp({ var_name: "favorite_timestamp" }),
  ]
</script>

<Datatable entity="favorite" data={all_fav} {columns} />
