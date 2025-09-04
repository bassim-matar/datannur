<script lang="ts">
  import Breadcrumb from "@component/Breadcrumb.svelte"
  import Icon from "@layout/Icon.svelte"
  import ExtendableText from "@layout/ExtendableText.svelte"
  import Link from "@layout/Link.svelte"

  let { folder_id, is_self = false, is_meta = false } = $props()

  const name = is_self ? "Partie de" : "Dossier"
  const icon = is_self ? "folder_tree_folder" : "folder"
</script>

{#if folder_id}
  <tr>
    <td><Icon type={icon} /> {name}</td>
    <td>
      {#if is_meta}
        <Link href="metaFolder/{folder_id}">{folder_id}</Link>
      {:else}
        <ExtendableText>
          <Breadcrumb type="folder" elem_id={folder_id} {is_self} />
        </ExtendableText>
      {/if}
    </td>
  </tr>
{/if}
