<script lang="ts">
  import { link, wrapLongText, getPercent } from '@lib/util'
  import { getParentPath } from '@lib/db'
  import Column from '@lib/column'
  import Render from '@lib/render'
  import Datatable from '@datatable/Datatable.svelte'
  import escapeHtml from 'escape-html'

  let { folders, isMeta = false } = $props()

  const foldersSorted = [...folders]
  const folderPath = isMeta ? 'metaFolder/' : 'folder/'
  const metaPath = isMeta ? 'metaFolder' : false

  let variableMax = 0
  let datasetMax = 0
  let folderMax = 0
  let nbDocMax = 0
  let levelMax = 0

  if (!isMeta) {
    for (const folder of folders) {
      folder.pathString = getParentPath(folder)
      if (folder.nbDatasetRecursive > datasetMax) {
        datasetMax = folder.nbDatasetRecursive
      }
      if (folder.nbVariableRecursive > variableMax) {
        variableMax = folder.nbVariableRecursive
      }
      if (folder.nbChildRecursive > folderMax) {
        folderMax = folder.nbChildRecursive
      }
      if (folder.docsRecursive?.length > nbDocMax) {
        nbDocMax = folder.docsRecursive?.length
      }
      if (folder.parents?.length + 1 > levelMax) {
        levelMax = folder.parents?.length + 1
      }
    }
    foldersSorted.sort((a, b) => a.pathString.localeCompare(b.pathString))
  }

  if (isMeta) {
    for (const folder of folders) {
      datasetMax = Math.max(datasetMax, folder.nbDataset)
      variableMax = Math.max(variableMax, folder.nbVariable)
    }
  }

  function defineColumns() {
    if (isMeta) {
      return [
        Column.name('folder', 'Dossiers'),
        Column.description(),
        {
          data: 'nbDataset',
          title: Render.icon('dataset') + 'Datasets',
          tooltip: 'Nombre de datasets',
          render: (data, type, row) => {
            if (!data) return ''
            const content = link(
              folderPath + row.id + '?tab=metaDatasets',
              escapeHtml(data),
            )
            const percent = getPercent(data / datasetMax)
            return `${Render.numPercent(content, percent, 'dataset', type)}`
          },
        },
        Column.nbVariable('folder', variableMax, {
          tab: 'metaVariables',
          linkPath: folderPath,
          showTitle: true,
        }),
      ]
    }

    return [
      Column.favorite(),
      Column.name('folder', 'Dossier', {
        withIndent: true,
        linkSameEntityTab: true,
      }),
      Column.description(),
      Column.nbChildRecursive('folder', folderMax, folderPath),
      Column.nbDatasetRecursive('folder', datasetMax),
      Column.nbVariable('folder', variableMax, {
        recursive: true,
      }),
      Column.nbDoc('folder', nbDocMax),
      Column.tag(),
      Column.lastUpdate(),
      Column.nextUpdate(),
      Column.frequency(),
      Column.startDate(),
      Column.endDate(),
      Column.parents('folder'),
      Column.owner(),
      Column.manager(),
      Column.localisation(),
      {
        data: 'survey_type',
        title: Render.icon('survey_type') + "Type d'enquête",
        defaultContent: '',
        tooltip: "Type d'enquête",
        render: Render.shortText,
      },
      Column.deliveryFormat(),
      {
        data: 'metadata_path',
        title: Render.icon('metadata_path') + 'Metadonnées',
        defaultContent: '',
        tooltip: 'Emplacement des métadonnées',
        render: (data, type) => {
          if (!data) return ''
          if (type !== 'display') return data
          return Render.copyCell(escapeHtml(data), type)
        },
      },
      Column.dataPath(),
      {
        data: 'git_code',
        title: Render.icon('git_code') + 'GIT code',
        defaultContent: '',
        tooltip: 'Code source des traitements',
        render: (data, type) => {
          if (!data) return ''
          if (type !== 'display') return data
          data = escapeHtml(data)
          return wrapLongText(`<a href="${data}" target="_blanck">${data}</a>`)
        },
      },
      Column.level(levelMax),
    ]
  }

  const columns = defineColumns()
</script>

<Datatable
  entity="folder"
  data={foldersSorted}
  isRecursive={true}
  {columns}
  {metaPath}
/>
