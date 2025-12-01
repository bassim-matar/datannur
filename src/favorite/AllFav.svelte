<script lang="ts">
  import { untrack } from 'svelte'
  import Datatable from '@datatable/Datatable.svelte'
  import Column from '@lib/column'
  import type { FavoritableEntity } from '@type'

  let { allFav: allFavProp }: { allFav: FavoritableEntity[] } = $props()
  const allFav = untrack(() => allFavProp)

  allFav.sort((a, b) => (b.favoriteTimestamp ?? 0) - (a.favoriteTimestamp ?? 0))

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
