<script lang="ts">
  import { onMount } from 'svelte'
  import JSZip from 'jszip'
  import { saveAs } from 'file-saver'
  import db from '@db'
  import { pageContentLoaded } from '@lib/store'
  import Options from '@lib/options'
  import Logs from '@lib/logs'
  import Favorites from '@favorite/favorites'
  import SearchHistory from '@search/search-history'
  import Icon from '@layout/Icon.svelte'
  import { resetColsSearchCache } from '@lib/util'
  import { getUserData } from '@lib/db'
  import { UrlParam } from '@lib/url-param'
  import Switch from '@layout/Switch.svelte'
  import DarkModeSwitch from '@dark-mode/DarkModeSwitch.svelte'
  import BtnImport from '@layout/BtnImport.svelte'
  import Button from '@layout/Button.svelte'

  async function importUserData(zipFile) {
    const jszip = new JSZip()
    const zip = await jszip.loadAsync(zipFile)
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
    const dataFolder = jszip.folder('user_data')
    const userData = await getUserData()
    for (const [name, data] of Object.entries(userData)) {
      const filename = name + '.json'
      const jsonData = JSON.stringify(data, null, 2)
      dataFolder.file(filename, jsonData)
    }
    jszip.generateAsync({ type: 'blob' }).then(function (content) {
      saveAs(content, 'datannur_user_data.zip')
    })
  }

  let openAllRecursive = $state(Options.get('open_all_recursive'))
  function updateOpenAllRecursive() {
    Options.set('open_all_recursive', openAllRecursive)
  }

  let evolutionSummary = $state(Options.get('evolution_summary'))
  function updateEvolutionSummary() {
    Options.set('evolution_summary', evolutionSummary)
  }

  let openAllTab = $state(Options.get('open_all_tab'))
  function updateOpenAllTab() {
    Options.set('open_all_tab', openAllTab)
  }

  let roundedDesign = $state(Options.get('rounded_design'))
  function updateRoundedDesign() {
    Options.set('rounded_design', roundedDesign)
    document.documentElement.classList.toggle('rounded_design')
  }

  let pageShadowColored = $state(Options.get('page_shadow_colored'))
  function updatePageShadowColored() {
    Options.set('page_shadow_colored', pageShadowColored)
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
    $pageContentLoaded = true
  })
</script>

<div class="flex_cols">
  <div class="flex_col">
    <h5 class="title is-5">Affichage</h5>
    <Switch
      bind:value={openAllRecursive}
      change={updateOpenAllRecursive}
      treeSwitch={true}
    >
      Afficher les éléments imbriqués (institutions et dossiers)
    </Switch>
    <Switch
      bind:value={evolutionSummary}
      change={updateEvolutionSummary}
      treeSwitch={true}
      minimize={true}
    >
      Afficher les évolultions de façon résumée
    </Switch>
    <Switch bind:value={openAllTab} change={updateOpenAllTab}>
      Charger tous les onglets automatiquement
    </Switch>
    <Switch bind:value={roundedDesign} change={updateRoundedDesign}>
      Design arrondi
    </Switch>
    <Switch bind:value={pageShadowColored} change={updatePageShadowColored}>
      mode néon (onglets colorés)
    </Switch>
    <div>
      <DarkModeSwitch label="Mode sombre" />
    </div>
  </div>

  <div class="flex_col">
    <h5 class="title is-5">Réinitialiser</h5>
    <Button onclick={clearLogs}>
      Logs <Icon type="log" marginLeft={true} />
    </Button>
    <Button onclick={clearFavorite}>
      Favoris <Icon type="favorite" marginLeft={true} />
    </Button>
    <Button onclick={resetColsSearchCache}>
      Filtres de colonne <Icon type="colSearch" marginLeft={true} />
    </Button>
    <Button onclick={clearHistorySearch}>
      Recherches récentes <Icon type="recentSearch" marginLeft={true} />
    </Button>
    <Button onclick={clearAll}>Tout</Button>
  </div>

  <div class="flex_col">
    <h5 class="title is-5">Mes données utilisateur</h5>
    <Button onclick={downloadUserData}>
      Exporter <Icon type="download" marginLeft={true} />
    </Button>
    <BtnImport onImport={importUserData}>
      Importer <Icon type="upload" marginLeft={true} />
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
