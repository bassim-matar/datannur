<script>
  import Icon from "@layout/Icon.svelte"

  export let frequency
</script>

{#if frequency}
  <tr>
    <td><Icon type="frequency" /> Fréquence</td>
    <td>{frequency}</td>
  </tr>
{/if}
