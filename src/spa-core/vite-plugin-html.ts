/**
 * Vite plugin for HTML transformations in SPA build
 * Optimizes HTML output by replacing patterns in the generated index.html
 */

/**
 * Creates a Vite plugin that replaces specified patterns in the HTML output
 * @param replacements - Array of [search, replace] tuples
 * @returns Vite plugin configuration
 */
export function htmlReplace(replacements: [string, string][]) {
  return {
    name: 'htmlReplace',
    transformIndexHtml: {
      handler: (html: string) => {
        for (const replacement of replacements) {
          html = html.replaceAll(replacement[0], replacement[1])
        }
        return html
      },
    },
  }
}

/**
 * Pre-configured HTML transformations for SPA optimization:
 * - Removes crossorigin attribute (not needed for same-origin resources)
 * - Replaces type="module" with defer (better browser compatibility)
 */
export function spaHtmlOptimizations() {
  return htmlReplace([
    [' crossorigin ', ' '],
    [` type="module" src="./`, ` defer src="./`],
  ])
}
