<script lang="ts">
  import Icon from '@layout/Icon.svelte'
  import { getTimeAgo, getDatetime } from '@lib/time'

  let { nextUpdateDate, intraday = false, fromTimestamp = false } = $props()

  let nextUpdateDateReadable = $state(nextUpdateDate)
  let timeAgo = $state(getTimeAgo(nextUpdateDate, true, !intraday))

  if (fromTimestamp) {
    nextUpdateDateReadable = getDatetime(nextUpdateDate)
    timeAgo = getTimeAgo(nextUpdateDate, false, !intraday)
  }
</script>

{#if nextUpdateDate}
  <tr>
    <td><Icon type="date" /> Prochaine</td>
    <td>{nextUpdateDateReadable}, {timeAgo}</td>
  </tr>
{/if}
