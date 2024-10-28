<script>
  import { wrap_long_text } from "@js/util"
  import { get_parent_path } from "@js/db"
  import Column from "@js/Column"
  import Render from "@js/Render"
  import Datatable from "@datatable/Datatable.svelte"

  let { institutions } = $props()

  let institution_max = 0
  let folder_max = 0
  let dataset_max = 0
  let nb_doc_max = 0
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
  }

  const institutions_sorted = [...institutions]
  institutions_sorted.sort((a, b) => a.path_string.localeCompare(b.path_string))

  const columns = [
    Column.name("institution", "Institution", {
      with_indent: true,
      link_same_entity_tab: true,
    }),
    Column.description(),
    Column.nb_child_recursive("institution", institution_max),
    Column.nb_folder_recursive("institution", folder_max),
    Column.nb_dataset_recursive("institution", dataset_max),
    Column.nb_doc("institution", nb_doc_max),
    Column.tag(),
    Column.parents(),
    {
      data: "email",
      defaultContent: "",
      title: Render.icon("email") + "Email",
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
      render: data =>
        data ? `<a href="tel:${data}" target="_blanck" >${data}</a>` : "",
    },
    Column.level(),
    Column.favorite(),
  ]
</script>

{#if institutions && institutions.length > 0}
  <Datatable
    entity="institution"
    data={institutions_sorted}
    sort_by_name={false}
    is_recursive={true}
    {columns}
  />
{/if}
