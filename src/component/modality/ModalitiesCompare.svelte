<script>
  import db from "@db"
  import { modalities_similitutes, tab_selected } from "@js/store"
  import Column from "@js/Column"
  import Render from "@js/Render"
  import { link, worker } from "@js/util"
  import {modality_compare_worker} from "@js/modality_compare_worker"
  import Datatable from "@datatable/Datatable.svelte"
  import Loading from "@frame/Loading.svelte"

  export let modalities_compare
  export let load_first = false

  let similitutes = []
  let loading = true

  ;(async () => {
    if ($modalities_similitutes) {
      similitutes = $modalities_similitutes
      return false
    }
    modalities_compare = db.get_all("modality")
    similitutes = await worker({ modalities_compare, limit: 50000 }, modality_compare_worker)
    $modalities_similitutes = similitutes
    loading = false
    if (similitutes.length === 0) $tab_selected.nb = 0
  })()

  const columns = [
    {
      data: "ratio",
      title: Render.icon("compare") + "Similitude",
      render: data => `${data}%`,
    },
    {
      data: "modality_1_id",
      title: Render.icon("modality") + "Modalité",
      render: (data, type, row) =>
        link("modality/" + data, row.modality_1_name),
    },
    Column.folder("modality_1_folder_id", "modality_1_folder_name"),
    {
      data: "modality_1_type",
      title: Render.icon("type") + "Type",
    },
    {
      data: "modality_1_nb_value",
      title: Render.icon("value") + "Valeurs",
      render: Render.num,
    },
    {
      data: "modality_1_nb_variable",
      title: Render.icon("variable") + "Variables",
      render: Render.num,
    },
    {
      data: "modality_2_id",
      title: Render.icon("modality") + "Similaire à",
      render: (data, type, row) =>
        link("modality/" + data, row.modality_2_name),
    },
    Column.folder("modality_2_folder_id", "modality_2_folder_name"),
    {
      data: "modality_2_type",
      title: Render.icon("type") + "Type",
    },
    {
      data: "modality_2_nb_value",
      title: Render.icon("value") + "Valeurs",
      render: Render.num,
    },
    {
      data: "modality_2_nb_variable",
      title: Render.icon("variable") + "Variables",
      render: Render.num,
    },
  ]
</script>

{#if loading && similitutes.length === 0}
  <Loading type="tab_body" color_entity="compare" />
{:else if similitutes.length > 0}
  <Datatable
    entity="compare"
    data={similitutes}
    {columns}
    {load_first}
  />
{:else}
  <div style="padding: 20px; text-align: center;">
    Aucune similitude trouvée
  </div>
{/if}
