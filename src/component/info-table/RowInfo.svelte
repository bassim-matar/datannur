<script lang="ts">
  import Render from '@lib/render'
  import Icon from '@layout/Icon.svelte'

  let { nbRow } = $props()
</script>

{#if nbRow}
  <tr>
    <td><Icon type="nbRow" /> Lignes</td>
    <td>{Render.num(nbRow)}</td>
  </tr>
{/if}
