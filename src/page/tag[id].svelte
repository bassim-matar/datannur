<script lang="ts">
  import db from '@db'
  import { tab_selected } from '@lib/store'
  import { is_big_limit } from '@lib/constant'
  import {
    make_parents_relative,
    add_minimum_deep,
    remove_duplicate_by_id,
  } from '@lib/db'
  import Tabs from '@tab/Tabs.svelte'
  import { tabsHelper } from '@tab/tabs-helper'
  import Title from '@layout/Title.svelte'
  import OpenAllSwitch from '@layout/OpenAllSwitch.svelte'

  let { tag } = $props()

  let opposite = $state(false)
  let tabs = $state()
  let key_tab = $state(-1)

  let institutions
  let folders
  let docs
  let datasets
  let variables
  let tags

  let with_institutions = db.getAll('institution', { tag })
  let with_folders = db.getAll('folder', { tag })
  let with_datasets = db.getAll('dataset', { tag })
  let with_variables = db.getAll('variable', { tag })
  let with_docs = db.getAll('doc', { tag })

  const with_tags = db.getAllChilds('tag', tag.id)

  for (const child_tag of with_tags) {
    const child_institutions = db.getAll('institution', { tag: child_tag })
    const child_folders = db.getAll('folder', { tag: child_tag })
    const child_datasets = db.getAll('dataset', { tag: child_tag })
    const child_variables = db.getAll('variable', { tag: child_tag })
    const child_docs = db.getAll('doc', { tag: child_tag })
    with_institutions = with_institutions.concat(child_institutions)
    with_folders = with_folders.concat(child_folders)
    with_datasets = with_datasets.concat(child_datasets)
    with_variables = with_variables.concat(child_variables)
    with_docs = with_docs.concat(child_docs)
  }
  with_institutions = remove_duplicate_by_id(with_institutions)
  with_folders = remove_duplicate_by_id(with_folders)
  with_datasets = remove_duplicate_by_id(with_datasets)
  with_variables = remove_duplicate_by_id(with_variables)
  with_docs = remove_duplicate_by_id(with_docs)

  function get_opposite(entity, with_tag_items, self_id = false) {
    if (with_tag_items.length === 0) return []
    const all = []
    const ids = []
    for (let item of with_tag_items) {
      ids.push(item.id)
    }
    for (let item of db.getAll(entity)) {
      if (ids.includes(item.id)) continue
      if (self_id && item.id === self_id) continue
      all.push(item)
    }
    return all
  }

  function load_tabs() {
    if (opposite) {
      institutions = get_opposite('institution', with_institutions)
      folders = get_opposite('folder', with_folders)
      docs = get_opposite('doc', with_docs)
      datasets = get_opposite('dataset', with_datasets)
      variables = get_opposite('variable', with_variables)
      tags = get_opposite('tag', with_tags, tag.id)
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

    const variables_id = new Set(variables.map(item => item.id))
    const datasets_id = new Set(datasets.map(item => item.id))
    const folders_id = new Set(folders.map(item => item.id))
    const institutions_id = new Set(institutions.map(item => item.id))

    const evolutions = db
      .getAll('evolution')
      .filter(
        evo =>
          (evo.entity === 'tag' && evo.id === tag.id) ||
          (evo.parent_entity === 'tag' && evo.parent_entity_id === tag.id) ||
          (evo.entity === 'variable' && variables_id.has(evo.id)) ||
          (evo.entity === 'dataset' && datasets_id.has(evo.id)) ||
          (evo.entity === 'folder' && folders_id.has(evo.id)) ||
          (evo.entity === 'institution' && institutions_id.has(evo.id)),
      )

    const stat = [
      { entity: 'institution', items: institutions },
      { entity: 'folder', items: folders },
      { entity: 'doc', items: docs },
      { entity: 'dataset', items: datasets },
      { entity: 'variable', items: variables },
    ]

    tabs = tabsHelper({
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

  let info = $derived(opposite ? '(absent)' : '(présent)')

  function toggle_opposite() {
    opposite = !opposite
    load_tabs()
  }

  load_tabs()

  let show_open_all_switch = $derived(
    $tab_selected.key === 'tags' && tags.length > is_big_limit,
  )
</script>

<section class="section">
  <Title
    type="tag"
    name={tag.name}
    id={tag.id}
    {info}
    toggle_info={toggle_opposite}
  />
  {#if show_open_all_switch}
    <OpenAllSwitch on_change={value => (key_tab = value)} />
  {/if}
  {#key Number(opposite) + key_tab}
    <Tabs {tabs} />
  {/key}
</section>
