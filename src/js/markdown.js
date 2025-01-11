import { marked } from "marked"
import { get_base_link_url } from "@js/util"

const renderer = new marked.Renderer()
renderer.link = ({ href, title, text }) => {
  if (!title) title = ""

  let target = ""
  if (href.includes("http") || href.includes("mailto")) {
    target = 'target="_blank" rel="noopener"'
    return `<a href="${href}" ${target} class="basic_link" title="${title}">${text}</a>`
  }

  const base = get_base_link_url()
  const onclick = `window.go_to_href(event, '${href}')`
  return `<a href="${base}${href}" onclick="${onclick}" class="basic_link" title="${title}">${text}</a>`
}

renderer.image = function ({ href, text }) {
  if (!text) text = ""
  if (text.includes("no_caption")) {
    return `<img src="${href}" alt="${text}" />`
  }
  return `<figure>
    <img src="${href}" alt="${text}" title="${text}" />
    <figcaption>${text}</figcaption>
  </figure>`
}

marked.setOptions({ renderer: renderer })

export default marked
