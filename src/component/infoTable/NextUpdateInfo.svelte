<script>
  import Icon from "@layout/Icon.svelte"
  import { get_time_ago, get_datetime_sortable } from "@js/Time"

  let { next_update_date, intraday = false, from_timestamp = false } = $props()

  let next_update_date_readable = $state(next_update_date)
  let time_ago = $state(get_time_ago(next_update_date, true, !intraday))
  
  if (from_timestamp) {
    next_update_date_readable = get_datetime_sortable(next_update_date, true)
    time_ago = get_time_ago(next_update_date, false, !intraday)
  }
</script>

{#if next_update_date}
  <tr>
    <td><Icon type="date" /> Prochaine</td>
    <td>{next_update_date_readable}, {time_ago}</td>
  </tr>
{/if}
