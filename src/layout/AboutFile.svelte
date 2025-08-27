<script>
  import { onMount } from "svelte"
  import MdContent from "@layout/MdContent.svelte"
  import { page_content_loaded, on_page_homepage } from "@js/store"
  import { dark_mode_theme } from "@dark_mode/Dark_mode"
  import Loading from "@frame/Loading.svelte"
  import { ensure_mermaid_loaded, md_with_mermaid_to_html } from "@js/mermaid"

  let { about_file } = $props()

  let html_content = $state("")
  let html_content_loaded = $state(false)

  let md_content = $derived(
    about_file.replaceAll(
      "{dark_mode}",
      $dark_mode_theme === "dark" ? "_dark" : "",
    ),
  )

  const use_mermaid = about_file.includes("mermaid(")

  $effect(() => {
    if (use_mermaid) {
      ensure_mermaid_loaded(async () => {
        if (!md_content) return
        html_content = await md_with_mermaid_to_html(md_content)
        html_content_loaded = true
        $page_content_loaded = true
      })
    }
  })

  onMount(() => {
    if (!use_mermaid) $page_content_loaded = true
  })
</script>

<div
  class="about_file_wrapper"
  class:homepage={$on_page_homepage}
>
  {#if use_mermaid}
    <div class="content">
      {@html html_content}
      {#if !html_content_loaded}
        <Loading position="relative" />
      {/if}
    </div>
  {:else}
    <MdContent content={md_content} />
  {/if}
</div>

<style lang="scss">
  @use "../main.scss" as *;
  @use "../style/mermaid.scss" as *;
  @use "../style/icon.scss" as *;

  .about_file_wrapper {
    
    :global {
      p img {
        width: 100%;
      }
    }
    &.homepage {
      max-height: max(calc(100vh - 225px), 80px)
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
    }
  }

  @media screen and (max-width: $menu_mobile_limit) {
    .about_file_wrapper.homepage {
      max-height: max(calc(100vh - 175px), 80px)
    }
  }

  @media screen and (max-width: 600px) {
    .content {
      padding: 1.5rem 1.75rem;
    }
  }
</style>
