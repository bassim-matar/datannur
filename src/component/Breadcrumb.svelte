<script lang="ts">
  import db from '@db'
  import Link from '@layout/Link.svelte'

  let { type, elem_id, is_self = false } = $props()

  const elems = db.getParents(type, elem_id)

  if (!is_self) {
    const current = db.get(type, elem_id)
    elems.push(current)
  }

  elems.reverse()
</script>

{#if elems && elems.length > 0}
  <div class="tree">
    {#each elems as elem, i (elem.id)}
      <Link href="{type}/{elem.id}" entity={type}>
        <div class="indented_text" style="padding-left: {i * 7}px;">
          {elem.name}
        </div>
      </Link>
    {/each}
  </div>
{/if}
