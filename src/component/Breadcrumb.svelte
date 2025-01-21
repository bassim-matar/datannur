<script>
  import db from "@db"
  import { add_indend } from "@js/util"
  import Link from "@layout/Link.svelte"

  let { type, elem_id, is_self = false, className = "" } = $props()

  const elems = db.get_parents(type, elem_id)

  if (!is_self) {
    const current = db.get(type, elem_id)
    elems.push(current)
  }

  elems.reverse()
</script>

{#if elems && elems.length > 0}
  <div class="tree">
    {#each elems as elem, i}
      <Link href="{type}/{elem.id}" entity={type}>
        {@html add_indend(elem.name, i)}
      </Link>
    {/each}
  </div>
{/if}
