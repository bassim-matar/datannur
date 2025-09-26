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
    if (db.use.tagRecursive) tag.pathString = getParentPath(tag)
    if (tag.nbChildRecursive > tagMax) tagMax = tag.nbChildRecursive
    if (tag.nbInstitutionRecursive > institutionMax)
      institutionMax = tag.nbInstitutionRecursive
    if (tag.nbFolderRecursive > folderMax) folderMax = tag.nbFolderRecursive
    if (tag.nbDocRecursive > docMax) docMax = tag.nbDocRecursive
    if (tag.nbDatasetRecursive > datasetMax) datasetMax = tag.nbDatasetRecursive
    if (tag.nbVariableRecursive > variableMax)
      variableMax = tag.nbVariableRecursive
    if (tag.parents?.length + 1 > levelMax) levelMax = tag.parents?.length + 1
  }

  const tagsSorted = [...tags]
  if (db.use.tagRecursive) {
    tagsSorted.sort((a, b) => a.pathString.localeCompare(b.pathString))
  }

  function defineColumns() {
    let columns = []
    columns.push(Column.favorite())
    if (db.use.tagRecursive) {
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

    if (db.use.tagRecursive) {
      columns.push(Column.parents('tag'))
    }

    columns = columns.concat([
      {
        data: 'nbInstitutionRecursive',
        title:
          Render.icon('institution') +
          "<span class='hidden'>nbInstitution</span>",
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

    if (db.use.tagRecursive) {
      columns.push(Column.level(levelMax))
    }
    return columns
  }

  const columns = defineColumns()

  onMount(() => {
    isRecursive =
      db.use.tagRecursive && ['_index', 'tag', 'tags'].includes($page)
    mounted = true
  })
</script>

{#if tags && tags.length > 0 && mounted}
  <Datatable entity="tag" data={tagsSorted} {isRecursive} {columns} />
{/if}
