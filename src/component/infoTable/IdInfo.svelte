<script>
  import Icon from "@layout/Icon.svelte"

  let { id } = $props()
</script>

<tr>
  <td><Icon type="key" /> Identifiant</td>
  <td>{id}</td>
</tr>
