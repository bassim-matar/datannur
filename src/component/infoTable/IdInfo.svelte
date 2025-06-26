<script>
  import Icon from "@layout/Icon.svelte"
  import CopyText from "@layout/CopyText.svelte"

  let { id } = $props()
</script>

<tr>
  <td><Icon type="internal_id" /> Identifiant</td>
  <td><CopyText text={id} /></td>
</tr>
