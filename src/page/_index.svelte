<script lang="ts">
  import db from "@db"
  import { tab_selected } from "@lib/store"
  import { make_parents_relative, add_minimum_deep } from "@lib/db"
  import { is_big_limit } from "@lib/constant"
  import { tabs_helper } from "@tab/tabs_helper"
  import { get_about_main } from "@lib/get_about_main"
  import Head from "@frame/Head.svelte"
  import Tabs from "@tab/Tabs.svelte"
  import OpenAllSwitch from "@layout/OpenAllSwitch.svelte"
  import EvolutionSummarySwitch from "@layout/EvolutionSummarySwitch.svelte"

  let key_tab = $state(1)

  let institutions = db.get_all("institution")
  let folders = db.get_all("folder")
  let tags = db.get_all("tag")
  const datasets = db.get_all("dataset")
  const variables = db.get_all("variable")
  const modalities = db.get_all("modality")
  const docs = db.get_all("doc")
  const evolutions = db.get_all("evolution")

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
    about_file: get_about_main(),
    institutions,
    folders,
    tags,
    docs,
    datasets,
    variables,
    modalities,
    evolutions,
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

  const nb_institution = institutions.length
  const nb_folder = folders.length
  const nb_tag = tags.length

  let show_open_all_switch = $derived(
    ($tab_selected.key === "institutions" && nb_institution > is_big_limit) ||
      ($tab_selected.key === "folders" && nb_folder > is_big_limit) ||
      ($tab_selected.key === "tags" && nb_tag > is_big_limit),
  )

  let show_evolution_summary_switch = $derived(
    $tab_selected.key === "evolutions" && evolutions.length > is_big_limit,
  )
</script>

<Head title="datannur | Accueil" description="Page d'accueil de datannur" />

<section class="section">
  {#if all_empty}
    <p class="has-text-centered">Le catalogue est vide.</p>
    <p class="has-text-centered">Vous pouvez ajouter du contenu.</p>
  {:else}
    {#if show_open_all_switch}
      <OpenAllSwitch on_change={value => (key_tab = value)} />
    {/if}
    {#if show_evolution_summary_switch}
      <EvolutionSummarySwitch on_change={value => (key_tab = value)} />
    {/if}
    {#key key_tab}
      <Tabs {tabs} />
    {/key}
  {/if}
</section>

<style lang="scss">
  .section {
    margin-top: 80px;
  }
</style>
