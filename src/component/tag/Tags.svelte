<script lang="ts">
  import { onMount } from 'svelte'
  import db from '@db'
  import { page } from '@lib/store'
  import { get_parent_path } from '@lib/db'
  import { link, get_percent } from '@lib/util'
  import Column from '@lib/column'
  import Render from '@lib/render'
  import Datatable from '@datatable/Datatable.svelte'

  let { tags } = $props()

  let is_recursive = $state(false)
  let mounted = $state(false)

  let tag_max = 0
  let institution_max = 0
  let folder_max = 0
  let doc_max = 0
  let dataset_max = 0
  let variable_max = 0
  let level_max = 0
  for (const tag of tags) {
    if (db.use.tag_recursive) tag.path_string = get_parent_path(tag)
    if (tag.nb_child_recursive > tag_max) tag_max = tag.nb_child_recursive
    if (tag.nb_institution_recursive > institution_max)
      institution_max = tag.nb_institution_recursive
    if (tag.nb_folder_recursive > folder_max)
      folder_max = tag.nb_folder_recursive
    if (tag.nb_doc_recursive > doc_max) doc_max = tag.nb_doc_recursive
    if (tag.nb_dataset_recursive > dataset_max)
      dataset_max = tag.nb_dataset_recursive
    if (tag.nb_variable_recursive > variable_max)
      variable_max = tag.nb_variable_recursive
    if (tag.parents?.length + 1 > level_max) level_max = tag.parents?.length + 1
  }

  const tags_sorted = [...tags]
  if (db.use.tag_recursive) {
    tags_sorted.sort((a, b) => a.path_string.localeCompare(b.path_string))
  }

  function define_columns() {
    let columns = []
    columns.push(Column.favorite())
    if (db.use.tag_recursive) {
      columns.push(
        Column.name('tag', 'Mot clé', {
          with_indent: true,
          link_same_entity_tab: true,
        }),
      )
    } else {
      columns.push(Column.name('tag', 'Mot clé'))
    }

    columns.push(Column.id())
    columns.push(Column.description())

    if (db.use.tag_recursive) {
      columns.push(Column.parents('tag'))
    }

    columns = columns.concat([
      {
        data: 'nb_institution_recursive',
        title:
          Render.icon('institution') +
          "<span class='hidden'>nb_institution</span>",
        filter_type: 'input',
        tooltip: "Nombre d'institutions",
        render: (data, type, row) => {
          if (!data) return ''
          const content = link('tag/' + row.id + '?tab=institutions', data)
          const percent = get_percent(data / institution_max)
          return `${Render.num_percent(content, percent, 'institution', type)}`
        },
      },
      Column.nb_folder_recursive('tag', folder_max),
      Column.nb_child_recursive('tag', tag_max),
      Column.nb_doc_recursive('tag', doc_max),
      Column.nb_dataset_recursive('tag', dataset_max),
      Column.nb_variable('tag', variable_max, { recursive: true }),
    ])

    if (db.use.tag_recursive) {
      columns.push(Column.level(level_max))
    }
    return columns
  }

  const columns = define_columns()

  onMount(() => {
    is_recursive =
      db.use.tag_recursive && ['_index', 'tag', 'tags'].includes($page)
    mounted = true
  })
</script>

{#if tags && tags.length > 0 && mounted}
  <Datatable entity="tag" data={tags_sorted} {is_recursive} {columns} />
{/if}
