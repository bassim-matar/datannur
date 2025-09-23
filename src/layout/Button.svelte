<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    onclick = () => {},
    children,
  }: {
    onclick?: (event: MouseEvent) => void
    children: Snippet
  } = $props()
</script>

<button class="button" {onclick}>
  {@render children()}
</button>

<style lang="scss">
  .button {
    &:active {
      transform: scale(0.97);
      transition: all 150ms ease-in-out;
    }
  }
</style>
