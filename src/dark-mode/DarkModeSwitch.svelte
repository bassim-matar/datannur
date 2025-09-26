<script lang="ts">
  import Logs from '@lib/logs'
  import { DarkMode, darkModeTheme } from '@dark-mode/dark-mode'

  let { label = null } = $props()

  let id = window.crypto.randomUUID()

  function toggle() {
    DarkMode.toggle()
    if ($darkModeTheme === 'dark') Logs.add('toggle_dark_mode_btn_off')
    else Logs.add('toggle_dark_mode_btn_on')
  }

  let day = $derived($darkModeTheme === 'dark' ? '' : 'day')
  let sun = $derived($darkModeTheme === 'dark' ? '' : 'sun')
</script>

<button
  id="checkbox_{id}"
  onclick={toggle}
  class="tdnn {day}"
  aria-label="dark_mode"
>
  <div class="moon {sun}"></div>
</button>

{#if label}
  <label for="checkbox_{id}">{label}</label>
{/if}

<style lang="scss">
  @use 'main.scss' as *;

  .tdnn {
    --toggleHeight: 16em;
    --toggleWidth: 30em;
    --toggleBtnRadius: 10em;
    --bgColor--night: #333; //#423966;
    --bgColor--day: #bbb; // #ffbf71;
    --mooncolor: #d9fbff;
    --suncolor: #fff; // #fce570;
    --moonstar--opacity: 0.3;

    cursor: pointer;
    margin: 0 auto;
    vertical-align: middle;
    /*change size of toggle with font-size*/
    font-size: 10%;
    position: relative;
    height: var(--toggleHeight);
    width: var(--toggleWidth);
    border-radius: var(--toggleHeight);
    transition: all 500ms ease-out;
    background: var(--bgColor--night);
  }
  .day {
    background: var(--bgColor--day);
  }
  .moon {
    position: absolute;
    display: block;
    border-radius: 50%;
    transition: all 400ms ease-out;
    top: 3em;
    left: 3em;
    transform: rotate(-75deg);
    width: var(--toggleBtnRadius);
    height: var(--toggleBtnRadius);
    background: var(--bgColor--night);
    box-shadow:
      3em 2.5em 0 0em var(--mooncolor) inset,
      rgba(255, 255, 255, var(--moonstar--opacity)) 0em -7em 0 -4.5em,
      rgba(255, 255, 255, var(--moonstar--opacity)) 3em 7em 0 -4.5em,
      rgba(255, 255, 255, var(--moonstar--opacity)) 2em 13em 0 -4em,
      rgba(255, 255, 255, var(--moonstar--opacity)) 6em 2em 0 -4.1em,
      rgba(255, 255, 255, var(--moonstar--opacity)) 8em 8em 0 -4.5em,
      rgba(255, 255, 255, var(--moonstar--opacity)) 6em 13em 0 -4.5em,
      rgba(255, 255, 255, var(--moonstar--opacity)) -4em 7em 0 -4.5em,
      rgba(255, 255, 255, var(--moonstar--opacity)) -1em 10em 0 -4.5em;
  }
  .sun {
    top: 4.5em;
    left: 18em;
    transform: rotate(0deg);
    width: 7em;
    height: 7em;
    background: var(--suncolor);
    box-shadow:
      3em 3em 0 5em var(--suncolor) inset,
      0 -5em 0 -2.7em var(--suncolor),
      3.5em -3.5em 0 -3em var(--suncolor),
      5em 0 0 -2.7em var(--suncolor),
      3.5em 3.5em 0 -3em var(--suncolor),
      0 5em 0 -2.7em var(--suncolor),
      -3.5em 3.5em 0 -3em var(--suncolor),
      -5em 0 0 -2.7em var(--suncolor),
      -3.5em -3.5em 0 -3em var(--suncolor);
  }

  label {
    cursor: pointer;
    padding-left: 0.3rem;
  }
</style>
