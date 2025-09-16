import db from '@db'
import default_banner from '@markdown/main/banner.md?raw'
import default_body from '@markdown/main/body.md?raw'
import default_more_info from '@markdown/main/more_info.md?raw'

export function get_about_main() {
  const banner = db.tableHasId('config', 'banner')
    ? db.getConfig('banner')
    : default_banner

  const body = db.tableHasId('config', 'body')
    ? db.getConfig('body')
    : default_body

  const more_info = db.tableHasId('config', 'more_info')
    ? db.getConfig('more_info')
    : default_more_info

  return banner + '\n' + body + '\n\n' + more_info
}
