"use client"

/**
 * Every node and mark in `@easner/blog-content`, registered under exactly those names and attrs. Nothing else is in
 * the schema, so nothing else can be pasted, typed or stored.
 */
import { Extension, Node, mergeAttributes, ReactNodeViewRenderer } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Table from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Placeholder from "@tiptap/extension-placeholder"
import Typography from "@tiptap/extension-typography"
import Heading from "@tiptap/extension-heading"
import Blockquote from "@tiptap/extension-blockquote"
import ListItem from "@tiptap/extension-list-item"
import { textInputRule } from "@tiptap/core"
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state"
import type { Node as PMNode } from "@tiptap/pm/model"
import { detectEmbed } from "@/lib/blog/embed"
import { cleanPastedHtml } from "@/components/editor/paste-clean"
import {
  CalloutView,
  CtaView,
  DefinitionView,
  EmbedView,
  FaqItemView,
  FaqView,
  ImageView,
  KeyTakeawaysView,
  ProductCardView,
  SourceItemView,
  SourcesView,
  StepView,
  StepsView,
  SummaryView,
  ButtonBlockView,
} from "@/components/editor/node-views"

/** Blocks allowed inside containers (list items, callouts, FAQ answers, steps), as in the package's SIMPLE_BLOCKS. */
const SIMPLE = "(paragraph|bulletList|orderedList|blockquote|codeBlock|image)"

/** A string attr stored in a data-* attribute so copy and paste inside the editor keeps it. */
const dataAttr = (name: string, fallback: unknown = null) => ({
  default: fallback,
  parseHTML: (el: HTMLElement) => el.getAttribute(`data-${name}`) ?? fallback,
  renderHTML: (attrs: Record<string, unknown>) => (attrs[name] == null ? {} : { [`data-${name}`]: String(attrs[name]) }),
})

type Block = { name: string; content?: string; attrs?: Record<string, unknown>; atom?: boolean; view?: Parameters<typeof ReactNodeViewRenderer>[0]; group?: string; defining?: boolean }

function block({ name, content, attrs, atom, view, group = "block", defining = true }: Block) {
  return Node.create({
    name,
    group,
    content,
    atom,
    defining,
    selectable: true,
    isolating: Boolean(atom),
    draggable: group === "block" && Boolean(atom),
    addAttributes() {
      return attrs ?? {}
    },
    parseHTML() {
      return [{ tag: `div[data-type="${name}"]` }]
    },
    renderHTML({ HTMLAttributes }) {
      return atom
        ? ["div", mergeAttributes({ "data-type": name }, HTMLAttributes)]
        : ["div", mergeAttributes({ "data-type": name }, HTMLAttributes), 0]
    },
    addNodeView: view ? () => ReactNodeViewRenderer(view) : undefined,
  })
}

const Summary = block({ name: "summary", content: "paragraph+", view: SummaryView })
const Callout = block({ name: "callout", content: `${SIMPLE}+`, attrs: { variant: dataAttr("variant", "info") }, view: CalloutView })
const KeyTakeaways = block({ name: "keyTakeaways", content: `${SIMPLE}+`, view: KeyTakeawaysView })
const FaqItem = block({ name: "faqItem", content: `${SIMPLE}+`, group: "", attrs: { question: dataAttr("question", "") }, view: FaqItemView })
const Faq = block({ name: "faq", content: "faqItem+", view: FaqView })
const Step = block({ name: "step", content: `${SIMPLE}+`, group: "", attrs: { name: dataAttr("name", "") }, view: StepView })
const Steps = block({ name: "steps", content: "step+", attrs: { name: dataAttr("name") }, view: StepsView })
const Definition = block({ name: "definition", content: "paragraph+", attrs: { term: dataAttr("term", "") }, view: DefinitionView })
const Cta = block({
  name: "cta",
  atom: true,
  view: CtaView,
  attrs: {
    variant: dataAttr("variant", "open-account"),
    heading: dataAttr("heading"),
    body: dataAttr("body"),
    label: dataAttr("label"),
    href: dataAttr("href"),
  },
})
const ProductCard = block({ name: "productCard", atom: true, view: ProductCardView, attrs: { product: dataAttr("product", "business") } })
const Embed = block({
  name: "embed",
  atom: true,
  view: EmbedView,
  attrs: { provider: dataAttr("provider", "other"), url: dataAttr("url", ""), title: dataAttr("title") },
})
const SourceItem = block({
  name: "sourceItem",
  atom: true,
  group: "",
  view: SourceItemView,
  attrs: { title: dataAttr("title", ""), url: dataAttr("url", ""), publisher: dataAttr("publisher") },
})
const Sources = block({ name: "sources", content: "sourceItem+", view: SourcesView })
const ButtonBlock = block({
  name: "button",
  atom: true,
  view: ButtonBlockView,
  attrs: { label: dataAttr("label", "Open an account"), href: dataAttr("href", "/business") },
})

