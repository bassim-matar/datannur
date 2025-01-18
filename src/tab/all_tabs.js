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
import InstitutionInfo from "@component/institution/InstitutionInfo.svelte"
import FolderInfo from "@component/folder/FolderInfo.svelte"
import TagInfo from "@component/tag/TagInfo.svelte"
import DocInfo from "@component/doc/DocInfo.svelte"
import DatasetInfo from "@component/dataset/DatasetInfo.svelte"
import VariableInfo from "@component/variable/VariableInfo.svelte"
import ModalityInfo from "@component/modality/ModalityInfo.svelte"
import MetaDiagramm from "@component/MetaDiagramm.svelte"
import DatasetPreview from "@component/preview/DatasetPreview.svelte"
import VariablePreview from "@component/preview/VariablePreview.svelte"
import AboutFile from "@layout/AboutFile.svelte"
import Stat from "@stat/Stat.svelte"
import AllFav from "@favorite/AllFav.svelte"
import Options from "@component/options/Options.svelte"
import Logs from "@component/options/Logs.svelte"
import Evolution from "@component/Evolution.svelte"

import { all_tabs_icon } from "@js/store"

export const all_tabs = {
  institutions: {
    name: "Institution",
    icon: "institution",
    component: Institutions,
  },
  folders: {
    name: "Dossier",
    icon: "folder",
    component: Folders,
  },
  tags: {
    name: "Mot clé",
    icon: "tag",
    component: Tags,
  },
  datasets: {
    name: "Dataset",
    icon: "dataset",
    component: Datasets,
  },
  variables: {
    name: "Variable",
    icon: "variable",
    component: Variables,
  },
  modalities: {
    name: "Modalité",
    icon: "modality",
    component: Modalities,
  },
  modalities_compare: {
    name: "Similitude",
    icon: "compare",
    component: ModalitiesCompare,
    load_async: true,
  },
  dataset_variables: {
    name: "Variable",
    icon: "variable",
    component: DatasetVariables,
  },
  values: {
    name: "Valeur",
    icon: "value",
    component: Values,
  },
  variable_values: {
    name: "Valeur",
    icon: "value",
    component: VariableValues,
  },
  all_fav: {
    name: "Favori",
    icon: "favorite",
    component: AllFav,
  },
  logs: {
    name: "Log",
    icon: "log",
    component: Logs,
  },
  evolutions: {
    name: "Evolution",
    icon: "evolution",
    component: Evolution,
  },
  metaFolders: {
    name: "Dossier",
    icon: "folder",
    component: Folders,
    is_meta: true,
    meta_key: "folders",
  },
  metaDatasets: {
    name: "Dataset",
    icon: "dataset",
    component: Datasets,
    is_meta: true,
    meta_key: "datasets",
  },
  metaVariables: {
    name: "Variable",
    icon: "variable",
    component: Variables,
    is_meta: true,
    meta_key: "variables",
  },
  meta_dataset_variables: {
    name: "Variable",
    icon: "variable",
    component: DatasetVariables,
    is_meta: true,
    meta_key: "dataset_variables",
  },
  variable_metaValues: {
    name: "Valeur",
    icon: "value",
    component: VariableValues,
    is_meta: true,
    meta_key: "variable_values",
  },
  metaDiagramm: {
    name: "Diagramme",
    icon: "diagram",
    component: MetaDiagramm,
    without_num: true,
    without_prop: true,
    footer_visible: true,
  },
  docs: {
    name: "Doc",
    icon: "doc",
    component: Docs,
  },
  options: {
    name: "Option",
    icon: "option",
    component: Options,
    without_num: true,
    without_prop: true,
    padding: true,
    footer_visible: true,
  },
  dataset_preview: {
    name: "Aperçu",
    icon: "preview",
    component: DatasetPreview,
  },
  variable_preview: {
    name: "Aperçu",
    icon: "preview",
    component: VariablePreview,
  },
  stat: {
    name: "Stat",
    icon: "stat",
    component: Stat,
    without_prop: true,
    footer_visible: true,
  },
  about_organisation: {
    name: "Organisation",
    icon: "diagram",
    component: AboutFile,
    footer_visible: true,
    use_about_file: true,
  },
  about_functionality: {
    name: "Fonctionnalité",
    icon: "functionality",
    component: AboutFile,
    footer_visible: true,
    use_about_file: true,
  },
  homepage: { icon: "home" },
  meta: { icon: "house-laptop" },
  metaFolder: { icon: "folder" },
  metaDataset: { icon: "dataset" },
  metaVariable: { icon: "variable" },
}

const info_items = {
  about_file: AboutFile,
  institution: InstitutionInfo,
  folder: FolderInfo,
  tag: TagInfo,
  doc: DocInfo,
  dataset: DatasetInfo,
  variable: VariableInfo,
  modality: ModalityInfo,
}
for (const [key, value] of Object.entries(info_items)) {
  all_tabs[key] = {
    name: "A propos",
    icon: "about",
    component: value,
    footer_visible: true,
  }
}

const all_tabs_icon_value = {}
for (let key in all_tabs) {
  all_tabs_icon_value[key] = { icon: all_tabs[key].icon }
}
all_tabs_icon.update(value => (value = all_tabs_icon_value))
