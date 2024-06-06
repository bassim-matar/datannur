<script>
  import Favorites from "./Favorites"

  export let type
  export let id
  export let is_favorite
  export let is_meta = false
  export let no_margin = false

  let clicked = false

  function toggle() {
    is_favorite = !is_favorite
    if (is_favorite) {
      Favorites.add(type, id)
      clicked = true
    } else {
      Favorites.remove(type, id)
      clicked = false
    }
  }
</script>

{#if !is_meta}
  <button
    class="icon favorite"
    class:clicked={clicked}
    class:is-active={is_favorite}
    class:no-margin={no_margin}
    on:click={toggle}
  >
    <i class="fas fa-star" />
  </button>
{/if}

<style lang="scss">
  @import "../style/favorite.scss";

  .favorite {
    margin-left: 10px;
    margin-right: 10px;
    margin-bottom: 0;
    &.no-margin {
      margin-left: 0;
      margin-right: 0;
      width: 16px;
    }
  }
</style>
