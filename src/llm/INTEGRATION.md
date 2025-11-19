# Intégration LLM - Guide complet

## 🎯 Résumé de l'implémentation

Architecture complète pour intégrer l'API Infomaniak LLM (Qwen3) dans datannur, inspirée du POC.

### Fichiers créés

```
src/llm/
├── llm-schema.ts       # Types enrichis (DB + computed + relations + user)
├── llm-context.ts      # Context builder (stats, user, UI state)
├── llm-config.ts       # Configuration API (key, product ID)
├── llm-client.ts       # Client API avec streaming SSE
├── llm-tools.ts        # 12 tools pour query/analysis/navigation
├── llm-setup.ts        # Helper pour setup rapide
├── llm-demo.ts         # Démos & tests
├── LLMChat.svelte      # Composant UI chat
├── index.ts            # Exports publics
└── README.md           # Documentation
```

## 🚀 Utilisation rapide

### 1. Setup dans browser console

```javascript
// Initialiser avec credentials du POC
setupLLM()

// Ou vérifier que c'est configuré
localStorage.getItem('llm-api-key')
localStorage.getItem('llm-product-id')
```

### 2. Tester dans console

```javascript
// Test simple
await demoSimpleChat()

// Test avec streaming
await demoStreamingChat()

// Test avec tools
await demoWithTools()

// Test conversation complète
await demoConversation()

// Tous les tests
await runAllDemos()
```

### 3. Utiliser dans l'app

```svelte
<!-- Dans une page Svelte -->
<script>
  import LLMChat from '@llm/LLMChat.svelte'
</script>

<div class="container">
  <h1>Assistant LLM</h1>
  <LLMChat />
</div>
```

## 🔑 Points clés vs POC

### Similitudes conservées

✅ **Streaming SSE** - Même parsing des `data:` events  
✅ **Credentials** - Même API key et product ID  
✅ **Models** - Qwen3 pour texte, Whisper pour STT  
✅ **UI** - Markdown rendering avec marked.js

### Améliorations

🚀 **Pas de proxy Python** - Appel direct depuis le browser  
🚀 **Types TypeScript** - Type-safety complète  
🚀 **Tools system** - 12 tools pour interroger la DB  
🚀 **Context builder** - Context automatique de l'app  
🚀 **Svelte components** - Integration native dans l'UI  
🚀 **Multi-turn** - Gestion conversation avec historique

## 📊 Architecture Context

### Ce qui est envoyé au LLM

**System Prompt :**

- Documentation schéma (types TypeScript)
- Documentation tools disponibles
- Context actuel (stats DB + user + UI)

**Format :**

```typescript
{
  stats: {
    nbDatasets: 150,
    nbVariables: 2340,
    datasetsByType: { panel: 45, cross: 105 },
    // ...
  },
  user: {
    favorites: { dataset: [...], variable: [...] },
    searchHistory: [...],
    options: { darkMode: true, language: 'fr' }
  },
  ui: {
    currentPage: '/dataset/123',
    currentTab: 'variables',
    activeFilters: {...}
  }
}
```

**Taille :** ~500-800 tokens (sans samples)

### Tools disponibles

**Query (4) :**

- `findEntities` - Chercher avec critères
- `getEntity` - Get par ID
- `countEntities` - Compter
- `searchInCatalog` - Full-text search

**Analysis (3) :**

- `groupBy` - Grouper et compter
- `getStatistics` - Stats numériques
- `getRelatedEntities` - Relations

**Navigation (1) :**

- `navigate` - Naviguer dans l'app

**User Data (1) :**

- `toggleFavorite` - Gérer favoris

**Filters (2) :**

- `applyFilter` - Appliquer filtres
- `clearFilters` - Effacer filtres

## 🎓 Exemples de conversations

### Question simple

**User:** "Combien de datasets ?"  
**LLM:** Appelle `countEntities({entity: 'dataset'})`  
**Result:** "Il y a 150 datasets dans le catalogue."

