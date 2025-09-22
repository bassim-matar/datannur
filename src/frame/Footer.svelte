<script lang="ts">
  import db from '@db'
  import { footer_visible } from '@lib/store'
  import { get_datetime, get_time_ago } from '@lib/time'
  import Loading from '@frame/Loading.svelte'
  import Icon from '@layout/Icon.svelte'
  import DarkModeSwitch from '@dark-mode/DarkModeSwitch.svelte'
  import HeaderLink from '@frame/HeaderLink.svelte'

  let { menu_mobile = false } = $props()
  let contact_email = $state('loading')
  const last_update = $state({
    state: 'loading',
    value: 0,
    relative: '',
    absolute: '',
  })
  const year = new Date().getFullYear()

  const app_version = document
    .querySelector('meta[name="app_version"]')
    ?.getAttribute('content')

  let current_interval
  let interval = 1000
  function update_last_modif() {
    last_update.relative = get_time_ago(last_update.value * 1000)
    if (
      interval === 1000 &&
      !last_update.relative.includes('seconde') &&
      !last_update.relative.includes('maintenant')
    ) {
      clearInterval(current_interval)
      interval = 60000
      current_interval = setInterval(update_last_modif, interval)
    }
  }

  db.loaded.then(() => {
    contact_email = db.getConfig('contact_email') as string
    last_update.state = 'loaded'
    if (db.use.info) {
      last_update.value = db.get('info', 'last_update')?.value
    }
    const last_modif_timestamp = db.getLastModifTimestamp()
    if (last_modif_timestamp) last_update.value = last_modif_timestamp
    if (last_update.value) {
      const timestamp = last_update.value * 1000
      last_update.relative = get_time_ago(timestamp)
      last_update.absolute = get_datetime(timestamp)
      current_interval = setInterval(update_last_modif, interval)
    } else {
      last_update.state = 'not_found'
    }
  })
</script>

{#if $footer_visible || menu_mobile}
  <footer class="footer">
    <div class="footer-content">
      <div>
        <a href="https://datannur.com" target="_blanck">
          © {year} dat<span class="main_color">a</span>nnur
        </a>
      </div>
      {#if app_version}
        <div>
          <a
            href="https://github.com/bassim-matar/datannur/releases/tag/v{app_version}"
            target="_blanck"
          >
            v{app_version}
          </a>
        </div>
      {/if}
      <div>
        <a href="https://github.com/bassim-matar/datannur" target="_blanck">
          <Icon type="github" margin_right={false} /> github
        </a>
      </div>
      <div>
        <HeaderLink
          href="meta"
          pages={['meta', 'metaFolder', 'metaDataset', 'metaVariable']}
          className=""
        >
          <Icon type="internal_view" margin_right={false} />
          vue interne
        </HeaderLink>
      </div>
      <div>
        <DarkModeSwitch />
      </div>
      {#if last_update.state === 'loading'}
        <div>
          <Loading type="mini" position="relative" />
        </div>
      {:else if last_update.state === 'loaded'}
        <div>
          <span
            class="break_line use_tooltip tooltip_top"
            title={last_update.absolute}
          >
            actualisé {last_update.relative}
          </span>
        </div>
      {/if}

      {#if contact_email}
        <div>
          {#if contact_email === 'loading'}
            <Loading type="mini" position="relative" />
          {:else}
            <a href="mailto:{contact_email}" target="_blanck">{contact_email}</a
            >
          {/if}
        </div>
      {/if}
    </div>
  </footer>
{/if}

<style lang="scss">
  @use 'main.scss' as *;

  .footer {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.3rem 3rem;
    background-color: transparent;
    color: $color-2;
    .footer-content {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      min-height: 2.65rem;
      & > div {
        margin: 0.3rem 0.75rem;
      }

      .main_color {
        color: $color-3;
        text-shadow: 0 0 10px;
      }
    }
  }

  @media screen and (max-width: 600px) {
    .footer {
      padding-left: 0.75rem;
      padding-right: 0.75rem;
    }
  }
</style>
