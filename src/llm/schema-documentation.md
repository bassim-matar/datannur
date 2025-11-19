# Data Catalog Schema

## Main Entities

### Dataset

A collection of tabular data with variables (columns).

**Key fields:**

- id, name, description
- folderId (parent folder)
- type (panel, cross-section, time-series, etc.)
- nbRow (number of rows)
- startDate, endDate (period covered)
- Computed: folderName, ownerName, managerName, nbVariable

**Query examples:**

- All: db.getAll('dataset')
- By folder: db.getAll('dataset', { folderId: '123' })
- By type: db.getAll('dataset', { type: 'panel' })
- By ID: db.get('dataset', 'dataset-123')

### Variable

A column/field within a dataset.

**Key fields:**

- id, name, description, originalName
- datasetId (parent dataset)
- type (data type: string, integer, float, etc.)
- nbDistinct, nbMissing, nbDuplicate (data quality metrics)
- Computed: datasetName, folderName, num (position in dataset)

**Query examples:**

- By dataset: db.getAll('variable', { dataset: '123' })
- By name: db.getAll('variable', { name: 'age' })
- By ID: db.get('variable', 'var-456')

### Folder

Hierarchical organization of datasets (can be nested).

**Key fields:**

- id, name, description
- parentId (for hierarchy)
- Computed: nbDatasetRecursive, nbVariableRecursive

### Institution

Organization that owns or manages data.

**Key fields:**

- id, name, email, phone
- Computed: nbDataset, nbFolder

### Tag

Keyword/label for categorization (hierarchical).

**Key fields:**

- id, name, description
- parentId (for hierarchy)
- Computed: nbDataset, nbVariable

### Modality

Standardized nomenclature for categorical variables.

**Key fields:**

- id, name, description
- Computed: nbVariable, nbValue

## Query Methods

- `db.getAll(entity, criteria?)` → Entity[] - Find all matching entities
- `db.get(entity, id)` → Entity | undefined - Get entity by ID
- `db.getAll(entity).length` → number - Count entities

**Examples:**

```typescript
// Get all datasets
const datasets = db.getAll('dataset')

// Get datasets by folder
const folderDatasets = db.getAll('dataset', { folder: 'folder-123' })

// Get specific dataset
const dataset = db.get('dataset', 'dataset-456')

// Count variables in a dataset
const count = db.getAll('variable', { dataset: 'dataset-456' }).length
```

## Relationships

- Dataset → Folder (many-to-one)
- Dataset → Institution (owner, manager)
- Variable → Dataset (many-to-one)
- Variable → Modality (many-to-many via modalityIds)
- All entities → Tags (many-to-many via tagIds)
- All entities → Docs (many-to-many via docIds)
