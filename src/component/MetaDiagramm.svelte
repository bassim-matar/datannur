<script>
  import db from "@db"
  import { is_mermaid_loaded } from "@js/store"
  import { is_mobile, url_prefix } from "@js/util"
  import { entity_names } from "@js/constant"
  import Render from "@js/Render"
  import Loading from "@frame/Loading.svelte"

  let svg_diagramm = false

  const schema = { ...db.tables.__schema__ }

  delete schema.one_to_one

  const direction = is_mobile ? "TB" : "LR"
  let diagramm_definition = `flowchart ${direction}\n`

  function compare_name_desc(a, b) {
    if (a[0] > b[0]) return -1
    if (a[0] < b[0]) return 1
    return 0
  }

  schema.one_to_many = schema.one_to_many.map(relation => {
    let other_one = false
    if (relation.includes("manager")) other_one = "owner"
    else if (relation.includes("owner")) other_one = "manager"
    if (other_one) {
      relation = ["institution", other_one, ...relation]
    }
    return relation
  })

  schema.alone = new Set()
  const all_tables = [...schema.one_to_many, ...schema.many_to_many]
  for (const table_relation of all_tables) {
    for (const table of table_relation) {
      if (table === "manager" || table === "owner") {
        continue
      }
      schema.alone.add(table)
    }
  }

  schema.alone = [...schema.alone]

  schema.alone.sort(compare_name_desc)
  schema.one_to_many.sort(compare_name_desc)
  schema.many_to_many.sort(compare_name_desc)

  const recursive_entities = []
  for (const link of schema.one_to_many) {
    if (link[0] === link[1]) recursive_entities.push(link[0])
  }

  for (const table of schema.alone) {
    if (["metaFolder", "metaDataset", "metaVariable", "alias"].includes(table))
      continue
    let entity_name = table
    if (table === "manager" || table === "owner") continue

    let icon = Render.icon(entity_name)
    if (table === "config") icon = ""
    const entity_clean_name = entity_names[table]

    let recursive_icon = ""
    if (recursive_entities.includes(table))
      recursive_icon = " " + Render.icon("recursive")

    diagramm_definition += `${table}(${icon}<span>${entity_clean_name}</span>${recursive_icon})\n`
    diagramm_definition += `click ${table} href "${url_prefix}/metaDataset/${table}";\n`
  }

  const other_links = []
  let separator = " - "
  for (const link of schema.one_to_many) {
    if (link.includes("metaDataset")) continue
    if (link[0] === link[1]) continue
    if (link.length > 2) {
      const last_one = link[link.length - 1]
      let link_clean_name = ""
      for (let i = 0; i < link.length - 1; i++) {
        if (i === 0) continue
        if (i === link.length - 1) continue
        if (link_clean_name === "") link_clean_name += entity_names[link[i]]
        else link_clean_name += separator + entity_names[link[i]]
      }

      let reverse_name = link_clean_name
        .split(separator)
        .reverse()
        .join(separator)
      const new_link = `${link[0]} -- ${link_clean_name} --> ${last_one}\n`
      const reverse_link = `${link[0]} -- ${reverse_name} --> ${last_one}\n`
      if (other_links.includes(reverse_link)) continue

      other_links.push(new_link)
      diagramm_definition += new_link
      continue
    }
    diagramm_definition += `${link[0]} --> ${link[1]}\n`
  }
  for (const link of schema.many_to_many) {
    diagramm_definition += `${link[0]} <--> ${link[1]}\n`
  }

  function script_loaded() {
    window.mermaid.render("diagramm", diagramm_definition).then(data => {
      svg_diagramm = data.svg
    })
  }

  const mermaid_src = "assets/external/mermaid.min.js"

  $is_mermaid_loaded =
    $is_mermaid_loaded || document.querySelector(`script[src="${mermaid_src}"]`)

  if ($is_mermaid_loaded) script_loaded()
  else {
    document.head.appendChild(
      Object.assign(document.createElement("script"), {
        src: mermaid_src,
        onload: () => {
          $is_mermaid_loaded = true
          script_loaded()
        },
      }),
    )
  }
</script>

{#if !svg_diagramm}
  <Loading type="tab_body" color_entity="diagram" />
{:else}
  <div class="tab_inner_tab">
    {@html svg_diagramm}
  </div>
{/if}

<style lang="scss">
  @import "../main.scss";

  .tab_inner_tab {
    background: $background-2;
    padding: 30px;
    text-align: center;
    :global {
      @import "../style/mermaid.scss";
      @import "../style/icon.scss";

      .icon {
        margin-right: 0;
        &:first-child {
          margin-right: 5px;
        }
      }
    }
  }

  :global(html.rounded_design) {
    .tab_inner_tab {
      border-radius: $rounded;
    }
  }
</style>
