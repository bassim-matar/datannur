export const copy_text_classes = "copyclip break_line use_tooltip"
export const copy_text_msg = "cliquer pour copier l'élement"
const copy_text_msg_copied = "copié dans le presse-papier !"

export function copy_text_listen_click() {
  document.addEventListener("click", async ({ target }) => {
    if (!target.classList.contains("copyclip")) return false
    const text = target.textContent.trim()
    await navigator.clipboard.writeText(text)
    const tooltip = document.getElementById("powerTip")
    tooltip.textContent = copy_text_msg_copied
    setTimeout(() => (tooltip.textContent = copy_text_msg), 1000)
  })
}
