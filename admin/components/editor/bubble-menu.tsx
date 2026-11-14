"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { BubbleMenu, type Editor } from "@tiptap/react"
import { NodeSelection } from "@tiptap/pm/state"
import { Bold, Check, Heading2, Heading3, Italic, Link2, MessageSquare, Quote, Strikethrough, Underline, Unlink } from "lucide-react"
import { cn } from "@/lib/utils"

export interface LinkTarget {
  label: string
  href: string
  kind: "page" | "post"
}

function ToolButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground",
        active && "bg-muted text-foreground",
      )}
    >
      {children}
    </button>
  )
}

/** The link picker: type an address, or search our pages and posts. */
function LinkField({ editor, targets, onDone }: { editor: Editor; targets: LinkTarget[]; onDone: () => void }) {
  const current = (editor.getAttributes("link").href as string | undefined) ?? ""
  const [value, setValue] = useState(current)
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase()
    if (!q || /^https?:\/\//.test(q) || q.startsWith("mailto:")) return []
    return targets
      .filter((target) => target.label.toLowerCase().includes(q) || target.href.toLowerCase().includes(q.replace(/^\//, "/")))
      .slice(0, 6)
  }, [targets, value])

  const apply = (href: string) => {
    const clean = href.trim()
    if (!clean) editor.chain().focus().unsetLink().run()
    else editor.chain().focus().extendMarkRange("link").setLink({ href: clean }).run()
    onDone()
  }

  return (
    <div className="w-80 p-2">
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type="text"
          aria-label="Link address"
          value={value}
          placeholder="Search pages and posts, or paste a link"
          onChange={(event) => {
            setValue(event.target.value)
            setActive(0)
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault()
              onDone()
              editor.commands.focus()
            } else if (event.key === "ArrowDown" && matches.length) {
              event.preventDefault()
              setActive((index) => (index + 1) % matches.length)
            } else if (event.key === "ArrowUp" && matches.length) {
              event.preventDefault()
              setActive((index) => (index - 1 + matches.length) % matches.length)
            } else if (event.key === "Enter") {
              event.preventDefault()
              apply(matches[active]?.href ?? value)
            }
          }}
          className="h-8 min-w-0 flex-1 rounded-md border border-input bg-card px-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <ToolButton label="Apply link" onClick={() => apply(matches[active]?.href ?? value)}>
          <Check className="size-4" aria-hidden />
        </ToolButton>
        {current ? (
          <ToolButton label="Remove link" onClick={() => apply("")}>
            <Unlink className="size-4" aria-hidden />
          </ToolButton>
        ) : null}
      </div>
      {matches.length ? (
        <ul role="listbox" aria-label="Pages and posts" className="mt-1">
          {matches.map((match, index) => (
            <li key={match.href}>
              <button
                type="button"
                role="option"
                aria-selected={index === active}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => apply(match.href)}
                className={cn("flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left text-sm", index === active && "bg-muted")}
              >
                <span className="truncate text-foreground">{match.label}</span>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">{match.kind === "post" ? "Post" : match.href}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export function EditorBubbleMenu({
  editor,
  linkTargets,
  onComment,
  linkRequest,
}: {
  editor: Editor
  linkTargets: LinkTarget[]
  onComment?: (quote: string) => void
  /** Bumped by ⌘K to open the link field. */
  linkRequest: number
}) {
  const [linking, setLinking] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- ⌘K from the editor asks the menu to open its link field.
    if (linkRequest > 0) setLinking(true)
  }, [linkRequest])

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100, placement: "top", maxWidth: "none", onHidden: () => setLinking(false) }}
      shouldShow={({ editor: e, state }) => {
        if (!e.isEditable) return false
        const { selection } = state
        if (selection.empty && !linking) return false
        if (selection instanceof NodeSelection) return false
        if (e.isActive("codeBlock") || e.isActive("image")) return false
        // Only text selections: node selections (blocks) have their own controls.
        return "$anchorCell" in selection ? false : selection.from !== selection.to || linking
      }}
    >
      <div className="rounded-lg border border-border bg-popover shadow-lift">
        {linking ? (
          <LinkField editor={editor} targets={linkTargets} onDone={() => setLinking(false)} />
        ) : (
          <div className="flex items-center gap-0.5 p-1" role="toolbar" aria-label="Format selection">
            <ToolButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
              <Bold className="size-4" aria-hidden />
            </ToolButton>
            <ToolButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
              <Italic className="size-4" aria-hidden />
            </ToolButton>
            <ToolButton label="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
              <Underline className="size-4" aria-hidden />
            </ToolButton>
            <ToolButton label="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
              <Strikethrough className="size-4" aria-hidden />
            </ToolButton>
            <span className="mx-1 h-5 w-px bg-border" aria-hidden />
            <ToolButton label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
              <Heading2 className="size-4" aria-hidden />
            </ToolButton>
            <ToolButton label="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
              <Heading3 className="size-4" aria-hidden />
            </ToolButton>
            <ToolButton label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
              <Quote className="size-4" aria-hidden />
            </ToolButton>
            <span className="mx-1 h-5 w-px bg-border" aria-hidden />
            <ToolButton label="Link (⌘K)" active={editor.isActive("link")} onClick={() => setLinking(true)}>
              <Link2 className="size-4" aria-hidden />
            </ToolButton>
            {onComment ? (
              <ToolButton
                label="Comment"
                onClick={() => {
                  const { from, to } = editor.state.selection
                  onComment(editor.state.doc.textBetween(from, to, " "))
                }}
              >
                <MessageSquare className="size-4" aria-hidden />
              </ToolButton>
            ) : null}
          </div>
        )}
      </div>
    </BubbleMenu>
  )
}
