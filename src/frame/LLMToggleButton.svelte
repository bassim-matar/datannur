<script lang="ts">
  let { onClick } = $props<{ onClick: () => void }>()
</script>

<button class="llm-toggle-btn" onclick={onClick} title="Assistant LLM">
  <i class="fa-solid fa-comments"></i>
</button>

<style lang="scss">
  @use 'main.scss' as *;

  .llm-toggle-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    width: 40px;
    height: 40px;
    transition: color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-2;
    margin: 0;

    &:hover {
      color: $color-3;
    }
  }
</style>
