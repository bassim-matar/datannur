<script lang="ts">
  import { page } from '@lib/store'
  import Column from '@lib/column'
  import Render from '@lib/render'
  import { wrapLongText } from '@lib/util'
  import { highlightDiff } from '@lib/evolution'
  import {
    entityToIcon,
    columnCleanNames,
    columnIcons,
    isBigLimit,
  } from '@lib/constant'
  import Options from '@lib/options'
  import Datatable from '@datatable/Datatable.svelte'

  let { evolutions } = $props()

  let evolutionSummary = $state(Options.get('evolution_summary'))

  function sortEvolutions(toSort) {
    if (toSort.length === 0) return
    toSort.sort((a, b) => b.timestamp - a.timestamp)
  }

  function filterEvolutions(toFilter) {
    if (toFilter.length === 0) return

    const detailEntities = ['dataset', 'variable', 'modality', 'value', 'freq']

    const mainRows = toFilter.filter(
      evo => !detailEntities.includes(evo.entity),
    )

    return mainRows
  }

  const detailPages = [
    'dataset',
    'datasets',
    'variable',
    'variables',
    'modality',
    'modalities',
    'favorite',
  ]
  const filterEvolution =
    evolutionSummary &&
    !detailPages.includes($page) &&
    evolutions.length > isBigLimit

  const evolutionsSorted = filterEvolution
    ? filterEvolutions([...evolutions])
    : [...evolutions]

  sortEvolutions(evolutionsSorted)

  function defineColumns() {
    return [
      Column.favorite(),
      {
        data: 'typeClean',
        title: Render.icon('type'),
        defaultContent: '',
        name: 'evolution_type',
        width: '20px',
        filterType: 'select',
        tooltip: 'Type de modification',
        render: (data, type, row) => {
          if (type === 'sort' || type === 'export' || type === 'filter') {
            return data
          }
          return `
          <span class="icon icon_${row.type}" title="${data}">
            <i class="fas fa-${entityToIcon[row.type]}"></i>
          </span>
          <span style="display: none;">${data}</span>`
        },
      },
      Column.entity(),
      Column.name(),
      Column.parentEntity(),
      {
        data: 'variable',
        title: Render.icon('variable') + 'Variable',
        defaultContent: '',
        name: 'variable',
        filterType: 'input',
        tooltip: 'Nom de la variable',
        render: (data, type) => {
          if (!data) return ''

          let columnCleanName = data
          if (columnCleanNames[data]) columnCleanName = columnCleanNames[data]
          else if (Column[data.toLowerCase()])
            columnCleanName = Column[data.toLowerCase()]?.name

          if (type === 'sort' || type === 'export' || type === 'filter') {
            return columnCleanName
          }

          let icon = data
          if (columnIcons[data]) icon = columnIcons[data]

          return `
          <div style="display: flex; align-items: center;">
            <span class="icon icon_${icon}" title="${data}">
              <i class="fas fa-${entityToIcon[icon] || icon}"></i>
            </span>
            <span style="font-size: 13px;">${columnCleanName}</span>
          </div>`
        },
      },
      {
        data: 'type',
        title: Render.icon('update') + 'Valeur',
        defaultContent: '',
        hasLongText: true,
        name: 'value',
        filterType: 'input',
        tooltip: 'Valeur de la variable',
        render: (data, type, row) => {
          if (!row.old_value && !row.new_value) {
            return ''
          }
          if (row.old_value === row.new_value)
            return wrapLongText(row.old_value)

          const diff = highlightDiff(row.old_value, row.new_value, row.variable)
          if (type === 'sort' || type === 'export' || type === 'filter') {
            return diff
          }
          return wrapLongText(diff)
        },
      },
      {
        data: 'time',
        title: Render.icon('date'),
        defaultContent: '',
        filterType: 'select',
        tooltip: 'passé ou futur',
        render: (data, type) => {
          if (type === 'sort' || type === 'export' || type === 'filter') {
            return data
          }
          return `<span style="display: none;">${data}</span>`
        },
      },
      Column.timestamp(),
    ]
  }
  const columns = defineColumns()
</script>

<Datatable entity="evolution" data={evolutionsSorted} {columns} />
