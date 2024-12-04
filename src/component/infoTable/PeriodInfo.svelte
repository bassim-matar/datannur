<script>
  import Icon from "@layout/Icon.svelte"

  let { period, period_duration = false } = $props()
</script>

{#if period}
  <tr>
    <td><Icon type="date_range" /> Période</td>
    <td>
      {period}
      {#if period_duration}
        ({period_duration})
      {/if}
    </td>
  </tr>
{/if}
