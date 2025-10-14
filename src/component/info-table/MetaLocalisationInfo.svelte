<script lang="ts">
  import Icon from '@layout/Icon.svelte'

  let { metaLocalisation }: { metaLocalisation: string | undefined } = $props()
</script>

{#if metaLocalisation}
  <tr>
    <td><Icon type="localisation" /> Localisation</td>
    <td>{metaLocalisation}</td>
  </tr>
{/if}
