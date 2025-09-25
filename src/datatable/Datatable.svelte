<script lang="ts">
  import jQuery from 'jquery'
  import JSZip from 'jszip'
  import DataTable from 'datatables.net-bm'
  import type { Config, ConfigLanguage } from 'datatables.net'
  import 'datatables.net-buttons-bm'
  import 'datatables.net-buttons/js/buttons.html5.mjs'
  import 'datatables.net-fixedcolumns-bm'
  import 'datatables.net-fixedheader-bm'
  import 'datatables.net-scroller-bm'
  import { onMount, onDestroy } from 'svelte'
  import { is_mobile } from '@lib/util'
  import { is_big_limit } from '@lib/constant'
  import { tab_selected, all_tables_loaded, all_tabs } from '@lib/store'
  import { extendable } from '@lib/extendable'
  import Exporter from './exporter/exporter'
  import FilterHelper from './filter/filter-helper'
  import initFavorite from './favorite/init-favorite'
  import DatatablesTimer from './datatables-timer'
  import DatatablesLoading from './datatables-loading'
  import { defineColumns } from './define-columns'
  import {
    getTableId,
    getCleanData,
    isShortTable,
    elemHasClickable,
    getNbSticky,
    getNbItem,
    fixColumnsWidth,
  } from './dt-util'
  import Filter from './filter/Filter.svelte'
  import FilterInfoBox from './filter/FilterInfoBox.svelte'
  import Popup from '@layout/Popup.svelte'
  import SearchOptionInfo from './filter/SearchOptionInfo.svelte'
  import LoadingDot from '@layout/LoadingDot.svelte'

  let {
    entity,
    data,
    columns,
    sort_by_name = false,
    keep_all_cols = false,
    meta_path = null,
    is_recursive = false,
    initied = () => {},
  } = $props()

  let loading = $state(true)
  let short_table = $state(false)
  let datatable_update_draw = $state(0)
  let nb_active_filter = $state(0)
  let is_popup_search_option_open = $state(false)

  DatatablesTimer.start()
  DatatablesLoading.start()

  DataTable.Buttons.jszip(JSZip)

  let datatable = null
  let dom_table = null

  const is_big = data.length > is_big_limit
  const max_height_value = 275
  const max_height = `max(calc(100vh - ${max_height_value}px), 170px)`
  const max_height_load = `max(calc(100vh - ${max_height_value - 82}px), 80px)`

  const table_id = getTableId(entity)
  const exporter = new Exporter(table_id)
  const filter = new FilterHelper(table_id, entity, current_nb => {
    nb_active_filter = current_nb
  })

  const clean_data = getCleanData(data, sort_by_name, is_recursive, is_big)
  const nb_row_loading = Math.min(clean_data.length, 50)
  const columns_copy = defineColumns(
    columns,
    clean_data,
    entity,
    keep_all_cols,
    meta_path,
    nb_row_loading,
  )
  const nb_sticky = getNbSticky(columns_copy)

  const clickable_rows = ![
    'value',
    'dataset_preview',
    'variable_preview',
    'preview',
    'log',
  ].includes(entity)

  $all_tables_loaded = false
  all_tables_loaded.subscribe(value => {
    if (value) {
      setTimeout(() => {
        datatable_update_draw += 1
      }, 1000)
    }
  })

  let buttons = exporter.getButtons()
  if (is_big) {
    buttons.push(
      filter.getBtnInfoPopup(() => {
        is_popup_search_option_open = true
      }),
    )
  }

  onMount(() => {
    setTimeout(() => {
      datatable = new DataTable('table#' + table_id, {
        data: clean_data,
        columns: columns_copy,
        scrollY: max_height,
        scrollX: true,
        scrollCollapse: true,
        pageLength: 100,
        paging: is_big,
        searching: is_big,
        deferRender: is_big,
        scroller: is_big ? { rowHeight: 65 } : false,
        autoWidth: false,
        fixedColumns: { leftColumns: nb_sticky },
        stateSave: true,
        info: false,
        dom: '<"toolbar">ftB',
        order: [[0, 'asc']],
        buttons,
        destroy: true,
        language: {
          zeroRecords: '<span class="no_result">Aucun résultat</span>',
          buttons: exporter.getLanguage(),
        } as ConfigLanguage,
        initComplete: function () {
          if (!is_big) return false
          filter.init(this.api())
        },
      } as Config)
      datatable.on('search.dt', () => {
        if ($all_tabs[entity]) {
          $all_tabs[entity].nb = getNbItem(datatable, clean_data)
        }
        short_table = isShortTable(datatable)
      })
      datatable.on('draw.dt', () => {
        datatable_update_draw += 1
      })
      dom_table = jQuery('table#' + table_id + '._datatables')
      dom_table.on('mouseenter', '.long_text', extendable.open)
      dom_table.on('mouseleave', '.long_text', extendable.closeTwoLines)

      dom_table.on(
        'click',
        'td',
        function (this: HTMLElement, event: MouseEvent) {
          setTimeout(() => {
            const clickable_elems =
              'a, button, input, select, .copyclip, .favorite'

            if (
              is_mobile ||
              !dom_table ||
              elemHasClickable(event.target, this, clickable_elems)
            ) {
              return false
            }
            jQuery(this).parent().find('.var_main_col')[0]?.click()
            jQuery(this).parent().find('.var_main_col a')[0]?.click()
          }, 1)
        },
      )

      initFavorite(table_id, datatable)
      initied()
      datatable.columns.adjust()
      datatable_update_draw += 1
      fixColumnsWidth(datatable)
      if ($all_tabs[entity]) {
        $all_tabs[entity].nb = getNbItem(datatable, clean_data)
      }
      short_table = isShortTable(datatable)
      loading = false
      DatatablesTimer.end()
      DatatablesLoading.end()
      if (DatatablesLoading.finished) {
        $all_tables_loaded = true
      }
    }, 1)
  })

  function onResize() {
    datatable?.columns?.adjust()
  }

  const tab_selected_unsubscribe = tab_selected.subscribe(tab => {
    if (tab && [tab.key, tab.icon].includes(entity)) {
      setTimeout(() => {
        datatable?.columns?.adjust()
        datatable_update_draw += 1
        window._current_tab_data = clean_data
      }, 1)
    }
  })

  onDestroy(() => {
    if (datatable) datatable?.destroy()
    tab_selected_unsubscribe()
    filter.destroy()
    jQuery('table#' + table_id + '._datatables *')?.off()
    dom_table = null
  })
