<script>
  import db from "@db"
  import {
    footer_visible,
    is_mermaid_loaded,
    page_content_loaded,
  } from "@js/store"
  import { dark_mode_theme } from "@dark_mode/Dark_mode"
  import { url_prefix } from "@js/util"
  import markdown_render from "@js/markdown"
  import { entity_to_icon, entity_names } from "@js/constant"
  import Render from "@js/Render"
  import Title from "@layout/Title.svelte"
  import Loading from "@frame/Loading.svelte"
  import about_page_organisation from "@markdown/about_page_organisation.md?raw"

  $footer_visible = true

  let is_script_loaded = false
  const direction = "TB" // is_mobile ? "TB" : "LR"
  let diagramm_definition = `flowchart ${direction}\n`

  let content = ""
  let about_main = db.get_config("about_main")
  $: about_main_dark = about_main?.replace(
    "{dark_mode}",
    $dark_mode_theme === "dark" ? "_dark" : "",
  )
  $: main_content = markdown_render(about_main_dark)

  function mermaid_add_entities(code) {
    let code_prefix = false
    let code_prefixes_search = ["flowchart LR", "flowchart TB"]
    for (const code_prefix_search of code_prefixes_search) {
      if (
        code.startsWith(code_prefix_search) ||
        code.startsWith("\n" + code_prefix_search)
      ) {
        code_prefix = `\n${code_prefix_search}\n`
        let [before, ...after] = code.split(code_prefix_search)
        code = after.join("_")
      }
    }

    const manager_owner_clean =
      entity_names["manager"] + " - " + entity_names["owner"]
    code = code.replaceAll(
      `-- manager - owner -->`,
      `-- ${manager_owner_clean} -->`,
    )

    for (const [entity, icon_name] of Object.entries(entity_to_icon)) {
      const entity_clean_name = entity_names[entity]
      code = code.replaceAll(`-- ${entity} -->`, `-- ${entity_clean_name} -->`)

      if (!code.includes("$" + entity)) continue

      let entity_name = entity
      if (entity === "manager" || entity === "owner") {
        entity_name = "institution"
      }
      let icon = Render.icon(entity_name)

      let recursive_icon = ""
      const entity_recursive = "$" + entity + " $recursive"
      if (code.includes(entity_recursive)) {
        recursive_icon = " " + Render.icon("recursive")
        code = code.replaceAll(entity_recursive, "")
      }

      let entity_definition = `${entity}(${icon}<span>${entity_clean_name}</span>${recursive_icon})\n`
      entity_definition += `click ${entity} href "${url_prefix}/metaDataset/${entity}";\n`
      code = code.replaceAll("$" + entity, entity)
      code = entity_definition + code
    }
    if (code_prefix) code = code_prefix + code

    return code
  }

  async function script_loaded() {
    is_script_loaded = true
    if (!about_page_organisation) return

    let about_page_parts = []
    for (const part_level_1 of about_page_organisation.split("mermaid(")) {
      for (const part_level_2 of part_level_1.split("```mermaid")) {
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
        content += markdown_render(about_page_part)
      } else {
        let separator = "```"
        let is_auto_flowchart = false
        if (about_page_part.includes(");")) {
          separator = ");"
          is_auto_flowchart = true
        }
        let [mermaid_code, mardown_code] = about_page_part.split(separator)
        mermaid_code = mermaid_add_entities(mermaid_code)
        if (is_auto_flowchart) mermaid_code = diagramm_definition + mermaid_code
        window.mermaid
          .render("about_page_diagramm_" + part_num, mermaid_code)
          .then(data => {
            content += `<div class="mermaid_block">${data.svg}</div>`
            content += markdown_render(mardown_code)
          })
      }
    }

    $page_content_loaded = true
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

<section class="section">
  <Title type="about" name="A propos" mode="main_title" />
  <div class="page_content_wrapper box_shadow box_shadow_color shadow_about">
    <div class="content">
      {@html main_content}
      {@html content}
    </div>
    {#if !is_script_loaded}
      <Loading position="relative" />
    {/if}
  </div>
</section>

<style lang="scss">
  @import "../main.scss";
  .page_content_wrapper {
    position: relative;
    background: $background-2;
    border: 1px solid $color-5;
    margin-top: 39px;
    :global(html.rounded_design) & {
      border-radius: $rounded;
    }
  }
  .content {
    max-width: 900px;
    padding: 3.5rem 3.75rem;
    margin: auto;
    :global {
      @import "../style/icon.scss";
      @import "../style/mermaid.scss";

      .mermaid_block {
        text-align: center;
        margin-bottom: 40px;
        .icon {
          margin-right: 0;
          &:first-child {
            margin-right: 5px;
          }
        }
      }
      h4 {
        margin-top: 1.3333em;
      }
    }
  }

  @media screen and (max-width: 600px) {
    .content {
      padding: 1.5rem 1.75rem;
    }
  }

  :global(html.page_shadow_colored) {
    .page_content_wrapper {
      border-color: color("about");
    }
  }
</style>
