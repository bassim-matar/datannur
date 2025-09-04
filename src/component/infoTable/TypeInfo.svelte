<script lang="ts">
  import Icon from "@layout/Icon.svelte"

  let { type } = $props()
</script>

<tr>
  <td><Icon type="type" /> Type</td>
  <td>{type}</td>
</tr>
