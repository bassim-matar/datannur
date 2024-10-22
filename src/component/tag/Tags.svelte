<script>
  import { onMount } from "svelte"
  import db from "@db"
  import { page_name } from "@js/store"
  import { get_parent_path } from "@js/db"
  import { link, get_percent } from "@js/util"
  import Column from "@js/Column"
  import Render from "@js/Render"
  import Datatable from "@datatable/Datatable.svelte"
 
  export let tags
  export let load_first = false

  let tag_max = 0
  let institution_max = 0
  let folder_max = 0
  let dataset_max = 0
  let variable_max = 0
  for (const tag of tags) {
    if (db.use.tag_recursive) tag.path_string = get_parent_path(tag)
    if (tag.nb_child_recursive > tag_max) tag_max = tag.nb_child_recursive
    if (tag.nb_institution > institution_max)
      institution_max = tag.nb_institution
    if (tag.nb_folder > folder_max) folder_max = tag.nb_folder
    if (tag.nb_dataset > dataset_max) dataset_max = tag.nb_dataset
    if (tag.nb_variable > variable_max) variable_max = tag.nb_variable
  }

  const tags_sorted = [...tags]
  if (db.use.tag_recursive) {
    tags_sorted.sort((a, b) => a.path_string.localeCompare(b.path_string))
  }

  let columns = []
  if (db.use.tag_recursive) {
    columns.push(
      Column.name("tag", "Mot clé", {
        with_indent: true,
        link_same_entity_tab: true,
      }),
    )
  } else {
    columns.push(Column.name("tag", "Mot clé"))
  }

  columns.push(Column.description())

  if (db.use.tag_recursive) {
    columns.push(Column.parents())
  }

  columns = columns.concat([
    Column.nb_child_recursive("tag", tag_max),
    {
      data: "nb_institution_recursive",
      title:
        Render.icon("institution") +
        "<span class='hidden'>nb_institution</span>",
      filter_type: "input",
      render: (data, type, row) => {
        if (!data) return ""
        const content = link("tag/" + row.id + "?tab=institutions", data)
        const percent = get_percent(data / institution_max)
        return `${Render.num_percent(content, percent, "institution", type)}`
      },
    },
    Column.nb_folder_recursive("tag", folder_max),
    Column.nb_dataset_recursive("tag", dataset_max),
    Column.nb_variable("tag", variable_max),
  ])

  if (db.use.tag_recursive) {
    columns.push(Column.level())
  }
  columns.push(Column.favorite())

  let is_recursive = false
  let mounted = false
  onMount(() => {
    setTimeout(() => {
      is_recursive =
        db.use.tag_recursive && ["homepage", "tag", "tags"].includes($page_name)
      mounted = true
    }, 1)
  })
</script>

{#if tags && tags.length > 0 && mounted}
  <Datatable
    entity="tag"
    data={tags_sorted}
    sort_by_name={false}
    {is_recursive}
    {columns}
    {load_first}
  />
{/if}
