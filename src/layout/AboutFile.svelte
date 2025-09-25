<script lang="ts">
  import { onMount } from 'svelte'
  import MdContent from '@layout/MdContent.svelte'
  import { pageContentLoaded, onPageHomepage } from '@lib/store'
  import { dark_mode_theme } from '@dark-mode/dark-mode'
  import Loading from '@frame/Loading.svelte'
  import { ensureMermaidLoaded, mdWithMermaidToHtml } from '@lib/mermaid'

  let { about_file } = $props()

  let html_content = $state('')
  let html_content_loaded = $state(false)

  let md_content = $derived(
    about_file.replaceAll(
      '{darkMode}',
      $dark_mode_theme === 'dark' ? '-dark' : '',
    ),
  )

  const use_mermaid = about_file.includes('mermaid(')

  $effect(() => {
    if (use_mermaid) {
      ensureMermaidLoaded(async () => {
        if (!md_content) return
        html_content = await mdWithMermaidToHtml(md_content)
        html_content_loaded = true
        $pageContentLoaded = true
      })
    }
  })

  onMount(() => {
    if (!use_mermaid) $pageContentLoaded = true
  })
</script>

<div class="about_file_wrapper" class:homepage={$onPageHomepage}>
  {#if use_mermaid}
    <div class="content">
      <!-- eslint-disable svelte/no-at-html-tags -->
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
  @use 'main.scss' as *;
  @use '../style/mermaid.scss' as *;
  @use '../style/icon.scss' as *;

  .about_file_wrapper {
    :global {
      p img {
        width: 100%;
      }
    }
    &.homepage {
      max-height: max(calc(100vh - 225px), 80px);
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
      max-height: max(calc(100vh - 175px), 80px);
    }
  }

  @media screen and (max-width: 600px) {
    .content {
      padding: 1.5rem 1.75rem;
    }
  }
</style>
