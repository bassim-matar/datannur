<script lang="ts">
  import { onMount } from "svelte"
  import JSZip from "jszip"
  import { saveAs } from "file-saver"
  import db from "@db"
  import { page_content_loaded } from "@js/store"
  import Options from "@js/Options"
  import Logs from "@js/Logs"
  import Favorites from "@favorite/Favorites"
  import SearchHistory from "@search/SearchHistory"
  import Icon from "@layout/Icon.svelte"
  import { reset_cols_search_cache } from "@js/util"
  import { get_user_data } from "@js/db"
  import { url_param } from "@js/url_param"
  import Switch from "@layout/Switch.svelte"
  import DarkModeSwitch from "@dark_mode/DarkModeSwitch.svelte"
  import BtnImport from "@layout/BtnImport.svelte"
  import Button from "@layout/Button.svelte"

  async function import_user_data(zip_file) {
    const jszip = new JSZip()
    const zip = await jszip.loadAsync(zip_file)
    for (const file of Object.values(zip.files)) {
      if (file.dir) continue
      const key = file.name.split(".json")[0]
      const content = await file.async("text")
      const data = JSON.parse(content)
      db.browser.set(key, data)
    }
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  async function download_user_data() {
    const jszip = new JSZip()
    const data_folder = jszip.folder("user_data")
    const user_data = await get_user_data()
    for (const [name, data] of Object.entries(user_data)) {
      const filename = name + ".json"
      const json_data = JSON.stringify(data, null, 2)
      data_folder.file(filename, json_data)
    }
    jszip.generateAsync({ type: "blob" }).then(function (content) {
      saveAs(content, "datannur_user_data.zip")
    })
  }

  let open_all_recursive = $state(Options.get("open_all_recursive"))
  function update_open_all_recursive() {
    Options.set("open_all_recursive", open_all_recursive)
  }

  let evolution_summary = $state(Options.get("evolution_summary"))
  function update_evolution_summary() {
    Options.set("evolution_summary", evolution_summary)
  }

  let open_all_tab = $state(Options.get("open_all_tab"))
  function update_open_all_tab() {
    Options.set("open_all_tab", open_all_tab)
  }

  let rounded_design = $state(Options.get("rounded_design"))
  function update_rounded_design() {
    Options.set("rounded_design", rounded_design)
    document.documentElement.classList.toggle("rounded_design")
  }

  let page_shadow_colored = $state(Options.get("page_shadow_colored"))
  function update_page_shadow_colored() {
    Options.set("page_shadow_colored", page_shadow_colored)
    document.documentElement.classList.toggle("page_shadow_colored")
  }

  function clear_logs() {
    Logs.clear()
    location.reload()
  }
  function clear_favorite() {
    Favorites.clear()
    location.reload()
  }
  function clear_history_search() {
    SearchHistory.clear()
  }
  function clear_all() {
    db.browser.clear()
    reset_cols_search_cache()
    url_param.reset()
    location.reload()
  }

  onMount(() => {
    $page_content_loaded = true
  })
</script>

<div class="flex_cols">
  <div class="flex_col">
    <h5 class="title is-5">Affichage</h5>
    <Switch
      bind:value={open_all_recursive}
      change={update_open_all_recursive}
      tree_switch={true}
    >
      Afficher les éléments imbriqués (institutions et dossiers)
    </Switch>
    <Switch
      bind:value={evolution_summary}
      change={update_evolution_summary}
      tree_switch={true}
      minimize={true}
    >
      Afficher les évolultions de façon résumée
    </Switch>
    <Switch bind:value={open_all_tab} change={update_open_all_tab}>
      Charger tous les onglets automatiquement
    </Switch>
    <Switch bind:value={rounded_design} change={update_rounded_design}>
      Design arrondi
    </Switch>
    <Switch
      bind:value={page_shadow_colored}
      change={update_page_shadow_colored}
    >
      mode néon (onglets colorés)
    </Switch>
    <div>
      <DarkModeSwitch label="Mode sombre" />
    </div>
  </div>

  <div class="flex_col">
    <h5 class="title is-5">Réinitialiser</h5>
    <Button onclick={clear_logs}>
      Logs <Icon type="log" margin_left={true} />
    </Button>
    <Button onclick={clear_favorite}>
      Favoris <Icon type="favorite" margin_left={true} />
    </Button>
    <Button onclick={reset_cols_search_cache}>
      Filtres de colonne <Icon type="col_search" margin_left={true} />
    </Button>
    <Button onclick={clear_history_search}>
      Recherches récentes <Icon type="recent_search" margin_left={true} />
    </Button>
    <Button onclick={clear_all}> Tout </Button>
  </div>

  <div class="flex_col">
    <h5 class="title is-5">Mes données utilisateur</h5>
    <Button onclick={download_user_data}>
      Exporter <Icon type="download" margin_left={true} />
    </Button>
    <BtnImport on_import={import_user_data}>
      Importer <Icon type="upload" margin_left={true} />
    </BtnImport>
  </div>
</div>

<style lang="scss">
  @use "main.scss" as *;

  .flex_cols {
    justify-content: center;
  }

  .title {
    text-align: center;
  }
</style>
