<script lang="ts">
  import { onMount } from 'svelte'
  import { tabSelected, footerVisible, allTabs } from '@lib/store'
  import { UrlParam } from '@lib/url-param'
  import { isFirefox, getIsMobile } from '@lib/util'
  import { isBigLimit } from '@lib/constant'
  import Logs from '@lib/logs'
  import TabsBody from '@tab/TabsBody.svelte'
  import TabTitle from '@tab/TabTitle.svelte'

  let { tabs } = $props()

  let isMobile = getIsMobile()
  let allKeys = []
  let hasReverseScroll = !isFirefox

  let activeTab = $state(tabs[0]?.key)
  let activeTabBody = $state(tabs[0]?.key)
  let tabsLoaded = $state({ activeTab: 1 })
  let tabsTitleKey = $state(isMobile)
  let ul: HTMLDivElement | null = $state()
  let isLastTab = $state()

  let noFirstTab = $derived(activeTab !== tabs[0]?.key)

  const getWidth = selector => document.querySelector(selector)?.offsetWidth

  function isTabsOverflow() {
    return getWidth('.tabs_container_ul') + 30 > getWidth('#tabs_container')
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

  function loadTab(tabKey) {
    if (!allKeys.includes(tabKey)) return
    activeTab = tabKey
    activeTabBody = tabKey
    if (!(tabKey in tabsLoaded)) {
      tabsLoaded[tabKey] = 0
    }
    tabsLoaded[tabKey] += 1
  }

  function selectTab(tab) {
    const tabKey = tab.key
    loadTab(tabKey)
    setFooter(tab)
    $tabSelected = tab
    centerActiveTab()
    Logs.add('select_tab', { entity: tabKey })
    if (tabs[0].key === tabKey) {
      UrlParam.delete('tab')
    } else {
      UrlParam.set('tab', tabKey)
    }
  }

  function setFooter(tab) {
    if (tab.footerVisible === false) {
      $footerVisible = false
      return
    }
    $footerVisible = tab.footerVisible || tab.nb < isBigLimit
  }

  function centerActiveTab() {
    setTimeout(() => {
      const liActive = '#tabs_container ul.tabs_container_ul li.is-active'
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
  id="tabs_container"
  class="tabs is-boxed"
  class:no-first-tab={noFirstTab}
  class:is-last-tab={isLastTab}
  class:has-reverse-scroll={hasReverseScroll}
  bind:this={ul}
>
  {#key tabsTitleKey}
    <ul class="tabs_container_ul">
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
    @include scrollbar_light();

    & > ul {
      flex-grow: 0;
      border-bottom-width: 0;
      z-index: 1;
    }
  }

  .tabs.has-reverse-scroll {
    transform: rotateX(180deg);
    .tabs_container_ul {
      transform: rotateX(180deg);
    }
  }

  :global(html.has_touch_screen) {
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
