<script lang="ts">
  import db from '@db'
  import { whenAppReady, footerVisible } from '@lib/store'
  import { onPageHomepage, onPageSearch } from '@spa-core/router/router-store'
  import GenericRouter from '@spa-core/router/GenericRouter.svelte'
  import routerIndex from '@page/.router-index'
  import Logs from '@lib/logs'
  import SearchHistory from '@search/search-history'
  import { UrlParam, UrlHash } from '@spa-core/url'
  import Options from '@lib/options'
  import { hasTouchScreen, isSmallMenu } from '@spa-core/browser-utils'
  import { isHttp } from '@spa-core/url'
  import icon from '@img/icon.png'
  import iconDark from '@img/icon-dark.png'
  import { DarkMode, darkModeTheme } from '@dark-mode/dark-mode'
  import { copyTextListenClick } from '@lib/copy-text'
  import { initTooltips, initColumnStatBtn } from '@lib/tooltip-events'
  import defaultBanner from '@markdown/main/banner.md?raw'
  import Header from '@frame/Header.svelte'
  import Footer from '@frame/Footer.svelte'
  import Popup from '@layout/Popup.svelte'
  import StatBox from '@stat/StatBox.svelte'
  import SearchBar from '@search/SearchBar.svelte'
  import { initApp } from '@src/app-mode/app-init'
  import type { AttributWithValues } from '@stat/stat'
  import type { MainEntityName, EntityName } from '@src/type'

  let errorLoadingDb = $state(false)

  let isPopupColumnStatOpen = $state(false)
  let columnStatEntity: MainEntityName | 'log' | undefined = $state()
  let columnStatAttribut: AttributWithValues | undefined = $state()

  const timer = performance.now()

  Options.init({
    roundedDesign: true,
    openAllRecursive: true,
    evolutionSummary: false,
    pageShadowColored: false,
  })

  DarkMode.init()

  $whenAppReady = (async () => {
    try {
      await initApp()
    } catch (e) {
      console.error(e)
      errorLoadingDb = true
    }
  })()

  if (hasTouchScreen) {
    document.documentElement.classList.toggle('has-touch-screen')
  }

  const isDark = $darkModeTheme === 'dark'
  const favicon = isDark ? iconDark : icon

  initTooltips()
  initColumnStatBtn((entity, attribut) => {
    columnStatEntity = entity
    columnStatAttribut = attribut
    isPopupColumnStatOpen = true
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

    console.log(
      'init complete (with banner)',
      Math.round(performance.now() - timer) + ' ms',
    )
  })

  function handleRouteChange(ctx: {
    entity: string
    params: Record<string, unknown>
    entityId: string
  }) {
    setTimeout(() => {
      const fromSearch = UrlParam.get('from_search')
      if (fromSearch) {
        const entityId = UrlHash.getLevel2()
        if (entityId) {
          SearchHistory.add(ctx.entity as MainEntityName, entityId)
          Logs.add('searchBar', { entity: ctx.entity, entityId })
          UrlParam.delete('from_search')
          UrlParam.delete('search')
        }
      }
    }, 1)

    setTimeout(
      () =>
        Logs.add('loadPage', {
          entity: ctx.entity,
          ...(ctx.entityId && { entityId: ctx.entityId }),
        }),
      10,
    )
  }
</script>

<svelte:head>
  <link href={favicon} rel="shortcut icon" type="image/png" />
  {#if isHttp}
    <link href="manifest.json?v=6" rel="manifest" />
  {/if}
</svelte:head>

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
      {#if ($isSmallMenu && ($onPageSearch || $onPageHomepage)) || !$isSmallMenu}
        <SearchBar />
      {/if}
      <GenericRouter
        {routerIndex}
        whenAppReady={$whenAppReady}
        onRouteChange={handleRouteChange}
        getEntityData={(entity, id) => db.get(entity as EntityName, id)}
      />
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
