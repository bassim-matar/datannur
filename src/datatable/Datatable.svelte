<script>
  import jQuery from "jquery"
  import JSZip from "jszip"
  import DataTable from "datatables.net-bm"
  import "datatables.net-buttons-bm"
  import "datatables.net-buttons/js/buttons.html5.mjs"
  import "datatables.net-fixedcolumns-bm"
  import "datatables.net-fixedheader-bm"
  import "datatables.net-scroller-bm"
  import { onMount, onDestroy } from "svelte"
  import { is_mobile } from "@js/util"
  import { is_big_limit } from "@js/constant"
  import { tab_selected, all_tables_loaded, all_tabs } from "@js/store"
  import { extendable } from "@js/extendable"
  import Exporter from "./exporter/Exporter"
  import Filter_helper from "./filter/Filter_helper"
  import init_favorite from "./favorite/init_favorite"
  import Datatables_timer from "./Datatables_timer"
  import Datatables_loading from "./Datatables_loading"
  import { define_columns } from "./define_columns"
  import {
    get_table_id,
    get_clean_data,
    is_short_table,
    elem_has_clickable,
    get_nb_sticky,
    get_nb_item,
    fix_columns_width,
  } from "./dt_util"
  import Filter from "./filter/Filter.svelte"
  import FilterInfoBox from "./filter/FilterInfoBox.svelte"
  import LoadingDot from "@layout/LoadingDot.svelte"

  let {
    entity,
    data,
    columns,
    sort_by_name = true,
    keep_all_cols = false,
    meta_path = false,
    is_recursive = false,
    initied = () => {},
  } = $props()

  let loading = $state(true)
  let short_table = $state(false)
  let datatable_update_draw = $state(0)
  let nb_active_filter = $state(0)

  Datatables_timer.start()
  Datatables_loading.start()
  DataTable.Buttons.jszip(JSZip)

  let datatable = false
  let dom_table = false

  const is_big = data.length > is_big_limit
  const max_height_value = 275
  const max_height = `max(calc(100vh - ${max_height_value}px), 170px)`
  const max_height_load = `max(calc(100vh - ${max_height_value - 82}px), 80px)`

  const table_id = get_table_id(entity)
  const exporter = new Exporter(table_id)
  const filter = new Filter_helper(table_id, entity, current_nb => {
    nb_active_filter = current_nb
  })

  const clean_data = get_clean_data(data, sort_by_name, is_recursive, is_big)
  const nb_row_loading = Math.min(clean_data.length, 50)
  const columns_copy = define_columns(
    columns,
    clean_data,
    entity,
    keep_all_cols,
    meta_path,
    nb_row_loading,
  )
  const nb_sticky = get_nb_sticky(columns_copy)

  const clickable_rows = ![
    "value",
    "dataset_preview",
    "variable_preview",
    "preview",
    "log",
  ].includes(entity)

  $all_tables_loaded = 0
  all_tables_loaded.subscribe(value => {
    if (value) {
      setTimeout(() => {
        datatable_update_draw += 1
      }, 1000)
    }
  })

  onMount(() => {
    setTimeout(() => {
      datatable = new DataTable("table#" + table_id, {
        data: clean_data,
        columns: columns_copy,
        scrollY: max_height,
        scrollX: true,
        scrollCollapse: true,
        paging: is_big,
        pageLength: 100,
        searching: is_big,
        deferRender: is_big,
        scroller: is_big ? { rowHeight: 65 } : false,
        autoWidth: false,
        fixedColumns: { leftColumns: nb_sticky },
        stateSave: true,
        info: false,
        dom: '<"toolbar">ftB',
        order: [[0, "asc"]],
        language: {
          zeroRecords: '<span class="no_result">Aucun résultat</span>',
          buttons: exporter.get_language(),
        },
        buttons: exporter.get_buttons(),
        bDestroy: true,
        initComplete: function () {
          if (!is_big) return false
          filter.init(this.api())
        },
      })
      datatable.on("search.dt", () => {
        $all_tabs[entity].nb = get_nb_item(datatable, clean_data)
        short_table = is_short_table(datatable)
      })
      datatable.on("draw.dt", () => {
        datatable_update_draw += 1
      })
      dom_table = jQuery("table#" + table_id + "._datatables")
      dom_table.on("mouseenter", ".long_text", extendable.open)
      dom_table.on("mouseleave", ".long_text", extendable.close)

      dom_table.on("click", "td", function (event) {
        setTimeout(() => {
          const clickable_elems =
            "a, button, input, select, .copyclip, .favorite"

          if (
            is_mobile ||
            !dom_table ||
            elem_has_clickable(event.target, this, clickable_elems)
          ) {
            return false
          }
          jQuery(this).parent().find(".var_main_col")[0]?.click()
          jQuery(this).parent().find(".var_main_col a")[0]?.click()
        }, 1)
      })

      init_favorite(table_id, datatable)
      initied()
      datatable.columns.adjust()
      datatable_update_draw += 1
      fix_columns_width(datatable)
      $all_tabs[entity].nb = get_nb_item(datatable, clean_data)
      short_table = is_short_table(datatable)
      loading = false
      Datatables_timer.end()
      Datatables_loading.end()
      if (Datatables_loading.finished) {
        $all_tables_loaded = true
      }
    }, 1)
  })

  function on_resize() {
    datatable?.columns?.adjust()
  }

  const tab_selected_unsubscribe = tab_selected.subscribe(tab => {
    if (tab && [tab.key, tab.icon].includes(entity)) {
      setTimeout(() => {
        datatable?.columns?.adjust()
        datatable_update_draw += 1
      }, 1)
    }
  })

  onDestroy(() => {
    if (datatable) datatable?.destroy()
    tab_selected_unsubscribe()
    filter.destroy()
    jQuery("table#" + table_id + "._datatables *")?.off()
    dom_table = false
  })
