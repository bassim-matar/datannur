<script lang="ts">
  import Icon from '@layout/Icon.svelte'

  let { level }: { level: number | undefined } = $props()
</script>

{#if level !== undefined}
  <tr>
    <td><Icon type="level" /> Niveau</td>
    <td>{level}</td>
  </tr>
{/if}
