import db from '@db'
import defaultBanner from '@markdown/main/banner.md?raw'
import defaultBody from '@markdown/main/body.md?raw'
import defaultMoreInfo from '@markdown/main/more-info.md?raw'

export function getAboutMain() {
  const banner = db.exists('config', 'banner')
    ? db.getConfig('banner')
    : defaultBanner

  const body = db.exists('config', 'body') ? db.getConfig('body') : defaultBody

  const moreInfo = db.exists('config', 'more_info')
    ? db.getConfig('more_info')
    : defaultMoreInfo

  return banner + '\n' + body + '\n\n' + moreInfo
}
