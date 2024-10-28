<script>
  import { extendable } from "@js/extendable"
  
  let { ...props } = $props()
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class={`extendable ${props.class}`}
  onmouseenter={extendable.open_no_margin}
  onmouseleave={extendable.close}
>
  {@render props.children?.()}
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
