<script>
  import db from "@db"
  import { make_parents_relative, add_minimum_deep } from "@js/db"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"
  import Title from "@layout/Title.svelte"

  let { tag } = $props()

  let opposite = $state(false)
  let tabs = $state()

  let institutions
  let folders
  let docs
  let datasets
  let variables
  let tags

  const with_institutions = db.get_all("institution", { tag })
  const with_folders = db.get_all("folder", { tag })
  const with_datasets = db.get_all("dataset", { tag })
  const with_variables = db.get_all("variable", { tag })
  const with_docs = db.get_all("doc", { tag })
  const with_tags = db.get_all_childs("tag", tag.id)

  function get_opposite(entity, with_tag_items, self_id = false) {
    if (with_tag_items.length === 0) return []
    const all = []
    const ids = []
    for (let item of with_tag_items) {
      ids.push(item.id)
    }
    for (let item of db.get_all(entity)) {
      if (ids.includes(item.id)) continue
      if (self_id && item.id === self_id) continue
      all.push(item)
    }
    return all
  }

  function load_tabs() {
    if (opposite) {
      institutions = get_opposite("institution", with_institutions)
      folders = get_opposite("folder", with_folders)
      docs = get_opposite("doc", with_docs)
      datasets = get_opposite("dataset", with_datasets)
      variables = get_opposite("variable", with_variables)
      tags = get_opposite("tag", with_tags, tag.id)
    } else {
      institutions = with_institutions
      folders = with_folders
      docs = with_docs
      datasets = with_datasets
      variables = with_variables
      tags = with_tags
    }

    make_parents_relative(false, institutions)
    make_parents_relative(false, folders)

    add_minimum_deep(institutions)
    add_minimum_deep(folders)

    if (db.use.tag_recursive) {
      make_parents_relative(tag.id, tags)
      add_minimum_deep(tags)
    }

    const evolutions = db
      .get_all("evolution")
      .filter(
        evo =>
          (evo.entity === "tag" && evo.id === tag.id) ||
          (evo.parent_entity === "tag" && evo.parent_entity_id === tag.id),
      )

    const stat = [
      { entity: "institution", items: institutions },
      { entity: "folder", items: folders },
      { entity: "doc", items: docs },
      { entity: "dataset", items: datasets },
      { entity: "variable", items: variables },
    ]

    tabs = tabs_helper({
      tag,
      institutions,
      folders,
      tags,
      docs,
      datasets,
      variables,
      evolutions,
      stat,
    })
  }

  let info = $derived(opposite ? "(absent)" : "(présent)")

  function toggle_opposite() {
    opposite = !opposite
    load_tabs()
  }

  load_tabs()
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
