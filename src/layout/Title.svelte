<script>
  import fitty from "fitty"
  import db from "@db"
  import { entity_names } from "@js/constant"
  import Head from "@frame/Head.svelte"
  import Icon from "@layout/Icon.svelte"
  import Favorite from "@favorite/Favorite.svelte"
  import { onMount } from "svelte"

  export let type
  export let name
  export let mode = "normal"
  export let id = false
  export let info = false
  export let toggle_info = false
  export let name_sup = ""

  let separator = " | "
  const entity_name = entity_names[type]
  let title = name
  if (mode !== "main_title") {
    title = entity_name + separator + name
  }
  let is_favorite = false
  if (id) {
    const item = db.get(type, id)
    is_favorite = item.is_favorite
  }

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
    <h1 class="title">
      <Icon {type} mode="main_title" />
      {#if mode !== "main_title"}
        <span>{entity_name}</span>
        {#if info}
          <button class="title_info" on:click={toggle_info}>{info}</button>
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
    // margin-bottom: 1.5rem;
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
      // margin-bottom: 1rem;
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
  }
</style>
