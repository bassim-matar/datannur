<script lang="ts">
  let { title, description = title } = $props()
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
</svelte:head>
