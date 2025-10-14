<script lang="ts">
  import { onMount } from 'svelte'
  import { tabSelected, footerVisible, allTabs } from '@lib/store'
  import { UrlParam } from '@lib/url-param'
  import { isFirefox, getIsMobile } from '@lib/util'
  import { isBigLimit } from '@lib/constant'
  import Logs from '@lib/logs'
  import TabsBody from '@tab/TabsBody.svelte'
  import TabTitle from '@tab/TabTitle.svelte'
  import type { Tab } from './tabs-helper'

  let { tabs }: { tabs: Tab[] } = $props()

  let isMobile = getIsMobile()
  let allKeys: unknown[] = []
  let hasReverseScroll = !isFirefox

  let activeTab = $state(tabs[0]?.key)
  let activeTabBody = $state(tabs[0]?.key)
  let tabsLoaded: { [key: string]: number } = $state({ activeTab: 1 })
  let tabsTitleKey = $state(isMobile)
  let ul: HTMLDivElement | undefined = $state()
  let isLastTab = $state(false)

  let noFirstTab = $derived(activeTab !== tabs[0]?.key)

  function getWidth(selector: string) {
    const elem: HTMLElement | null = document.querySelector(selector)
    return elem?.offsetWidth ?? 0
  }

  function isTabsOverflow() {
    return getWidth('.tabs-container-ul') + 30 > getWidth('#tabs-container')
  }

  function checkIfLastTab() {
    return (
      tabs.length > 0 &&
      activeTab === tabs[tabs.length - 1].key &&
      isTabsOverflow()
    )
  }

  function onResize() {
    isLastTab = checkIfLastTab()
    isMobile = getIsMobile()
    if (!tabsTitleKey && isMobile) {
      tabsTitleKey = true
    }
  }

  function loadTab(tabKey: string) {
    if (!allKeys.includes(tabKey)) return
    activeTab = tabKey
    activeTabBody = tabKey
    if (!(tabKey in tabsLoaded)) {
      tabsLoaded[tabKey] = 0
    }
    tabsLoaded[tabKey] += 1
  }

  function selectTab(tab: Tab) {
    const tabKey = tab.key
    loadTab(tabKey)
    setFooter(tab)
    $tabSelected = tab
    centerActiveTab()
    Logs.add('selectTab', { entity: tabKey })
    if (tabs[0].key === tabKey) {
      UrlParam.delete('tab')
    } else {
      UrlParam.set('tab', tabKey)
    }
  }

  function setFooter(tab: Tab) {
    if (tab.footerVisible === false) {
      $footerVisible = false
      return
    }
    $footerVisible =
      tab.footerVisible || (typeof tab.nb === 'number' && tab.nb < isBigLimit)
  }

  function centerActiveTab() {
    setTimeout(() => {
      const liActive = '#tabs-container ul.tabs-container-ul li.is-active'
      const li: HTMLLIElement | null = document.querySelector(liActive)
      if (!li || !ul) return
      const position = ul.offsetWidth / 2 - li.offsetWidth / 2
      ul.scrollLeft = 0 - (position - li.offsetLeft)
    }, 1)
  }

  function setupTabs() {
    for (const tab of tabs) {
      allKeys.push(tab.key)
      $allTabs[tab.icon] = { ...tab }
    }
  }

  function loadTabFromUrlParam() {
    const urlParamTab = UrlParam.get('tab')
    if (urlParamTab) {
      loadTab(urlParamTab)
    }
  }

  function setupActiveTab() {
    for (const tab of tabs) {
      if (activeTabBody === tab.key) {
        setFooter(tab)
        $tabSelected = tab
      }
    }
  }

  onMount(() => {
    centerActiveTab()
  })

  $effect(() => {
    void activeTab
    isLastTab = checkIfLastTab()
  })

  setupTabs()
  loadTabFromUrlParam()
  setupActiveTab()
</script>

<svelte:window onresize={onResize} />

<div
  id="tabs-container"
  class="tabs is-boxed"
  class:no-first-tab={noFirstTab}
  class:is-last-tab={isLastTab}
  class:has-reverse-scroll={hasReverseScroll}
  bind:this={ul}
>
  {#key tabsTitleKey}
    <ul class="tabs-container-ul">
      {#each tabs as tab (tab.key)}
        <TabTitle {tab} bind:activeTab {selectTab} />
      {/each}
    </ul>
  {/key}
</div>

<TabsBody {tabs} {noFirstTab} {isLastTab} {activeTabBody} {tabsLoaded} />

<style lang="scss">
  @use 'main.scss' as *;

  .tabs {
    margin-bottom: -1px;
    overflow-x: auto;
    z-index: 1;
    position: relative;
    @include scrollbar-light();

    & > ul {
      flex-grow: 0;
      border-bottom-width: 0;
      z-index: 1;
    }
  }

  .tabs.has-reverse-scroll {
    transform: rotateX(180deg);
    .tabs-container-ul {
      transform: rotateX(180deg);
    }
  }

  :global(html.has-touch-screen) {
    .tabs {
      scrollbar-width: none;
      -ms-overflow-style: none;
      &::-webkit-scrollbar {
        width: 0;
        height: 0;
        display: none;
      }
    }
  }
</style>
