<script lang="ts">
  import Icon from "@layout/Icon.svelte"

  let { frequency } = $props()
</script>

{#if frequency}
  <tr>
    <td><Icon type="frequency" /> Fréquence</td>
    <td>{frequency}</td>
  </tr>
{/if}