/** Images: a block atom. Only our own markup parses back in, so images pasted from other sites never sneak in. */
const ImageBlock = Node.create({
  name: "image",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,
  addAttributes() {
    return {
      mediaId: dataAttr("media-id"),
      src: { default: "", parseHTML: (el: HTMLElement) => el.querySelector("img")?.getAttribute("src") ?? "", renderHTML: () => ({}) },
      alt: { default: "", parseHTML: (el: HTMLElement) => el.querySelector("img")?.getAttribute("alt") ?? "", renderHTML: () => ({}) },
      caption: dataAttr("caption"),
      width: dataAttr("width", "column"),
      widthPx: { default: null, parseHTML: (el: HTMLElement) => Number(el.getAttribute("data-width-px")) || null, renderHTML: (a: Record<string, unknown>) => (a.widthPx ? { "data-width-px": String(a.widthPx) } : {}) },
      heightPx: { default: null, parseHTML: (el: HTMLElement) => Number(el.getAttribute("data-height-px")) || null, renderHTML: (a: Record<string, unknown>) => (a.heightPx ? { "data-height-px": String(a.heightPx) } : {}) },
    }
  },
  parseHTML() {
    return [{ tag: 'figure[data-type="image"]' }]
  },
  renderHTML({ node, HTMLAttributes }) {
    return ["figure", mergeAttributes({ "data-type": "image" }, HTMLAttributes), ["img", { src: node.attrs.src, alt: node.attrs.alt }]]
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageView)
  },
})

const EasnerHeading = Heading.configure({ levels: [2, 3, 4] })

const EasnerBlockquote = Blockquote.extend({
  content: "paragraph+",
  addAttributes() {
    return { attribution: dataAttr("attribution") }
  },
})

const EasnerListItem = ListItem.extend({ content: `paragraph ${SIMPLE}*` })

const EasnerTaskItem = TaskItem.configure({ nested: false })

const EasnerTableCell = TableCell.extend({
  content: "paragraph+",
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "left",
        parseHTML: (el: HTMLElement) => el.style.textAlign || el.getAttribute("align") || "left",
        renderHTML: (attrs: Record<string, unknown>) => (attrs.align && attrs.align !== "left" ? { style: `text-align:${attrs.align}` } : {}),
      },
    }
  },
})
const EasnerTableHeader = TableHeader.extend({ content: "paragraph+" })

/** Only href, title and sponsored are stored. Every outbound link gets rel="noopener". */
const EasnerLink = Link.extend({
  addAttributes() {
    return {
      href: { default: null },
      title: { default: null },
      sponsored: {
        default: false,
        parseHTML: (el: HTMLElement) => (el.getAttribute("rel") ?? "").includes("sponsored"),
        renderHTML: (attrs: Record<string, unknown>) => ({ rel: attrs.sponsored ? "sponsored noopener" : "noopener" }),
      },
    }
  },
}).configure({ openOnClick: false, autolink: true, linkOnPaste: true, protocols: ["mailto"] })

// ---------------------------------------------------------------------------------------------------------------
// Behaviours
// ---------------------------------------------------------------------------------------------------------------

/** `--` becomes an en dash (the brand uses en dashes, never em dashes). */
const EnDash = Extension.create({
  name: "enDash",
  addInputRules() {
    return [textInputRule({ find: /--$/, replace: "–" })]
  },
})

/** The doc always ends in a paragraph, so there is somewhere to click and type after an image or a table. */
const TrailingParagraph = Extension.create({
  name: "trailingParagraph",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("trailingParagraph"),
        appendTransaction: (_transactions, _old, state) => {
          const last = state.doc.lastChild
          if (!last || last.type.name === "paragraph") return null
          const paragraph = state.schema.nodes.paragraph?.create()
          return paragraph ? state.tr.insert(state.doc.content.size, paragraph) : null
        },
      }),
    ]
  },
})

