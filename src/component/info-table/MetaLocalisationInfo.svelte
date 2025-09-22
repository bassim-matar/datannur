<script lang="ts">
  import Icon from "@layout/Icon.svelte"

  let { meta_localisation } = $props()
</script>

{#if meta_localisation}
  <tr>
    <td><Icon type="localisation" /> Localisation</td>
    <td>{meta_localisation}</td>
  </tr>
{/if}
