<script>
  import db from "@db"
  import { add_indend } from "@js/util"
  import Link from "@layout/Link.svelte"

  export let type
  export let elem_id
  export let is_self = false
  export let className = ""

  const elems = db.get_parents(type, elem_id)

  if (!is_self) {
    const current = db.get(type, elem_id)
    elems.push(current)
  }

  elems.reverse()
</script>

{#if elems && elems.length > 0}
  <div class={className}>
    {#each elems as elem, i}
      <div class="breadcrumb_element">
        <Link href="{type}/{elem.id}">
          <div class="breadcrumb_element_wrapper">
            {@html add_indend(elem.name, i)}
          </div>
        </Link>
      </div>
    {/each}
  </div>
{/if}

<style lang="scss">
  @use "../main.scss" as *;

  .tree {
    width: 100%;
  }

  .breadcrumb_element {
    display: grid;
    // max-width: calc(100vw - 300px);
    width: 100%;
    :global(a) {
      display: inline-block;
      max-width: 100%;
    }
    .breadcrumb_element_wrapper {
      width: 100%;
      :global(.indented_text) {
        text-overflow: ellipsis;
        overflow: hidden;
        max-width: calc(50vw - 270px);
      }
    }
  }

  @media screen and (max-width: 1023px) {
    .breadcrumb_element .breadcrumb_element_wrapper {
      :global(.indented_text) {
        max-width: calc(100vw - 350px);
      }
    }
  }

  @media screen and (max-width: 600px) {
    .breadcrumb_element .breadcrumb_element_wrapper {
      :global(.indented_text) {
        max-width: calc(100vw - 50px);
      }
    }
  }
</style>
