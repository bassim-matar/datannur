<script lang="ts">
  import Favorites from './favorites'

  let { type, id, isFavorite, isMeta = false, noMargin = false } = $props()

  let clicked = $state(false)

  function toggle() {
    isFavorite = !isFavorite
    if (isFavorite) {
      Favorites.add(type, id)
      clicked = true
    } else {
      Favorites.remove(type, id)
      clicked = false
    }
  }
</script>

{#if !isMeta}
  <button
    class="icon favorite"
    class:clicked
    class:is-active={isFavorite}
    class:no-margin={noMargin}
    onclick={toggle}
    aria-label="Favorite"
  >
    <i class="fas fa-star"></i>
  </button>
{/if}

<style lang="scss">
  @use '../style/favorite.scss' as *;
  @include favorite-style;

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
