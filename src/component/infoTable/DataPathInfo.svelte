<script>
  import Icon from "@layout/Icon.svelte"
  import CopyText from "@layout/CopyText.svelte"

  let { data_path } = $props()
</script>

{#if data_path}
  <tr>
    <td><Icon type="data_path" /> Emplacement</td>
    <td><CopyText text={data_path} /></td>
  </tr>
{/if}
