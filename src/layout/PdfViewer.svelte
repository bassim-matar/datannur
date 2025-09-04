<script lang="ts">
  import { has_touch_screen } from "@lib/util"
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
    class="frame"
    class:loaded={!loading}
    title="pdf viewer"
    onload={() => (loading = false)}
  >
    {#if has_touch_screen}
      <embed src={url_mobile} class="frame" />
    {/if}
  </object>
</div>

<style lang="scss">
  @use "main.scss" as *;

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
    border: none;
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
