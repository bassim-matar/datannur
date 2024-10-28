<script>
  import Icon from "@layout/Icon.svelte"
  import PdfViewer from "@layout/PdfViewer.svelte"
  import MdFileDynamic from "@layout/MdFileDynamic.svelte"

  let { doc } = $props()
</script>

<div class="doc_content_wrapper">
  <div style="font-weight: bold;">
    <Icon type="search" /> Aperçu
  </div>

  <div class="doc_content_box">
    <div class="doc_content">
      {#if doc.type === "pdf"}
        <PdfViewer pdf={doc.path} />
      {:else if doc.type === "md"}
        <MdFileDynamic doc_id={doc.id} />
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  @use "../../main.scss" as *;

  .doc_content_wrapper {
    width: calc(50% - 3px);
    padding: 1em 0.75em;
    box-sizing: border-box;
    display: inline-block;
    .doc_content_box {
      margin-top: 10px;
      border: 1px solid $color-5;
      overflow: hidden;
      .doc_content {
        overflow: auto;
        height: max(100vh - 301px, 170px);
      }
    }
  }

  :global(html.rounded_design) {
    .doc_content_box {
      border-radius: $rounded-size;
    }
  }

  @media screen and (max-width: 1023px) {
    .doc_content_wrapper {
      display: block;
      width: 100%;
    }
  }
  @media screen and (max-width: 600px) {
    .doc_content_wrapper {
      padding: 10px;
    }
  }
</style>
