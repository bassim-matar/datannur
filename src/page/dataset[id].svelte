<script>
  import db from "@db"
  import { remove_duplicate_by_id } from "@js/db"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"
  import Title from "@layout/Title.svelte"

  let { id } = $props()
  const dataset = db.get("dataset", id)

  let dataset_variables = db.get_all("variable", { dataset })
  dataset.nb_variable = dataset_variables.length
  if (dataset.folder_id) dataset.folder = db.get("folder", dataset.folder_id)
  if (dataset.owner_id) dataset.owner = db.get("institution", dataset.owner_id)
  if (dataset.manager_id)
    dataset.manager = db.get("institution", dataset.manager_id)

  let modalities = []
  for (const variable of dataset_variables) {
    modalities = modalities.concat(variable.modalities)
  }
  modalities = remove_duplicate_by_id(modalities)

  let dataset_preview = dataset.link ? dataset.id : false

  const history = db
    .get_all("history")
    .filter(
      history => history.entity === "dataset" && history.id === dataset.id,
    )

  const stat = [
    { entity: "doc", items: dataset.docs },
    { entity: "variable", items: dataset_variables },
    { entity: "modality", items: modalities },
  ]

  let tabs = tabs_helper({
    dataset,
    docs: dataset.docs,
    dataset_variables,
    modalities,
    dataset_preview,
    history,
    stat,
  })
</script>

<section class="section">
  <Title type="dataset" name={dataset.name} id={dataset.id} />
  <Tabs {tabs} />
</section>
