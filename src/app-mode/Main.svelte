<script lang="ts">
  import { onDestroy } from 'svelte'
  import jQuery from 'jquery'
  import 'jquery-powertip'
  import db from '@db'
  import {
    pageHash,
    footerVisible,
    isSmallMenu,
    pageContentLoaded,
    onPageHomepage,
    onPageSearch,
    currentTabData,
  } from '@lib/store'
  import Options from '@lib/options'
  import Logs from '@lib/logs'
  import Favorites from '@favorite/favorites'
  import MainFilter from '@lib/main-filter'
  import { isHttp, hasTouchScreen, getIsSmallMenu } from '@lib/util'
  import { UrlParam } from '@lib/url-param'
  import { UrlHash } from '@lib/url-hash'
  import { dbAddProcessedData, getUserData } from '@lib/db'
  import icon from '@img/icon.png'
  import iconDark from '@img/icon-dark.png'
  import Search from '@search/search'
  import SearchHistory from '@search/search-history'
  import { DarkMode, darkModeTheme } from '@dark-mode/dark-mode'
  import { copyTextListenClick } from '@lib/copy-text'
  import { addValuesToAttribut } from '@stat/stat'
  import definition from '@stat/attributs-def'
  import default_banner from '@markdown/main/banner.md?raw'
  import Header from '@frame/Header.svelte'
  import Footer from '@frame/Footer.svelte'
  import Router from '@frame/Router.svelte'
  import Popup from '@layout/Popup.svelte'
  import Loading from '@page/_loading.svelte'
  import StatBox from '@stat/StatBox.svelte'
  import SearchBar from '@search/SearchBar.svelte'
  import dbSchema from '@src/db-schema.json'

  let errorLoadingDb = $state(false)
  let pageLoadedRoute = $state('')

  let isPopupColumnStatOpen = $state(false)
  let columnStatEntity = $state()
  let columnStatAttribut = $state()

  const timer = performance.now()

  $isSmallMenu = getIsSmallMenu()
  function onResize() {
    $isSmallMenu = getIsSmallMenu()
  }

  function setOptionDefault(key, value = true) {
    let optionValue = Options.get(key)
    if (optionValue === undefined) {
      optionValue = value
      Options.set(key, value)
    }
    if (optionValue) {
      document.documentElement.classList.add(key)
    }
    return optionValue
  }

  Options.loaded = (async () => {
    let timer = performance.now()
    await Options.init()
    setOptionDefault('rounded_design')
    setOptionDefault('open_all_recursive')
    setOptionDefault('evolution_summary', false)
    setOptionDefault('page_shadow_colored', false)
    console.log('init option', Math.round(performance.now() - timer) + ' ms')
  })()

  DarkMode.init(Options)

  db.loaded = (async () => {
    try {
      let timer = performance.now()
      await MainFilter.init()
      const filter = {
        entity: 'dataset',
        variable: 'type',
        values: MainFilter.getTypeToFilter(),
      }
      console.log('init filter', Math.round(performance.now() - timer) + ' ms')

      timer = performance.now()
      const dbOption = {
        filter,
        aliases: [
          { table: 'institution', alias: 'owner' },
          { table: 'institution', alias: 'manager' },
        ],
      }
      await db.init(dbOption)
      console.log('load db', Math.round(performance.now() - timer) + ' ms')

      timer = performance.now()
      const userData = await getUserData()
      db.addMeta(userData, dbSchema as string[][])
      dbAddProcessedData()
      console.log('process db', Math.round(performance.now() - timer) + ' ms')

      timer = performance.now()
      const search = new Search()
      search.init()
      db.search = async (...args) => await search.search(...args)
      Logs.init(userData.log)
      Favorites.init(userData.favorite)
      SearchHistory.init(userData.search_history, { limit: 100 })
    } catch (e) {
      console.error(e)
      errorLoadingDb = true
    }
  })()

  async function checkFromSearch(pageHashValue) {
    await db.loaded
    const fromSearch = UrlParam.get('from_search')
    if (fromSearch) {
      const entity = pageHashValue
      const entityId = UrlHash.getLevel2()
      SearchHistory.add(entity, entityId)
      Logs.add('search_bar', { entity, entity_id: entityId })
      UrlParam.delete('from_search')
      UrlParam.delete('search')
    }
  }

  $pageHash = UrlHash.getLevel1()
  pageHash.subscribe(pageHashValue => checkFromSearch(pageHashValue))

  if (hasTouchScreen) {
    document.documentElement.classList.toggle('has_touch_screen')
  }

  const isDark = $darkModeTheme === 'dark'
  const favicon = isDark ? iconDark : icon

  jQuery('body').on('mouseover', '.use_tooltip', function (this: HTMLElement) {
    const elem = jQuery(this)
    if (!elem?.data('powertip_initialized')) {
      elem?.data('powertip_initialized', true)
      elem?.powerTip({
        placement: elem.hasClass('tooltip_top') ? 'n' : 's',
        smartPlacement: true,
        mouseOnToPopup: true,
      })
      elem?.powerTip('show')
    }
  })

  jQuery('body').on('click', '.column_stat_btn', function (this: HTMLElement) {
    const attributName = jQuery(this).data('attribut')
    columnStatEntity = jQuery(this).data('entity')
    columnStatAttribut = addValuesToAttribut($currentTabData, {
      key: attributName,
      ...definition[attributName],
    })
    if (columnStatAttribut) isPopupColumnStatOpen = true
  })

  copyTextListenClick()

  db.loaded.then(() => {
    const mainBanner = new Image()
    let bannerSrc = db.tableHasId('config', 'banner')
      ? (db.getConfig('banner') as string)
      : default_banner
    bannerSrc = bannerSrc?.split('(')[1]?.split(')')[0]
    mainBanner.src = bannerSrc?.replaceAll('{darkMode}', isDark ? '-dark' : '')
    mainBanner.onload = () => {
      const cssVarStyle = document.documentElement.style
      cssVarStyle.setProperty(
        '--main-banner-width',
        mainBanner.width.toString(),
      )
      cssVarStyle.setProperty(
        '--main-banner-height',
        mainBanner.height.toString(),
      )
    }

    console.log('init total', Math.round(performance.now() - timer) + ' ms')
  })

  const unsubscribe = pageContentLoaded.subscribe(value => {
    if (value !== false) {
      if (window.location.hash) {
        pageLoadedRoute = window.location.hash.split('#/')[1].split('?')[0]
      } else {
        pageLoadedRoute = window.location.pathname.substring(1)
      }
      pageLoadedRoute = pageLoadedRoute.replace(/\//g, '___')
    }
  })

  onDestroy(() => {
    unsubscribe()
  })
</script>

<svelte:head>
  <link href={favicon} rel="shortcut icon" type="image/png" />
  {#if isHttp}
    <link href="manifest.json?v=6" rel="manifest" />
  {/if}
</svelte:head>

<svelte:window onresize={onResize} />

{#await Options.loaded then}
  <Header />
  <div id="wrapper" class:no_footer={!$footerVisible}>
    {#if errorLoadingDb}
      <div class="error_loading_db">
        <h2 class="title">Erreur de chargement</h2>
        <p>Erreur durant le chargement de la base de données.</p>
        <p>Veuillez réessayer de charger l'application plus tard.</p>
        <p>Si le problème persiste, contactez le support.</p>
      </div>
    {:else}
      {#await db.loaded}
        <Loading />
      {:then}
        {#if ($isSmallMenu && ($onPageSearch || $onPageHomepage)) || !$isSmallMenu}
          <SearchBar />
        {/if}
        <Router />
        <div id="db_loaded" style="display: none;"></div>
        <div
          id="page_loaded_route_{pageLoadedRoute}"
          style="display: none;"
        ></div>
      {/await}
    {/if}
  </div>
  {#if !$isSmallMenu}
    <Footer />
  {/if}
{/await}

<Popup bind:isOpen={isPopupColumnStatOpen}>
  <StatBox
    entity={columnStatEntity}
    attribut={columnStatAttribut}
    fromPopup={true}
  />
</Popup>

<style lang="scss">
  @use 'main.scss' as *;

  .error_loading_db {
    position: absolute;
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 700px;
    h2 {
      color: $color-3;
    }
    p {
      margin: 0.5em 0;
    }
  }
</style>
