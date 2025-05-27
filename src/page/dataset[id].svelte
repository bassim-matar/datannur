<script>
  import db from "@db"
  import { remove_duplicate_by_id, get_lineage } from "@js/db"
  import { tabs_helper } from "@tab/tabs_helper"
  import Tabs from "@tab/Tabs.svelte"
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

  const modalities_id = new Set(modalities.map(item => item.id))

  const datasets = [
    ...get_lineage("dataset", dataset, "source"),
    ...get_lineage("dataset", dataset, "derived"),
  ]

  const evolutions = db
    .get_all("evolution")
    .filter(
      evo =>
        (evo.entity === "dataset" && evo.id === dataset.id) ||
        (evo.parent_entity === "dataset" &&
          evo.parent_entity_id === dataset.id) ||
        (evo.parent_entity === "modality" &&
          modalities_id.has(evo.parent_entity_id)) ||
        (evo.entity === "modality" && modalities_id.has(evo.id)),
    )

  const stat = [
    { entity: "doc", items: dataset.docs },
    { entity: "variable", items: dataset_variables },
    { entity: "modality", items: modalities },
  ]

  let tabs = tabs_helper({
    dataset,
    docs: dataset.docs,
    datasets,
    dataset_variables,
    modalities,
    dataset_preview,
    evolutions,
    stat,
  })
</script>

<section class="section">
  <Title type="dataset" name={dataset.name} id={dataset.id} />
  <Tabs {tabs} />
</section>
