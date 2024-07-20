<script>
  import Icon from "@layout/Icon.svelte"

  export let period
</script>

{#if period}
  <tr>
    <td><Icon type="date_range" /> Période</td>
    <td>{period}</td>
  </tr>
{/if}
