<script lang="ts">
  import { onMount } from 'svelte'
  import db from '@db'
  import { page } from '@lib/store'
  import { getParentPath } from '@lib/db'
  import { link, getPercent } from '@lib/util'
  import Column from '@lib/column'
  import Render from '@lib/render'
  import Datatable from '@datatable/Datatable.svelte'

  let { tags } = $props()

  let isRecursive = $state(false)
  let mounted = $state(false)

  let tagMax = 0
  let institutionMax = 0
  let folderMax = 0
  let docMax = 0
  let datasetMax = 0
  let variableMax = 0
  let levelMax = 0
  for (const tag of tags) {
    if (db.use.tag_recursive) tag.path_string = getParentPath(tag)
    if (tag.nb_child_recursive > tagMax) tagMax = tag.nb_child_recursive
    if (tag.nb_institution_recursive > institutionMax)
      institutionMax = tag.nb_institution_recursive
    if (tag.nb_folder_recursive > folderMax) folderMax = tag.nb_folder_recursive
    if (tag.nb_doc_recursive > docMax) docMax = tag.nb_doc_recursive
    if (tag.nb_dataset_recursive > datasetMax)
      datasetMax = tag.nb_dataset_recursive
    if (tag.nb_variable_recursive > variableMax)
      variableMax = tag.nb_variable_recursive
    if (tag.parents?.length + 1 > levelMax) levelMax = tag.parents?.length + 1
  }

  const tagsSorted = [...tags]
  if (db.use.tag_recursive) {
    tagsSorted.sort((a, b) => a.path_string.localeCompare(b.path_string))
  }

  function defineColumns() {
    let columns = []
    columns.push(Column.favorite())
    if (db.use.tag_recursive) {
      columns.push(
        Column.name('tag', 'Mot clé', {
          withIndent: true,
          linkSameEntityTab: true,
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
        filterType: 'input',
        tooltip: "Nombre d'institutions",
        render: (data, type, row) => {
          if (!data) return ''
          const content = link('tag/' + row.id + '?tab=institutions', data)
          const percent = getPercent(data / institutionMax)
          return `${Render.numPercent(content, percent, 'institution', type)}`
        },
      },
      Column.nbFolderRecursive('tag', folderMax),
      Column.nbChildRecursive('tag', tagMax),
      Column.nbDocRecursive('tag', docMax),
      Column.nbDatasetRecursive('tag', datasetMax),
      Column.nbVariable('tag', variableMax, { recursive: true }),
    ])

    if (db.use.tag_recursive) {
      columns.push(Column.level(levelMax))
    }
    return columns
  }

  const columns = defineColumns()

  onMount(() => {
    isRecursive =
      db.use.tag_recursive && ['_index', 'tag', 'tags'].includes($page)
    mounted = true
  })
</script>

{#if tags && tags.length > 0 && mounted}
  <Datatable entity="tag" data={tagsSorted} {isRecursive} {columns} />
{/if}
