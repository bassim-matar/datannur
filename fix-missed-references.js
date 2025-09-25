#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

// Fonction pour convertir snake_case vers camelCase
function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())
}

// Liste des références manquées à corriger
const missedReferences = [
  'entity_to_icon_name',
  'wrap_long_text',
  'get_sort_by_name',
]

// Fonction pour corriger les références dans un fichier
function fixReferencesInFile(filePath) {
  const fullPath = path.resolve(filePath)

  if (!fs.existsSync(fullPath)) {
    return false
  }

  let content = fs.readFileSync(fullPath, 'utf8')
  let modified = false

  missedReferences.forEach(snakeName => {
    const camelName = snakeToCamel(snakeName)

    // Remplacer les appels de fonction
    const callPattern = new RegExp(`\\b${snakeName}\\s*\\(`, 'g')
    if (callPattern.test(content)) {
      content = content.replace(callPattern, `${camelName}(`)
      modified = true
    }

    // Remplacer les références dans les templates Svelte
    const templatePattern = new RegExp(`{\\s*${snakeName}\\s*}`, 'g')
    if (templatePattern.test(content)) {
      content = content.replace(templatePattern, `{${camelName}}`)
      modified = true
    }
  })

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8')
    return true
  }

  return false
}

// Trouver tous les fichiers avec des erreurs
function findFilesWithErrors() {
  const files = []

  // Liste des fichiers mentionnés dans les erreurs svelte-check
  const errorFiles = [
    'src/layout/Icon.svelte',
    'src/component/institution/Institutions.svelte',
    'src/component/folder/Folders.svelte',
    'src/component/tag/Tags.svelte',
    'src/component/doc/Docs.svelte',
    'src/component/variable/Freq.svelte',
    'src/component/options/Logs.svelte',
    'src/lib/preview-manager.ts',
    'src/search/SearchResult.svelte',
    'src/datatable/dt-util.ts',
  ]

  return errorFiles
}

console.log('🔧 Correction des références de fonctions manquées')
console.log(`📋 Références à corriger: ${missedReferences.join(', ')}`)
console.log('')

const filesToCheck = findFilesWithErrors()
let fixedCount = 0

filesToCheck.forEach(file => {
  if (fixReferencesInFile(file)) {
    console.log(`✅ ${file}`)
    fixedCount++
  } else {
    console.log(`⚪ ${file} (aucun changement)`)
  }
})

console.log('')
console.log(`🎉 Corrections terminées!`)
console.log(`📊 ${fixedCount}/${filesToCheck.length} fichiers modifiés`)
console.log('')
console.log('💡 Vérifiez avec: npm run svelte-check')
