<script lang="ts">
  import Icon from '@layout/Icon.svelte'

  let { metaLocalisation } = $props()
</script>

{#if metaLocalisation}
  <tr>
    <td><Icon type="localisation" /> Localisation</td>
    <td>{metaLocalisation}</td>
  </tr>
{/if}
