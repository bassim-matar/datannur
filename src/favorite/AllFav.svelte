<script lang="ts">
  import Datatable from '@datatable/Datatable.svelte'
  import Column from '@lib/column'

  let { allFav } = $props()

  allFav.sort((a, b) => b.favoriteTimestamp - a.favoriteTimestamp)

  const columns = [
    Column.favorite(),
    Column.entity(),
    Column.name(),
    Column.description(),
    Column.folderSimple(),
    Column.timestamp({ varName: 'favoriteTimestamp' }),
  ]
</script>

<Datatable entity="favorite" data={allFav} {columns} />
