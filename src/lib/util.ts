import { varTypes, entityToIcon } from '@lib/constant'
import { UrlParam } from './url-param'

export const appMode = UrlParam.getAppMode()

export const isHttp = window.location.protocol.startsWith('http')

function getSubFolder() {
  const url = new URL(window.location.href)
  const pathname = url.pathname.split('/').filter(Boolean)
  return pathname.length > 0 ? pathname[0] : ''
}
const subfolder = getSubFolder()
export const urlPrefix = (() => {
  if (appMode === 'static_render') return ''
  else if (isHttp && subfolder) return '/' + subfolder + '/#'
  return '#'
})()

export function getBaseLinkUrl() {
  if (appMode === 'static_render') return '/'
  return '#/'
}

export function capitalize(str: string) {
  if (!str || str.length === 0) return str
  return str[0].toUpperCase() + str.slice(1)
}

export const isFirefox = navigator.userAgent.toLowerCase().includes('firefox')

function getDocumentWidth() {
  return (
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth
  )
}
export const documentWidth = getDocumentWidth()
export function getIsMobile() {
  return getDocumentWidth() < 600
}

export const isMobile = getIsMobile()

export function getIsSmallMenu() {
  return getDocumentWidth() < 1023
}

export const hasTouchScreen =
  'ontouchstart' in window || navigator.maxTouchPoints > 0

export function getPercent(value: number) {
  return Math.min(Math.round(value * 1000) / 10, 100)
}

export function getVariableTypeClean(type: string | undefined) {
  if (!type || !(type in varTypes)) return '???'
  return varTypes[type as keyof typeof varTypes]
}

export function entityToIconName(type: string) {
  return type in entityToIcon
    ? entityToIcon[type as keyof typeof entityToIcon]
    : type
}

export function getColor(entity: string) {
  return getComputedStyle(document.body).getPropertyValue(`--color-${entity}`)
}

export function pluralize(str: string) {
  if (str.endsWith('y')) return str.slice(0, -1) + 'ies'
  return str + 's'
}

export function splitOnLastSeparator(str: string, separator: string) {
  const lastIndex = str.lastIndexOf(separator)
  return lastIndex === -1
    ? [str, '']
    : [str.slice(0, lastIndex), str.slice(lastIndex + separator.length)]
}

export function link(href: string, content: string, entity = '') {
  const base = getBaseLinkUrl()
  const onclick = `window.goToHref(event, '${href}')`
  let specialClass = ''
  if (entity) {
    specialClass = `class="color-entity-${entity}"`
  }
  return `<a href="${base}${href}" onclick="${onclick}" ${specialClass}>${content}</a>`
}

export function addIndend(text: string, indent: number) {
  const style = `padding-left: ${indent * 7}px;`
  return `<div class="indented-text" style="${style}">${text}</div>`
}

export function wrapLongText(text = '', indent = 0) {
  if (text === undefined || text === null || text === '')
    return `<div class="long-text_empty"></div>`
  if (indent) text = addIndend(text, indent)
  return `<div class="long-text">${text}</div>`
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
) {
  let timeout: ReturnType<typeof setTimeout> | undefined = undefined
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

export function resetColsSearchCache() {
  Object.keys(localStorage)
    .filter(x => x.startsWith('DataTables_'))
    .forEach(x => localStorage.removeItem(x))
}

export function clickOutside(
  node: HTMLElement,
  callback?: (event: MouseEvent) => void,
) {
  const handleClick = (event: MouseEvent) => {
    if (
      node &&
      !node.contains(event.target as Node) &&
      !event.defaultPrevented
    ) {
      if (callback) {
        callback(event)
      } else {
        node.dispatchEvent(new CustomEvent('clickOutside'))
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

export async function worker<TParams, TResult>(
  params: TParams,
  callback: (data: TParams) => TResult,
): Promise<TResult> {
  return new Promise(resolve => {
    function workerFunction(cb: (data: TParams) => TResult) {
      onmessage = (e: MessageEvent) => postMessage(cb(e.data))
    }
    const workerApi = new Worker(
      URL.createObjectURL(
        new Blob([`(${workerFunction.toString()})(${callback.toString()})`], {
          type: 'text/javascript',
        }),
      ),
    )
    workerApi.postMessage(params)
    workerApi.onmessage = (e: MessageEvent) => resolve(e.data as TResult)
  })
}

export function ensureScriptLoaded(scriptPath: string) {
  return new Promise<void>(resolve => {
    const scriptBase = scriptPath.split('?')[0]
    if (document.querySelector(`script[src^="${scriptBase}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = `${scriptPath}?v=${__APP_VERSION__}`
    script.onload = () => resolve()
    document.head.appendChild(script)
  })
}
export function ensureMermaidLoaded() {
  return ensureScriptLoaded('assets/external/mermaid.min.js')
}
