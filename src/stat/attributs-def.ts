export default {
  name: {
    name: 'Nom',
    type: 'string',
    nbRange: 5,
    getValue: x => x.name?.length,
  },
  description: {
    name: 'Description',
    type: 'string',
    nbRange: 5,
    getValue: x => x.description?.length,
  },
  tag: {
    name: 'Mots clés',
    type: 'category',
    nonExclusive: 'tags',
  },
  frequency: {
    name: 'Fréquence',
    type: 'category',
    variable: 'updating_each',
  },
  last_update: {
    icon: 'timeAgo',
    name: 'Mise à jour',
    type: 'numeric',
    variable: 'last_update_date',
    rangeType: 'timeAgo',
    parseDate: true,
  },
  lastUpdateDoc: {
    icon: 'timeAgo',
    name: 'Mise à jour',
    type: 'numeric',
    variable: 'last_update',
    rangeType: 'timeAgo',
  },
  type: {
    name: 'Type',
    type: 'category',
    variable: 'typeClean',
  },
  docType: {
    name: 'Type',
    icon: 'type',
    type: 'category',
    variable: 'type',
  },
  modality: {
    name: 'Nombre de modalités',
    type: 'category_ordered',
    getValue: x => x.modalities?.length,
  },
  entity: {
    name: 'Entités',
    type: 'category',
    nonExclusive: 'entities',
  },
  variable: {
    name: 'Nombre de variables',
    type: 'numeric',
    variable: 'nbVariable',
  },
  value: {
    name: 'Nombre de valeurs',
    type: 'numeric',
    getValue: x => x.values?.length,
  },
  nb_row: {
    name: 'Nombre de lignes',
    type: 'numeric',
    variable: 'nb_row',
  },
  level: {
    name: "Niveau de l'arborecence",
    type: 'category_ordered',
    getValue: x => x.parentsRelative?.length + 1,
  },
  localisation: {
    name: 'Localisation',
    type: 'category',
    variable: 'localisation',
  },
  email: {
    name: 'Email',
    type: 'string',
    nbRange: 1,
    getValue: x => x.email?.length,
  },
  phone: {
    name: 'Téléphone',
    type: 'string',
    nbRange: 1,
    getValue: x => x.phone?.length,
  },
  survey_type: {
    name: "Type d'enquête",
    type: 'category',
    variable: 'survey_type',
  },
  delivery_format: {
    name: 'Format de livraison',
    type: 'category',
    variable: 'delivery_format',
  },
  metadata_path: {
    name: 'Metadonnées',
    type: 'string',
    nbRange: 1,
    getValue: x => x.metadata_path?.length,
  },
  docPath: {
    name: 'Lien',
    type: 'string',
    nbRange: 1,
    getValue: x => x.path?.length,
  },
  git_code: {
    name: 'Repo GIT',
    type: 'string',
    nbRange: 1,
    getValue: x => x.git_code?.length,
  },
  actionReadable: {
    icon: 'log',
    name: 'Log',
    withHtml: {
      text: 'actionReadable',
      icon: 'actionIcon',
      link: 'actionLink',
    },
  },
  page: {
    name: 'Charger la page',
    withHtml: {
      text: 'element',
      icon: 'elementIcon',
      link: 'elementLink',
    },
    subtype: x => x.actionName === 'load_page',
  },
  tab: {
    name: "Sélectionner l'onglet",
    withHtml: {
      text: 'element',
      icon: 'elementIcon',
      link: 'elementLink',
    },
    subtype: x => x.actionName === 'select_tab',
  },
  search: {
    name: 'Rechercher',
    withHtml: {
      text: 'element',
      icon: 'elementIcon',
      link: 'elementLink',
    },
    subtype: x => x.actionName === 'search_bar',
  },
  timeAgo: {
    name: 'Moment',
    type: 'numeric',
    variable: 'timestamp',
    rangeType: 'timeAgo',
  },
}
