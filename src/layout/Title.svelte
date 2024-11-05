<script>
  import fitty from "fitty"
  import db from "@db"
  import { entity_names } from "@js/constant"
  import Head from "@frame/Head.svelte"
  import Icon from "@layout/Icon.svelte"
  import Favorite from "@favorite/Favorite.svelte"
  import { onMount } from "svelte"

  let {
    type,
    name,
    mode = "normal",
    id = false,
    info = false,
    toggle_info = false,
    name_sup = "",
  } = $props()

  let title = $state(name)
  let is_favorite = $state(false)

  let separator = " | "
  const entity_name = entity_names[type]

  if (mode !== "main_title") {
    title = entity_name + separator + name
  }

  if (id) {
    const item = db.get(type, id)
    is_favorite = item.is_favorite
  }

  let item_page = id ? true : false
  let not_item_page = !item_page

  onMount(() => {
    fitty(".fitty", {
      minSize: 14,
      maxSize: 32,
    })
  })
</script>

<Head {title} />

<div class="fitty_wrapper">
  <div>
    <h1 class="title" class:item_page class:not_item_page>
      <Icon {type} mode="main_title" />
      {#if mode !== "main_title"}
        <span>{entity_name}</span>
        {#if info}
          <button class="title_info" onclick={toggle_info}>{info}</button>
        {/if}
        {#if id}
          <Favorite {type} {id} {is_favorite} />
        {:else}
          <span class="separator">{separator}</span>
        {/if}
      {/if}
      {#if name_sup}
        <span class="title_name fitty">{name} {@html name_sup}</span>
      {:else}
        <span class="title_name fitty">{name}</span>
      {/if}
    </h1>
  </div>
</div>

<style lang="scss">
  .fitty_wrapper {
    width: 100%;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: left;
    & > div {
      width: 100%;
    }
    .fitty {
      margin: auto;
    }
  }
  .title_info {
    font-style: italic;
    cursor: pointer;
    margin: 0;
    padding: 0;
    font-size: 1.5rem;
  }

  @media screen and (max-width: 600px) {
    .fitty_wrapper {
      padding-left: 20px;
      padding-right: 20px;
      .fitty {
        padding: 0;
        margin: 0;
        width: 100%;
        box-sizing: border-box;
      }
      .title {
        padding: 0;
      }
    }
    .title_name {
      display: block;
    }
    .title_info {
      font-size: 1rem;
    }
    .title.not_item_page {
      :global(.icon) {
        margin-right: 0;
      }
    }
  }
</style>
