import { marked } from "marked"

const renderer = new marked.Renderer()
renderer.link = ({ href, title, text }) => {
  if (!title) title = ""
  return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="basic_link" title="${title}">${text}</a>`
}

renderer.image = function ({ href, text }) {
  if (!text) text = ""
  return `<figure>
    <img src="${href}" alt="${text}" title="${text}" />
    <figcaption>${text}</figcaption>
  </figure>`
}

marked.setOptions({ renderer: renderer })

export default marked
