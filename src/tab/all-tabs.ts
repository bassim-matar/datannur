import Institutions from '@component/institution/Institutions.svelte'
import Folders from '@component/folder/Folders.svelte'
import Tags from '@component/tag/Tags.svelte'
import Docs from '@component/doc/Docs.svelte'
import Datasets from '@component/dataset/Datasets.svelte'
import Variables from '@component/variable/Variables.svelte'
import Modalities from '@component/modality/Modalities.svelte'
import ModalitiesCompare from '@component/modality/ModalitiesCompare.svelte'
import DatasetVariables from '@component/dataset/DatasetVariables.svelte'
import Values from '@component/modality/Values.svelte'
import VariableValues from '@component/variable/VariableValues.svelte'
import Freq from '@component/variable/Freq.svelte'
import InstitutionInfo from '@component/institution/InstitutionInfo.svelte'
import FolderInfo from '@component/folder/FolderInfo.svelte'
import TagInfo from '@component/tag/TagInfo.svelte'
import DocInfo from '@component/doc/DocInfo.svelte'
import DatasetInfo from '@component/dataset/DatasetInfo.svelte'
import VariableInfo from '@component/variable/VariableInfo.svelte'
import ModalityInfo from '@component/modality/ModalityInfo.svelte'
import MetaDiagramm from '@component/MetaDiagramm.svelte'
import DatasetPreview from '@component/preview/DatasetPreview.svelte'
import VariablePreview from '@component/preview/VariablePreview.svelte'
import AboutFile from '@layout/AboutFile.svelte'
import Stat from '@stat/Stat.svelte'
import AllFav from '@favorite/AllFav.svelte'
import Options from '@component/options/Options.svelte'
import Logs from '@component/options/Logs.svelte'
import Evolution from '@component/Evolution.svelte'

import { allTabsIcon } from '@lib/store'
import type { Row } from '@type'

export const allTabs: Row = {
  institutions: {
    name: 'Institution',
    icon: 'institution',
    component: Institutions,
  },
  folders: {
    name: 'Dossier',
    icon: 'folder',
    component: Folders,
  },
  tags: {
    name: 'Mot clé',
    icon: 'tag',
    component: Tags,
  },
  datasets: {
    name: 'Dataset',
    icon: 'dataset',
    component: Datasets,
  },
  variables: {
    name: 'Variable',
    icon: 'variable',
    component: Variables,
  },
  modalities: {
    name: 'Modalité',
    icon: 'modality',
    component: Modalities,
  },
  modalitiesCompare: {
    name: 'Similitude',
    icon: 'compare',
    component: ModalitiesCompare,
    loadAsync: true,
  },
  datasetVariables: {
    name: 'Variable',
    icon: 'variable',
    component: DatasetVariables,
  },
  values: {
    name: 'Valeur',
    icon: 'value',
    component: Values,
  },
  variableValues: {
    name: 'Valeur',
    icon: 'value',
    component: VariableValues,
  },
  freq: {
    name: 'Fréquence',
    icon: 'freq',
    component: Freq,
  },
  allFav: {
    name: 'Favori',
    icon: 'favorite',
    component: AllFav,
  },
  logs: {
    name: 'Log',
    icon: 'log',
    component: Logs,
  },
  evolutions: {
    name: 'Evolution',
    icon: 'evolution',
    component: Evolution,
  },
  metaFolders: {
    name: 'Dossier',
    icon: 'folder',
    component: Folders,
    isMeta: true,
    metaKey: 'folders',
  },
  metaDatasets: {
    name: 'Dataset',
    icon: 'dataset',
    component: Datasets,
    isMeta: true,
    metaKey: 'datasets',
  },
  metaVariables: {
    name: 'Variable',
    icon: 'variable',
    component: Variables,
    isMeta: true,
    metaKey: 'variables',
  },
  metaDatasetVariables: {
    name: 'Variable',
    icon: 'variable',
    component: DatasetVariables,
    isMeta: true,
    metaKey: 'datasetVariables',
  },
  variableMetaValues: {
    name: 'Valeur',
    icon: 'value',
    component: VariableValues,
    isMeta: true,
    metaKey: 'variableValues',
  },
  metaDiagramm: {
    name: 'Diagramme',
    icon: 'diagram',
    component: MetaDiagramm,
    withoutNum: true,
    withoutProp: true,
    footerVisible: true,
  },
  docs: {
    name: 'Doc',
    icon: 'doc',
    component: Docs,
  },
  options: {
    name: 'Option',
    icon: 'option',
    component: Options,
    withoutNum: true,
    withoutProp: true,
    padding: true,
    footerVisible: true,
  },
  datasetPreview: {
    name: 'Aperçu',
    icon: 'preview',
    component: DatasetPreview,
  },
  variablePreview: {
    name: 'Aperçu',
    icon: 'preview',
    component: VariablePreview,
  },
  stat: {
    name: 'Stat',
    icon: 'stat',
    component: Stat,
    withoutProp: true,
    footerVisible: true,
  },
  aboutOrganisation: {
    name: 'Organisation',
    icon: 'diagram',
    component: AboutFile,
    footerVisible: true,
    useAboutFile: true,
  },
  aboutFunctionality: {
    name: 'Fonctionnalité',
    icon: 'functionality',
    component: AboutFile,
    footerVisible: true,
    useAboutFile: true,
  },
  homepage: { icon: 'home' },
  meta: { icon: 'internalView' },
  metaFolder: { icon: 'folder' },
  metaDataset: { icon: 'dataset' },
  metaVariable: { icon: 'variable' },
}

const infoItems = {
  aboutFile: AboutFile,
  institution: InstitutionInfo,
  folder: FolderInfo,
  tag: TagInfo,
  doc: DocInfo,
  dataset: DatasetInfo,
  variable: VariableInfo,
  modality: ModalityInfo,
}
for (const [key, value] of Object.entries(infoItems)) {
  ;(allTabs as Row)[key] = {
    name: 'A propos',
    icon: 'about',
    component: value,
    footerVisible: true,
  }
}

const allTabsIconValue: Record<string, { icon: string }> = {}
for (const key in allTabs) {
  const tab = allTabs[key] as { icon: string }
  allTabsIconValue[key] = { icon: tab.icon }
}
allTabsIcon.set(allTabsIconValue)
