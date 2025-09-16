import Navigo from 'navigo'
import { app_mode } from '@lib/util'
import { page, reload_increment } from '@lib/store'

export const router = new Navigo('/', { hash: app_mode !== 'static_render' })

let pageValue = ''
page.subscribe(value => (pageValue = value))

window.goToHref = (event, href) => {
  if (event.ctrlKey || event.metaKey) return
  event.preventDefault()

  if (
    !href.startsWith('http') &&
    !href.startsWith('mailto') &&
    pageValue === href.split('?')[0]
  ) {
    router.navigate(href)
    reload_increment.update(value => value + 1)
  } else {
    router.navigate(href)
  }
}
