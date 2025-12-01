<script lang="ts">
  import Icon from '@layout/Icon.svelte'
  import { getTimeAgo, getDatetime } from '@lib/time'

  let {
    lastUpdateDate,
    intraday = false,
    fromTimestamp = false,
  }: {
    lastUpdateDate: string | number
    intraday?: boolean
    fromTimestamp?: boolean
  } = $props()

  const lastUpdateDateReadable = $derived(
    fromTimestamp ? getDatetime(lastUpdateDate as number) : lastUpdateDate,
  )
  const timeAgo = $derived(
    getTimeAgo(lastUpdateDate, !fromTimestamp, !intraday),
  )
</script>

{#if lastUpdateDate}
  <tr>
    <td><Icon type="date" /> Mise à jour</td>
    <td>{lastUpdateDateReadable}, {timeAgo}</td>
  </tr>
{/if}
