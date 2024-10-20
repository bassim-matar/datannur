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
  import { link, get_percent } from "@js/util"
  import { get_sort_by_name } from "@js/db"
  import { entity_names, is_big_limit } from "@js/constant"
  import { url_hash } from "@js/url_hash"
  import { tab_selected, all_tables_loaded } from "@js/store"
  import { extendable } from "@js/extendable"
  import Options from "@js/Options"
  import LoadingDot from "@layout/LoadingDot.svelte"
  import Exporter from "./exporter/Exporter"
  import Filter_helper from "./filter/Filter_helper"
  import init_favorite from "./favorite/init_favorite"
  import Datatables_timer from "./Datatables_timer"
  import Datatables_loading from "./Datatables_loading"
  import Filter from "./filter/Filter.svelte"
  import FilterInfoBox from "./filter/FilterInfoBox.svelte"

  DataTable.Buttons.jszip(JSZip)

  export let entity
  export let data
  export let columns
  export let nb_item
  export let load_first = false
  export let sort_by_name = true
  export let keep_all_cols = false
  export let meta_path = false
  export let is_recursive = false
  export let data_update_key = false
  export let initied = () => {}

  let datatable = false
  let loading = true
  let dom_table = false
  const timeout = load_first ? 1 : 50
  const is_big = data.length > is_big_limit
  let short_table = false
  let nb_sticky = 1
  let datatable_update_draw = 0
  let nb_active_filter = 0

  let hash = url_hash.get_all()
  const open_all_recursive = Options.get("open_all_recursive")
  let filter_recursive =
    is_recursive && is_big && hash !== "favorite" && !open_all_recursive

  const max_height_value = 275
  const max_height = `max(calc(100vh - ${max_height_value}px), 170px)`
  const max_height_load = `max(calc(100vh - ${max_height_value - 82}px), 80px)`

  function get_table_id() {
    let table_id = hash.replaceAll("/", "___")
    table_id = table_id.replace(/[^a-z0-9_\-,. ]/gi, "")
    return table_id + "___" + entity
  }

  function update_filter_count(current_nb_active_filter) {
    nb_active_filter = current_nb_active_filter
  }

  const table_id = get_table_id(entity)
  const exporter = new Exporter(table_id)
  const filter = new Filter_helper(table_id, entity, update_filter_count)

  nb_item = "..."

  let new_data
  function load_new_data() {
    new_data = [...data]
    if (sort_by_name) {
      new_data.sort(get_sort_by_name)
    }
    let row_num = 0
    for (const rows of new_data) {
      row_num += 1
      rows._row_num = row_num
    }
  }

  function reload() {
    load_new_data()
    if (datatable) datatable.clear().rows.add(new_data).draw()
  }
  $: data_update_key && reload()
  load_new_data()

  if (columns[0]?.title !== "#") {
    const col_numerotation = {
      data: "_row_num",
      name: "_row_num",
      title: "#",
      tooltip: "Numéro de ligne",
      width: "20px",
    }
    if (entity in entity_names) {
      if (meta_path) {
        col_numerotation.render = (data, type, row) => {
          return link(meta_path + row.id, data)
        }
      } else {
        col_numerotation.render = (data, type, row) => {
          return link(entity + "/" + row.id, data)
        }
      }
    }
    columns = [col_numerotation, ...columns]
  }

  if (window.innerWidth > 1023) {
    for (const column of columns) {
      if (column.name === "entity") nb_sticky += 1
      if (column.name === "name") nb_sticky += 1
    }
  }

  Datatables_timer.start()
  Datatables_loading.start()

  function get_nb_item(dt) {
    const nb_total = new_data.length
    const nb_item_display = dt?.page?.info()?.recordsDisplay
    if (nb_item_display !== nb_total) {
      const percent = get_percent(nb_item_display / nb_total)
      return `${nb_item_display} / ${nb_total} - ${percent}%`
    } else {
      return nb_item_display
    }
  }

  function is_short_table(dt) {
    return (
      datatable?.page?.info()?.recordsDisplay > 0 &&
      datatable?.page?.info()?.recordsDisplay < 11
    )
  }

  function filter_empty_columns(columns, items) {
    const has_prop = {}
    for (const item of items) {
      for (const [key, value] of Object.entries(item)) {
        if (key === "id" || key === "is_favorite") {
          has_prop[key] = true
          continue
        }
        const value = item[key]
        if (Array.isArray(value)) {
          if (value.length > 0) has_prop[key] = true
        } else if (value) has_prop[key] = true
      }
    }
    return columns.filter(column => column.data in has_prop)
  }

  if (!keep_all_cols) columns = filter_empty_columns(columns, new_data)

  function get_text_width(lines, font) {
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    context.font = font
    let maxWidth = 0
    for (const line of lines) {
      const metrics = context.measureText(line)
      maxWidth = Math.max(maxWidth, metrics.width)
    }
    return maxWidth
  }

  const nb_row_loading = Math.min(new_data.length, 50)
  let bold = ""
  const mini_col = ["_row_num", "level", "is_favorite", "search_receht"]
  for (const column of columns) {
    if (["is_favorite", "type"].includes(column.name))
      column.search_modality = true
    if (mini_col.includes(column.name)) {
      column.loading_max_width = 20
      continue
    }
    if (column.name === "name") bold = "bold"
    const cells = []
    for (const row of new_data.slice(0, nb_row_loading))
      cells.push(row[column.data])
    const cells_width = get_text_width(cells, `${bold} 16px BlinkMacSystemFont`)
    column.loading_width = Math.min(285, cells_width)
  }

  function elem_has_clickable(target, container, selector) {
    while (target && target !== container) {
      if (target.matches(selector)) return true
      target = target.parentNode
    }
    return false
  }

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
        data: new_data,
        columns,
        scrollY: max_height,
        scrollX: true,
        scrollCollapse: true,
        paging: is_big,
        pageLength: 100,
        searching: is_big,
        deferRender: is_big,
        scroller: is_big ? { rowHeight: 41 } : false,
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
        nb_item = get_nb_item(datatable)
        short_table = is_short_table(datatable)
      })
      datatable.on("draw.dt", () => {
        datatable_update_draw += 1
      })
      if (filter_recursive) {
        datatable
          .column("level:name")
          .search.fixed("filter_recursive", 1)
          .draw()
      }
      dom_table = jQuery("table#" + table_id + "._datatables")
      dom_table.on("mouseenter", ".long_text", extendable.open)
      dom_table.on("mouseleave", ".long_text", extendable.close)

      dom_table.on("click", "td", function (event) {
        setTimeout(() => {
          const clickable_elems =
            "a, button, input, select, .copyclip, .favorite"

          if (
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
      nb_item = get_nb_item(datatable)
      short_table = is_short_table(datatable)
      loading = false
      Datatables_timer.end()
      Datatables_loading.end()
      if (Datatables_loading.finished) {
        $all_tables_loaded = true
      }
    }, timeout)
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

<svelte:window on:resize={on_resize} />

{#if loading}
  <div class="datatable_main_wrapper dt_loading" class:is_big>
    <div
      class="datatables_outer visible dt-container dt_loading_outer"
      class:is_big
    >
      <div class="dt-scroll" style="--max-height: {max_height_load}">
        <table class="_datatables table is-striped dataTable" class:short_table>
          <thead>
            <tr>
              {#each columns as column, i}
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
              <Filter {columns} />
            </thead>
          {/if}
          <tbody>
            {#each Array(nb_row_loading) as _, i}
              <tr>
                {#each columns as column, j}
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

<div class="datatable_main_wrapper" class:is_big>
  {#if data.length > 0}
    <div class="datatables_outer" class:visible={!loading}>
      <FilterInfoBox {nb_active_filter} click={() => filter.remove_all()} />
      <table
        id={table_id}
        class="_datatables table is-striped"
        class:short_table
      >
        <thead>
          <tr>
            {#each columns as column, i}
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
              {columns}
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
        height: 41px;
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
      .div.dt-scroll-body,  div.dt-scroll-head, div.dt-scroll-headInner {
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
              padding: 0.5em 0;
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
          td div.long_text {
            display: table-caption;
            max-width: 300px;
            width: auto;
            padding-right: 0px;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-height: 25px;
            min-height: 25px;
            overflow-x: hidden;
            overflow-y: hidden;
            word-wrap: break-word;
            scrollbar-gutter: stable;
            .indented_text {
              display: inline;
              width: 100%;
              box-sizing: border-box;
            }
            .tree {
              text-overflow: ellipsis;
              overflow: hidden;
            }
            a:nth-child(2) .indented_text {
              display: block;
            }
            &.open {
              white-space: normal;
              .indented_text {
                display: block;
              }
            }
            &.open_full {
              overflow-y: auto;
            }
          }
          tbody > tr {
            cursor: pointer;
          }
          tbody > tr:hover > td,
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
