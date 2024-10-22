<script>
  import { onMount } from "svelte"
  import { tab_selected, footer_visible, all_tabs } from "@js/store"
  import { url_param } from "@js/url_param"
  import { is_firefox, get_is_mobile } from "@js/util"
  import { is_big_limit } from "@js/constant"
  import Logs from "@js/Logs"
  import TabsBody from "@tab/TabsBody.svelte"
  import TabTitle from "@tab/TabTitle.svelte"

  export let tabs

  let active_tab = tabs[0]?.key
  let active_tab_body = tabs[0]?.key
  let tabs_loaded = {}
  let all_keys = []
  let ul
  let is_mobile = get_is_mobile()
  let tabs_title_key = is_mobile

  let has_reverse_scroll = !is_firefox
  
  const get_width = selector => document.querySelector(selector)?.offsetWidth

  function is_tabs_overflow() {
    return get_width(".tabs_container_ul") + 30 > get_width("#tabs_container")
  }

  function check_if_last_tab() {
    return active_tab === tabs[tabs.length - 1].key && is_tabs_overflow()
  }

  function on_resize() {
    is_last_tab = check_if_last_tab()
    is_mobile = get_is_mobile()
    if (!tabs_title_key && is_mobile) {
      tabs_title_key = true
    }
  }

  function load_tab(tab_key) {
    if (!all_keys.includes(tab_key)) return
    active_tab = tab_key
    active_tab_body = tab_key
    if (!(tab_key in tabs_loaded)) {
      tabs_loaded[tab_key] = 0
    }
    tabs_loaded[tab_key] += 1
  }

  function select_tab(tab) {
    const tab_key = tab.key
    load_tab(tab_key)
    set_footer(tab)
    $tab_selected = tab
    center_active_tab()
    Logs.add("select_tab", { entity: tab_key })
    if (tabs[0].key === tab_key) {
      url_param.delete("tab")
    } else {
      url_param.set("tab", tab_key)
    }
  }

  function set_footer(tab) {
    if (tab.footer_visible === false) {
      $footer_visible = false
      return
    }
    $footer_visible = tab.footer_visible || tab.nb < is_big_limit
  }

  function center_active_tab() {
    setTimeout(() => {
      const li_active = "#tabs_container ul.tabs_container_ul li.is-active"
      const li = document.querySelector(li_active)
      if (!li || !ul) return
      const position = ul.offsetWidth / 2 - li.offsetWidth / 2
      ul.scrollLeft = 0 - (position - li.offsetLeft)
    }, 1)
  }

  for (const tab of tabs) {
    all_keys.push(tab.key)
    $all_tabs[tab.icon] = tab
    if (!tab.without_load) {
      tab.props.load_first = active_tab_body === tab.key
    }
  }

  const url_param_tab = url_param.get("tab")
  if (url_param_tab) {
    load_tab(url_param_tab)
  }

  for (const tab of tabs) {
    if (active_tab_body === tab.key) {
      set_footer(tab)
      $tab_selected = tab
    }
  }

  onMount(() => {
    center_active_tab()
  })

  tabs_loaded[active_tab] = 1
  $: no_first_tab = active_tab !== tabs[0]?.key
  $: is_last_tab =
    tabs.length > 0 &&
    active_tab === tabs[tabs.length - 1].key &&
    is_tabs_overflow()
</script>

<svelte:window on:resize={on_resize} />

<div
  id="tabs_container"
  class="tabs is-boxed"
  class:no_first_tab
  class:is_last_tab
  class:has_reverse_scroll
  bind:this={ul}
>
  {#key tabs_title_key}
  <ul class="tabs_container_ul">
    {#each tabs as tab}
      <TabTitle bind:tab bind:active_tab {select_tab} />
    {/each}
  </ul>
  {/key}
</div>

<TabsBody
  bind:tabs
  {no_first_tab}
  {is_last_tab}
  {active_tab_body}
  {tabs_loaded}
/>

<style lang="scss">
  @use "../main.scss" as *;

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

  .tabs.has_reverse_scroll {
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
