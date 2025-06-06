export default {
  name: {
    name: "Nom",
    type: "string",
    nb_range: 5,
    get_value: x => x.name?.length,
  },
  description: {
    name: "Description",
    type: "string",
    nb_range: 5,
    get_value: x => x.description?.length,
  },
  tag: {
    name: "Mots clés",
    type: "category",
    non_exclusive: "tags",
  },
  frequency: {
    name: "Fréquence",
    type: "category",
    variable: "updating_each",
  },
  last_update: {
    icon: "time_ago",
    name: "Mise à jour",
    type: "numeric",
    variable: "last_update_date",
    range_type: "time_ago",
    parse_date: true,
  },
  last_update_doc: {
    icon: "time_ago",
    name: "Mise à jour",
    type: "numeric",
    variable: "last_update",
    range_type: "time_ago",
  },
  type: {
    name: "Type",
    type: "category",
    variable: "type_clean",
  },
  doc_type: {
    name: "Type",
    icon: "type",
    type: "category",
    variable: "type",
  },
  modality: {
    name: "Nombre de modalités",
    type: "category_ordered",
    get_value: x => x.modalities?.length,
  },
  entity: {
    name: "Entités",
    type: "category",
    non_exclusive: "entities",
  },
  variable: {
    name: "Nombre de variables",
    type: "numeric",
    variable: "nb_variable",
  },
  value: {
    name: "Nombre de valeurs",
    type: "numeric",
    get_value: x => x.values.length,
  },
  nb_row: {
    name: "Nombre de lignes",
    type: "numeric",
    variable: "nb_row",
  },
  level: {
    name: "Niveau de l'arborecence",
    type: "category_ordered",
    get_value: x => x.parents_relative?.length + 1,
  },
  localisation: {
    name: "Localisation",
    type: "category",
    variable: "localisation",
  },
  email: {
    name: "Email",
    type: "string",
    nb_range: 1,
    get_value: x => x.email?.length,
  },
  phone: {
    name: "Téléphone",
    type: "string",
    nb_range: 1,
    get_value: x => x.phone?.length,
  },
  survey_type: {
    name: "Type d'enquête",
    type: "category",
    variable: "survey_type",
  },
  delivery_format: {
    name: "Format de livraison",
    type: "category",
    variable: "delivery_format",
  },
  metadata_path: {
    name: "Metadonnées",
    type: "string",
    nb_range: 1,
    get_value: x => x.metadata_path?.length,
  },
  doc_path: {
    name: "Lien",
    type: "string",
    nb_range: 1,
    get_value: x => x.path?.length,
  },
  git_code: {
    name: "Repo GIT",
    type: "string",
    nb_range: 1,
    get_value: x => x.git_code?.length,
  },
  action: {
    icon: "log",
    name: "Log",
    get_value: item => item.action,
  },
  page: {
    name: "Charger la page",
    get_value: item => item.element,
    subtype: x => x.action_name === "load_page",
  },
  tab: {
    name: "Sélectionner l'onglet",
    get_value: item => item.element,
    subtype: x => x.action_name === "select_tab",
  },
  search: {
    name: "Rechercher",
    get_value: item => item.element,
    subtype: x => x.action_name === "search_bar",
  },
  time_ago: {
    name: "Moment",
    type: "numeric",
    variable: "timestamp",
    range_type: "time_ago",
  },
}
