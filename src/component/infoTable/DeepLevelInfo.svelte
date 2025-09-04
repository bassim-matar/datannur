<script lang="ts">
  import Icon from "@layout/Icon.svelte"

  let { level } = $props()
</script>

<tr>
  <td><Icon type="level" /> Niveau</td>
  <td>{level}</td>
</tr>
