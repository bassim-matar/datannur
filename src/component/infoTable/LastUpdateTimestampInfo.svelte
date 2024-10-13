<script>
  import Icon from "@layout/Icon.svelte"
  import { get_time_ago, get_datetime_sortable } from "@js/Time"

  export let last_update_timestamp
  export let intraday = true
  export let from_timestamp = true

  last_update_timestamp = last_update_timestamp * 1000

  let last_update_date_readable = last_update_timestamp
  let time_ago = get_time_ago(last_update_timestamp, true, !intraday)
  if (from_timestamp) {
    last_update_date_readable = get_datetime_sortable(last_update_timestamp, true)
    time_ago = get_time_ago(last_update_timestamp, false, !intraday)
  }
</script>

{#if last_update_timestamp}
  <tr>
    <td><Icon type="date" /> Mis à jour</td>
    <td>{last_update_date_readable}, {time_ago}</td>
  </tr>
{/if}
