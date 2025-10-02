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
    variable: 'updatingEach',
  },
  lastUpdate: {
    icon: 'timeAgo',
    name: 'Mise à jour',
    type: 'numeric',
    variable: 'lastUpdateDate',
    rangeType: 'timeAgo',
    parseDate: true,
  },
  lastUpdateDoc: {
    icon: 'timeAgo',
    name: 'Mise à jour',
    type: 'numeric',
    variable: 'lastUpdate',
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
    type: 'categoryOrdered',
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
  nbRow: {
    name: 'Nombre de lignes',
    type: 'numeric',
    variable: 'nbRow',
  },
  level: {
    name: "Niveau de l'arborecence",
    type: 'categoryOrdered',
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
  surveyType: {
    name: "Type d'enquête",
    type: 'category',
    variable: 'surveyType',
  },
  deliveryFormat: {
    name: 'Format de livraison',
    type: 'category',
    variable: 'deliveryFormat',
  },
  metadataPath: {
    name: 'Metadonnées',
    type: 'string',
    nbRange: 1,
    getValue: x => x.metadataPath?.length,
  },
  docPath: {
    name: 'Lien',
    type: 'string',
    nbRange: 1,
    getValue: x => x.path?.length,
  },
  gitCode: {
    name: 'Repo GIT',
    type: 'string',
    nbRange: 1,
    getValue: x => x.gitCode?.length,
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
    subtype: x => x.actionName === 'loadPage',
  },
  tab: {
    name: "Sélectionner l'onglet",
    withHtml: {
      text: 'element',
      icon: 'elementIcon',
      link: 'elementLink',
    },
    subtype: x => x.actionName === 'selectTab',
  },
  search: {
    name: 'Rechercher',
    withHtml: {
      text: 'element',
      icon: 'elementIcon',
      link: 'elementLink',
    },
    subtype: x => x.actionName === 'searchBar',
  },
  timeAgo: {
    name: 'Moment',
    type: 'numeric',
    variable: 'timestamp',
    rangeType: 'timeAgo',
  },
}
