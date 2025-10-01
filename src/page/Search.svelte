<script lang="ts">
  import { onMount } from 'svelte'
  import { searchValue, pageContentLoaded } from '@lib/store'
  import { UrlParam } from '@lib/url-param'
  import search from '@search/search'
  import Head from '@frame/Head.svelte'
  import Tabs from '@tab/Tabs.svelte'
  import SearchResult from '@search/SearchResult.svelte'
  import SearchHistory from '@search/search-history'
  import AboutFile from '@layout/AboutFile.svelte'
  import aboutSearch from '@markdown/search/about-search.md?raw'
  import noResult from '@markdown/search/no-result.md?raw'
  import noRecentSearch from '@markdown/search/no-recent-search.md?raw'

  let isLoading = $state(true)
  let searchResultData = $state([])
  let tabs = $state([])
  let tabKey = $state()

  let recentSearchChange = false

  function makeTab(name, icon, key, aboutFile) {
    return {
      name,
      icon,
      key,
      component: AboutFile,
      footerVisible: true,
      props: { aboutFile },
    }
  }
  const aboutTab = makeTab('A propos', 'about', 'about', aboutSearch)
  const noResultTab = makeTab('Résultat', 'search', 'noResult', noResult)
  const noRecentSearchTab = makeTab(
    'Recherches récentes',
    'search',
    'noRecentSearch',
    noRecentSearch,
  )

  SearchHistory.onChange('search_page', () => searchInputChange())

  function setTabKey() {
    recentSearchChange = !recentSearchChange
    tabKey = recentSearchChange
  }

  function initSearchRecent() {
    searchResultData = SearchHistory.getRecentSearch()
    const tabName = 'Recherches récentes'
    setTabs(tabName)
    isLoading = false
  }

  async function searchInputChange() {
    const urlSearchValue = UrlParam.get('search')
    if (urlSearchValue !== $searchValue) {
      UrlParam.set('search', $searchValue)
    }
    if ($searchValue === '') {
      UrlParam.delete('search')
      initSearchRecent()
      return false
    }
    const valueBefore = $searchValue
    const allSearchRaw = await search.find($searchValue)
    isLoading = false
    if ($searchValue !== valueBefore) return false
    searchResultData = SearchHistory.putRecentFirst(allSearchRaw)
    setTabs()
  }

  function setTabs(name = 'Résultat') {
    setTabKey()
    if (searchResultData.length === 0) {
      tabs = [isEmptyInput ? noRecentSearchTab : noResultTab]
    } else {
      tabs = [
        {
          name,
          icon: 'search',
          key: 'search',
          component: SearchResult,
          nb: searchResultData.length,
          props: {
            searchResultData,
            searchValue: $searchValue,
          },
        },
      ]
    }
    tabs.push(aboutTab)
  }

  let isEmptyInput = $derived(['', undefined, null].includes($searchValue))

  const urlSearchValue = UrlParam.get('search')
  if (urlSearchValue !== false && urlSearchValue !== '') {
    $searchValue = urlSearchValue
  }
  setTabKey()

  onMount(() => {
    $pageContentLoaded = true
  })

  let searchTimeout

  $effect(() => {
    void $searchValue
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      searchInputChange()
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
        bind:value={$searchValue}
        autocomplete="off"
        enterkeyhint="search"
      />
    </p>
  </div>
  {#if !isLoading}
    {#key tabKey}
      <Tabs {tabs} />
    {/key}
  {/if}
</section>

<style lang="scss">
  @use 'main.scss' as *;

  .section {
    margin-top: 13px;
  }

  .section :global(.searchHighlight) {
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
