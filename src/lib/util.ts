import { var_types, entity_to_icon } from '@lib/constant'
import { UrlParam } from './url-param'

export const app_mode = UrlParam.getAppMode()

export const is_http = window.location.protocol.startsWith('http')

function getSubFolder() {
  const url = new URL(window.location.href)
  const pathname = url.pathname.split('/').filter(Boolean)
  return pathname.length > 0 ? pathname[0] : ''
}
const subfolder = getSubFolder()
export const url_prefix = (() => {
  if (app_mode === 'static_render') return ''
  else if (is_http && subfolder) return '/' + subfolder + '/#'
  return '#'
})()

export function getBaseLinkUrl() {
  if (app_mode === 'static_render') return '/'
  return '#/'
}

export const is_firefox = navigator.userAgent.toLowerCase().includes('firefox')

function getDocumentWidth() {
  return (
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth
  )
}
export const document_width = getDocumentWidth()
export function getIsMobile() {
  return getDocumentWidth() < 600
}

export const is_mobile = getIsMobile()

export function getIsSmallMenu() {
  return getDocumentWidth() < 1023
}

export const has_touch_screen =
  'ontouchstart' in window || navigator.maxTouchPoints > 0

export function getPercent(value) {
  return Math.min(Math.round(value * 1000) / 10, 100)
}

export function getVariableTypeClean(type) {
  return var_types[type] || '???'
}

export function entityToIconName(type) {
  return type in entity_to_icon ? entity_to_icon[type] : type
}

export function getColor(entity) {
  return getComputedStyle(document.body).getPropertyValue(`--color-${entity}`)
}

export function pluralize(str) {
  if (str.endsWith('y')) return str.slice(0, -1) + 'ies'
  return str + 's'
}

export function escapeHtmlEntities(str) {
  const to_replace = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return String(str).replace(/[&<>"']/g, char => to_replace[char])
}

export function splitOnLastSeparator(str, separator) {
  const last_index = str.lastIndexOf(separator)
  return last_index === -1
    ? [str, '']
    : [str.slice(0, last_index), str.slice(last_index + separator.length)]
}

export function link(href, content, entity = null) {
  const base = getBaseLinkUrl()
  const onclick = `window.goToHref(event, '${href}')`
  let special_class = ''
  if (entity) {
    special_class = `class="color_entity_${entity}"`
  }
  return `<a href="${base}${href}" onclick="${onclick}" ${special_class}>${content}</a>`
}

export function addIndend(text, indent) {
  const style = `padding-left: ${indent * 7}px;`
  return `<div class="indented_text" style="${style}">${text}</div>`
}

export function wrapLongText(text = null, indent = null) {
  if (text === undefined || text === null || text === '')
    return `<div class="long_text_empty"></div>`
  if (indent) text = addIndend(text, indent)
  return `<div class="long_text">${text}</div>`
}

export function debounce(func, wait) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

export function resetColsSearchCache() {
  Object.keys(localStorage)
    .filter(x => x.startsWith('DataTables_'))
    .forEach(x => localStorage.removeItem(x))
}

export function clickOutside(node, callback) {
  const handleClick = event => {
    if (node && !node.contains(event.target) && !event.defaultPrevented) {
      if (callback) {
        callback(event)
      } else {
        node.dispatchEvent(new CustomEvent('click_outside', node))
      }
    }
  }
  document.addEventListener('click', handleClick, true)
  return {
    destroy() {
      document.removeEventListener('click', handleClick, true)
    },
  }
}

export async function worker(params, callback) {
  return new Promise(resolve => {
    function workerFunction(callback) {
      onmessage = e => postMessage(callback(e.data))
    }
    const worker_api = new Worker(
      URL.createObjectURL(
        new Blob([`(${workerFunction.toString()})(${callback.toString()})`], {
          type: 'text/javascript',
        }),
      ),
    )
    worker_api.postMessage(params)
    worker_api.onmessage = e => resolve(e.data)
  })
}
