<script lang="ts">
  import { onMount } from 'svelte'
  import { tabSelected, footerVisible, allTabs } from '@lib/store'
  import { UrlParam } from '@lib/url-param'
  import { is_firefox, getIsMobile } from '@lib/util'
  import { is_big_limit } from '@lib/constant'
  import Logs from '@lib/logs'
  import TabsBody from '@tab/TabsBody.svelte'
  import TabTitle from '@tab/TabTitle.svelte'

  let { tabs } = $props()

  let is_mobile = getIsMobile()
  let all_keys = []
  let has_reverse_scroll = !is_firefox

  let active_tab = $state(tabs[0]?.key)
  let active_tab_body = $state(tabs[0]?.key)
  let tabs_loaded = $state({ active_tab: 1 })
  let tabs_title_key = $state(is_mobile)
  let ul: HTMLDivElement | null = $state()
  let is_last_tab = $state()

  let no_first_tab = $derived(active_tab !== tabs[0]?.key)

  const getWidth = selector => document.querySelector(selector)?.offsetWidth

  function isTabsOverflow() {
    return getWidth('.tabs_container_ul') + 30 > getWidth('#tabs_container')
  }

  function checkIfLastTab() {
    return (
      tabs.length > 0 &&
      active_tab === tabs[tabs.length - 1].key &&
      isTabsOverflow()
    )
  }

  function onResize() {
    is_last_tab = checkIfLastTab()
    is_mobile = getIsMobile()
    if (!tabs_title_key && is_mobile) {
      tabs_title_key = true
    }
  }

  function loadTab(tab_key) {
    if (!all_keys.includes(tab_key)) return
    active_tab = tab_key
    active_tab_body = tab_key
    if (!(tab_key in tabs_loaded)) {
      tabs_loaded[tab_key] = 0
    }
    tabs_loaded[tab_key] += 1
  }

  function selectTab(tab) {
    const tab_key = tab.key
    loadTab(tab_key)
    setFooter(tab)
    $tabSelected = tab
    centerActiveTab()
    Logs.add('select_tab', { entity: tab_key })
    if (tabs[0].key === tab_key) {
      UrlParam.delete('tab')
    } else {
      UrlParam.set('tab', tab_key)
    }
  }

  function setFooter(tab) {
    if (tab.footer_visible === false) {
      $footerVisible = false
      return
    }
    $footerVisible = tab.footer_visible || tab.nb < is_big_limit
  }

  function centerActiveTab() {
    setTimeout(() => {
      const li_active = '#tabs_container ul.tabs_container_ul li.is-active'
      const li: HTMLLIElement | null = document.querySelector(li_active)
      if (!li || !ul) return
      const position = ul.offsetWidth / 2 - li.offsetWidth / 2
      ul.scrollLeft = 0 - (position - li.offsetLeft)
    }, 1)
  }

  function setupTabs() {
    for (const tab of tabs) {
      all_keys.push(tab.key)
      $allTabs[tab.icon] = { ...tab }
    }
  }

  function loadTabFromUrlParam() {
    const url_param_tab = UrlParam.get('tab')
    if (url_param_tab) {
      loadTab(url_param_tab)
    }
  }

  function setupActiveTab() {
    for (const tab of tabs) {
      if (active_tab_body === tab.key) {
        setFooter(tab)
        $tabSelected = tab
      }
    }
  }

  onMount(() => {
    centerActiveTab()
  })

  $effect(() => {
    void active_tab
    is_last_tab = checkIfLastTab()
  })

  setupTabs()
  loadTabFromUrlParam()
  setupActiveTab()
</script>

<svelte:window onresize={onResize} />

<div
  id="tabs_container"
  class="tabs is-boxed"
  class:no-first-tab={no_first_tab}
  class:is-last-tab={is_last_tab}
  class:has-reverse-scroll={has_reverse_scroll}
  bind:this={ul}
>
  {#key tabs_title_key}
    <ul class="tabs_container_ul">
      {#each tabs as tab (tab.key)}
        <TabTitle {tab} bind:active_tab {selectTab} />
      {/each}
    </ul>
  {/key}
</div>

<TabsBody {tabs} {no_first_tab} {is_last_tab} {active_tab_body} {tabs_loaded} />

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
