const mermaid_src = "assets/external/mermaid.min.js?v=11.2.1"

export function ensure_mermaid_loaded(callback) {
  if (document.querySelector(`script[src="${mermaid_src}"]`)) {
    callback()
    return
  }
  const script = document.createElement("script")
  const script_attributes = { src: mermaid_src, onload: () => callback() }
  document.head.appendChild(Object.assign(script, script_attributes))
}