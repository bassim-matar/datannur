import { entityToIcon, entityNames } from '@lib/constant'
import Render from '@lib/render'
import { urlPrefix } from '@lib/util'
import markdownRender from '@lib/markdown'

export function ensureMermaidLoaded(callback) {
  const mermaidSrc = `assets/external/mermaid.min.js?v=${__APP_VERSION__}`
  if (document.querySelector(`script[src="${mermaidSrc}"]`)) {
    callback()
    return
  }
  const script = document.createElement('script')
  const scriptAttributes = { src: mermaidSrc, onload: () => callback() }
  document.head.appendChild(Object.assign(script, scriptAttributes))
}

function mermaidAddEntities(code) {
  let codePrefix = null
  const codePrefixesSearch = ['flowchart LR', 'flowchart TB']
  for (const codePrefixSearch of codePrefixesSearch) {
    if (
      code.startsWith(codePrefixSearch) ||
      code.startsWith('\n' + codePrefixSearch)
    ) {
      codePrefix = `\n${codePrefixSearch}\n`
      const [, ...after] = code.split(codePrefixSearch)
      code = after.join('_')
    }
  }

  const managerOwnerClean =
    entityNames['manager'] + ' - ' + entityNames['owner']
  code = code.replaceAll(
    `-- manager - owner -->`,
    `-- ${managerOwnerClean} -->`,
  )

  for (const entity of Object.keys(entityToIcon)) {
    const entityCleanName = entityNames[entity]
    code = code.replaceAll(`-- ${entity} -->`, `-- ${entityCleanName} -->`)

    if (!code.includes('$' + entity)) continue

    let entityName = entity
    if (entity === 'manager' || entity === 'owner') {
      entityName = 'institution'
    }
    const icon = Render.icon(entityName)

    let recursiveIcon = ''
    const entityRecursive = '$' + entity + ' $recursive'
    if (code.includes(entityRecursive)) {
      recursiveIcon = ' ' + Render.icon('recursive')
      code = code.replaceAll(entityRecursive, '')
    }

    let entityDefinition = `${entity}(${icon}<span>${entityCleanName}</span>${recursiveIcon})\n`
    entityDefinition += `click ${entity} href "${urlPrefix}/metaDataset/${entity}";\n`
    code = code.replaceAll('$' + entity, entity)
    code = entityDefinition + code
  }
  if (codePrefix) code = codePrefix + code

  return code
}

export async function mdWithMermaidToHtml(mdWithMermaid) {
  let content = ''
  const direction = 'TB'
  const diagrammDefinition = `flowchart ${direction}\n`
  const aboutPageParts = []
  for (const partLevel1 of mdWithMermaid.split('mermaid(')) {
    for (const partLevel2 of partLevel1.split('```mermaid')) {
      aboutPageParts.push(partLevel2)
    }
  }

  if (aboutPageParts.length === 1) {
    content += aboutPageParts[0]
    return
  }
  let partNum = 0
  for (const aboutPagePart of aboutPageParts) {
    partNum += 1
    if (partNum === 1) {
      content += markdownRender(aboutPagePart)
    } else {
      let separator = '```'
      let isAutoFlowchart = false
      if (aboutPagePart.includes(');')) {
        separator = ');'
        isAutoFlowchart = true
      }

      const [mermaidCodeRaw, mardownCode] = aboutPagePart.split(separator)
      let mermaidCode = mermaidAddEntities(mermaidCodeRaw)
      if (isAutoFlowchart) mermaidCode = diagrammDefinition + mermaidCode
      const diagrammId = 'about-page-diagramm-' + partNum
      const { svg } = await window.mermaid.render(diagrammId, mermaidCode)
      content += `<div class="mermaid-block">${svg}</div>`
      content += markdownRender(mardownCode)
    }
  }
  return content
}
