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

  let lastUpdateDateReadable = $state(lastUpdateDate)
  let timeAgo = $state(getTimeAgo(lastUpdateDate, true, !intraday))

  if (fromTimestamp) {
    lastUpdateDateReadable = getDatetime(lastUpdateDate as number)
    timeAgo = getTimeAgo(lastUpdateDate, false, !intraday)
  }
</script>

{#if lastUpdateDate}
  <tr>
    <td><Icon type="date" /> Mise à jour</td>
    <td>{lastUpdateDateReadable}, {timeAgo}</td>
  </tr>
{/if}
