<script>
  import { has_touch_screen } from "@js/util"
  import Loading from "@frame/Loading.svelte"

  let { pdf } = $props()

  let loading = $state(true)
  let url_mobile = $state(
    "https://drive.google.com/viewerng/viewer?embedded=true&url=",
  )

  let url = pdf + "#toolbar=1&view=FitH"
  url_mobile += window.location.origin + "/" + url
</script>

<div class="iframe_wrapper">
  {#if loading}
    <Loading position="relative" color_entity="doc" />
  {/if}
  <object
    data={url}
    type="application/pdf"
    frameborder="0"
    class="frame"
    class:loaded={!loading}
    title="pdf viewer"
    onload={() => (loading = false)}
  >
    {#if has_touch_screen}
      <embed src={url_mobile} frameborder="0" class="frame" />
    {/if}
  </object>
</div>

<style lang="scss">
  @use "../main.scss" as *;

  .iframe_wrapper {
    position: relative;
    padding: 0;
    overflow: hidden;
    width: 100%;
    height: 100%;
    margin: auto;
  }
  .frame {
    height: 0;
    width: 100%;
    &.loaded {
      height: 100%;
    }
  }

  @media screen and (max-width: 600px) {
    .frame {
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }
  }
</style>
