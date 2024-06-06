<script>
  import { link, wrap_long_text, get_percent } from "@js/util"
  import { get_parent_path } from "@js/db"
  import Column from "@js/Column"
  import Render from "@js/Render"
  import Datatable from "@datatable/Datatable.svelte"

  export let folders
  export let nb_item = false
  export let load_first = false
  export let is_meta = false

  let columns

  const folders_sorted = [...folders]

  let folder_path = is_meta ? "metaFolder/" : "folder/"

  let dataset_max = 0
  let folder_max = 0

  if (!is_meta) {
    for (const folder of folders) {
      folder.path_string = get_parent_path(folder)
      if (folder.nb_dataset_recursive > dataset_max) {
        dataset_max = folder.nb_dataset_recursive
      }
      if (folder.nb_child_recursive > folder_max) {
        folder_max = folder.nb_child_recursive
      }
    }
    folders_sorted.sort((a, b) => a.path_string.localeCompare(b.path_string))
  }

  if (is_meta) {
    let dataset_max = 0
    let variable_max = 0
    for (const folder of folders) {
      dataset_max = Math.max(dataset_max, folder.nb_dataset)
      variable_max = Math.max(variable_max, folder.nb_variable)
    }

    columns = [
      Column.name("folder", "Dossiers"),
      Column.description(),
      {
        data: "nb_dataset",
        title: Render.icon("dataset") + "Datasets",
        render: (data, type, row) => {
          if (!data) return ""
          const content = link(folder_path + row.id + "?tab=metaDatasets", data)
          const percent = get_percent(data / dataset_max)
          return `${Render.num_percent(content, percent, "dataset", type)}`
        },
      },
      {
        data: "nb_variable",
        title: Render.icon("variable") + "Variables",
        render: (data, type, row) => {
          if (!data) return ""
          const url = folder_path + row.id + "?tab=metaVariables"
          const percent = get_percent(data / variable_max)
          return `${Render.num_percent(link(url, data), percent, "folder", type)}`
        },
      },
    ]
  } else {
    columns = [
      Column.favorite(),
      Column.level(),
      Column.name("folder", "Dossier", {
        with_indent: true,
        link_same_entity_tab: true,
      }),
      Column.description(),
      {
        data: "nb_child_recursive",
        title:
          Render.icon("folder") + "<span class='hidden'>nb_dossiers</span>",
        render: (data, type, row) => {
          if (!data) return ""
          const content = link(folder_path + row.id + "?tab=folders", data)
          const percent = get_percent(data / folder_max)
          return `${Render.num_percent(content, percent, "folder", type)}`
        },
      },
      Column.nb_dataset_recursive("folder", dataset_max),
      Column.nb_doc("folder"),
      Column.tag(),
      Column.parents(),
      Column.owner(),
      Column.manager(),
      Column.localisation(),
      {
        data: "survey_type",
        title: Render.icon("survey_type") + "Type d'enquête",
        defaultContent: "",
      },
      {
        data: "delivery_format",
        title: Render.icon("delivery_format") + "Format livraison",
        defaultContent: "",
      },
      Column.frequency(),
      Column.last_update(),
      Column.period(),
      {
        data: "metadata_path",
        title: Render.icon("metadata_path") + "Metadonnées",
        defaultContent: "",
        render: Render.copy_cell,
      },
      Column.data_path(),
      {
        data: "git_code",
        title: Render.icon("git_code") + "GIT code",
        defaultContent: "",
        render: data =>
          data
            ? wrap_long_text(`<a href="${data}" target="_blanck">${data}</a>`)
            : "",
      },
    ]
  }
</script>

{#if folders && folders.length > 0}
  <Datatable
    entity="folder"
    data={folders_sorted}
    sort_by_name={false}
    is_recursive={true}
    {columns}
    {load_first}
    meta_path={is_meta ? folder_path : false}
    bind:nb_item
  />
{/if}
