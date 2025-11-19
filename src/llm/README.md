# LLM Integration Module

Architecture pour intégration LLM dans datannur via API Infomaniak (Qwen3 + Whisper)

## 🚀 Quick Start

### 1. Setup (browser console)

```javascript
// Configurer avec les credentials du POC
setupLLM()
```

Ou manuellement :

```javascript
localStorage.setItem('llm-api-key', 'your-api-key-here')
localStorage.setItem('llm-product-id', 'your-product-id')
```

### 2. Utiliser le composant

```svelte
<script>
  import LLMChat from '@llm/LLMChat.svelte'
</script>

<LLMChat />
```

## 📁 Structure

```
src/llm/
├── index.ts           # Exports publics
├── llm-schema.ts      # Types TypeScript enrichis pour contexte LLM
├── llm-context.ts     # Builder de contexte (DB stats + user + UI)
├── llm-config.ts      # Configuration API Infomaniak
├── llm-client.ts      # Client API avec streaming SSE
├── llm-tools.ts       # Tools appelables par le LLM
├── llm-setup.ts       # Helper pour setup rapide
├── LLMChat.svelte     # Composant UI chat
└── README.md          # Ce fichier
```

## 🔑 Configuration API Infomaniak

### Endpoints utilisés

**Chat Completions (Qwen3/Mixtral) :**

```
POST https://api.infomaniak.com/2/ai/{PRODUCT_ID}/openai/v1/chat/completions
```

**Speech-to-Text (Whisper) :**

```
POST https://api.infomaniak.com/1/ai/{PRODUCT_ID}/openai/audio/transcriptions
```

### Headers requis

```typescript
{
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
  'Accept': 'text/event-stream' // Pour streaming
}
```

### Credentials du POC

- **API Key:** Clé fournie par Infomaniak
- **Product ID:** ID de votre produit Infomaniak

## 🎯 Principe

### Single Source of Truth

Les **types TypeScript** servent à la fois pour :

1. Type-checking du code de l'app
2. Documentation pour le LLM

**Avantages :**

- Pas de duplication avec JSON schemas
- Inclut les champs computed/processés
- Maintenance simplifiée
- Concis (économie de tokens)

### Architecture Hybrid

```typescript
// 1. Context minimal (stats + user + UI)
const context = buildLLMContext()
// → ~500-800 tokens

// 2. Tools pour queries dynamiques
const tools = getToolDefinitions()
// → LLM appelle les fonctions selon besoin

// 3. Schémas en documentation
const systemPrompt = `
${getSchemaDocumentation()}
${getToolsDocumentation()}
`
```

## 📊 Types enrichis (llm-schema.ts)

Types avec documentation complète :

```typescript
export type DatasetSchema = {
  // Raw database fields
  id: string
  name?: string
  type?: string
  nbRow?: number

  // Computed fields (added by app)
  typeClean?: string // Humanized
  folderName?: string // Denormalized
  nbVariable?: number // Calculated

  // Relations (loaded on demand)
  variables?: VariableSchema[]
  tags?: TagSchema[]

  // User context (runtime)
  isFavorite?: boolean
}
```

**Couverture complète :**

- Dataset, Variable, Folder, Institution, Tag, Modality, Doc
- Champs bruts + computed + relations + user context
- Documentation inline (JSDoc)

## 🔧 Context Builder (llm-context.ts)

```typescript
buildLLMContext({
  includeFullData: false, // true = ajoute samples
  entities: ['dataset'], // Limite les entités
  maxItems: 20, // Limite par entité
})
```

**Retourne :**

- `stats` : Statistiques DB (counts, distributions)
- `user` : Favoris, historique recherche, préférences
- `ui` : Page courante, filtres actifs
- `samples` : (optionnel) Exemples de données

**Optimisation tokens :**

- Minimal : ~500 tokens (stats only)
- Avec samples : ~2000 tokens (10 items/entité)

## 🛠️ Tools (llm-tools.ts)

### Query Tools

- `findEntities` - Chercher entités avec critères
- `getEntity` - Récupérer entité par ID
- `countEntities` - Compter entités
- `searchInCatalog` - Recherche full-text

### Analysis Tools