/** ⌥↑ and ⌥↓ move the top-level block around the cursor. */
const MoveBlock = Extension.create({
  name: "moveBlock",
  addKeyboardShortcuts() {
    const move = (direction: -1 | 1) => () => {
      const { state, view } = this.editor
      const { $from } = state.selection
      const index = $from.index(0)
      const target = index + direction
      if (target < 0 || target >= state.doc.childCount) return true
      const blocks: PMNode[] = []
      state.doc.forEach((child) => blocks.push(child))
      const [moved] = blocks.splice(index, 1)
      blocks.splice(target, 0, moved)
      let offset = 0
      for (let i = 0; i < target; i += 1) offset += blocks[i].nodeSize
      const tr = state.tr.replaceWith(0, state.doc.content.size, blocks)
      const caret = Math.min(offset + 1, tr.doc.content.size)
      try {
        tr.setSelection(TextSelection.near(tr.doc.resolve(caret)))
      } catch {
        // Selection stays where it lands.
      }
      view.dispatch(tr.scrollIntoView())
      return true
    }
    return { "Alt-ArrowUp": move(-1), "Alt-ArrowDown": move(1) }
  },
})

export interface BehaviourOptions {
  /** Image files pasted or dropped. `pos` is where they were dropped, or null for a paste. */
  onImageFiles: (files: File[], pos: number | null) => void
  /** Pasted HTML lost images that can't be uploaded this way. */
  onDroppedImages: (count: number) => void
}

/** Paste cleanup, URL-on-its-own-line embeds, and image paste and drop. */
const Behaviours = Extension.create<BehaviourOptions>({
  name: "behaviours",
  addOptions() {
    return { onImageFiles: () => {}, onDroppedImages: () => {} }
  },
  addProseMirrorPlugins() {
    const options = this.options
    const editor = this.editor
    const imageFiles = (list: FileList | null | undefined) =>
      Array.from(list ?? []).filter((file) => file.type.startsWith("image/"))
    return [
      new Plugin({
        key: new PluginKey("behaviours"),
        props: {
          transformPastedHTML(html) {
            const cleaned = cleanPastedHtml(html)
            if (cleaned.droppedImages) queueMicrotask(() => options.onDroppedImages(cleaned.droppedImages))
            return cleaned.html
          },
          handlePaste(view, event) {
            const files = imageFiles(event.clipboardData?.files)
            if (files.length) {
              options.onImageFiles(files, null)
              return true
            }
            const text = event.clipboardData?.getData("text/plain")?.trim() ?? ""
            const embed = text ? detectEmbed(text) : null
            const { $from, empty } = view.state.selection
            if (embed && empty && $from.parent.type.name === "paragraph" && $from.parent.content.size === 0 && $from.depth === 1) {
              editor.chain().focus().insertContent({ type: "embed", attrs: { provider: embed.provider, url: embed.url } }).run()
              return true
            }
            return false
          },
          handleDrop(view, event) {
            const files = imageFiles((event as DragEvent).dataTransfer?.files)
            if (!files.length) return false
            const coords = view.posAtCoords({ left: event.clientX, top: event.clientY })
            options.onImageFiles(files, coords?.pos ?? null)
            return true
          },
        },
      }),
    ]
  },
})

export interface EditorExtensionOptions extends BehaviourOptions {
  placeholder?: string
}

/** The full extension list. The slash menu is added by the editor (it needs React state). */
export function buildExtensions(options: EditorExtensionOptions) {
  return [
    StarterKit.configure({ heading: false, blockquote: false, listItem: false }),
    EasnerHeading,
    EasnerBlockquote,
    EasnerListItem,
    Underline,
    EasnerLink,
    Table.configure({ resizable: false }),
    TableRow,
    EasnerTableHeader,
    EasnerTableCell,
    TaskList,
    EasnerTaskItem,
    ImageBlock,
    Summary,
    Callout,
    KeyTakeaways,
    FaqItem,
    Faq,
    Step,
    Steps,
    Definition,
    Cta,
    ProductCard,
    Embed,
    SourceItem,
    Sources,
    ButtonBlock,
    Typography.configure({ emDash: false, copyright: false, trademark: false, registeredTrademark: false, servicemark: false }),
    EnDash,
    TrailingParagraph,
    MoveBlock,
    Placeholder.configure({
      placeholder: ({ node }) => (node.type.name === "heading" ? "Heading" : (options.placeholder ?? "Type / to add a block")),
      showOnlyCurrent: true,
      includeChildren: false,
    }),
    Behaviours.configure({ onImageFiles: options.onImageFiles, onDroppedImages: options.onDroppedImages }),
  ]
}
