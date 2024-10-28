<script>
  import Icon from "@layout/Icon.svelte"

  let { period } = $props()
</script>

{#if period}
  <tr>
    <td><Icon type="date_range" /> Période</td>
    <td>{period}</td>
  </tr>
{/if}
