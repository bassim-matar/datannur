<script lang="ts">
  import db from "@db"
  import { nb_favorite } from "@lib/store"
  import { make_parents_relative, add_minimum_deep } from "@lib/db"
  import Title from "@layout/Title.svelte"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"
  import about_file from "@markdown/about_favorite.md?raw"

  const institutions = db
    .get_all("institution")
    .filter(item => item.is_favorite)
  const folders = db.get_all("folder").filter(item => item.is_favorite)
  const tags = db.get_all("tag").filter(item => item.is_favorite)
  const docs = db.get_all("doc").filter(item => item.is_favorite)
  const datasets = db.get_all("dataset").filter(item => item.is_favorite)
  const variables = db.get_all("variable").filter(item => item.is_favorite)
  const modalities = db.get_all("modality").filter(item => item.is_favorite)
  const evolutions = db.get_all("evolution").filter(item => item.is_favorite)

  const all_fav = [
    ...institutions,
    ...folders,
    ...tags,
    ...docs,
    ...datasets,
    ...variables,
    ...modalities,
  ]

  make_parents_relative(false, folders)
  make_parents_relative(false, institutions)

  add_minimum_deep(institutions, true, true)
  add_minimum_deep(folders, true, true)

  if (db.use.tag_recursive) {
    make_parents_relative(false, tags)
    add_minimum_deep(tags, true, true)
  }

  const stat = [
    { entity: "institution", items: institutions },
    { entity: "folder", items: folders },
    { entity: "tag", items: tags },
    { entity: "doc", items: docs },
    { entity: "dataset", items: datasets },
    { entity: "variable", items: variables },
    { entity: "modality", items: modalities },
  ]

  const tabs = tabs_helper({
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
    name_sup="<span class='num_style big'>{$nb_favorite}</span>"
    mode="main_title"
  />
  <Tabs {tabs} />
</section>
