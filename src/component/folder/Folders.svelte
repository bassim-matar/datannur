<script>
  import { link, wrap_long_text, get_percent } from "@js/util"
  import { get_parent_path } from "@js/db"
  import Column from "@js/Column"
  import Render from "@js/Render"
  import Datatable from "@datatable/Datatable.svelte"

  let { folders, is_meta = false } = $props()

  const folders_sorted = [...folders]

  let folder_path = is_meta ? "metaFolder/" : "folder/"

  let variable_max = 0
  let dataset_max = 0
  let folder_max = 0
  let nb_doc_max = 0

  if (!is_meta) {
    for (const folder of folders) {
      folder.path_string = get_parent_path(folder)
      if (folder.nb_dataset_recursive > dataset_max) {
        dataset_max = folder.nb_dataset_recursive
      }
      if (folder.nb_variable_recursive > variable_max) {
        variable_max = folder.nb_variable_recursive
      }
      if (folder.nb_child_recursive > folder_max) {
        folder_max = folder.nb_child_recursive
      }
      if (folder.docs_recursive?.length > nb_doc_max) {
        nb_doc_max = folder.docs_recursive?.length
      }
    }
    folders_sorted.sort((a, b) => a.path_string.localeCompare(b.path_string))
  }

  if (is_meta) {
    for (const folder of folders) {
      dataset_max = Math.max(dataset_max, folder.nb_dataset)
      variable_max = Math.max(variable_max, folder.nb_variable)
    }
  }

  function define_columns() {
    if (is_meta) {
      return [
        Column.name("folder", "Dossiers"),
        Column.description(),
        {
          data: "nb_dataset",
          title: Render.icon("dataset") + "Datasets",
          tooltip: "Nombre de datasets",
          render: (data, type, row) => {
            if (!data) return ""
            const content = link(
              folder_path + row.id + "?tab=metaDatasets",
              data,
            )
            const percent = get_percent(data / dataset_max)
            return `${Render.num_percent(content, percent, "dataset", type)}`
          },
        },
        Column.nb_variable("folder", variable_max, {
          tab: "metaVariables",
          link_path: folder_path,
          show_title: true,
        }),
      ]
    }
    
    return [
      Column.favorite(),
      Column.name("folder", "Dossier", {
        with_indent: true,
        link_same_entity_tab: true,
      }),
      Column.description(),
      Column.nb_child_recursive("folder", folder_max, folder_path),
      Column.nb_dataset_recursive("folder", dataset_max),
      Column.nb_variable("folder", variable_max, {
        recursive: true,
      }),
      Column.nb_doc("folder", nb_doc_max),
      Column.tag(),
      Column.last_update(),
      Column.frequency(),
      Column.period(),
      Column.parents(),
      Column.owner(),
      Column.manager(),
      Column.localisation(),
      {
        data: "survey_type",
        title: Render.icon("survey_type") + "Type d'enquête",
        defaultContent: "",
        tooltip: "Type d'enquête",
      },
      Column.delivery_format(),
      {
        data: "metadata_path",
        title: Render.icon("metadata_path") + "Metadonnées",
        defaultContent: "",
        tooltip: "Emplacement des métadonnées",
        render: Render.copy_cell,
      },
      Column.data_path(),
      {
        data: "git_code",
        title: Render.icon("git_code") + "GIT code",
        defaultContent: "",
        tooltip: "Code source des traitements",
        render: data =>
          wrap_long_text(
            data ? `<a href="${data}" target="_blanck">${data}</a>` : "",
          ),
      },
      Column.level(),
    ]
  }

  const columns = define_columns()
</script>

{#if folders && folders.length > 0}
  <Datatable
    entity="folder"
    data={folders_sorted}
    sort_by_name={false}
    is_recursive={true}
    {columns}
    meta_path={is_meta ? folder_path : false}
  />
{/if}
