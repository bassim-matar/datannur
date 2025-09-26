<script lang="ts">
  import markdownRender from '@lib/markdown'
  import { safeHtml } from '@lib/html-sanitizer'

  let { content, mode = 'classic' } = $props()

  let mdContent = $derived(content ? (markdownRender(content) as string) : '')
</script>

<div
  class="main content"
  class:classic={mode === 'classic'}
  use:safeHtml={mdContent}
></div>

<style lang="scss">
  @use 'main.scss' as *;

  div.main {
    padding: 10px;
    max-width: 900px;
    margin: auto;
    box-sizing: border-box;
    word-wrap: break-word;
  }

  div.classic {
    padding: 3.5rem 3.75rem;
  }

  @media screen and (max-width: 600px) {
    div.main {
      padding: 1.5rem 1.75rem;
    }
  }
</style>
