<script>
  import db from "@db"
  import { footer_visible } from "@js/store"
  import { get_datetime, get_time_ago } from "@js/Time"
  import Loading from "@frame/Loading.svelte"
  import Icon from "@layout/Icon.svelte"
  import DarkModeSwitch from "@dark_mode/DarkModeSwitch.svelte"
  import HeaderLink from "@frame/HeaderLink.svelte"

  const year = new Date().getFullYear()
  let contact_email = "loading"
  let last_update = "loading"

  const app_version = document
    .querySelector('meta[name="app_version"]')
    ?.getAttribute("content")

  db.loaded.then(() => {
    contact_email = db.get_config("contact_email")
    last_update = false
    if (db.use.info) last_update = db.get("info", "last_update")
    if (last_update) {
      const timestamp = last_update.value * 1000
      const relative = get_time_ago(timestamp)
      const absolute = get_datetime(timestamp)
      last_update = { relative, absolute }
    }
  })
</script>

{#if $footer_visible}
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
            href="https://github.com/bassim-matar/datannur-app/releases/tag/{app_version}"
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
          pages={["meta", "metaFolder", "metaDataset", "metaVariable"]}
          className=""
        >
          vue méta
        </HeaderLink>
      </div>
      <div>
        <DarkModeSwitch />
      </div>
      {#if last_update}
        <div>
          {#if last_update === "loading"}
            <Loading type="mini" position="relative" />
          {:else}
            <span
              class="break_line use_tooltip tooltip_top"
              title={last_update.absolute}
            >
              actualisé {last_update.relative}
            </span>
          {/if}
        </div>
      {/if}

      {#if contact_email}
        <div>
          {#if contact_email === "loading"}
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
  @use "../main.scss" as *;

  .footer {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.3rem 3rem;
    // background-color: $background-1;
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
