"use client"

import { useEffect, useRef, useState, type RefObject } from "react"
import type { Editor } from "@tiptap/react"
import { NodeSelection } from "@tiptap/pm/state"
import { GripVertical, Plus } from "lucide-react"
import { TRIGGER_INVISIBLE } from "@/components/editor/slash-menu"

/**
 * The block handle: appears beside the block under the pointer. The grip drags the block (native drag, ProseMirror
 * moves it); the plus adds an empty line below and opens the slash menu.
 */
export function BlockHandle({ editor, containerRef }: { editor: Editor; containerRef: RefObject<HTMLDivElement | null> }) {
  const [target, setTarget] = useState<{ top: number; pos: number } | null>(null)
  const overHandle = useRef(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // The handle sits outside the canvas box, so the pointer leaves the canvas on its way to it. Hiding waits a beat
  // and is cancelled when the pointer arrives.
  const cancelHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = null
  }
  const scheduleHide = () => {
    cancelHide()
    hideTimer.current = setTimeout(() => {
      if (!overHandle.current) setTarget(null)
    }, 400)
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const onMove = (event: MouseEvent) => {
      cancelHide()
      if (overHandle.current || !editor.isEditable) return
      const dom = editor.view.dom as HTMLElement
      const rect = dom.getBoundingClientRect()
      const x = Math.min(Math.max(event.clientX, rect.left + 24), rect.right - 24)
      const hit = editor.view.posAtCoords({ left: x, top: event.clientY })
      if (!hit) return setTarget(null)
      const $pos = editor.state.doc.resolve(hit.pos)
      if ($pos.depth < 1) return setTarget(null)
      const start = $pos.before(1)
      const el = editor.view.nodeDOM(start) as HTMLElement | null
      if (!el || !("getBoundingClientRect" in el)) return setTarget(null)
      const box = el.getBoundingClientRect()
      const holder = container.getBoundingClientRect()
      setTarget((current) => (current && current.pos === start ? current : { top: box.top - holder.top, pos: start }))
    }
    const onLeave = () => {
      if (!overHandle.current) scheduleHide()
    }
    container.addEventListener("mousemove", onMove)
    container.addEventListener("mouseleave", onLeave)
    return () => {
      container.removeEventListener("mousemove", onMove)
      container.removeEventListener("mouseleave", onLeave)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, containerRef])

  if (!target || !editor.isEditable) return null

  const addBelow = () => {
    const node = editor.state.doc.nodeAt(target.pos)
    if (!node) return
    const storage = (editor.storage as unknown as { slashCommand?: { fromPlus: boolean; createdLine: boolean } }).slashCommand
    // An empty line is used as it is; anything else gets a new line below. Either way the menu opens at once.
    const empty = node.type.name === "paragraph" && node.content.size === 0
    if (storage) {
      // eslint-disable-next-line react-hooks/immutability -- extension storage is the editor's own mutable state
      storage.fromPlus = true
      storage.createdLine = !empty
    }
    if (empty) {
      editor.chain().focus().setTextSelection(target.pos + 1).insertContent(TRIGGER_INVISIBLE).run()
      return
    }
    const at = target.pos + node.nodeSize
    editor
      .chain()
      .focus()
      .insertContentAt(at, { type: "paragraph" })
      .setTextSelection(at + 1)
      .insertContent(TRIGGER_INVISIBLE)
      .run()
  }

  const onDragStart = (event: React.DragEvent<HTMLButtonElement>) => {
    const { view } = editor
    const node = view.state.doc.nodeAt(target.pos)
    if (!node || !event.dataTransfer) return
    view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, target.pos)))
    const slice = view.state.selection.content()
    const { dom, text } = view.serializeForClipboard(slice)
    event.dataTransfer.clearData()
    event.dataTransfer.setData("text/html", dom.innerHTML)
    event.dataTransfer.setData("text/plain", text)
    event.dataTransfer.effectAllowed = "copyMove"
    const blockDom = view.nodeDOM(target.pos)
    if (blockDom instanceof HTMLElement) event.dataTransfer.setDragImage(blockDom, 0, 0)
    // ProseMirror's own drag hook: this is how a native drag from outside the editor view becomes a move.
    // eslint-disable-next-line react-hooks/immutability
    view.dragging = { slice, move: true }
  }

  return (
    <div
      className="absolute -left-[60px] z-10 flex items-center gap-0.5"
      style={{ top: target.top }}
      onMouseEnter={() => {
        overHandle.current = true
        cancelHide()
      }}
      onMouseLeave={() => {
        overHandle.current = false
        scheduleHide()
      }}
    >
      <button
        type="button"
        aria-label="Add a block below"
        title="Add a block below"
        onMouseDown={(event) => event.preventDefault()}
        onClick={addBelow}
        className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Plus className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        draggable
        aria-label="Drag to move this block"
        title="Drag to move (⌥↑ ⌥↓ moves with the keyboard)"
        onDragStart={onDragStart}
        className="flex size-6 cursor-grab items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="size-4" aria-hidden />
      </button>
    </div>
  )
}
