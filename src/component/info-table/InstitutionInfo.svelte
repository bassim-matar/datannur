<script lang="ts">
  import { entityNames } from '@lib/constant'
  import Icon from '@layout/Icon.svelte'
  import Breadcrumb from '@component/Breadcrumb.svelte'
  import ExtendableText from '@layout/ExtendableText.svelte'

  let { institutionId, type = 'institution', isSelf = false } = $props()

  const name = isSelf ? 'Partie de' : entityNames[type]
  const icon = isSelf ? 'folderTreeInstitution' : 'institution'
</script>

{#if institutionId}
  <tr>
    <td><Icon type={icon} /> {name}</td>
    <td>
      <ExtendableText>
        <Breadcrumb type="institution" elemId={institutionId} {isSelf} />
      </ExtendableText>
    </td>
  </tr>
{/if}
