import { var_types, entity_to_icon } from "@js/constant"

export let app_mode = "spa"
export function set_app_mode(mode) {
  app_mode = mode
}

export const is_http = window.location.protocol.startsWith("http")

export const is_firefox = navigator.userAgent.toLowerCase().includes("firefox")

export const document_width =
  window.innerWidth ||
  document.documentElement.clientWidth ||
  document.body.clientWidth

export const is_mobile = document_width < 600

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
  let base = "#!/"
  if (app_mode === "static_render") base = ""
  return `<a href="${base}${href}">${content}</a>`
}

export function add_indend(text, indent) {
  const style = `padding-left: ${indent * 7}px;`
  return `<div class="indented_text" style="${style}">${text}</div>`
}

export function wrap_long_text(text, indent = false) {
  if (text === undefined || text === null || text === "") return ""
  if (indent) text = add_indend(text, indent)
  return `<div class="long_text">${text}</div>`
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
