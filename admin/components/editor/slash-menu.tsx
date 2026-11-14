"use client"

import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { Extension, ReactRenderer, type Editor, type Range } from "@tiptap/react"
import { Plugin } from "@tiptap/pm/state"
import Suggestion, { findSuggestionMatch,  type SuggestionKeyDownProps, type SuggestionProps } from "@tiptap/suggestion"
import {
  AlertTriangle,
  BookOpen,
  Code2,
  Film,
  Heading2,
  Heading3,
  Heading4,
  HelpCircle,
  Image as ImageIcon,
  Lightbulb,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  ListTodo,
  Minus,
  MousePointerClick,
  Package,
  Quote,
  Sparkles,
  Table2,
  TextQuote,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface SlashItem {
  id: string
  title: string
  description: string
  group: "Easner blocks" | "Basic"
  keywords: string[]
  icon: LucideIcon
  run: (editor: Editor, range: Range, ctx: SlashContext) => void
}

export interface SlashContext {
  onPickImage: () => void
  hasSummary: () => boolean
}

const p = () => ({ type: "paragraph" })

function insert(editor: Editor, range: Range, content: Record<string, unknown>) {
  editor.chain().focus().deleteRange(range).insertContent(content).run()
}

export const SLASH_ITEMS: SlashItem[] = [
  {
    id: "summary",
    title: "Summary",
    description: "The direct answer, first thing in the post",
    group: "Easner blocks",
    keywords: ["answer", "tldr", "aeo"],
    icon: Sparkles,
    run: (editor, range) => {
      editor.chain().focus().deleteRange(range).insertContentAt(0, { type: "summary", content: [p()] }).run()
      editor.commands.focus(2)
    },
  },
  {
    id: "cta",
    title: "Call to action",
    description: "Open an account, download the app or book a call",
    group: "Easner blocks",
    keywords: ["cta", "signup", "button"],
    icon: MousePointerClick,
    run: (editor, range) => insert(editor, range, { type: "cta", attrs: { variant: "open-account" } }),
  },
  {
    id: "faq",
    title: "FAQ",
    description: "Questions and answers, with FAQPage markup",
    group: "Easner blocks",
    keywords: ["questions", "answers", "schema"],
    icon: HelpCircle,
    run: (editor, range) =>
      insert(editor, range, { type: "faq", content: [{ type: "faqItem", attrs: { question: "" }, content: [p()] }] }),
  },
  {
    id: "steps",
    title: "Steps",
    description: "Numbered how-to steps, with HowTo markup",
    group: "Easner blocks",
    keywords: ["howto", "guide", "numbered"],
    icon: ListChecks,
    run: (editor, range) =>
      insert(editor, range, { type: "steps", content: [{ type: "step", attrs: { name: "" }, content: [p()] }] }),
  },
  {
    id: "definition",
    title: "Definition",
    description: "A defined term, with DefinedTerm markup",
    group: "Easner blocks",
    keywords: ["term", "glossary"],
    icon: BookOpen,
    run: (editor, range) => insert(editor, range, { type: "definition", attrs: { term: "" }, content: [p()] }),
  },
  {
    id: "keyTakeaways",
    title: "Key takeaways",
    description: "The points to remember, in a box",
    group: "Easner blocks",
    keywords: ["summary", "points", "box"],
    icon: Lightbulb,
    run: (editor, range) =>
      insert(editor, range, {
        type: "keyTakeaways",
        content: [{ type: "bulletList", content: [{ type: "listItem", content: [p()] }] }],
      }),
  },
  {
    id: "productCard",
    title: "Product card",
    description: "Links to the Easner product page this post is about",
    group: "Easner blocks",
    keywords: ["product", "page", "link"],
    icon: Package,
    run: (editor, range) => insert(editor, range, { type: "productCard", attrs: { product: "business" } }),
  },
  {
    id: "sources",
    title: "Sources",
    description: "Where the facts in this post come from",
    group: "Easner blocks",
    keywords: ["citations", "references"],
    icon: Link2,
    run: (editor, range) =>
      insert(editor, range, { type: "sources", content: [{ type: "sourceItem", attrs: { title: "", url: "" } }] }),
  },
  {
    id: "button",
    title: "Button",
    description: "A single link button",
    group: "Easner blocks",
    keywords: ["link", "cta"],
    icon: MousePointerClick,
    run: (editor, range) => insert(editor, range, { type: "button", attrs: { label: "Open an account", href: "/business" } }),
  },
  {
    id: "h2",
    title: "Heading 2",
    description: "A section heading",
    group: "Basic",
    keywords: ["title", "h2", "section"],
    icon: Heading2,
    run: (editor, range) => editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run(),
  },
  {
    id: "h3",
    title: "Heading 3",
    description: "A subsection heading",
    group: "Basic",
    keywords: ["h3", "subsection"],
    icon: Heading3,
    run: (editor, range) => editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run(),
  },
  {
    id: "h4",
    title: "Heading 4",
    description: "A small heading",
    group: "Basic",
    keywords: ["h4"],
    icon: Heading4,
    run: (editor, range) => editor.chain().focus().deleteRange(range).setNode("heading", { level: 4 }).run(),
  },
  {
    id: "bulletList",
    title: "Bulleted list",
    description: "A simple list",
    group: "Basic",
    keywords: ["ul", "bullets", "list"],
    icon: List,
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    id: "orderedList",
    title: "Numbered list",
    description: "A list in order",
    group: "Basic",
    keywords: ["ol", "numbers", "list"],
    icon: ListOrdered,
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    id: "taskList",
    title: "Checklist",
    description: "Items to tick off",
    group: "Basic",
    keywords: ["todo", "tasks", "checkbox"],
    icon: ListTodo,
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  {
    id: "blockquote",
    title: "Quote",
    description: "A pull quote or a cited passage",
    group: "Basic",
    keywords: ["blockquote", "citation"],
    icon: Quote,
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    id: "callout",
    title: "Callout",
    description: "Info, warning or success note",
    group: "Basic",
    keywords: ["note", "info", "warning", "tip"],
    icon: AlertTriangle,
    run: (editor, range) => insert(editor, range, { type: "callout", attrs: { variant: "info" }, content: [p()] }),
  },
  {
    id: "horizontalRule",
    title: "Divider",
    description: "A line between sections",
    group: "Basic",
    keywords: ["hr", "line", "separator"],
    icon: Minus,
    run: (editor, range) => editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
  {
    id: "image",
    title: "Image",
    description: "Upload a picture",
    group: "Basic",
    keywords: ["photo", "picture", "upload"],
    icon: ImageIcon,
    run: (editor, range, ctx) => {
      editor.chain().focus().deleteRange(range).run()
      ctx.onPickImage()
    },
  },
  {
    id: "table",
    title: "Table",
    description: "Rows and columns",
    group: "Basic",
    keywords: ["grid", "rows", "columns"],
    icon: Table2,
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    id: "codeBlock",
    title: "Code",
    description: "A block of code",
    group: "Basic",
    keywords: ["pre", "snippet"],
    icon: Code2,
    run: (editor, range) => editor.chain().focus().deleteRange(range).setCodeBlock().run(),
  },
  {
    id: "embed",
    title: "Embed",
    description: "A YouTube, Vimeo, Loom or X link",
    group: "Basic",
    keywords: ["video", "youtube", "loom", "tweet"],
    icon: Film,
    run: (editor, range) => insert(editor, range, { type: "embed", attrs: { provider: "other", url: "" } }),
  },
  {
    id: "paragraph",
    title: "Text",
    description: "Back to plain paragraph",
    group: "Basic",
    keywords: ["paragraph", "plain"],
    icon: TextQuote,
    run: (editor, range) => editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
]

export function filterSlashItems(query: string, hasSummary: boolean): SlashItem[] {
  const q = query.trim().toLowerCase()
  return SLASH_ITEMS.filter((item) => {
    if (item.id === "summary" && hasSummary) return false
    if (!q) return true
    return item.title.toLowerCase().includes(q) || item.keywords.some((word) => word.includes(q))
  })
}

interface ListHandle {
  onKeyDown: (event: KeyboardEvent) => boolean
}

const SlashList = forwardRef<ListHandle, SuggestionProps<SlashItem, SlashItem>>(function SlashList(props, ref) {
  const [selected, setSelected] = useState(0)
  const { items, command } = props

  useEffect(() => {
    setSelected(0)
  }, [items])

  useEffect(() => {
    document.querySelector(`[data-slash-item="${selected}"]`)?.scrollIntoView({ block: "nearest" })
  }, [selected])

  useImperativeHandle(ref, () => ({
    onKeyDown: (event) => {
      if (event.key === "ArrowDown") {
        setSelected((index) => (index + 1) % Math.max(items.length, 1))
        return true
      }
      if (event.key === "ArrowUp") {
        setSelected((index) => (index - 1 + items.length) % Math.max(items.length, 1))
        return true
      }
      if (event.key === "Enter" || event.key === "Tab") {
        const item = items[selected]
        if (item) command(item)
        return true
      }
      return false
    },
  }))

  if (!items.length) {
    return (
      <div role="listbox" className="w-72 rounded-lg border border-border bg-popover p-3 text-sm text-muted-foreground shadow-lift">
        No blocks match “{props.query}”.
      </div>
    )
  }

  let lastGroup = ""
  return (
    <div
      role="listbox"
      aria-label="Blocks"
      className="max-h-80 w-72 overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-lift"
    >
      {items.map((item, index) => {
        const heading = item.group !== lastGroup ? item.group : null
        lastGroup = item.group
        const Icon = item.icon
        return (
          <div key={item.id}>
            {heading ? (
              <p className="px-2 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{heading}</p>
            ) : null}
            <button
              type="button"
              role="option"
              aria-selected={index === selected}
              data-slash-item={index}
              onMouseEnter={() => setSelected(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => command(item)}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left",
                index === selected ? "bg-muted" : "hover:bg-muted/60",
              )}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground">
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{item.title}</span>
                <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
              </span>
            </button>
          </div>
        )
      })}
    </div>
  )
})

/**
 * What the plus button types to open the menu: a zero-width space, so the line stays visually empty. Typing "/" opens
 * the same menu. Both are stripped before a document is stored (lib/blog/normalize.ts).
 */
export const TRIGGER_INVISIBLE = "\u200b"

/** Remove the typed "/query" and, when the plus button made this line only to host it, the empty line too. */
function discardSlash(editor: Editor, range: Range, dropLine: boolean) {
  const $from = editor.state.doc.resolve(range.from)
  const onlySlash = $from.parent.textContent === editor.state.doc.textBetween(range.from, range.to)
  // One deletion, so positions stay valid: the whole line, or just the typed text.
  const target = dropLine && onlySlash && $from.depth === 1 ? { from: $from.before(), to: $from.after() } : range
  editor.chain().deleteRange(target).run()
}

export const SlashCommand = Extension.create<SlashContext, { fromPlus: boolean; createdLine: boolean; escapedAt: number }>({
  name: "slashCommand",
  addOptions() {
    return { onPickImage: () => {}, hasSummary: () => false }
  },
  addStorage() {
    // Set by the block handle's plus button: that line exists only to hold the menu.
    return { fromPlus: false, createdLine: false, escapedAt: 0 }
  },
  addProseMirrorPlugins() {
    const ctx = this.options
    const storage = this.storage
    let picked = false
    return [
      // Runs before the suggestion plugin, which closes the menu on Escape by itself: remember that it was Escape.
      new Plugin({
        props: {
          handleDOMEvents: {
            // Clicking out of the editor while the plus button's menu is open: drop the lone "/" line it made.
            // (Menu items keep focus in the editor, so choosing a block never lands here.)
            blur: (view) => {
              if (!storage.fromPlus) return false
              const { $from } = view.state.selection
              if ($from.depth === 1 && new RegExp(`^[/${TRIGGER_INVISIBLE}]\\S*$`).test($from.parent.textContent)) {
                const created = storage.createdLine
                storage.fromPlus = false
                storage.createdLine = false
                view.dispatch(
                  created
                    ? view.state.tr.delete($from.before(), $from.after())
                    : view.state.tr.delete($from.start(), $from.end()),
                )
              }
              return false
            },
          },
          handleKeyDown: (_view, event) => {
            if (event.key === "Escape") storage.escapedAt = Date.now()
            return false
          },
        },
      }),
      Suggestion<SlashItem, SlashItem>({
        editor: this.editor,
        char: "/",
        findSuggestionMatch: (config) => findSuggestionMatch(config) ?? findSuggestionMatch({ ...config, char: TRIGGER_INVISIBLE }),
        startOfLine: false,
        allowSpaces: false,
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from)
          return $from.depth === 1 && $from.parent.type.name === "paragraph" && $from.parentOffset === 0
        },
        items: ({ query }) => filterSlashItems(query, ctx.hasSummary()),
        command: ({ editor, range, props }) => {
          picked = true
          storage.fromPlus = false
          storage.createdLine = false
          props.run(editor, range, ctx)
        },
        render: () => {
          let component: ReactRenderer<ListHandle, SuggestionProps<SlashItem, SlashItem>> | null = null
          const place = (props: SuggestionProps<SlashItem, SlashItem>) => {
            const rect = props.clientRect?.()
            const el = component?.element as HTMLElement | undefined
            if (!rect || !el) return
            const height = el.offsetHeight || 320
            const below = rect.bottom + 6
            const top = below + height > window.innerHeight ? Math.max(8, rect.top - height - 6) : below
            el.style.left = `${Math.min(rect.left, window.innerWidth - 296)}px`
            el.style.top = `${top}px`
          }
          return {
            onStart: (props) => {
              component = new ReactRenderer(SlashList, { props, editor: props.editor })
              const el = component.element as HTMLElement
              el.style.position = "fixed"
              el.style.zIndex = "60"
              document.body.appendChild(el)
              place(props)
              requestAnimationFrame(() => place(props))
            },
            onUpdate: (props) => {
              component?.updateProps(props)
              place(props)
              requestAnimationFrame(() => place(props))
            },
            onKeyDown: (props: SuggestionKeyDownProps) => {
              if (props.event.key === "Escape") {
                component?.destroy()
                component = null
                // Escape means "never mind": the "/" goes with it, as it was only there to open the menu.
                picked = true
                const dropLine = storage.fromPlus && storage.createdLine
                storage.fromPlus = false
                storage.createdLine = false
                discardSlash(this.editor, props.range, dropLine)
                return true
              }
              return component?.ref?.onKeyDown(props.event) ?? false
            },
            onExit: (props) => {
              component?.destroy()
              component = null
              const escaped = Date.now() - storage.escapedAt < 200
              const text = props.editor.state.doc.textBetween(props.range.from, Math.min(props.range.to, props.editor.state.doc.content.size))
              // Escape means "never mind": the "/" goes with it, as it was only there to open the menu.
              if (!picked && escaped && (text.startsWith("/") || text.startsWith(TRIGGER_INVISIBLE))) {
                discardSlash(props.editor, props.range, storage.fromPlus && storage.createdLine)
              }
              // Clicked away from a menu the plus button opened: don't leave a lone "/" on its own line.
              else if (!picked && storage.fromPlus && new RegExp(`^[/${TRIGGER_INVISIBLE}]\\S*$`).test(props.editor.state.doc.textBetween(props.range.from, Math.min(props.range.to, props.editor.state.doc.content.size)))) {
                discardSlash(props.editor, props.range, storage.createdLine)
              }
              storage.fromPlus = false
              storage.createdLine = false
              picked = false
            },
          }
        },
      }),
    ]
  },
})
