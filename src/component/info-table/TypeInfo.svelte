<script lang="ts">
  import Icon from '@layout/Icon.svelte'

  let { type }: { type: string | undefined } = $props()
</script>

{#if type}
  <tr>
    <td><Icon type="type" /> Type</td>
    <td>{type}</td>
  </tr>
{/if}
