<script>
  import Render from "@js/Render"
  import Icon from "@layout/Icon.svelte"

  export let nb_row
</script>

{#if nb_row}
  <tr>
    <td><Icon type="nb_row" /> Lignes</td>
    <td>{Render.num(nb_row)}</td>
  </tr>
{/if}
