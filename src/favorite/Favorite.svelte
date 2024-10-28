<script>
  import Favorites from "./Favorites"

  let {
    type,
    id,
    is_favorite,
    is_meta = false,
    no_margin = false,
  } = $props()

  let clicked = $state(false)

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
    class:clicked
    class:is-active={is_favorite}
    class:no-margin={no_margin}
    onclick={toggle}
    aria-label="Favorite"
  >
    <i class="fas fa-star"></i>
  </button>
{/if}

<style lang="scss">
  @use "../style/favorite.scss" as *;
  @include favorite_style;

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
