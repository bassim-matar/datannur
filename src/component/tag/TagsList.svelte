<script lang="ts">
  import db from '@db'
  import TagsListLevel from '@component/tag/TagsListLevel.svelte'

  let { tags } = $props()

  function buildTree(tags) {
    const tagsTree = {}
    tags.forEach(tag => {
      if (!(tag.id in tagsTree)) {
        tagsTree[tag.id] = { ...tag, children: {} }
      }
    })
    if (!db.use.tagRecursive) {
      return tagsTree
    }
    tags.forEach(tag => {
      let currentLevel = tagsTree
      tag.parents.forEach(parent => {
        if (!(parent.id in currentLevel)) {
          currentLevel[parent.id] = { ...parent, children: {} }
        }
        currentLevel = currentLevel[parent.id].children
      })
      if (!(tag.id in currentLevel)) {
        currentLevel[tag.id] = tagsTree[tag.id]
      } else {
        currentLevel[tag.id] = {
          ...tagsTree[tag.id],
          children: { ...currentLevel[tag.id].children },
        }
      }
    })
    const rootTags = {}
    Object.keys(tagsTree).forEach(tagId => {
      if (tagsTree[tagId].parents.length === 0) {
        rootTags[tagId] = tagsTree[tagId]
      }
    })
    return rootTags
  }

  let tagsTree = buildTree(tags)
</script>

<div class="tags_wrapper">
  <TagsListLevel tag={{ children: tagsTree }} />
</div>

<style lang="scss">
  .tags_wrapper {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
</style>
