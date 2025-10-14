<script lang="ts">
  import { onDestroy } from 'svelte'
  import jQuery from 'jquery'
  import 'jquery-powertip'
  import db from '@db'
  import {
    whenAppReady,
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
  import { dbAddProcessedData } from '@lib/db'
  import { loadUserData } from '@lib/user-data'
  import icon from '@img/icon.png'
  import iconDark from '@img/icon-dark.png'
  import search from '@search/search'
  import SearchHistory from '@search/search-history'
  import { DarkMode, darkModeTheme } from '@dark-mode/dark-mode'
  import { copyTextListenClick } from '@lib/copy-text'
  import { addValuesToAttribut } from '@stat/stat'
  import definition from '@stat/attributs-def'
  import defaultBanner from '@markdown/main/banner.md?raw'
  import Header from '@frame/Header.svelte'
  import Footer from '@frame/Footer.svelte'
  import Router from '@frame/Router.svelte'
  import Popup from '@layout/Popup.svelte'
  import Loading from '@page/_loading.svelte'
  import StatBox from '@stat/StatBox.svelte'
  import SearchBar from '@search/SearchBar.svelte'
  import dbSchema from '@src/assets/db-schema.json'
  import type { SearchHistoryEntry } from '@search/search-history'
  import type { Favorite } from '@favorite/favorites'
  import type { AttributWithValues } from '@stat/stat'
  import type { Log, MainEntityName } from '@src/type'

  let errorLoadingDb = $state(false)
  let pageLoadedRoute = $state('')

  let isPopupColumnStatOpen = $state(false)
  let columnStatEntity: MainEntityName | 'log' | undefined = $state()
  let columnStatAttribut: AttributWithValues | undefined = $state()

  const timer = performance.now()

  $isSmallMenu = getIsSmallMenu()
  function onResize() {
    $isSmallMenu = getIsSmallMenu()
  }

  function setOptionDefault(key: string, value = true) {
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
    setOptionDefault('roundedDesign')
    setOptionDefault('openAllRecursive')
    setOptionDefault('evolutionSummary', false)
    setOptionDefault('pageShadowColored', false)
    console.log('init option', Math.round(performance.now() - timer) + ' ms')
  })()

  DarkMode.init()

  $whenAppReady = (async () => {
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
      const userData = await loadUserData()
      db.addMeta(userData, dbSchema as string[][])
      dbAddProcessedData()
      console.log('process db', Math.round(performance.now() - timer) + ' ms')

      timer = performance.now()
      search.init()
      Logs.init(userData.log as Log[] | null)
      Favorites.init(userData.favorite as Favorite[])
      SearchHistory.init(userData.searchHistory as SearchHistoryEntry[], {
        limit: 100,
      })
    } catch (e) {
      console.error(e)
      errorLoadingDb = true
    }
  })()

  async function checkFromSearch(pageHashValue: string) {
    await $whenAppReady
    const fromSearch = UrlParam.get('from_search')
    if (fromSearch) {
      const entity = pageHashValue as MainEntityName
      const entityId = UrlHash.getLevel2()
      SearchHistory.add(entity, entityId)
      Logs.add('searchBar', { entity, entityId })
      UrlParam.delete('from_search')
      UrlParam.delete('search')
    }
  }

  $pageHash = UrlHash.getLevel1()
  pageHash.subscribe(pageHashValue => checkFromSearch(pageHashValue))

  if (hasTouchScreen) {
    document.documentElement.classList.toggle('has-touch-screen')
  }

  const isDark = $darkModeTheme === 'dark'
  const favicon = isDark ? iconDark : icon

  jQuery('body').on('mouseover', '.use-tooltip', function (this: HTMLElement) {
    const elem = jQuery(this)
    if (!elem?.data('powertip-initialized')) {
      elem?.data('powertip-initialized', true)
      // @ts-expect-error - powerTip is a jQuery plugin
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      elem?.powerTip({
        placement: elem.hasClass('tooltip-top') ? 'n' : 's',
        smartPlacement: true,
        mouseOnToPopup: true,
      })
      // @ts-expect-error - powerTip is a jQuery plugin
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      elem?.powerTip('show')
    }
  })

  jQuery('body').on('click', '.column-stat-btn', function (this: HTMLElement) {
    const attributName = jQuery(this).data('attribut') as string
    columnStatEntity = jQuery(this).data('entity') as MainEntityName | 'log'
    columnStatAttribut = addValuesToAttribut($currentTabData, {
      key: attributName,
      ...definition[attributName],
    })
    if (columnStatAttribut) isPopupColumnStatOpen = true
  })

  copyTextListenClick()

  $whenAppReady.then(() => {
    console.log(db)
    const mainBanner = new Image()
    let bannerSrc = db.exists('config', 'banner')
      ? (db.getConfig('banner') as string)
      : defaultBanner
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
  <div id="wrapper" class:no-footer={!$footerVisible}>
    {#if errorLoadingDb}
      <div class="error-loading-db">
        <h2 class="title">Erreur de chargement</h2>
        <p>Erreur durant le chargement de la base de données.</p>
        <p>Veuillez réessayer de charger l'application plus tard.</p>
        <p>Si le problème persiste, contactez le support.</p>
      </div>
    {:else}
      {#await $whenAppReady}
        <Loading />
      {:then}
        {#if ($isSmallMenu && ($onPageSearch || $onPageHomepage)) || !$isSmallMenu}
          <SearchBar />
        {/if}
        <Router />
        <div id="db-loaded" style="display: none;"></div>
        <div
          id="page-loaded-route-{pageLoadedRoute}"
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
  {#if columnStatEntity && columnStatAttribut}
    <StatBox
      entity={columnStatEntity}
      attribut={columnStatAttribut}
      fromPopup={true}
    />
  {/if}
</Popup>

<style lang="scss">
  @use 'main.scss' as *;

  .error-loading-db {
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
