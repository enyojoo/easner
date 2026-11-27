/**
 * Answers can wrap a word in a link: "the [web](https://app.easner.com)". The page shows the word as a link.
 * Schema and plain-text surfaces use the word alone, so what a crawler quotes matches the page.
 */
const MARKDOWN_LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g

/** "the [web](https://app.easner.com)" becomes "the web". */
export function plainAnswer(text: string): string {
  return text.replace(MARKDOWN_LINK, "$1")
}

/** Keeps the links for Markdown output (llms.txt), turning site paths into full URLs. */
export function markdownAnswer(text: string, site: string): string {
  return text.replace(/\]\((\/[^)\s]*)\)/g, (_match, path: string) => `](${site}${path})`)
}

export { MARKDOWN_LINK }
