<script lang="ts">
  import Icon from '@layout/Icon.svelte'
  import CopyText from '@layout/CopyText.svelte'

  let { dataPath } = $props()
</script>

{#if dataPath}
  <tr>
    <td><Icon type="dataPath" /> Emplacement</td>
    <td><CopyText text={dataPath} /></td>
  </tr>
{/if}
