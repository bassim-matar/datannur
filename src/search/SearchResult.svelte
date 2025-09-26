<script lang="ts">
  import jQuery from 'jquery'
  import { wrapLongText, link } from '@lib/util'
  import Render from '@lib/render'
  import SearchHistory from './search-history'
  import { searchHighlight } from './search'
  import Datatable from '@datatable/Datatable.svelte'
  import Column from '@lib/column'

  let { searchValue, searchResultData } = $props()

  function initied() {
    const tableId = 'search___search'
    const datatableSearch = jQuery('table#' + tableId + '._datatables')
    datatableSearch.on(
      'click',
      '.remove_search_item',
      function (this: HTMLElement) {
        const elem = jQuery(this)
        const entityName = elem.data('entity_name')
        const itemId = elem.data('item_id')
        SearchHistory.remove(entityName, itemId)
      },
    )
  }

  const columns = [
    Column.favorite(),
    Column.entity(),
    {
      data: 'name',
      title: Render.icon('name') + 'Nom',
      defaultContent: '',
      name: 'name',
      tooltip: 'Nom',
      render: (data, type, row) =>
        wrapLongText(
          `<strong class="var_main_col">` +
            link(
              row._entity + '/' + row.id + '?from_search=true',
              `${searchHighlight(data, searchValue)}`,
              row._entity,
            ) +
            `</strong>`,
        ),
    },
    {
      data: 'description',
      title: Render.icon('description') + 'Description',
      defaultContent: '',
      tooltip: 'Description',
      render: data => {
        if ([null, undefined].includes(data)) return wrapLongText()
        return wrapLongText(searchHighlight(data, searchValue))
      },
    },
    {
      data: 'folder_id',
      title: Render.icon('folder') + 'Dossier',
      defaultContent: '',
      tooltip: 'Dossier',
      render: (data, type, row) => {
        if (!data) return wrapLongText()
        return wrapLongText(link('folder/' + data, row.folder_name))
      },
    },
    {
      data: 'id',
      title: "<span class='hidden'>Recent search</span>",
      name: 'search_recent',
      defaultContent: '',
      noSearch: true,
      width: '20px',
      render: (data, type, row) => {
        if (type === 'sort' || type === 'export') {
          return row.is_recent ? '1' : '0'
        }
        return !row.is_recent
          ? ''
          : `<button style="cursor: pointer; margin: 0;" 
              class="remove_search_item" 
              data-entity_name="${row._entity}"
              data-item_id="${row.id}"
            >
              <i class="fa-solid fa-xmark close"></i>
              <i class="fa-solid fa-clock-rotate-left recent"></i>
            </button>`
      },
    },
  ]
</script>

{#if searchResultData.length > 0}
  <div class="search_page_result_wrapper">
    <Datatable entity="search" data={searchResultData} {columns} {initied} />
  </div>
{/if}

<style lang="scss">
  @use 'main.scss' as *;

  .search_page_result_wrapper {
    :global(.remove_search_item) {
      margin: 0;
      position: relative;
      width: 16px;
      height: 16px;
      vertical-align: middle;
      color: $color-2;
    }
    :global(.remove_search_item > .fa-solid) {
      transition: opacity $transition-basic-1;
      position: absolute;
      top: 0;
      left: 0;
      margin: auto;
    }
    :global(.remove_search_item > .recent) {
      opacity: 1;
    }
    :global(.remove_search_item > .close) {
      opacity: 0;
      padding-right: 1px;
    }
    :global(tr:hover .remove_search_item > .recent) {
      opacity: 0;
    }
    :global(tr:hover .remove_search_item > .close) {
      opacity: 1;
    }
    :global(.remove_search_item:hover > .close) {
      text-shadow: 0 0 10px;
    }
  }
</style>
