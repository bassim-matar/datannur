<script lang="ts">
  import Icon from '@layout/Icon.svelte'

  let { localisation }: { localisation: string | undefined } = $props()
</script>

{#if localisation}
  <tr>
    <td><Icon type="localisation" /> Localisation</td>
    <td>{localisation}</td>
  </tr>
{/if}
