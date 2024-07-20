<script>
  import Breadcrumb from "@component/Breadcrumb.svelte"
  import Icon from "@layout/Icon.svelte"
  import ExtendableText from "@layout/ExtendableText.svelte"
  import Link from "@layout/Link.svelte"
  
  export let folder_id
  export let is_self = false
  export let is_meta = false

  let name = "Dossier"
  let icon = "folder"
  if (is_self) {
    name = "Partie de"
    icon = "folder_tree"
  }
</script>

{#if folder_id}
  <tr>
    <td><Icon type={icon} /> {name}</td>
    <td>
      {#if is_meta}
        <Link href="metaFolder/{folder_id}">{folder_id}</Link>
      {:else}
      <ExtendableText>
        <Breadcrumb className="tree" type="folder" elem_id={folder_id} {is_self} />
      </ExtendableText>
      {/if}
    </td>
  </tr>
{/if}
