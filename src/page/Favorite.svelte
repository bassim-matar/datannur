<script lang="ts">
  import db from '@db'
  import { makeParentsRelative, addMinimumDeep } from '@lib/db'
  import Title from '@layout/Title.svelte'
  import Tabs from '@tab/Tabs.svelte'
  import { tabsHelper } from '@tab/tabs-helper'
  import aboutFile from '@markdown/about-favorite.md?raw'

  const institutions = db.getAll('institution').filter(item => item.isFavorite)
  const folders = db.getAll('folder').filter(item => item.isFavorite)
  const tags = db.getAll('tag').filter(item => item.isFavorite)
  const docs = db.getAll('doc').filter(item => item.isFavorite)
  const datasets = db.getAll('dataset').filter(item => item.isFavorite)
  const variables = db.getAll('variable').filter(item => item.isFavorite)
  const modalities = db.getAll('modality').filter(item => item.isFavorite)
  const evolutions = db.getAll('evolution').filter(item => item.isFavorite)

  const allFav = [
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

  if (db.useRecursive.tag) {
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
    allFav,
    institutions,
    folders,
    tags,
    docs,
    datasets,
    variables,
    modalities,
    evolutions,
    stat,
    aboutFile,
  })
</script>

<section class="section">
  <Title
    type="favorite"
    name="Favoris"
    isFavoritePage={true}
    mode="mainTitle"
  />
  <Tabs {tabs} />
</section>
