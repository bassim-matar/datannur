<script lang="ts">
  import Icon from '@layout/Icon.svelte'
  import Breadcrumb from '@component/Breadcrumb.svelte'
  import ExtendableText from '@layout/ExtendableText.svelte'

  let { tagId } = $props()

  const name = 'Partie de'
  const icon = 'folderTreeTag'
</script>

{#if tagId}
  <tr>
    <td><Icon type={icon} /> {name}</td>
    <td>
      <ExtendableText>
        <Breadcrumb type="tag" elemId={tagId} isSelf={true} />
      </ExtendableText>
    </td>
  </tr>
{/if}
