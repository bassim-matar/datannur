<script>
  import TagsListLevel from "@component/tag/TagsListLevel.svelte"
  import Link from "@layout/Link.svelte"

  let { tag } = $props()
  
  const tag_children_data = Object.values(tag.children)
</script>

<div class="main_tag_list_wrapper">
  {#if tag.id}
    <span><Link href="tag/{tag.id}">{tag.name}</Link></span>
  {/if}
  {#if tag_children_data && tag_children_data.length > 0}
    <div class="tags_list_level_wrapper" class:with_indent={tag.id}>
      {#each tag_children_data as tag}
        {#if tag.children && Object.values(tag.children).length > 0}
          <div class="tag_list_level_wrapper">
            <TagsListLevel {tag} />
          </div>
        {:else}
          <span class="tag_last_level"><TagsListLevel {tag} /></span>
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .tag_list_level_wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 10px;
    font-weight: bold;
  }
  .main_tag_list_wrapper {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .tags_list_level_wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 10px 20px;
    &.with_indent {
      margin-left: 10px;
      padding-left: 5px;
    }
  }

  .tag_last_level {
    font-weight: normal;
    font-style: italic;
    padding: 0;
  }
</style>
