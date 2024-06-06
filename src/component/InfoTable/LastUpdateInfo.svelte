<script>
  import Icon from "@layout/Icon.svelte"
  import { get_time_ago, get_datetime_sortable } from "@js/Time"

  export let last_update_date
  export let intraday = false
  export let from_timestamp = false

  let last_update_date_readable = last_update_date
  let time_ago = get_time_ago(last_update_date, true, !intraday)
  if (from_timestamp) {
    last_update_date_readable = get_datetime_sortable(last_update_date, true)
    time_ago = get_time_ago(last_update_date, false, !intraday)
  }
</script>

{#if last_update_date}
  <tr>
    <td><Icon type="date" /> Mis à jour</td>
    <td>{last_update_date_readable}, {time_ago}</td>
  </tr>
{/if}
