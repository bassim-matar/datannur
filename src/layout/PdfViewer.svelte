<script lang="ts">
  import { hasTouchScreen } from '@lib/util'
  import Loading from '@frame/Loading.svelte'

  let { pdf } = $props()

  let loading = $state(true)
  let urlMobile = $state(
    'https://drive.google.com/viewerng/viewer?embedded=true&url=',
  )

  let url = pdf + '#toolbar=1&view=FitH'
  urlMobile += window.location.origin + '/' + url
</script>

<div class="iframe_wrapper">
  {#if loading}
    <Loading position="relative" colorEntity="doc" />
  {/if}
  <object
    data={url}
    type="application/pdf"
    class="frame"
    class:loaded={!loading}
    title="pdf viewer"
    onload={() => (loading = false)}
  >
    {#if hasTouchScreen}
      <embed src={urlMobile} class="frame" />
    {/if}
  </object>
</div>

<style lang="scss">
  @use 'main.scss' as *;

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