- `groupBy` - Grouper et compter par champ
- `getStatistics` - Stats numériques (mean, min, max, median)
- `getRelatedEntities` - Récupérer relations (variables d'un dataset, etc.)

### Navigation Tools

- `navigate` - Naviguer vers page

### User Data Tools

- `toggleFavorite` - Gérer favoris

### Filter Tools

- `applyFilter` - Appliquer filtres
- `clearFilters` - Effacer filtres

**Format OpenAI Function Calling :**

```typescript
getToolDefinitions() // → Array de tool definitions
executeTool(name, params) // → Execute tool
```

## ⚙️ Configuration (llm-config.ts)

```typescript
// API Key stockée dans localStorage
setLLMAPIKey('sk-...')
isLLMConfigured() // → boolean

// Config par défaut
{
  baseURL: 'https://api.infomaniak.com/v1',
  models: {
    text: 'qwen3',
    speech: 'whisper3'
  },
  maxTokens: 4096,
  temperature: 0.7
}
```

## 💬 Utilisation

## 💬 Utilisation du Chat

### Via le composant Svelte

```svelte
<script>
  import LLMChat from '@llm/LLMChat.svelte'
</script>

<LLMChat />
```

### Programmatique

```typescript
import { chat, chatStream } from '@llm'

// Simple (non-streaming)
const response = await chat([
  { role: 'user', content: 'Combien de datasets ?' },
])

// Streaming
await chatStream(
  [{ role: 'user', content: 'Liste les datasets panel' }],
  chunk => console.log(chunk), // Afficher au fur et à mesure
)
```

### Avec tools

```typescript
import { chatCompletion, getToolDefinitions, executeTool } from '@llm'

await chatCompletion({
  messages: [{ role: 'user', content: 'Combien de datasets panel ?' }],
  tools: getToolDefinitions(),
  stream: true,
  onChunk: chunk => console.log(chunk),
  onToolCall: async toolCall => {
    const params = JSON.parse(toolCall.function.arguments)
    const result = executeTool(toolCall.function.name, params)
    console.log('Tool result:', result)
    return result
  },
})
```

## 🎓 Exemples de requêtes utilisateur

### Question simple

**User:** "Combien de datasets panel ?"

**LLM action:**

```json
{
  "tool": "countEntities",
  "params": {
    "entity": "dataset",
    "criteria": { "type": "panel" }
  }
}
```

### Question complexe

**User:** "Quels sont les datasets mis à jour récemment avec plus de 100 variables ?"

**LLM actions:**

1. `findEntities` avec criteria
2. Filter par nbVariable > 100
3. Sort par lastUpdateDate

### Navigation contextuelle

**User:** "Montre-moi ce dataset"

**LLM action:**

1. Utilise `ui.currentPage` pour identifier le dataset courant
2. `navigate` vers page détail si pas déjà dessus

### Analyse

**User:** "Quelle est la taille moyenne des datasets ?"

**LLM action:**

```json
{
  "tool": "getStatistics",
  "params": {
    "entity": "dataset",
    "field": "nbRow"
  }
}
```

## 🚀 Avantages de cette approche

### vs Extension VS Code

- ✅ Pas d'installation requise
- ✅ Fonctionne dans tout browser
- ✅ UI native dans l'app
- ✅ Accès complet au contexte utilisateur

### vs SQL.js

- ✅ Pas de dépendance lourde
- ✅ Données déjà processées/enrichies
- ✅ Types TypeScript = documentation vivante
- ✅ Tools plus expressifs que SQL

### vs JSON Schemas

- ✅ Single source of truth
- ✅ Inclut champs computed
- ✅ Plus concis (moins de tokens)
- ✅ Maintenance simplifiée

## 📈 Optimisations futures

1. **Caching** : Cache responses courantes
2. **Streaming** : SSE pour affichage progressif
3. **Context window** : Résumé intelligent si DB très large
4. **Embeddings** : Pour recherche sémantique avancée
5. **User feedback** : Apprendre des corrections utilisateur

## 🔐 Sécurité

- API key en localStorage (idéalement chiffré)
- Validation des tool parameters
- Rate limiting côté client
- Pas de données sensibles dans prompts
