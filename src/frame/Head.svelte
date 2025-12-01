<script lang="ts">
  let {
    title,
    description: descriptionProp,
  }: { title: string; description?: string } = $props()

  const description = $derived(descriptionProp ?? title)
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
</svelte:head>
