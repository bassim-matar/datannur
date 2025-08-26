<script>
  let { onclick = () => {}, children } = $props()
</script>

<button class="button" {onclick}>
  {@render children()}
</button>

<style lang="scss">
  .button {
    width: 100%;
    
    &:active {
      transform: scale(0.97);
      transition: all 150ms ease-in-out;
    }
  }
</style>
