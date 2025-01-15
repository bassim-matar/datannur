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
  import Tags from "@js/Tags"
  import { tabs_helper } from "@tab/tabs_helper"
  import Tabs from "@tab/Tabs.svelte"
  import Title from "@layout/Title.svelte"
  import OpenAllSwitch from "@layout/OpenAllSwitch.svelte"

  let { institution } = $props()

  let key_tab = $state(1)

  const institutions = db.get_all_childs("institution", institution.id)
  make_parents_relative(institution.id, institutions)
  add_minimum_deep(institutions)

  const folders = get_recursive("institution", institution.id, "folder")
  make_parents_relative(false, folders)
  add_minimum_deep(folders)

  const datasets = get_recursive("institution", institution.id, "dataset")
  const variables = datasets.flatMap(dataset =>
    db.get_all("variable", { dataset }),
  )

  let modalities = variables.flatMap(variable => variable.modalities)
  modalities = remove_duplicate_by_id(modalities)

  const tags = Tags.get_from_entities({ institutions, folders, datasets })
  make_parents_relative(false, tags)
  add_minimum_deep(tags)

  const history = db
    .get_all("history")
    .filter(
      history =>
        (history.entity === "institution" && history.id === institution.id) ||
        (history.parent_entity === "institution" &&
          history.parent_entity_id === institution.id),
    )

  const stat = [
    { entity: "institution", items: institutions },
    { entity: "folder", items: folders },
    { entity: "tag", items: tags },
    { entity: "doc", items: institution.docs_recursive },
    { entity: "dataset", items: datasets },
    { entity: "variable", items: variables },
    { entity: "modality", items: modalities },
  ]

  const tabs = tabs_helper({
    institution,
    docs: institution.docs_recursive,
    institutions,
    folders,
    tags,
    datasets,
    variables,
    modalities,
    history,
    stat,
  })

  const nb_institution = institutions.length
  const nb_folder = folders.length
  let show_open_all_switch = $derived(
    ($tab_selected.key === "institutions" && nb_institution > is_big_limit) ||
      ($tab_selected.key === "folders" && nb_folder > is_big_limit),
  )
</script>

<section class="section">
  <Title type="institution" name={institution.name} id={institution.id} />
  {#if show_open_all_switch}
    <OpenAllSwitch on_change={value => (key_tab = value)} />
  {/if}
  {#key key_tab}
    <Tabs {tabs} />
  {/key}
</section>
