<script>
  import { footer_visible, page_content_loaded } from "@js/store"
  import { dark_mode_theme } from "@dark_mode/Dark_mode"
  import markdown_render from "@js/markdown"
  import Title from "@layout/Title.svelte"
  import Loading from "@frame/Loading.svelte"
  import about_page_organisation from "@markdown/about_page_organisation.md?raw"
  import { get_about_main } from "@js/get_about_main"
  import { ensure_mermaid_loaded, md_with_mermaid_to_html } from "@js/mermaid"

  $footer_visible = true

  let is_script_loaded = false
  let content = ""
  let about_main = get_about_main()
  $: about_main_dark = about_main?.replace(
    "{dark_mode}",
    $dark_mode_theme === "dark" ? "_dark" : "",
  )
  $: main_content = markdown_render(about_main_dark)

  ensure_mermaid_loaded(async () => {
    if (!about_page_organisation) return
    content = await md_with_mermaid_to_html(about_page_organisation)
    is_script_loaded = true
    $page_content_loaded = true
  })
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
  @use "../main.scss" as *;
  @use "../style/mermaid.scss" as *;
  @use "../style/icon.scss" as *;

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
      @include icon_color;
      @include mermaid_style;

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
