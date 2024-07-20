<script>
  import Icon from "@layout/Icon.svelte"

  export let localisation
</script>

{#if localisation}
  <tr>
    <td><Icon type="localisation" /> Localisation</td>
    <td>{localisation}</td>
  </tr>
{/if}