</script>

<svelte:window onresize={onResize} />

<Popup bind:is_open={is_popup_search_option_open}>
  <SearchOptionInfo />
</Popup>

{#if loading}
  <div class="datatable_main_wrapper dt_loading">
    <div class="datatables_outer visible dt-container dt_loading_outer">
      <div class="dt-scroll" style="--max-height: {max_height_load}">
        <table
          class="_datatables table is-striped dataTable"
          class:short-table={short_table}
        >
          <thead>
            <tr>
              {#each columns_copy as column, i (`${column.data}/${column.title}`)}
                <th
                  class="sorting"
                  class:sorting_asc={i === 0}
                  class:first_col={i === 0}
                  style="min-width: {column.loading_width}px; 
                    width: {column.loading_max_width}px;"
                >
                  <!-- eslint-disable svelte/no-at-html-tags -->
                  {@html column.title}
                  <span class="dt-column-order"></span>
                </th>
              {/each}
            </tr>
          </thead>
          {#if is_big}
            <thead class="loading_filter_wrapper">
              <Filter columns={columns_copy} />
            </thead>
          {/if}
          <tbody>
            {#each Array(nb_row_loading).keys() as i (i)}
              <tr>
                {#each columns_copy as column, j (`${column.data}/${column.title}`)}
                  <td class:first_col={j === 0} class:first_row={i === 0}>
                    {#if column.data === '_row_num'}
                      {i + 1}
                    {:else if column.data === 'is_favorite'}
                      <span class="icon favorite">
                        <i class="fas fa-star"></i>
                      </span>
                    {:else}
                      <LoadingDot />
                    {/if}
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
{/if}

<div class="datatable_main_wrapper">
  {#if data.length > 0}
    <div class="datatables_outer" class:visible={!loading}>
      <FilterInfoBox {nb_active_filter} click={() => filter.removeAll()} />
      <table
        id={table_id}
        class="_datatables table is-striped"
        class:short-table={short_table}
        class:clickable-rows={clickable_rows}
      >
        <thead>
          <tr>
            {#each columns_copy as column, i (`${column.data}/${column.title}`)}
              <th
                title={column.tooltip}
                class:first_col={i === 0}
                class="use_tooltip"
              ></th>
            {/each}
          </tr>
        </thead>

        {#if is_big}
          <thead>
            <Filter
              columns={columns_copy}
              {table_id}
              {loading}
              {nb_sticky}
              {datatable_update_draw}
            />
          </thead>
        {/if}
      </table>
    </div>
  {/if}
</div>

<style lang="scss">
  @use 'main.scss' as *;
  @use './exporter/exporter-popup.scss' as *;
  @use './exporter/exporter.scss' as *;
  @use '../style/icon.scss' as *;
  @use '../style/favorite.scss' as *;

  .datatable_main_wrapper {
    text-align: left;
    :global {
      .dt-scroll {
        :global(html.rounded_design) & {
          border-radius: $rounded-bottom;
          border-top-right-radius: $rounded-size;
        }
        :global(html.rounded_design .no_first_tab) & {
          border-top-left-radius: $rounded-size;
        }
      }
    }
  }

  .dt_loading {
    .dt-scroll {
      max-height: var(--max-height);

      th {
        position: relative;
        padding-right: 28px;
      }
      td {
        height: 65px;
        vertical-align: middle;
        &.first_row {
          height: 67px;
          padding-top: 10px;
        }
      }
      .loading_filter_wrapper {
        position: sticky;
        bottom: 0;
        left: 0;
        right: 0;
      }
      .dt-column-order {
        position: absolute;
        right: 12px;
        top: 0;
        bottom: 0;
        width: 12px;
        &::before,
        &::after {
          position: absolute;
          display: block;
          left: 0;
          opacity: 0.125;
          line-height: 9px;
          font-size: 0.8em;
        }
        &::before {
          bottom: 52%;
          content: '▲' / '';
        }
        &::after {
          top: 52%;
          content: '▼';
          content: '▼' / '';
        }
      }
    }
  }

  .datatable_main_wrapper {
    :global {
      .dt-scroll-foot {
        display: none;
      }
    }
  }

  .datatable_main_wrapper {
    :global {
      @include exporter_style;
      @include favorite_style;
      @include icon_color;

      table.dataTable th.dt-type-numeric,
      table.dataTable th.dt-type-date,
      table.dataTable td.dt-type-numeric,
      table.dataTable td.dt-type-date {
        text-align: left;
      }

      .datatables_outer {
        &:not(.visible) {
          opacity: 0;
          height: 0;
          overflow: hidden;
        }
      }
      div.dt-scroll div.dtfc-top-blocker,
      div.dt-scroll div.dtfc-bottom-blocker,
      div.dtfh-floatingparent div.dtfc-top-blocker,
      div.dtfh-floatingparent div.dtfc-bottom-blocker {
        z-index: -999;
      }
      .dt-scroll-footInner {
        border-top: 1px solid $color-5;
      }
      .dt-scroll {
        display: inline-block;
        vertical-align: top;
        width: auto;
        margin: auto;
        max-width: 100%;
      }
      .div.dt-scroll-body,
      div.dt-scroll-head,
      div.dt-scroll-headInner {
        text-align: left;
        margin: auto;
      }
      div.dt-container.dt-empty-footer div.dt-scroll-body {
        border-bottom: 0;
      }
      .dt-container {
        position: initial;

        table.dataTable.dtfc-scrolling-left tr > .dtfc-fixed-left::after {
          box-shadow: inset 10px 0 8px -8px rgba(0, 0, 0, 0.2);
          :global(html.dark_mode) & {
            box-shadow: inset 10px 0 8px -8px rgba(0, 0, 0, 1);
          }
        }
        .dt-filter {
          display: none;
        }
        .dt-scroll {
          position: static !important;
          overflow: hidden;
          .dt-scroll-body {
            width: auto !important;
            @include scrollbar_light();
          }
          .dt-scroll-body,
          .dt-scroll-body table {
            background: transparent;
          }
        }
        div.toolbar,
        .dt-search {
          display: none;
        }
        table.dataTable thead > tr > th.sorting {
          &::before {
            bottom: 55%;
          }
          &::after {
            top: 55%;
          }
        }

        table.dataTable thead > tr > th.dt-orderable-asc:hover,
        table.dataTable thead > tr > th.dt-orderable-desc:hover,
        table.dataTable thead > tr > td.dt-orderable-asc:hover,
        table.dataTable thead > tr > td.dt-orderable-desc:hover {
          outline: none;
        }

        th.dt-type-numeric div.dt-column-header,
        th.dt-type-date div.dt-column-header {
          flex-direction: row;
        }

        .dt-column-order {
          color: $color-3;
          &::before {
            bottom: 52%;
          }
          &::after {
            top: 52%;
          }
        }
        div > ._datatables {
          text-align: left;
        }
        .dt-scroll-head ._datatables {
          border-bottom: 2px $background-1 solid;
        }
        ._datatables {
          width: auto !important;
          text-align: left;
          margin: auto;
          margin-top: 0px !important;
          margin-bottom: 0px !important;
          background: $background-2;
          &.short-table {
            position: relative !important;
            + div {
              height: 0 !important;
            }
          }
          tbody tr {
            height: 65px;
          }
          tbody tr > .dtfc-fixed-left {
            z-index: 1;
          }
          tbody tr > .dtfc-fixed-left,
          > tbody > tr {
            background-color: $background-1;
            td {
              box-shadow: none !important;
            }
          }
          thead tr > .dtfc-fixed-start,
          thead > tr > th.sorting,
          > tbody > tr:nth-child(2n) > .dtfc-fixed-left,
          &.is-striped > tbody > tr:nth-child(2n) {
            background-color: $background-2;
          }
          tbody > tr:has(span.icon_add) > .dtfc-fixed-left {
            background-color: $background-green-filled;
          }
          tbody > tr:has(span.icon_delete) > .dtfc-fixed-left {
            background-color: $background-red-filled;
          }
          tbody > tr:has(span.icon_add) {
            background-color: $background-green-filled !important;
          }
          tbody > tr:has(span.icon_delete) {
            background-color: $background-red-filled !important;
          }
          thead td,
          thead th {
            border: none;
            .hidden {
              display: none;
            }
          }
          tbody > tr > td,
          th {
            white-space: nowrap;
            &.first_col {
              min-width: 50px;
            }
          }
          tbody > tr > td {
            border: 0;
            text-align: left;
            vertical-align: middle;
          }
          .ul_value {
            padding-left: 20px;
            list-style: initial;
            min-width: 100px;
          }
          .type_icon,
          .icon_type {
            font-weight: bold;
            color: $color-type;
          }
          .icon {
            width: auto;
            min-width: 1.5em;
          }
          .dt-empty {
            padding: 0.1px;
            .no_result {
              position: fixed;
              left: (calc(50% - 50px));
              margin-top: -12px;
              pointer-events: none;
            }
          }
          td {
            position: relative;
            @each $entity in $entities {
              a.color_entity_#{$entity}:hover,
              a.color_entity_#{$entity}.is-active,
              a.color_entity_#{$entity}:focus-within {
                color: #{color($entity)} !important;
              }
            }

            .num_percent_container {
              position: absolute;
              border-radius: $rounded;
              overflow: hidden;
              top: 10px;
              left: 5px;
              bottom: 10px;
              right: 5px;
            }
            .num_percent_value {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              top: 50%;
              transform: translateY(-50%);
              text-align: center;
            }
            .num_percent {
              position: absolute;
              top: 0px;
              left: 0;
              bottom: 0px;
              border-radius: $rounded;
              opacity: 0.3;
              pointer-events: none;
              &.placeholder {
                opacity: 0.1;
              }
            }
            .freq_item_container {
              position: relative;
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 2px 8px;
              margin: 1px 0;
              border-radius: $rounded;
              overflow: hidden;

              .freq_background {
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                border-radius: $rounded;
                opacity: 0.2;
                pointer-events: none;
                &.color_freq {
                  background: color('freq');
                }
              }

              .freq_value,
              .freq_number {
                position: relative;
                z-index: 1;
              }

              .freq_percent {
                position: relative;
                z-index: 1;
                margin-left: auto;
              }
            }
            .num_percent {
              position: absolute;
              top: 0px;
              left: 0;
              bottom: 0px;
              border-radius: $rounded;
              opacity: 0.3;
              pointer-events: none;
              &.placeholder {
                opacity: 0.1;
              }
              &.color_missing {
                background: color('missing');
              }
              &.color_duplicate {
                background: color('duplicate');
              }
              &.color_freq {
                background: color('freq');
              }
              &.color_value {
                background: color('value');
              }
              &.color_institution {
                background: color('institution');
              }
              &.color_folder {
                background: color('folder');
              }
              &.color_tag {
                background: color('tag');
              }
              &.color_doc {
                background: color('doc');
              }
              &.color_dataset {
                background: color('dataset');
              }
              &.color_variable {
                background: color('variable');
              }
              &.color_nb_row {
                background: color('nb_row');
              }
              &.color_value {
                background: color('value');
              }
              &.color_nb_source {
                background: color('nb_source');
              }
              &.color_nb_derived {
                background: color('nb_derived');
              }
              &.color_key {
                background: color('key');
              }
            }
          }
          td span.deleted {
            color: $color-2;
            font-style: italic;
            font-size: 14px;
          }
          td div.long_text_empty {
            width: 250px;
          }
          td span.highlight_diff_add {
            background: $background-green;
          }
          td span.highlight_diff_delete {
            background: $background-red;
          }
          td div.long_text {
            padding: 1px auto;
            display: -webkit-box;
            flex-direction: column;
            justify-content: flex-start;
            align-items: flex-start;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            width: 250px;
            max-width: 250px;
            padding-right: 0px;
            text-overflow: ellipsis;
            white-space: normal;
            max-height: 50px;
            min-height: auto;
            overflow-x: hidden;
            overflow-y: hidden;
            word-wrap: break-word;
            scrollbar-gutter: stable;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: left;
            .indented_text {
              width: 100%;
              box-sizing: border-box;
              margin: auto;
            }
            a:nth-child(2) .indented_text {
              display: block;
            }
            &.open {
              white-space: normal;
              display: block;
            }
            &.open_full {
              overflow-y: auto;
            }
          }
          &.clickable-rows {
            tbody > tr:not(:has(.dt-empty)) {
              cursor: pointer;
            }
          }
          tbody > tr:hover > td:not(.dt-empty),
          tbody > tr:hover > td.dtfc-fixed-left {
            background: $color-6;
          }
          tbody > tr:hover:has(span.icon_delete) > td:not(.dt-empty),
          tbody > tr:hover:has(span.icon_delete) > td.dtfc-fixed-left {
            background: $background-red-filled;
          }
          tbody > tr:hover:has(span.icon_add) > td:not(.dt-empty),
          tbody > tr:hover:has(span.icon_add) > td.dtfc-fixed-left {
            background: $background-green-filled;
          }

          tbody > tr:hover > td .var_main_col,
          tbody > tr:hover > td .long_text:has(.var_main_col) {
            color: $color-3;
          }

          tbody > tr:hover > td .var_main_col,
          tbody > tr:hover > td .long_text:has(.var_main_col) {
            @each $entity in $entities {
              a.color_entity_#{$entity} {
                color: #{color($entity)} !important;
              }
            }
          }
        }

        @media screen and (max-width: 600px) {
          div.dt-buttons .search_option {
            position: fixed;
            top: 40px;
            right: 52px;
          }
        }
      }
    }
  }
</style>
