<script lang="ts">
  import TagsListLevel from '@component/tag/TagsListLevel.svelte'
  import Link from '@layout/Link.svelte'
  import type { TagWithChildren } from '@type'

  let {
    tag,
  }: {
    tag: TagWithChildren | { children?: { [key: string]: TagWithChildren } }
  } = $props()

  const tagChildrenData: TagWithChildren[] = Object.values(tag.children || {})

  const isTag = 'id' in tag && 'name' in tag

  const typedTag = isTag ? (tag as TagWithChildren) : null
</script>

<div class="main-tag-list-wrapper">
  {#if isTag && typedTag}
    <span>
      <Link href="tag/{typedTag.id}" entity="tag">{typedTag.name}</Link>
    </span>
  {/if}
  {#if tagChildrenData && tagChildrenData.length > 0}
    <div class="tags-list-level-wrapper" class:with-indent={isTag}>
      {#each tagChildrenData as childTag (childTag.id)}
        {#if childTag.children && Object.values(childTag.children).length > 0}
          <div class="tag-list-level-wrapper">
            <TagsListLevel tag={childTag} />
          </div>
        {:else}
          <span class="tag-last-level"><TagsListLevel tag={childTag} /></span>
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .tag-list-level-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 10px;
    font-weight: bold;
  }
  .main-tag-list-wrapper {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .tags-list-level-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 10px 20px;
    &.with-indent {
      margin-left: 10px;
      padding-left: 5px;
    }
  }

  .tag-last-level {
    font-weight: normal;
    font-style: italic;
    padding: 0;
  }
</style>
