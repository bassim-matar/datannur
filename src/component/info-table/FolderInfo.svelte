<script lang="ts">
  import Breadcrumb from '@component/Breadcrumb.svelte'
  import Icon from '@layout/Icon.svelte'
  import ExtendableText from '@layout/ExtendableText.svelte'
  import Link from '@layout/Link.svelte'

  let { folderId, isSelf = false, isMeta = false } = $props()

  const name = isSelf ? 'Partie de' : 'Dossier'
  const icon = isSelf ? 'folderTreeFolder' : 'folder'
</script>

{#if folderId}
  <tr>
    <td><Icon type={icon} /> {name}</td>
    <td>
      {#if isMeta}
        <Link href="metaFolder/{folderId}">{folderId}</Link>
      {:else}
        <ExtendableText>
          <Breadcrumb type="folder" elemId={folderId} {isSelf} />
        </ExtendableText>
      {/if}
    </td>
  </tr>
{/if}
