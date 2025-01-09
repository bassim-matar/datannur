<script>
  import Icon from "@layout/Icon.svelte"
  import { get_time_ago, get_datetime_sortable } from "@js/Time"

  let { last_update_date, intraday = false, from_timestamp = false } = $props()

  let last_update_date_readable = $state(last_update_date)
  let time_ago = $state(get_time_ago(last_update_date, true, !intraday))
  
  if (from_timestamp) {
    last_update_date_readable = get_datetime_sortable(last_update_date, true)
    time_ago = get_time_ago(last_update_date, false, !intraday)
  }
</script>

{#if last_update_date}
  <tr>
    <td><Icon type="date" /> Mise à jour</td>
    <td>{last_update_date_readable}, {time_ago}</td>
  </tr>
{/if}
