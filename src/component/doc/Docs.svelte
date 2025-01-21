<script>
  import Column from "@js/Column"
  import Render from "@js/Render"
  import { link, get_percent } from "@js/util"
  import Datatable from "@datatable/Datatable.svelte"

  let { docs } = $props()

  let institution_max = 0
  let folder_max = 0
  let dataset_max = 0
  let tag_max = 0

  for (const doc of docs) {
    if (doc.nb_institution > institution_max)
      institution_max = doc.nb_institution
    if (doc.nb_folder > folder_max) folder_max = doc.nb_folder
    if (doc.nb_dataset > dataset_max) dataset_max = doc.nb_dataset
    if (doc.nb_tag > tag_max) tag_max = doc.nb_tag
  }

  let columns = [
    Column.favorite(),
    Column.name("doc", "Doc"),
    Column.description(),
    {
      data: "type",
      name: "doc_type",
      title: Render.icon("type") + "Type",
      defaultContent: "",
      filter_type: "select",
      tooltip: "Type de fichier (markdown ou pdf)",
      render: (data, type, row) => {
        if (!data) return ""
        if (["filter", "sort", "export"].includes(type)) return data
        return `${data} ${Render.icon(data)}`
      },
    },
    Column.doc_path(),
    Column.timestamp({
      var_name: "last_update",
      title: "Mise à jour",
      tooltip: "Date de dernière mise à jour",
    }),
    {
      data: "nb_institution",
      title:
        Render.icon("institution") +
        "<span class='hidden'>nb_institutions</span>",
      filter_type: "input",
      tooltip: "Nombre d'institutions",
      render: (data, type, row) => {
        if (!data) return ""
        const content = link("doc/" + row.id + "?tab=institutions", data)
        const percent = get_percent(data / institution_max)
        return `${Render.num_percent(content, percent, "institution", type)}`
      },
    },
    {
      data: "nb_folder",
      title: Render.icon("folder") + "<span class='hidden'>nb_folder</span>",
      filter_type: "input",
      tooltip: "Nombre de dossiers",
      render: (data, type, row) => {
        if (!data) return ""
        const content = link("doc/" + row.id + "?tab=folders", data)
        const percent = get_percent(data / folder_max)
        return `${Render.num_percent(content, percent, "folder", type)}`
      },
    },
    {
      data: "nb_tag",
      title: Render.icon("tag") + "<span class='hidden'>nb_tag</span>",
      filter_type: "input",
      tooltip: "Nombre de mots clés",
      render: (data, type, row) => {
        if (!data) return ""
        const content = link("doc/" + row.id + "?tab=tags", data)
        const percent = get_percent(data / tag_max)
        return `${Render.num_percent(content, percent, "tag", type)}`
      },
    },
    {
      data: "nb_dataset",
      title: Render.icon("dataset") + "<span class='hidden'>nb_dataset</span>",
      filter_type: "input",
      tooltip: "Nombre de datasets",
      render: (data, type, row) => {
        if (!data) return ""
        const content = link("doc/" + row.id + "?tab=datasets", data)
        const percent = get_percent(data / dataset_max)
        return `${Render.num_percent(content, percent, "dataset", type)}`
      },
    },
  ]
</script>

<Datatable entity="doc" data={docs} {columns} sort_by_name={true} />
