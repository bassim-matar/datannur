<script>
  import Icon from "@layout/Icon.svelte"

  let { delivery_format } = $props()
</script>

{#if delivery_format}
  <tr>
    <td><Icon type="delivery_format" /> Format livraison</td>
    <td>{delivery_format}</td>
  </tr>
{/if}
