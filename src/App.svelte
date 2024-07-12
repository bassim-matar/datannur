<script>
  import "@src/style/from_bulma/minireset.scss"
  import "@src/style/from_bulma/generic.scss"
  import "@src/style/from_bulma/navbar.scss"
  import "@src/style/from_bulma/tabs.scss"
  import "@src/style/from_bulma/table.scss"
  import "@fortawesome/fontawesome-free/css/fontawesome.min.css"
  import "@fortawesome/fontawesome-free/css/solid.min.css"
  import "@fortawesome/fontawesome-free/css/brands.min.css"
  import "datatables.net-bm/css/dataTables.bulma.min.css"
  import "datatables.net-buttons-bm/css/buttons.bulma.min.css"
  import "datatables.net-fixedcolumns-bm/css/fixedColumns.bulma.min.css"
  import "datatables.net-fixedheader-bm/css/fixedHeader.bulma.min.css"
  import "datatables.net-scroller-bm/css/scroller.bulma.min.css"
  import "jquery-powertip/dist/css/jquery.powertip.min.css"
  import "@src/style/global.scss"
  import CheckDb from "@src/app_mode/CheckDb.svelte"
  import Main from "@src/app_mode/Main.svelte"
  import { app_mode } from "@js/util"
</script>

{#if app_mode === "check_db"}
  <CheckDb />
{:else}
  <Main />
{/if}
