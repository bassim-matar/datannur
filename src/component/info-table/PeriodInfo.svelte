<script lang="ts">
  import Icon from '@layout/Icon.svelte'

  let {
    period,
    periodDuration = false,
  }: { period: string; periodDuration?: string | false } = $props()
</script>

{#if period}
  <tr>
    <td><Icon type="dateRange" /> Période</td>
    <td>
      {period}
      {#if periodDuration}
        ({periodDuration})
      {/if}
    </td>
  </tr>
{/if}
