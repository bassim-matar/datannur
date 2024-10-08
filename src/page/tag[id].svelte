<script>
  import db from "@db"
  import { make_parents_relative, add_minimum_deep } from "@js/db"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"
  import Title from "@layout/Title.svelte"

  export let tag

  let opposite = false
  let tabs

  let institutions
  let folders
  let datasets
  let variables

  let tags = db.get_all_childs("tag", tag.id)
  if (db.use.tag_recursive) {
    make_parents_relative(tag.id, tags)
    add_minimum_deep(tags)
  }

  const with_institutions = db.get_all("institution", { tag })
  const with_folders = db.get_all("folder", { tag })
  const with_datasets = db.get_all("dataset", { tag })
  const with_variables = db.get_all("variable", { tag })

  function get_opposite(entity, with_tag_items) {
    if (with_tag_items.length === 0) return []
    const all = []
    const ids = []
    for (let item of with_tag_items) {
      ids.push(item.id)
    }
    for (let item of db.get_all(entity)) {
      if (ids.includes(item.id)) continue
      all.push(item)
    }
    return all
  }

  function load_tabs(opposite) {
    if (opposite) {
      institutions = get_opposite("institution", with_institutions)
      folders = get_opposite("folder", with_folders)
      datasets = get_opposite("dataset", with_datasets)
      variables = get_opposite("variable", with_variables)
    } else {
      institutions = with_institutions
      folders = with_folders
      datasets = with_datasets
      variables = with_variables
    }

    make_parents_relative(false, folders)
    make_parents_relative(false, institutions)

    add_minimum_deep(institutions)
    add_minimum_deep(folders)

    const stat = [
      { entity: "institution", items: institutions },
      { entity: "folder", items: folders },
      { entity: "dataset", items: datasets },
      { entity: "variable", items: variables },
    ]

    tabs = tabs_helper({
      tag_info: tag,
      institutions,
      folders,
      tags,
      datasets,
      variables,
      stat,
    })
  }

  $: info = opposite ? "(absent)" : "(présent)"

  function toggle_opposite() {
    opposite = !opposite
    load_tabs(opposite)
  }

  load_tabs(opposite)
</script>

<section class="section">
  <Title
    type="tag"
    name={tag.name}
    id={tag.id}
    {info}
    toggle_info={toggle_opposite}
  />
  {#key opposite}
    <Tabs {tabs} />
  {/key}
</section>
