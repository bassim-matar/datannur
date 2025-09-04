import Navigo from "navigo"
import { app_mode } from "@lib/util"
import { page, reload_increment } from "@lib/store"

export const router = new Navigo("/", { hash: app_mode !== "static_render" })

let page_value = ""
page.subscribe(value => (page_value = value))

window.go_to_href = (event, href) => {
  if (event.ctrlKey || event.metaKey) return
  event.preventDefault()

  if (
    !href.startsWith("http") &&
    !href.startsWith("mailto") &&
    page_value === href.split("?")[0]
  ) {
    router.navigate(href)
    reload_increment.update(value => value + 1)
  } else {
    router.navigate(href)
  }
}
