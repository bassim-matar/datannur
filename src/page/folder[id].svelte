<script lang="ts">
  import db from "@db"
  import { tab_selected } from "@js/store"
  import {
    make_parents_relative,
    get_recursive,
    remove_duplicate_by_id,
    add_minimum_deep,
  } from "@js/db"
  import { is_big_limit } from "@js/constant"
  import { tabs_helper } from "@tab/tabs_helper"
  import Tags from "@js/Tags"
  import Tabs from "@tab/Tabs.svelte"

  import Title from "@layout/Title.svelte"
  import OpenAllSwitch from "@layout/OpenAllSwitch.svelte"
  import EvolutionSummarySwitch from "@layout/EvolutionSummarySwitch.svelte"

  let { folder } = $props()

  const docs = folder.docs_recursive

  const folders = db.get_all_childs("folder", folder.id)
  make_parents_relative(folder.id, folders)
  add_minimum_deep(folders)

  const datasets = get_recursive("folder", folder.id, "dataset")
  const variables = datasets.flatMap(dataset =>
    db.get_all("variable", { dataset }),
  )

  let modalities = variables.flatMap(variable => variable.modalities)
  let direct_modalities = db.get_all("modality", { folder })
  modalities = modalities.concat(direct_modalities)
  modalities = remove_duplicate_by_id(modalities)

  const tags = Tags.get_from_entities({ folders, datasets })
  make_parents_relative(false, tags)
  add_minimum_deep(tags)

  const modalities_id = new Set(modalities.map(item => item.id))
  const variables_id = new Set(variables.map(item => item.id))
  const datasets_id = new Set(datasets.map(item => item.id))
  const folders_id = new Set(folders.map(item => item.id))

  const evolutions = db
    .get_all("evolution")
    .filter(
      evo =>
        (evo.parent_entity === "modality" &&
          modalities_id.has(evo.parent_entity_id)) ||
        (evo.entity === "modality" && modalities_id.has(evo.id)) ||
        (evo.entity === "variable" && variables_id.has(evo.id)) ||
        (evo.entity === "dataset" && datasets_id.has(evo.id)) ||
        (evo.entity === "folder" &&
          (evo.id === folder.id || folders_id.has(evo.id))),
    )

  const stat = [
    { entity: "folder", items: folders },
    { entity: "tag", items: tags },
    { entity: "doc", items: docs },
    { entity: "dataset", items: datasets },
    { entity: "variable", items: variables },
    { entity: "modality", items: modalities },
  ]

  const tabs = tabs_helper({
    folder,
    folders,
    tags,
    docs,
    datasets,
    variables,
    modalities,
    evolutions,
    stat,
  })

  const nb_folder = folders.length
  let key_tab = $state(1)
  let show_open_all_switch = $derived(
    $tab_selected.key === "folders" && nb_folder > is_big_limit,
  )
  let show_evolution_summary_switch = $derived(
    $tab_selected.key === "evolutions" && evolutions.length > is_big_limit,
  )
</script>

<section class="section">
  <Title type="folder" name={folder.name} id={folder.id} />
  {#if show_open_all_switch}
    <OpenAllSwitch on_change={value => (key_tab = value)} />
  {/if}
  {#if show_evolution_summary_switch}
      <EvolutionSummarySwitch on_change={value => (key_tab = value)} />
    {/if}
  {#key key_tab}
    <Tabs {tabs} />
  {/key}
</section>
