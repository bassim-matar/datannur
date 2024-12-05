import { var_types, entity_to_icon } from "@js/constant"
import { url_param } from "./url_param"

export let app_mode = url_param.get_app_mode()

export const is_http = window.location.protocol.startsWith("http")

function get_sub_folder() {
  const url = new URL(window.location.href)
  const pathname = url.pathname.split("/").filter(Boolean)
  return pathname.length > 0 ? pathname[0] : ""
}
const subfolder = get_sub_folder()
export const url_prefix = (() => {
  if (app_mode === "static_render") return ""
  else if (is_http && subfolder) return "/" + subfolder + "/#"
  return "#"
})()

export function get_base_link_url() {
  if (app_mode === "static_render") return "/"
  return "#/"
}

export const is_firefox = navigator.userAgent.toLowerCase().includes("firefox")

function get_document_width() {
  return (
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth
  )
}
export const document_width = get_document_width()
export function get_is_mobile() {
  return get_document_width() < 600
}

export const is_mobile = get_is_mobile()

export const has_touch_screen =
  "ontouchstart" in window ||
  navigator.maxTouchPoints > 0 ||
  navigator.msMaxTouchPoints > 0

export function get_percent(value) {
  return Math.min(Math.round(value * 1000) / 10, 100)
}

export function get_variable_type_clean(type) {
  return var_types[type] || "???"
}

export function entity_to_icon_name(type) {
  return type in entity_to_icon ? entity_to_icon[type] : type
}

export function get_color(entity) {
  return getComputedStyle(document.body).getPropertyValue(`--color-${entity}`)
}

export function pluralize(str) {
  if (str.endsWith("y")) return str.slice(0, -1) + "ies"
  return str + "s"
}

export function escape_html_entities(str) {
  const to_replace = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }
  return String(str).replace(/[&<>"']/g, char => to_replace[char])
}

export function link(href, content) {
  const base = get_base_link_url()
  const onclick = `window.go_to_href(event, '${href}')`
  return `<a href="${base}${href}" onclick="${onclick}">${content}</a>`
}

export function add_indend(text, indent) {
  const style = `padding-left: ${indent * 7}px;`
  return `<div class="indented_text" style="${style}">${text}</div>`
}

export function wrap_long_text(text, indent = false) {
  if (text === undefined || text === null || text === "")
    return `<div class="long_text_empty"></div>`
  if (indent) text = add_indend(text, indent)
  return `<div class="long_text">${text}</div>`
}

export function debounce(func, wait) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

export function reset_cols_search_cache() {
  Object.keys(localStorage)
    .filter(x => x.startsWith("DataTables_"))
    .forEach(x => localStorage.removeItem(x))
}

export function clickOutside(node) {
  const handleClick = event => {
    if (node && !node.contains(event.target) && !event.defaultPrevented) {
      node.dispatchEvent(new CustomEvent("click_outside", node))
    }
  }
  document.addEventListener("click", handleClick, true)
  return {
    destroy() {
      document.removeEventListener("click", handleClick, true)
    },
  }
}

export async function worker(params, callback) {
  return new Promise(resolve => {
    function worker_function(callback) {
      onmessage = e => postMessage(callback(e.data))
    }
    const worker_api = new Worker(
      URL.createObjectURL(
        new Blob([`(${worker_function.toString()})(${callback.toString()})`], {
          type: "text/javascript",
        })
      )
    )
    worker_api.postMessage(params)
    worker_api.onmessage = e => resolve(e.data)
  })
}
