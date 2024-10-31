<script>
  import Icon from "@layout/Icon.svelte"
  import Breadcrumb from "@component/Breadcrumb.svelte"
  import ExtendableText from "@layout/ExtendableText.svelte"

  let { tag_id, is_self = false } = $props()

  const name = is_self ? "Partie de" : "Tag"
  const icon = is_self ? "folder_tree" : "institution"
</script>

{#if tag_id}
  <tr>
    <td><Icon type={icon} /> {name}</td>
    <td>
      <ExtendableText>
        <Breadcrumb type="tag" elem_id={tag_id} {is_self} />
      </ExtendableText>
    </td>
  </tr>
{/if}
