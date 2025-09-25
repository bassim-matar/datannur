<script lang="ts">
  import Icon from '@layout/Icon.svelte'
  import { getTimeAgo, getDatetime } from '@lib/time'

  let { last_update_date, intraday = false, from_timestamp = false } = $props()

  let last_update_date_readable = $state(last_update_date)
  let time_ago = $state(getTimeAgo(last_update_date, true, !intraday))

  if (from_timestamp) {
    last_update_date_readable = getDatetime(last_update_date)
    time_ago = getTimeAgo(last_update_date, false, !intraday)
  }
</script>

{#if last_update_date}
  <tr>
    <td><Icon type="date" /> Mise à jour</td>
    <td>{last_update_date_readable}, {time_ago}</td>
  </tr>
{/if}
