<script lang="ts">
  import { link, wrapLongText, getPercent } from '@lib/util'
  import { getParentPath } from '@lib/db'
  import Column from '@lib/column'
  import Render from '@lib/render'
  import Datatable from '@datatable/Datatable.svelte'

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
      folder.path_string = getParentPath(folder)
      if (folder.nb_dataset_recursive > datasetMax) {
        datasetMax = folder.nb_dataset_recursive
      }
      if (folder.nb_variable_recursive > variableMax) {
        variableMax = folder.nb_variable_recursive
      }
      if (folder.nb_child_recursive > folderMax) {
        folderMax = folder.nb_child_recursive
      }
      if (folder.docs_recursive?.length > nbDocMax) {
        nbDocMax = folder.docs_recursive?.length
      }
      if (folder.parents?.length + 1 > levelMax) {
        levelMax = folder.parents?.length + 1
      }
    }
    foldersSorted.sort((a, b) => a.path_string.localeCompare(b.path_string))
  }

  if (isMeta) {
    for (const folder of folders) {
      datasetMax = Math.max(datasetMax, folder.nb_dataset)
      variableMax = Math.max(variableMax, folder.nb_variable)
    }
  }

  function defineColumns() {
    if (isMeta) {
      return [
        Column.name('folder', 'Dossiers'),
        Column.description(),
        {
          data: 'nb_dataset',
          title: Render.icon('dataset') + 'Datasets',
          tooltip: 'Nombre de datasets',
          render: (data, type, row) => {
            if (!data) return ''
            const content = link(
              folderPath + row.id + '?tab=metaDatasets',
              data,
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
      },
      Column.deliveryFormat(),
      {
        data: 'metadata_path',
        title: Render.icon('metadata_path') + 'Metadonnées',
        defaultContent: '',
        tooltip: 'Emplacement des métadonnées',
        render: Render.copyCell,
      },
      Column.dataPath(),
      {
        data: 'git_code',
        title: Render.icon('git_code') + 'GIT code',
        defaultContent: '',
        tooltip: 'Code source des traitements',
        render: data =>
          wrapLongText(
            data ? `<a href="${data}" target="_blanck">${data}</a>` : '',
          ),
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
