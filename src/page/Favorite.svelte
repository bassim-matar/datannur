<script lang="ts">
  import db from '@db'
  import { makeParentsRelative, addMinimumDeep } from '@lib/db'
  import Title from '@layout/Title.svelte'
  import Tabs from '@tab/Tabs.svelte'
  import { tabsHelper } from '@tab/tabs-helper'
  import about_file from '@markdown/about-favorite.md?raw'

  const institutions = db.getAll('institution').filter(item => item.is_favorite)
  const folders = db.getAll('folder').filter(item => item.is_favorite)
  const tags = db.getAll('tag').filter(item => item.is_favorite)
  const docs = db.getAll('doc').filter(item => item.is_favorite)
  const datasets = db.getAll('dataset').filter(item => item.is_favorite)
  const variables = db.getAll('variable').filter(item => item.is_favorite)
  const modalities = db.getAll('modality').filter(item => item.is_favorite)
  const evolutions = db.getAll('evolution').filter(item => item.is_favorite)

  const all_fav = [
    ...institutions,
    ...folders,
    ...tags,
    ...docs,
    ...datasets,
    ...variables,
    ...modalities,
  ]

  makeParentsRelative(false, folders)
  makeParentsRelative(false, institutions)

  addMinimumDeep(institutions, true, true)
  addMinimumDeep(folders, true, true)

  if (db.use.tag_recursive) {
    makeParentsRelative(false, tags)
    addMinimumDeep(tags, true, true)
  }

  const stat = [
    { entity: 'institution', items: institutions },
    { entity: 'folder', items: folders },
    { entity: 'tag', items: tags },
    { entity: 'doc', items: docs },
    { entity: 'dataset', items: datasets },
    { entity: 'variable', items: variables },
    { entity: 'modality', items: modalities },
  ]

  const tabs = tabsHelper({
    all_fav,
    institutions,
    folders,
    tags,
    docs,
    datasets,
    variables,
    modalities,
    evolutions,
    stat,
    about_file,
  })
</script>

<section class="section">
  <Title
    type="favorite"
    name="Favoris"
    isFavoritePage={true}
    mode="main_title"
  />
  <Tabs {tabs} />
</section>
