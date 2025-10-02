<script lang="ts">
  import { router } from '@lib/router.svelte.js'
  import { getBaseLinkUrl } from '@lib/util'

  let {
    href,
    className = '',
    click = () => false,
    isActive = () => false,
    alternativeAction = null,
    entity = '',
    children,
  } = $props()

  const base = href === '/' ? '' : getBaseLinkUrl()

  const entityClass = $derived(entity ? `color-entity-${entity}` : '')

  function goToHref(event) {
    if (event.ctrlKey || event.metaKey) return
    event.preventDefault()
    if (alternativeAction) {
      alternativeAction()
      return
    }
    router.navigate(href)
  }

  function onClickEvent(event) {
    click(event)
    goToHref(event)
  }
</script>

<a
  href="{base}{href}"
  class="{className} {entityClass}"
  class:is-active={isActive()}
  onclick={onClickEvent}
>
  {@render children?.()}
</a>

<style lang="scss">
  @use 'main.scss' as *;

  a {
    text-decoration: none;
    transition: $transition-basic-1;
    &:hover,
    &:focus-within,
    &.is-active {
      color: $color-3 !important;
      background: initial !important;
    }
  }

  @each $entity in $entities {
    a.color-entity-#{$entity}:hover,
    a.color-entity-#{$entity}.is-active,
    a.color-entity-#{$entity}:focus-within {
      color: #{color($entity)} !important;
    }
  }
</style>
