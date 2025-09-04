<script lang="ts">
  import db from "@db"
  import TagsListLevel from "@component/tag/TagsListLevel.svelte"

  let { tags } = $props()

  function build_tree(tags) {
    const tags_tree = {}
    tags.forEach(tag => {
      if (!(tag.id in tags_tree)) {
        tags_tree[tag.id] = { ...tag, children: {} }
      }
    })
    if (!db.use.tag_recursive) {
      return tags_tree
    }
    tags.forEach(tag => {
      let current_level = tags_tree
      tag.parents.forEach(parent => {
        if (!(parent.id in current_level)) {
          current_level[parent.id] = { ...parent, children: {} }
        }
        current_level = current_level[parent.id].children
      })
      if (!(tag.id in current_level)) {
        current_level[tag.id] = tags_tree[tag.id]
      } else {
        current_level[tag.id] = {
          ...tags_tree[tag.id],
          children: { ...current_level[tag.id].children },
        }
      }
    })
    const root_tags = {}
    Object.keys(tags_tree).forEach(tagId => {
      if (tags_tree[tagId].parents.length === 0) {
        root_tags[tagId] = tags_tree[tagId]
      }
    })
    return root_tags
  }

  let tags_tree = build_tree(tags)
</script>

<div class="tags_wrapper">
  <TagsListLevel tag={{ children: tags_tree }} />
</div>

<style lang="scss">
  .tags_wrapper {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
</style>