### Question complexe

**User:** "Quels sont les 5 datasets panel les plus récents ?"  
**LLM:**

1. `findEntities({entity: 'dataset', criteria: {type: 'panel'}})`
2. Trie par `lastUpdateDate`
3. Prend top 5
   **Result:** Liste formatée avec noms et dates

### Navigation contextuelle

**User:** "Montre-moi ce dataset"  
**LLM:** Lit `ui.currentPage`, identifie le dataset actuel  
**Action:** `navigate('/dataset/123')` si pas déjà dessus

### Analyse

**User:** "Quelle est la taille moyenne des datasets ?"  
**LLM:** `getStatistics({entity: 'dataset', field: 'nbRow'})`  
**Result:** "En moyenne 45 230 lignes (min: 100, max: 2M)"

## 🔄 Flow d'une requête

```
1. User input
   ↓
2. Add to messages[]
   ↓
3. Call chatCompletion() avec tools
   ↓
4. Streaming SSE depuis API
   ↓
5. Parse chunks: content OU tool_calls
   ↓
6. Si tool_call:
   - executeTool()
   - Add result to messages
   - Re-call LLM with result
   ↓
7. Display final response
```

## ⚡ Optimisations

### Tokens

- Context minimal par défaut (~500 tokens)
- Tools appelés à la demande
- Pas de full DB envoyée

### Performance

- Streaming pour UX responsive
- Cache possible des réponses courantes
- Batch tool calls si multiple queries

### UX

- Loading states clairs
- Markdown rendering
- Scroll auto vers bas
- Cancel possible (AbortController)

## 🔐 Sécurité

**API Key :**

- Stockée en localStorage
- Jamais commitée dans code
- Configurable par utilisateur

**Rate limiting :**

- Géré par Infomaniak
- Retry avec backoff possible
- Error handling complet

**Validation :**

- Tool parameters validés
- Criteria sanitized
- No SQL injection (pas de SQL!)

## 🐛 Debugging

### Browser console

```javascript
// Vérifier config
getLLMConfig()

// Tester tool directement
executeTool('countEntities', { entity: 'dataset' })

// Voir le context
buildLLMContext()

// Reset config
clearLLMAPIKey()
clearLLMProductId()
```

### Logs

Le client log automatiquement :

- Tool calls avec params
- Streaming errors
- API errors

## 📈 Prochaines étapes

**Phase 1 - MVP** (actuel)

- ✅ Client API avec streaming
- ✅ 12 tools essentiels
- ✅ Composant chat UI
- ✅ Context builder
- ⏳ Tests & debug

**Phase 2 - Enhancements**

- 🔲 Whisper STT integration
- 🔲 Voice input button
- 🔲 Conversation persistence
- 🔲 Context window management
- 🔲 Better error messages

**Phase 3 - Advanced**

- 🔲 Embeddings pour semantic search
- 🔲 RAG sur documentation
- 🔲 Custom prompts par user
- 🔲 Analytics & feedback loop
- 🔲 Multi-language support

## 💡 Différences vs Extension VS Code

| Aspect      | Extension    | App Browser              |
| ----------- | ------------ | ------------------------ |
| **Install** | Requise      | Aucune                   |
| **Access**  | VS Code only | N'importe quel browser   |
| **Context** | DB brute     | DB processée + UI + user |
| **Tools**   | SQL queries  | TS functions natives     |
| **UX**      | External     | Native dans l'app        |
| **Setup**   | Complex      | Juste API key            |
| **Data**    | Normalized   | Denormalized + computed  |

## 🎉 Conclusion

Architecture complète et production-ready pour LLM dans datannur :

- **Single source of truth** : Types TS = documentation
- **Smart context** : Données processées + user + UI
- **Powerful tools** : Accès direct aux fonctions de l'app
- **Great UX** : Streaming, markdown, mobile-friendly
- **Easy setup** : Juste copier l'API key

Prêt à tester ! 🚀
