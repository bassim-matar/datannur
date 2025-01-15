<script>
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

  let { folder } = $props()

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

  const history = db
    .get_all("history")
    .filter(
      history =>
        (history.entity === "folder" && history.id === folder.id) ||
        (history.parent_entity === "folder" &&
          history.parent_entity_id === folder.id),
    )

  const stat = [
    { entity: "folder", items: folders },
    { entity: "tag", items: tags },
    { entity: "doc", items: folder.docs_recursive },
    { entity: "dataset", items: datasets },
    { entity: "variable", items: variables },
    { entity: "modality", items: modalities },
  ]

  const tabs = tabs_helper({
    folder,
    docs: folder.docs_recursive,
    folders,
    tags,
    datasets,
    variables,
    modalities,
    history,
    stat,
  })

  const nb_folder = folders.length
  let key_tab = $state(1)
  let show_open_all_switch = $derived(
    $tab_selected.key === "folders" && nb_folder > is_big_limit,
  )
</script>

<section class="section">
  <Title type="folder" name={folder.name} id={folder.id} />
  {#if show_open_all_switch}
    <OpenAllSwitch on_change={value => (key_tab = value)} />
  {/if}
  {#key key_tab}
    <Tabs {tabs} />
  {/key}
</section>
