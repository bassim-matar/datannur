<script>
  import db from "@db"
  import {
    make_parents_relative,
    get_recursive,
    remove_duplicate_by_id,
    add_minimum_deep,
  } from "@js/db"
  import Tags from "@js/Tags"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"
  import Title from "@layout/Title.svelte"

  export let folder

  let folders = db.get_all_childs("folder", folder.id)
  make_parents_relative(folder.id, folders)
  add_minimum_deep(folders)

  let datasets = get_recursive("folder", folder.id, "dataset")
  let variables = []
  for (const dataset of datasets) {
    variables = variables.concat(db.get_all("variable", { dataset }))
  }

  let modalities = []
  for (const variable of variables) {
    modalities = modalities.concat(variable.modalities)
  }
  let direct_modalities = db.get_all("modality", { folder })
  modalities = modalities.concat(direct_modalities)
  modalities = remove_duplicate_by_id(modalities)

  const tags = Tags.get_from_entities({ folders, datasets })
  make_parents_relative(false, tags)
  add_minimum_deep(tags)

  const stat = [
    { entity: "folder", items: folders },
    { entity: "tag", items: tags },
    { entity: "doc", items: folder.docs_recursive },
    { entity: "dataset", items: datasets },
    { entity: "variable", items: variables },
    { entity: "modality", items: modalities },
  ]

  let tabs = tabs_helper({
    folder_info: folder,
    docs: folder.docs_recursive,
    folders,
    tags,
    datasets,
    variables,
    modalities,
    stat,
  })
</script>

<section class="section">
  <Title type="folder" name={folder.name} id={folder.id} />
  <Tabs {tabs} />
</section>
