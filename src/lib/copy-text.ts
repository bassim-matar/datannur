export const copyTextClasses = 'copyclip break-line use-tooltip'
export const copyTextMsg = "cliquer pour copier l'élement"
const copyTextMsgCopied = 'copié dans le presse-papier !'

export function copyTextListenClick() {
  document.addEventListener('click', async ({ target }) => {
    if (
      !(target instanceof HTMLElement) ||
      !target.classList.contains('copyclip')
    )
      return
    const text = target.textContent.trim()
    await navigator.clipboard.writeText(text)
    const tooltip = document.getElementById('powerTip')
    if (!tooltip) return
    tooltip.textContent = copyTextMsgCopied
    setTimeout(() => (tooltip.textContent = copyTextMsg), 1000)
  })
}
