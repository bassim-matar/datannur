import Institutions from "@component/institution/Institutions.svelte"
import Folders from "@component/folder/Folders.svelte"
import Tags from "@component/tag/Tags.svelte"
import Docs from "@component/doc/Docs.svelte"
import Datasets from "@component/dataset/Datasets.svelte"
import Variables from "@component/variable/Variables.svelte"
import Modalities from "@component/modality/Modalities.svelte"
import ModalitiesCompare from "@component/modality/ModalitiesCompare.svelte"
import DatasetVariables from "@component/dataset/DatasetVariables.svelte"
import Values from "@component/modality/Values.svelte"
import VariableValues from "@component/variable/VariableValues.svelte"
import Logs from "@component/options/Logs.svelte"
import InstitutionInfo from "@component/institution/InstitutionInfo.svelte"
import FolderInfo from "@component/folder/FolderInfo.svelte"
import TagInfo from "@component/tag/TagInfo.svelte"
import DocInfo from "@component/doc/DocInfo.svelte"
import DatasetInfo from "@component/dataset/DatasetInfo.svelte"
import VariableInfo from "@component/variable/VariableInfo.svelte"
import ModalityInfo from "@component/modality/ModalityInfo.svelte"
import OptionsExport from "@component/options/OptionsExport.svelte"
import OptionsImport from "@component/options/OptionsImport.svelte"
import Options from "@component/options/Options.svelte"
import MetaDiagramm from "@component/MetaDiagramm.svelte"
import DatasetPreview from "@component/preview/DatasetPreview.svelte"
import VariablePreview from "@component/preview/VariablePreview.svelte"
import TextContent from "@layout/TextContent.svelte"
import AboutFile from "@layout/AboutFile.svelte"
import Stat from "@stat/Stat.svelte"
import AllFav from "@favorite/AllFav.svelte"

import { all_tabs_icon } from "@js/store"

export const all_tabs = {
  institutions: {
    name: "Institutions",
    icon: "institution",
    component: Institutions,
  },
  folders: {
    name: "Dossiers",
    icon: "folder",
    component: Folders,
  },
  tags: {
    name: "Mots clés",
    icon: "tag",
    component: Tags,
  },
  datasets: {
    name: "Datasets",
    icon: "dataset",
    component: Datasets,
  },
  variables: {
    name: "Variables",
    icon: "variable",
    component: Variables,
  },
  modalities: {
    name: "Modalités",
    icon: "modality",
    component: Modalities,
  },
  modalities_compare: {
    name: "Similitudes",
    icon: "compare",
    component: ModalitiesCompare,
    load_async: true,
  },
  dataset_variables: {
    name: "Variables",
    icon: "variable",
    component: DatasetVariables,
  },
  values: {
    name: "Valeurs",
    icon: "value",
    component: Values,
  },
  variable_values: {
    name: "Valeurs",
    icon: "value",
    component: VariableValues,
  },
  all_fav: {
    name: "Favoris",
    icon: "favorite",
    component: AllFav,
  },
  logs: {
    name: "Logs",
    icon: "log",
    component: Logs,
  },
  metaFolders: {
    name: "Dossiers",
    icon: "folder",
    component: Folders,
    is_meta: true,
    meta_key: "folders",
  },
  metaDatasets: {
    name: "Datasets",
    icon: "dataset",
    component: Datasets,
    is_meta: true,
    meta_key: "datasets",
  },
  metaVariables: {
    name: "Variables",
    icon: "variable",
    component: Variables,
    is_meta: true,
    meta_key: "variables",
  },
  meta_dataset_variables: {
    name: "Variables",
    icon: "variable",
    component: DatasetVariables,
    is_meta: true,
    meta_key: "dataset_variables",
  },
  metaDiagramm: {
    name: "Diagramme",
    icon: "diagram",
    component: MetaDiagramm,
    without_num: true,
    without_prop: true,
    without_load: true,
    footer_visible: true,
  },
  docs: {
    name: "Docs",
    icon: "doc",
    component: Docs,
  },
  options_export: {
    name: "Exporter",
    icon: "download",
    component: OptionsExport,
    without_num: true,
    without_prop: true,
    padding: true,
    without_load: true,
    footer_visible: true,
  },
  options_import: {
    name: "Importer",
    icon: "upload",
    component: OptionsImport,
    without_num: true,
    without_prop: true,
    padding: true,
    without_load: true,
    footer_visible: true,
  },
  options: {
    name: "Options",
    icon: "option",
    component: Options,
    without_num: true,
    without_prop: true,
    padding: true,
    without_load: true,
    footer_visible: true,
  },
  dataset_preview: {
    name: "Aperçu",
    icon: "search",
    component: DatasetPreview,
  },
  variable_preview: {
    name: "Aperçu",
    icon: "search",
    component: VariablePreview,
  },
  stat: {
    name: "Stat",
    icon: "stat",
    component: Stat,
    without_num: true,
    without_prop: true,
    without_load: true,
    footer_visible: false,
  },
  homepage: { icon: "home" },
  meta: { icon: "house-laptop" },
  metaFolder: { icon: "folder" },
  metaDataset: { icon: "dataset" },
  metaVariable: { icon: "variable" },
}

const info_items = {
  about_file: AboutFile,
  info: TextContent,
  institution_info: InstitutionInfo,
  folder_info: FolderInfo,
  tag_info: TagInfo,
  doc_info: DocInfo,
  dataset_info: DatasetInfo,
  variable_info: VariableInfo,
  modality_info: ModalityInfo,
}
for (const [key, value] of Object.entries(info_items)) {
  all_tabs[key] = {
    name: "A propos",
    icon: "about",
    component: value,
    without_load: true,
    footer_visible: true,
  }
}

const all_tabs_icon_value = {}
for (let key in all_tabs) {
  all_tabs_icon_value[key] = { icon: all_tabs[key].icon }
}
all_tabs_icon.update(value => (value = all_tabs_icon_value))
