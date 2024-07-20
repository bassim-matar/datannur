<script>
  import Icon from "@layout/Icon.svelte"
  import Breadcrumb from "@component/Breadcrumb.svelte"
  import ExtendableText from "@layout/ExtendableText.svelte"

  export let tag_id
  export let is_self = false

  let name = "Tag"

  let icon = "institution"
  if (is_self) {
    name = "Partie de"
    icon = "folder_tree"
  }
</script>

{#if tag_id}
  <tr>
    <td><Icon type={icon} /> {name}</td>
    <td>
      <ExtendableText>
        <Breadcrumb
          className="tree"
          type="tag"
          elem_id={tag_id}
          {is_self}
        />
      </ExtendableText>
    </td>
  </tr>
{/if}
