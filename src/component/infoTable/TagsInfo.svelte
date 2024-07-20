<script>
  import Icon from "@layout/Icon.svelte"
  import TagsList from "@component/tag/TagsList.svelte"

  export let tags
</script>

{#if tags && tags.length > 0}
  <tr>
    <td><Icon type="tag" /> Mots clés</td>
    <td><div><TagsList {tags} /></div></td>
  </tr>
{/if}

<style lang="scss">
  div {
    max-width: 600px;
  }
</style>
