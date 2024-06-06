<script>
  import markdown_render from "@js/markdown"

  export let content

  $: md_content = content ? markdown_render(content): ""
</script>

<div class="main content">
  {@html md_content}
</div>

<style lang="scss">
  @import "../main.scss";

  div.main {
    padding: 3.5rem 3.75rem;
    max-width: 900px;
    margin: auto;
    box-sizing: border-box;
    word-wrap: break-word;
  }

  @media screen and (max-width: 600px) {
    div.main {
      padding: 1.5rem 1.75rem;
    }
  }
</style>
