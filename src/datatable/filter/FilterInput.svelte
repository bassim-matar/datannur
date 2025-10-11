<script lang="ts">
  import jQuery from 'jquery'
  import BtnClearInput from '@layout/BtnClearInput.svelte'

  let { tableId, i, column } = $props()

  function clearInput(this: HTMLElement) {
    const input = jQuery(this).parent().children('input')
    input[0].value = ''
    input.keyup()
    input.focus()
  }
</script>

<div class="header-input-wrapper">
  {#if column.filterType === 'none'}
    <span></span>
  {:else if column.filterType === 'select'}
    <div class="select">
      <select
        id="datatables-title-{tableId}-filter-{i}"
        name="datatables-title-{tableId}-filter-{i}"
        autocomplete="off"
        required
      >
        <option value="">- - -</option>
      </select>
    </div>
  {:else}
    <i class="fas fa-search search-icon"></i>
    <input
      type="text"
      class="input fontAwesome"
      value=""
      id="datatables-title-{tableId}-filter-{i}"
      name="datatables-title-{tableId}-filter-{i}"
      autocomplete="off"
      enterkeyhint="search"
    />
    <BtnClearInput click={clearInput} mode="mini" />
  {/if}
</div>

<style lang="scss">
  @use 'main.scss' as *;

  .header-input-wrapper {
    position: relative;
    .fontAwesome {
      font-family: 'Helvetica', FontAwesome, sans-serif;
    }
    :global {
      .select {
        min-width: 50px;
        width: 100%;
        overflow: hidden;
        border-radius: 0;
        &:not(.is-multiple):not(.is-loading)::after {
          display: none;
        }
        & select:not([multiple]) {
          padding-right: 0;
        }
      }
      select {
        color: $color-4;
        &:valid {
          color: $color-2;
        }
        option {
          background-color: $background-1;
          color: $color-1;
        }
      }
      input,
      select {
        width: 100%;
        min-width: 50px;
        margin: 0;
        border: 0;
        background: transparent;
        outline: none;
        box-shadow: none;
        border-radius: 0;
        &:focus {
          z-index: 1;
          border: 1px solid transparent;
          padding-left: 10px;
          box-sizing: border-box;
          -moz-box-sizing: border-box;
          -webkit-box-sizing: border-box;
        }
      }

      .search-icon {
        position: absolute;
        left: 15px;
        top: 50%;
        transform: translateY(-50%);
        color: $color-4;
      }
    }
  }
</style>