</script>

<svelte:window onresize={on_resize} />

{#if loading}
  <div class="datatable_main_wrapper dt_loading">
    <div class="datatables_outer visible dt-container dt_loading_outer">
      <div class="dt-scroll" style="--max-height: {max_height_load}">
        <table class="_datatables table is-striped dataTable" class:short_table>
          <thead>
            <tr>
              {#each columns_copy as column, i}
                <th
                  class="sorting"
                  class:sorting_asc={i === 0}
                  class:first_col={i === 0}
                  style="min-width: {column.loading_width}px; 
                    width: {column.loading_max_width}px;"
                >
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
            {#each Array(nb_row_loading) as _, i}
              <tr>
                {#each columns_copy as column, j}
                  <td class:first_col={j === 0}>
                    {#if column.data === "_row_num"}
                      {i + 1}
                    {:else if column.data === "is_favorite"}
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
      <FilterInfoBox {nb_active_filter} click={() => filter.remove_all()} />
      <table
        id={table_id}
        class="_datatables table is-striped"
        class:short_table
        class:clickable_rows
      >
        <thead>
          <tr>
            {#each columns_copy as column, i}
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
  @use "../main.scss" as *;
  @use "./exporter/exporter_popup.scss" as *;
  @use "./exporter/exporter.scss" as *;
  @use "../style/icon.scss" as *;
  @use "../style/favorite.scss" as *;

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
        padding-right: 30px;
      }
      td {
        height: 65px;
        vertical-align: middle;
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
          content: "▲" / "";
        }
        &::after {
          top: 52%;
          content: "▼";
          content: "▼" / "";
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
        ._datatables {
          width: auto !important;
          text-align: left;
          margin: auto;
          margin-top: 0 !important;
          margin-bottom: 0 !important;
          background: $background-2;
          &.short_table {
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
              min-width: 20px;
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
            .num_percent_value {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              z-index: 1;
            }
            .num_percent {
              position: absolute;
              top: 0;
              left: 0;
              bottom: 0;
              opacity: 0.15;
              pointer-events: none;
              &.color_missing {
                background: color("missing");
              }
              &.color_duplicate {
                background: color("duplicate");
              }
              &.color_value {
                background: color("value");
              }
              &.color_institution {
                background: color("institution");
              }
              &.color_folder {
                background: color("folder");
              }
              &.color_tag {
                background: color("tag");
              }
              &.color_doc {
                background: color("doc");
              }
              &.color_dataset {
                background: color("dataset");
              }
              &.color_variable {
                background: color("variable");
              }
              &.color_nb_row {
                background: color("nb_row");
              }
              &.color_value {
                background: color("value");
              }
            }
          }
          td div.long_text_empty {
            width: 250px;
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
          &.clickable_rows {
            tbody > tr:not(:has(.dt-empty)) {
              cursor: pointer;
            }
          }
          tbody > tr:hover > td:not(.dt-empty),
          tbody > tr:hover > td.dtfc-fixed-left {
            background: $color-6;
          }
          tbody > tr:hover > td .var_main_col,
          tbody > tr:hover > td .long_text:has(.var_main_col) {
            color: $color-3;
          }
        }
      }
    }
  }
</style>
