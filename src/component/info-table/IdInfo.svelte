<script lang="ts">
  import Icon from '@layout/Icon.svelte'
  import CopyText from '@layout/CopyText.svelte'

  let { id } = $props()
</script>

<tr>
  <td><Icon type="internalId" /> Identifiant</td>
  <td><CopyText text={id} /></td>
</tr>
