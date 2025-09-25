<script lang="ts">
  import { onMount } from 'svelte'
  import JSZip from 'jszip'
  import { saveAs } from 'file-saver'
  import db from '@db'
  import { page_content_loaded } from '@lib/store'
  import Options from '@lib/options'
  import Logs from '@lib/logs'
  import Favorites from '@favorite/favorites'
  import SearchHistory from '@search/search-history'
  import Icon from '@layout/Icon.svelte'
  import {resetColsSearchCache} from '@lib/util'
  import {getUserData} from '@lib/db'
  import { UrlParam } from '@lib/url-param'
  import Switch from '@layout/Switch.svelte'
  import DarkModeSwitch from '@dark-mode/DarkModeSwitch.svelte'
  import BtnImport from '@layout/BtnImport.svelte'
  import Button from '@layout/Button.svelte'

  async function importUserData(zip_file) {
    const jszip = new JSZip()
    const zip = await jszip.loadAsync(zip_file)
    for (const file of Object.values(zip.files)) {
      if (file.dir) continue
      const key = file.name.split('.json')[0]
      const content = await file.async('text')
      const data = JSON.parse(content)
      db.browser.set(key, data)
    }
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  async function downloadUserData() {
    const jszip = new JSZip()
    const data_folder = jszip.folder('user_data')
    const user_data = await getUserData()
    for (const [name, data] of Object.entries(user_data)) {
      const filename = name + '.json'
      const json_data = JSON.stringify(data, null, 2)
      data_folder.file(filename, json_data)
    }
    jszip.generateAsync({ type: 'blob' }).then(function (content) {
      saveAs(content, 'datannur_user_data.zip')
    })
  }

  let open_all_recursive = $state(Options.get('open_all_recursive'))
  function updateOpenAllRecursive() {
    Options.set('open_all_recursive', open_all_recursive)
  }

  let evolution_summary = $state(Options.get('evolution_summary'))
  function updateEvolutionSummary() {
    Options.set('evolution_summary', evolution_summary)
  }

  let open_all_tab = $state(Options.get('open_all_tab'))
  function updateOpenAllTab() {
    Options.set('open_all_tab', open_all_tab)
  }

  let rounded_design = $state(Options.get('rounded_design'))
  function updateRoundedDesign() {
    Options.set('rounded_design', rounded_design)
    document.documentElement.classList.toggle('rounded_design')
  }

  let page_shadow_colored = $state(Options.get('page_shadow_colored'))
  function updatePageShadowColored() {
    Options.set('page_shadow_colored', page_shadow_colored)
    document.documentElement.classList.toggle('page_shadow_colored')
  }

  function clearLogs() {
    Logs.clear()
    location.reload()
  }
  function clearFavorite() {
    Favorites.clear()
    location.reload()
  }
  function clearHistorySearch() {
    SearchHistory.clear()
  }
  function clearAll() {
    db.browser.clear()
    resetColsSearchCache()
    UrlParam.reset()
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
      change={updateOpenAllRecursive}
      tree_switch={true}
    >
      Afficher les éléments imbriqués (institutions et dossiers)
    </Switch>
    <Switch
      bind:value={evolution_summary}
      change={updateEvolutionSummary}
      tree_switch={true}
      minimize={true}
    >
      Afficher les évolultions de façon résumée
    </Switch>
    <Switch bind:value={open_all_tab} change={updateOpenAllTab}>
      Charger tous les onglets automatiquement
    </Switch>
    <Switch bind:value={rounded_design} change={updateRoundedDesign}>
      Design arrondi
    </Switch>
    <Switch
      bind:value={page_shadow_colored}
      change={updatePageShadowColored}
    >
      mode néon (onglets colorés)
    </Switch>
    <div>
      <DarkModeSwitch label="Mode sombre" />
    </div>
  </div>

  <div class="flex_col">
    <h5 class="title is-5">Réinitialiser</h5>
    <Button onclick={clearLogs}>
      Logs <Icon type="log" margin_left={true} />
    </Button>
    <Button onclick={clearFavorite}>
      Favoris <Icon type="favorite" margin_left={true} />
    </Button>
    <Button onclick={resetColsSearchCache}>
      Filtres de colonne <Icon type="col_search" margin_left={true} />
    </Button>
    <Button onclick={clearHistorySearch}>
      Recherches récentes <Icon type="recent_search" margin_left={true} />
    </Button>
    <Button onclick={clearAll}>Tout</Button>
  </div>

  <div class="flex_col">
    <h5 class="title is-5">Mes données utilisateur</h5>
    <Button onclick={downloadUserData}>
      Exporter <Icon type="download" margin_left={true} />
    </Button>
    <BtnImport onImport={importUserData}>
      Importer <Icon type="upload" margin_left={true} />
    </BtnImport>
  </div>
</div>

<style lang="scss">
  @use 'main.scss' as *;

  .flex_cols {
    justify-content: center;
  }

  .title {
    text-align: center;
  }
</style>
