<script lang="ts">
  import { untrack } from 'svelte'
  import { onMount } from 'svelte'
  import db from '@db'
  import { page, link } from 'svelte-fileapp'
  import { getParentPath } from '@lib/db'
  import { getPercent } from '@lib/util'
  import Column from '@lib/column'
  import Render from '@lib/render'
  import Datatable from '@datatable/Datatable.svelte'
  import escapeHtml from 'escape-html'
  import type { Tag, Column as ColumnType } from '@type'

  let { tags: tagsProp }: { tags: Tag[] } = $props()
  const tags = untrack(() => tagsProp)

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
    if (db.useRecursive.tag) tag.pathString = getParentPath(tag)
    if (tag.nbChildRecursive ?? 0 > tagMax) tagMax = tag.nbChildRecursive ?? 0
    if (tag.nbInstitutionRecursive ?? 0 > institutionMax)
      institutionMax = tag.nbInstitutionRecursive ?? 0
    if (tag.nbFolderRecursive ?? 0 > folderMax)
      folderMax = tag.nbFolderRecursive ?? 0
    if (tag.nbDocRecursive ?? 0 > docMax) docMax = tag.nbDocRecursive ?? 0
    if (tag.nbDatasetRecursive ?? 0 > datasetMax)
      datasetMax = tag.nbDatasetRecursive ?? 0
    if (tag.nbVariableRecursive ?? 0 > variableMax)
      variableMax = tag.nbVariableRecursive ?? 0
    if ((tag.parents?.length ?? 0) + 1 > levelMax)
      levelMax = (tag.parents?.length ?? 0) + 1
  }

  const tagsSorted = [...tags]
  if (db.useRecursive.tag) {
    tagsSorted.sort((a, b) =>
      (a.pathString ?? '').localeCompare(b.pathString ?? ''),
    )
  }

  function defineColumns() {
    let columns: ColumnType[] = []
    columns.push(Column.favorite())
    if (db.useRecursive.tag) {
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

    if (db.useRecursive.tag) {
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
        render: (data, type, row: Tag) => {
          if (!data) return ''
          if (type !== 'display') return Number(data)
          const content = link(
            'tag/' + row.id + '?tab=institutions',
            escapeHtml(data),
          )
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

    if (db.useRecursive.tag) {
      columns.push(Column.level(levelMax))
    }
    return columns
  }

  const columns = defineColumns()

  onMount(() => {
    isRecursive =
      !!db.useRecursive.tag && ['_index', 'tag', 'tags'].includes($page)
    mounted = true
  })
</script>

{#if tags && tags.length > 0 && mounted}
  <Datatable entity="tag" data={tagsSorted} {isRecursive} {columns} />
{/if}
