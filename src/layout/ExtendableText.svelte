<script lang="ts">
  import { extendable } from '@lib/extendable'

  let { ...props } = $props()
</script>

<div
  class={`extendable ${props.class}`}
  onmouseenter={extendable.open}
  onmouseleave={extendable.closeTwoLines}
  onkeydown={() => {}}
  role="button"
  tabindex="0"
>
  {@render props.children?.()}
</div>

<style lang="scss">
  .extendable {
    display: -webkit-box;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    width: auto;
    max-height: 50px;
    overflow-x: hidden;
    overflow-y: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
    white-space: normal;
    max-width: min(600px, calc(100vw - 220px));
    &:global(.open) {
      display: block;
      white-space: normal;
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
