/**
 * Cleans pasted HTML (Google Docs, Notion, Word, web pages) before ProseMirror parses it against the schema.
 * The schema already drops unknown nodes and marks; this handles what the schema can't see: formatting hidden in
 * inline styles, H1s (the title is the page's one H1), images that can't be uploaded this way, and Office noise.
 */

const BOLD = /^(bold|bolder|[6-9]00)$/
const HEADING_MAP: Record<string, string> = { H1: "h2", H5: "h4", H6: "h4" }

function wrap(el: Element, tag: string) {
  const doc = el.ownerDocument
  const wrapper = doc.createElement(tag)
  while (el.firstChild) wrapper.appendChild(el.firstChild)
  el.appendChild(wrapper)
}

function unwrap(el: Element) {
  const parent = el.parentNode
  if (!parent) return
  while (el.firstChild) parent.insertBefore(el.firstChild, el)
  parent.removeChild(el)
}

function rename(el: Element, tag: string) {
  const doc = el.ownerDocument
  const next = doc.createElement(tag)
  while (el.firstChild) next.appendChild(el.firstChild)
  el.replaceWith(next)
}

export interface CleanedPaste {
  html: string
  droppedImages: number
}

export function cleanPastedHtml(html: string): CleanedPaste {
  // The editor's own copy keeps its markup (ProseMirror marks its clipboard HTML).
  if (html.includes("data-pm-slice")) return { html, droppedImages: 0 }
  if (typeof DOMParser === "undefined") return { html, droppedImages: 0 }

  const doc = new DOMParser().parseFromString(html, "text/html")
  const body = doc.body
  let droppedImages = 0

  body.querySelectorAll("script, style, meta, link, title, colgroup, o\\:p, xml").forEach((el) => el.remove())

  // Inline formatting that lives in `style` becomes real marks, then the span goes.
  body.querySelectorAll<HTMLElement>("span, b, i, em, strong, u, font").forEach((el) => {
    const { fontWeight, fontStyle, textDecorationLine, textDecoration } = el.style
    const deco = `${textDecorationLine} ${textDecoration}`
    const tag = el.tagName
    if (tag === "B" && (fontWeight === "normal" || fontWeight === "400")) return unwrap(el) // Google Docs wrapper
    if (tag === "SPAN" || tag === "FONT") {
      if (BOLD.test(fontWeight)) wrap(el, "strong")
      if (fontStyle === "italic") wrap(el, "em")
      if (deco.includes("underline")) wrap(el, "u")
      if (deco.includes("line-through")) wrap(el, "s")
      unwrap(el)
    }
  })

  body.querySelectorAll("h1, h5, h6").forEach((el) => rename(el, HEADING_MAP[el.tagName]))

  body.querySelectorAll("img").forEach((img) => {
    if (img.closest('figure[data-type="image"]')) return
    droppedImages += 1
    const holder = img.closest("figure") ?? img
    holder.remove()
  })

  body.querySelectorAll("details, summary").forEach((el) => unwrap(el))

  body.querySelectorAll("*").forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase()
      const keep = name === "href" || name === "src" || name === "alt" || name === "colspan" || name === "rowspan" || name === "align" || name === "title"
      const ours = name.startsWith("data-") && Boolean(el.closest("[data-type]"))
      if (!keep && !ours) el.removeAttribute(attr.name)
    }
  })

  // Empty paragraphs from Office and `<br>` runs at the edges of a paragraph.
  body.querySelectorAll("p").forEach((p) => {
    if (!p.textContent?.trim() && !p.querySelector("img, br")) p.remove()
  })

  return { html: body.innerHTML, droppedImages }
}
