<script lang="ts">
  import { wrap_long_text } from "@js/util"
  import { get_parent_path } from "@js/db"
  import Column from "@js/Column"
  import Render from "@js/Render"
  import Datatable from "@datatable/Datatable.svelte"

  let { institutions } = $props()

  const is_recursive = true

  let institution_max = 0
  let folder_max = 0
  let dataset_max = 0
  let nb_doc_max = 0
  let variable_max = 0
  let level_max = 0
  for (const institution of institutions) {
    institution.path_string = get_parent_path(institution)
    if (institution.nb_child_recursive > institution_max) {
      institution_max = institution.nb_child_recursive
    }
    if (institution.nb_folder_recursive > folder_max) {
      folder_max = institution.nb_folder_recursive
    }
    if (institution.nb_dataset_recursive > dataset_max) {
      dataset_max = institution.nb_dataset_recursive
    }
    if (institution.docs_recursive.length > nb_doc_max) {
      nb_doc_max = institution.docs_recursive.length
    }
    if (institution.nb_variable_recursive > variable_max) {
      variable_max = institution.nb_variable_recursive
    }
    if (institution.parents?.length + 1 > level_max) {
      level_max = institution.parents?.length + 1
    }
  }

  const institutions_sorted = [...institutions]
  institutions_sorted.sort((a, b) => a.path_string.localeCompare(b.path_string))

  const columns = [
    Column.favorite(),
    Column.name("institution", "Institution", {
      with_indent: true,
      link_same_entity_tab: true,
    }),
    Column.description(),
    Column.nb_child_recursive("institution", institution_max),
    Column.nb_folder_recursive("institution", folder_max),
    Column.nb_dataset_recursive("institution", dataset_max),
    Column.nb_variable("institution", variable_max, {
      recursive: true,
    }),
    Column.nb_doc("institution", nb_doc_max),
    Column.tag(),
    Column.parents("institution"),
    {
      data: "email",
      defaultContent: "",
      title: Render.icon("email") + "Email",
      tooltip: "Email de contact",
      render: data => {
        return wrap_long_text(
          data ? `<a href="mailto:${data}" target="_blanck" >${data}</a>` : "",
        )
      },
    },
    {
      data: "phone",
      defaultContent: "",
      title: Render.icon("phone") + "Téléphone",
      tooltip: "Téléphone de contact",
      render: data =>
        data ? `<a href="tel:${data}" target="_blanck" >${data}</a>` : "",
    },
    Column.start_date(),
    Column.end_date(),
    Column.level(level_max),
  ]
</script>

<Datatable
  entity="institution"
  data={institutions_sorted}
  {is_recursive}
  {columns}
/>
