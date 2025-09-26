<script lang="ts">
  import Icon from '@layout/Icon.svelte'
  import Link from '@layout/Link.svelte'
  import Logs from '@lib/logs'
  import SearchHistory from './search-history'
  import { searchHighlight } from './search'
  import { safeHtml } from '@lib/html-sanitizer'
  import Favorite from '@favorite/Favorite.svelte'

  let { item, searchValue, isFocusIn = $bindable(), selectInput } = $props()

  function clickLink(entityName, itemId) {
    setTimeout(() => {
      SearchHistory.add(entityName, itemId)
      Logs.add('search_bar', { entity: entityName, entity_id: itemId })
      isFocusIn = false
    }, 10)
  }

  function removeItem(entityName, itemId) {
    SearchHistory.remove(entityName, itemId)
    selectInput()
  }
</script>

<tr class:nav-hover={item.nav_hover}>
  <td style="width: 20px;">
    <div>
      <Icon type={item.entity} />
    </div>
  </td>
  <td style="width: 20px;">
    <div>
      <Favorite
        type={item.entity}
        id={item.id}
        isFavorite={item.isFavorite}
        noMargin={true}
      />
    </div>
  </td>
  <td>
    <Link
      href="{item.entity}/{item.id}"
      click={() => clickLink(item.entity, item.id)}
      entity={item.entity}
    >
      <div class="long_text">
        {#if searchValue === ''}
          {item.name}
        {:else}
          <span use:safeHtml={searchHighlight(item.name, searchValue)}></span>
        {/if}
      </div>
    </Link>
  </td>
  {#if searchValue === '' || item.is_recent}
    <td style="width: 20px;">
      <button
        class="btn_delete_item"
        style="cursor: pointer;"
        onclick={() => removeItem(item.entity, item.id)}
        aria-label="Remove item from recent search"
      >
        <i class="fa-solid fa-xmark close"></i>
        <i class="fa-solid fa-clock-rotate-left recent"></i>
      </button>
    </td>
  {/if}
</tr>

<style lang="scss">
  @use 'main.scss' as *;

  tr.nav-hover,
  tr:hover {
    background: rgba(127, 127, 127, 0.1);
  }
  td {
    border: 0;
  }
  .long_text {
    word-break: break-word;
    width: 100%;
    :global(.searchHighlight) {
      border-radius: $rounded;
      background: rgba(255, 255, 0, 0.5);
    }
  }

  .btn_delete_item {
    margin: 0;
    position: relative;
    width: 20px;
    height: 16px;
    vertical-align: middle;
    color: $color-2;
    .fa-solid {
      transition: opacity $transition-basic-1;
      position: absolute;
      top: 0;
      left: 0;
      margin: auto;
    }
    .recent {
      opacity: 1;
    }
    .close {
      opacity: 0;
    }
    tr:hover & {
      opacity: 1;
      .recent {
        opacity: 0;
      }
      .close {
        opacity: 1;
      }
    }
    &:hover {
      text-shadow: 0 0 10px;
    }
  }
</style>
