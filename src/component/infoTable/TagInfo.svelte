<script>
  import Icon from "@layout/Icon.svelte"
  import Breadcrumb from "@component/Breadcrumb.svelte"
  import ExtendableText from "@layout/ExtendableText.svelte"

  let { tag_id } = $props()

  const name = "Partie de"
  const icon = "folder_tree_tag"
</script>

{#if tag_id}
  <tr>
    <td><Icon type={icon} /> {name}</td>
    <td>
      <ExtendableText>
        <Breadcrumb type="tag" elem_id={tag_id} is_self={true} />
      </ExtendableText>
    </td>
  </tr>
{/if}
