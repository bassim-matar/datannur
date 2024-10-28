<script>
  import Icon from "@layout/Icon.svelte"

  let { localisation } = $props()
</script>

{#if localisation}
  <tr>
    <td><Icon type="localisation" /> Localisation</td>
    <td>{localisation}</td>
  </tr>
{/if}
