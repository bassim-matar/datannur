<script>
  import Icon from "@layout/Icon.svelte"

  let { id } = $props()
</script>

<tr>
  <td><Icon type="internal_id" /> Identifiant</td>
  <td>{id}</td>
</tr>
