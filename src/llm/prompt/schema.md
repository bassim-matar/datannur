## DATA SCHEMA

TypeScript types of the processed database with field descriptions.

### Main Entities

#### Dataset

Collection de données tabulaires avec variables (colonnes).

**Raw fields (from database):**

- id: string - Identifiant unique du dataset
- folderId: string|number - Clé du dossier contenant le dataset
- ownerId: string|number - Clé de l'institution propriétaire
- managerId: string|number - Clé de l'institution gestionnaire
- name: string - Nom du dataset
- description: string - Description du dataset
- type: string - Type de dataset (panel, cross-section, time-series, etc.)
- nbRow: number - Nombre de lignes dans le dataset
- startDate: string - Début de la période couverte
- endDate: string - Fin de la période couverte
- lastUpdateDate: string - Date de dernière mise à jour
- tagIds: string - Clés des mots-clés liés (format: "id1,id2,id3")
- docIds: string - Clés des documents liés (format: "id1,id2,id3")

**Computed fields (added by app):**

- typeClean: string - Type humanisé pour affichage
- folderName: string - Nom du dossier parent (dénormalisé)
- ownerName: string - Nom de l'institution propriétaire (dénormalisé)
- managerName: string - Nom de l'institution gestionnaire (dénormalisé)
- nbVariable: number - Nombre de variables dans ce dataset (calculé)
- period: string - Période formatée (ex: "2020 - 2025")
- nextUpdateDate: string - Date de prochaine mise à jour prévue (calculée)

**Relations:**

- variables: Variable[] - Variables contenues dans le dataset
- tags: Tag[] - Mots-clés associés
- docs: Doc[] - Documents liés

---

#### Variable

Colonne/champ dans un dataset.

**Raw fields:**

- id: string - Identifiant unique de la variable
- datasetId: string|number - Clé du dataset contenant la variable
- name: string - Nom de la variable
- originalName: string - Nom d'origine de la variable
- description: string - Description de la variable
- type: string - Type de données (string, integer, float, date, etc.)
- nbDistinct: number - Nombre de valeurs distinctes
- nbMissing: number - Nombre de valeurs manquantes
- nbDuplicate: number - Nombre de valeurs dupliquées
- modalityIds: string - Clés des modalités liées
- tagIds: string - Clés des mots-clés liés
- key: boolean - Est ou fait partie d'une clé unique

**Computed fields:**

- datasetName: string - Nom du dataset parent (dénormalisé)
- folderName: string - Nom du dossier (dénormalisé)
- typeClean: string - Type humanisé
- num: number - Position dans le dataset (1, 2, 3...)
- nbValue: number - Nombre de valeurs distinctes
- hasFreq: boolean - A une distribution de fréquences

**Relations:**

- modalities: Modality[] - Modalités associées
- tags: Tag[] - Mots-clés associés
- values: Value[] - Échantillon de valeurs

---

#### Folder

Organisation hiérarchique des datasets (peut être imbriqué).

**Raw fields:**

- id: string - Identifiant unique
- parentId: string|number - Clé du dossier parent (pour hiérarchie)
- name: string - Nom du dossier
- description: string - Description

**Computed fields:**

- nbDatasetRecursive: number - Nombre de datasets (incluant sous-dossiers)
- nbVariableRecursive: number - Nombre de variables (incluant sous-dossiers)
- pathString: string - Chemin complet dans la hiérarchie

---

#### Institution

Organisation qui possède ou gère des données.

**Raw fields:**

- id: string - Identifiant unique
- parentId: string|number - Institution parente (hiérarchie)
- name: string - Nom de l'institution
- email: string - Email de contact
- phone: string - Téléphone

**Computed fields:**

- nbDataset: number - Nombre de datasets gérés
- nbFolder: number - Nombre de dossiers gérés

---

#### Tag

Mot-clé/label pour catégorisation (hiérarchique).

**Raw fields:**

- id: string - Identifiant unique
- parentId: string|number - Tag parent (hiérarchie)
- name: string - Nom du tag
- description: string - Description

**Computed fields:**

- nbDataset: number - Nombre de datasets tagués
- nbVariable: number - Nombre de variables taguées

---

#### Modality

Nomenclature standardisée pour variables catégorielles.

**Raw fields:**

- id: string - Identifiant unique
- folderId: string|number - Dossier parent
- name: string - Nom de la modalité
- description: string - Description
- type: string - Type de modalité

**Computed fields:**

- nbVariable: number - Nombre de variables utilisant cette modalité
- nbValue: number - Nombre de valeurs dans la modalité

---

#### Doc

Document/fichier de métadonnées.

**Raw fields:**

- id: string - Identifiant unique
- name: string - Nom du document
- path: string - Chemin du fichier
- type: string - Type de fichier (pdf, html, md, etc.)

**Computed fields:**

- nbDataset: number - Nombre de datasets liés
- nbVariable: number - Nombre de variables liées

---

### Relationships

- Dataset → Folder (many-to-one via folderId)
- Dataset → Institution (owner via ownerId, manager via managerId)
- Variable → Dataset (many-to-one via datasetId)
- Variable → Modality (many-to-many via modalityIds)
- All entities → Tags (many-to-many via tagIds)
- All entities → Docs (many-to-many via docIds)

---

### Notes

- All IDs are strings or numbers
- Comma-separated ID fields (tagIds, docIds, modalityIds) use format: "id1,id2,id3"
- Computed fields are calculated during app initialization
- Relations are loaded on demand
