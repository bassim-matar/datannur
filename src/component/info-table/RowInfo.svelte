<script lang="ts">
  import Render from '@lib/render'
  import Icon from '@layout/Icon.svelte'

  let { nbRow } = $props()
</script>

{#if nbRow}
  <tr>
    <td><Icon type="nb_row" /> Lignes</td>
    <td>{Render.num(nbRow)}</td>
  </tr>
{/if}
