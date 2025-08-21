<script>
  import { onMount } from "svelte"
  import db from "@db"
  import { search_value, page_content_loaded } from "@js/store"
  import { url_param } from "@js/url_param"
  import Head from "@frame/Head.svelte"
  import Loading from "@frame/Loading.svelte"
  import Tabs from "@tab/Tabs.svelte"
  import SearchResult from "@search/SearchResult.svelte"
  import SearchHistory from "@search/SearchHistory"
  import AboutFile from "@layout/AboutFile.svelte"
  import about_search from "@markdown/search/about_search.md?raw"
  import no_result from "@markdown/search/no_result.md?raw"
  import no_recent_search from "@markdown/search/no_recent_search.md?raw"

  let is_loading = $state(true)
  let search_result_data = $state([])
  let tabs = $state([])
  let tab_key = $state()

  let recent_search_change = false

  function make_tab(name, icon, key, about_file) {
    return {
      name,
      icon,
      key,
      component: AboutFile,
      footer_visible: true,
      props: { about_file },
    }
  }
  const about_tab = make_tab("A propos", "about", "about", about_search)
  const no_result_tab = make_tab("Résultat", "search", "no_result", no_result)
  const no_recent_search_tab = make_tab(
    "Recherches récentes",
    "search",
    "no_recent_search",
    no_recent_search,
  )

  SearchHistory.on_change("search_page", () => search_input_change())

  function set_tab_key() {
    recent_search_change = !recent_search_change
    tab_key = recent_search_change
  }

  function init_search_recent() {
    search_result_data = SearchHistory.get_recent_search()
    const tab_name = "Recherches récentes"
    set_tabs(tab_name)
    is_loading = false
  }

  async function search_input_change() {
    const url_search_value = url_param.get("search")
    if (url_search_value !== $search_value) {
      url_param.set("search", $search_value)
    }
    if ($search_value === "") {
      url_param.delete("search")
      init_search_recent()
      return false
    }
    const value_before = $search_value
    const all_search_raw = await db.search($search_value)
    is_loading = false
    if ($search_value !== value_before) return false
    search_result_data = SearchHistory.put_recent_first(all_search_raw)
    set_tabs()
  }

  function set_tabs(name = "Résultat") {
    set_tab_key()
    if (search_result_data.length === 0) {
      tabs = [is_empty_input ? no_recent_search_tab : no_result_tab]
    } else {
      tabs = [
        {
          name,
          icon: "search",
          key: "search",
          component: SearchResult,
          nb: search_result_data.length,
          props: {
            search_result_data,
            search_value: $search_value,
          },
        },
      ]
    }
    tabs.push(about_tab)
  }

  let is_empty_input = $derived(["", undefined, null].includes($search_value))

  const url_search_value = url_param.get("search")
  if (url_search_value !== false && url_search_value !== "") {
    $search_value = url_search_value
  }
  set_tab_key()

  onMount(() => {
    $page_content_loaded = true
  })

  let search_timeout
  
  $effect(() => {
    $search_value
    if (search_timeout) clearTimeout(search_timeout)
    search_timeout = setTimeout(() => {
      search_input_change()
    }, 200)
  })
</script>

<Head title="Recherche" description="Page de recherche" />

<section class="section">
  <div>
    <p class="control has-icons-right">
      <input
        class="input"
        type="text"
        name="search_page_input"
        bind:value={$search_value}
        autocomplete="off"
        enterkeyhint="search"
      />
    </p>
  </div>
  {#if is_loading}
    <Loading />
  {:else}
    {#key tab_key}
      <Tabs {tabs} />
    {/key}
  {/if}
</section>

<style lang="scss">
  @use "../main.scss" as *;

  .section {
    margin-top: 13px;
  }

  .section :global(.search_highlight) {
    border-radius: $rounded;
    background: rgba(255, 255, 0, 0.5);
  }

  p.control {
    margin-bottom: 25px;
    opacity: 0;
    .input {
      width: 100%;
      margin: auto;
      padding: 20px;
      padding-left: 3.3rem;
      box-sizing: border-box;
    }
  }
</style>
