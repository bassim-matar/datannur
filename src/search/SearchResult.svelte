<script>
  import jQuery from "jquery"
  import { wrap_long_text, link } from "@js/util"
  import Render from "@js/Render"
  import SearchHistory from "./SearchHistory"
  import { search_highlight } from "./Search"
  import Datatable from "@datatable/Datatable.svelte"
  import Column from "@js/Column"

  let { search_result_data, search_value } = $props()

  function initied() {
    const table_id = "search___search"
    const datatable_search = jQuery("table#" + table_id + "._datatables")
    datatable_search.on("click", ".remove_search_item", function () {
      const elem = jQuery(this)
      const entity_name = elem.data("entity_name")
      const item_id = elem.data("item_id")
      SearchHistory.remove(entity_name, item_id)
    })
  }

  const columns = [
    Column.entity(),
    {
      data: "name",
      title: Render.icon("name") + "Nom",
      defaultContent: "",
      name: "name",
      render: (data, _, row) =>
        wrap_long_text(
          link(
            row._entity + "/" + row.id + "?from_search=true",
            `<strong class="var_main_col">${search_highlight(data, search_value)}</strong>`,
          ),
        ),
    },
    {
      data: "description",
      title: Render.icon("description") + "Description",
      defaultContent: "",
      render: data => {
        if ([null, undefined].includes(data)) return wrap_long_text()
        return wrap_long_text(search_highlight(data, search_value))
      },
    },
    {
      data: "folder_id",
      title: Render.icon("folder") + "Dossier",
      defaultContent: "",
      render: (data, _, row) => {
        if (!data) return wrap_long_text()
        return wrap_long_text(link("folder/" + data, row.folder_name))
      },
    },
    Column.favorite(),
    {
      data: "id",
      title: "<span class='hidden'>Recent search</span>",
      name: "search_receht",
      defaultContent: "",
      no_search: true,
      width: "20px",
      render: (data, type, row) => {
        if (type === "sort" || type === "export") {
          return row.is_recent ? "1" : "0"
        }
        return !row.is_recent
          ? ""
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

{#if search_result_data.length > 0}
  <div class="search_page_result_wrapper">
    <Datatable
      entity="search"
      data={search_result_data}
      sort_by_name={false}
      {columns}
      {initied}
    />
  </div>
{/if}

<style lang="scss">
  @use "../main.scss" as *;

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
      padding-left: 3px;
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
