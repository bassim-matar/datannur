<script lang="ts">
  import Icon from '@layout/Icon.svelte'

  let { period, periodDuration = false } = $props()
</script>

{#if period}
  <tr>
    <td><Icon type="date_range" /> Période</td>
    <td>
      {period}
      {#if periodDuration}
        ({periodDuration})
      {/if}
    </td>
  </tr>
{/if}
