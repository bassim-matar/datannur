<script lang="ts">
  import Icon from '@layout/Icon.svelte'

  let { frequency }: { frequency: string | undefined } = $props()
</script>

{#if frequency}
  <tr>
    <td><Icon type="frequency" /> Fréquence</td>
    <td>{frequency}</td>
  </tr>
{/if}
