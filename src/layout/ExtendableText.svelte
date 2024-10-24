<script>
  import { extendable } from "@js/extendable"
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class={`extendable ${$$props.class}`}
  on:mouseenter={extendable.open_no_margin}
  on:mouseleave={extendable.close}
>
  <slot />
</div>

<style lang="scss">
  .extendable {
    width: auto;
    max-height: 50px;
    overflow-x: hidden;
    overflow-y: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: min(600px, calc(100vw - 220px));
    &:global(.open) {
      white-space: pre-wrap;
    }
    &:global(.open_full) {
      overflow-y: auto;
    }
  }
  @media screen and (max-width: 600px) {
    .extendable {
      max-width: calc(100vw - 50px);
    }
  }
</style>
