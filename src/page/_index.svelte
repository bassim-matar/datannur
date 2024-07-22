<script>
  import db from "@db"
  import { make_parents_relative, add_minimum_deep } from "@js/db"
  import Head from "@frame/Head.svelte"
  import Tabs from "@tab/Tabs.svelte"
  import { tabs_helper } from "@tab/tabs_helper"

  let institutions = db.get_all("institution")
  let folders = db.get_all("folder")
  let tags = db.get_all("tag")
  const datasets = db.get_all("dataset")
  const variables = db.get_all("variable")
  const modalities = db.get_all("modality")
  const docs = db.get_all("doc")

  make_parents_relative(0, institutions)
  make_parents_relative(0, folders)
  add_minimum_deep(institutions)
  add_minimum_deep(folders)

  if (db.use.tag_recursive) {
    make_parents_relative(0, tags)
    add_minimum_deep(tags)
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

  let tabs = tabs_helper({
    info: "about_main",
    institutions,
    folders,
    tags,
    docs,
    datasets,
    variables,
    modalities,
    stat,
  })

  const all_empty =
    !db.use.institution &&
    !db.use.folder &&
    !db.use.tag &&
    !db.use.doc &&
    !db.use.dataset &&
    !db.use.variable &&
    !db.use.modality &&
    !db.use.about
</script>

<Head
  title="datannur | Accueil"
  description="Page d'accueil de datannur"
/>

<section class="section">
  {#if all_empty}
    <p class="has-text-centered">Le catalogue est vide.</p>
    <p class="has-text-centered">Vous pouvez ajouter du contenu.</p>
  {:else}
    <Tabs {tabs} />
  {/if}
</section>

<style lang="scss">
  .section {
    margin-top: 80px;
  }
</style>
