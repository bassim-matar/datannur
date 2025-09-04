<script lang="ts">
  import Render from "@js/Render"
  import Icon from "@layout/Icon.svelte"

  let { nb_row } = $props()
</script>

{#if nb_row}
  <tr>
    <td><Icon type="nb_row" /> Lignes</td>
    <td>{Render.num(nb_row)}</td>
  </tr>
{/if}
