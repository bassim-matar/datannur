<script lang="ts">
  import Icon from '@layout/Icon.svelte'

  let { deliveryFormat } = $props()
</script>

{#if deliveryFormat}
  <tr>
    <td><Icon type="deliveryFormat" /> Format livraison</td>
    <td>{deliveryFormat}</td>
  </tr>
{/if}
