import { entity_to_icon, entity_names } from '@lib/constant'
import Render from '@lib/render'
import { url_prefix } from '@lib/util'
import markdownRender from '@lib/markdown'

export function ensureMermaidLoaded(callback) {
  const mermaid_src = `assets/external/mermaid.min.js?v=${__APP_VERSION__}`
  if (document.querySelector(`script[src="${mermaid_src}"]`)) {
    callback()
    return
  }
  const script = document.createElement('script')
  const script_attributes = { src: mermaid_src, onload: () => callback() }
  document.head.appendChild(Object.assign(script, script_attributes))
}

function mermaidAddEntities(code) {
  let code_prefix = null
  let code_prefixes_search = ['flowchart LR', 'flowchart TB']
  for (const code_prefix_search of code_prefixes_search) {
    if (
      code.startsWith(code_prefix_search) ||
      code.startsWith('\n' + code_prefix_search)
    ) {
      code_prefix = `\n${code_prefix_search}\n`
      let [before, ...after] = code.split(code_prefix_search)
      code = after.join('_')
    }
  }

  const manager_owner_clean =
    entity_names['manager'] + ' - ' + entity_names['owner']
  code = code.replaceAll(
    `-- manager - owner -->`,
    `-- ${manager_owner_clean} -->`,
  )

  for (const [entity, icon_name] of Object.entries(entity_to_icon)) {
    const entity_clean_name = entity_names[entity]
    code = code.replaceAll(`-- ${entity} -->`, `-- ${entity_clean_name} -->`)

    if (!code.includes('$' + entity)) continue

    let entity_name = entity
    if (entity === 'manager' || entity === 'owner') {
      entity_name = 'institution'
    }
    let icon = Render.icon(entity_name)

    let recursive_icon = ''
    const entity_recursive = '$' + entity + ' $recursive'
    if (code.includes(entity_recursive)) {
      recursive_icon = ' ' + Render.icon('recursive')
      code = code.replaceAll(entity_recursive, '')
    }

    let entity_definition = `${entity}(${icon}<span>${entity_clean_name}</span>${recursive_icon})\n`
    entity_definition += `click ${entity} href "${url_prefix}/metaDataset/${entity}";\n`
    code = code.replaceAll('$' + entity, entity)
    code = entity_definition + code
  }
  if (code_prefix) code = code_prefix + code

  return code
}

export async function mdWithMermaidToHtml(md_with_mermaid) {
  let content = ''
  const direction = 'TB'
  const diagramm_definition = `flowchart ${direction}\n`
  const about_page_parts = []
  for (const part_level_1 of md_with_mermaid.split('mermaid(')) {
    for (const part_level_2 of part_level_1.split('```mermaid')) {
      about_page_parts.push(part_level_2)
    }
  }

  if (about_page_parts.length === 1) {
    content += about_page_parts[0]
    return
  }
  let part_num = 0
  for (const about_page_part of about_page_parts) {
    part_num += 1
    if (part_num === 1) {
      content += markdownRender(about_page_part)
    } else {
      let separator = '```'
      let is_auto_flowchart = false
      if (about_page_part.includes(');')) {
        separator = ');'
        is_auto_flowchart = true
      }
      let [mermaid_code, mardown_code] = about_page_part.split(separator)
      mermaid_code = mermaidAddEntities(mermaid_code)
      if (is_auto_flowchart) mermaid_code = diagramm_definition + mermaid_code
      const diagramm_id = 'about_page_diagramm_' + part_num
      const { svg } = await window.mermaid.render(diagramm_id, mermaid_code)
      content += `<div class="mermaid_block">${svg}</div>`
      content += markdownRender(mardown_code)
    }
  }
  return content
}
