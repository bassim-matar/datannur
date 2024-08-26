import { marked } from "marked"

const renderer = new marked.Renderer()
renderer.link = ({ href, title, text }) => {
  if (!title) title = ""
  return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="basic_link" title="${title}">${text}</a>`
}

marked.setOptions({ renderer: renderer })

export default marked
