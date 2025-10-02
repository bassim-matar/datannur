<script lang="ts">
  import db from '@db'
  import { isMobile, urlPrefix } from '@lib/util'
  import { entityNames } from '@lib/constant'
  import Render from '@lib/render'
  import { ensureMermaidLoaded } from '@lib/mermaid'
  import Loading from '@frame/Loading.svelte'
  import { safeHtmlWithSvg } from '@lib/html-sanitizer'

  let svgDiagramm = $state<string | null>(null)

  const schema = db.getSchema()

  delete schema.oneToOne

  const direction = isMobile ? 'TB' : 'LR'
  let diagrammDefinition = `flowchart ${direction}\n`

  function compareNameDesc(a: string[] | string, b: string[] | string): number {
    const aName = Array.isArray(a) ? a[0] : a
    const bName = Array.isArray(b) ? b[0] : b
    if (aName > bName) return -1
    if (aName < bName) return 1
    return 0
  }

  schema.oneToMany = schema.oneToMany.map((relation: string[]) => {
    let otherOne: string | null = null
    if (relation.includes('manager')) otherOne = 'owner'
    else if (relation.includes('owner')) otherOne = 'manager'
    if (otherOne) {
      relation = ['institution', otherOne, ...relation]
    }
    return relation
  })

  const schemaAlone: string[] = []
  const allTables = [...schema.oneToMany, ...schema.manyToMany]
  for (const tableRelation of allTables) {
    for (const table of tableRelation) {
      if (table === 'manager' || table === 'owner') {
        continue
      }
      if (!schemaAlone.includes(table)) {
        schemaAlone.push(table)
      }
    }
  }

  schemaAlone.sort(compareNameDesc)
  schema.oneToMany.sort(compareNameDesc)
  schema.manyToMany.sort(compareNameDesc)

  const recursiveEntities = []
  for (const link of schema.oneToMany) {
    if (link[0] === link[1]) recursiveEntities.push(link[0])
  }

  for (const table of schemaAlone) {
    if (['metaFolder', 'metaDataset', 'metaVariable', 'alias'].includes(table))
      continue
    let entityName = table
    if (table === 'manager' || table === 'owner') continue

    let icon = Render.icon(entityName)
    if (table === 'config') icon = ''
    const entityCleanName = entityNames[table]

    let recursiveIcon = ''
    if (recursiveEntities.includes(table))
      recursiveIcon = ' ' + Render.icon('recursive')

    diagrammDefinition += `${table}(${icon}<span>${entityCleanName}</span>${recursiveIcon})\n`
    diagrammDefinition += `click ${table} href "${urlPrefix}/metaDataset/${table}";\n`
  }

  const otherLinks = []
  let separator = ' - '
  for (const link of schema.oneToMany) {
    if (link.includes('metaDataset')) continue
    if (link[0] === link[1]) continue
    if (link.length > 2) {
      const lastOne = link[link.length - 1]
      let linkCleanName = ''
      for (let i = 0; i < link.length - 1; i++) {
        if (i === 0) continue
        if (i === link.length - 1) continue
        if (linkCleanName === '') linkCleanName += entityNames[link[i]]
        else linkCleanName += separator + entityNames[link[i]]
      }

      let reverseName = linkCleanName.split(separator).reverse().join(separator)
      const newLink = `${link[0]} -- ${linkCleanName} --> ${lastOne}\n`
      const reverseLink = `${link[0]} -- ${reverseName} --> ${lastOne}\n`
      if (otherLinks.includes(reverseLink)) continue

      otherLinks.push(newLink)
      diagrammDefinition += newLink
      continue
    }
    diagrammDefinition += `${link[0]} --> ${link[1]}\n`
  }
  for (const link of schema.manyToMany) {
    diagrammDefinition += `${link[0]} <--> ${link[1]}\n`
  }

  ensureMermaidLoaded(async () => {
    const { svg } = await window.mermaid.render('diagramm', diagrammDefinition)
    svgDiagramm = svg
  })
</script>

{#if !svgDiagramm}
  <Loading type="tabBody" colorEntity="diagram" />
{:else}
  <div class="tab-inner-tab" use:safeHtmlWithSvg={svgDiagramm}></div>
{/if}

<style lang="scss">
  @use 'main.scss' as *;
  @use '../style/mermaid.scss' as *;
  @use '../style/icon.scss' as *;

  .tab-inner-tab {
    background: $background-2;
    padding: 30px;
    text-align: center;
    :global {
      @include mermaid-style;
      @include icon-color;

      .icon {
        margin-right: 0;
        &:first-child {
          margin-right: 5px;
        }
      }
    }
  }

  :global(html.roundedDesign) {
    .tab-inner-tab {
      border-radius: $rounded;
    }
  }
</style>
