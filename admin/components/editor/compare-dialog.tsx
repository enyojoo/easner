"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Columns2, Loader2, RotateCcw, Rows3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EditorSelect } from "@/components/editor/editor-select"
import type { EditorAdapter, RevisionDetail, RevisionRow } from "@/components/editor/types"
import { diffDocs, diffStats, wordDiff, type BlockSummary, type DiffRow, type WordPart } from "@/lib/blog/diff"
import { KIND_LABEL, whenLabel } from "@/lib/blog/revision-format"
import { cn } from "@/lib/utils"

const CURRENT = "current"

type Side = { title: string; excerpt: string; doc: unknown }

function Words({ parts, show }: { parts: WordPart[]; show: "before" | "after" | "both" }) {
  return (
    <>
      {parts.map((part, index) => {
        if (part.op === "same") return <span key={index}>{part.text}</span>
        if (part.op === "del" && show !== "after") return <del key={index} className="rounded-sm bg-destructive-surface px-0.5 text-destructive-text">{part.text}</del>
        if (part.op === "add" && show !== "before") return <ins key={index} className="rounded-sm bg-success-surface px-0.5 text-success-text no-underline">{part.text}</ins>
        return null
      })}
    </>
  )
}

function Block({ block, tone, children }: { block: BlockSummary | null; tone: "same" | "removed" | "added" | "changed"; children?: React.ReactNode }) {
  if (!block) return <div aria-hidden className="rounded-lg bg-muted/30" />
  return (
    <div
      className={cn(
        "min-w-0 rounded-lg border px-3 py-2 text-sm leading-6",
        tone === "same" && "border-transparent text-muted-foreground",
        tone === "removed" && "border-destructive-text/20 bg-destructive-surface/50 text-foreground",
        tone === "added" && "border-success-text/20 bg-success-surface/50 text-foreground",
        tone === "changed" && "border-border bg-card text-foreground",
      )}
    >
      <p className="mb-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{block.label}</p>
      <div className={cn("whitespace-pre-line break-words", tone === "same" && "line-clamp-2")}>{children ?? (block.text || <span className="text-muted-foreground">(no text)</span>)}</div>
    </div>
  )
}

function SideBySide({ rows }: { rows: DiffRow[] }) {
  return (
    <div className="grid gap-2">
      {rows.map((row, index) => (
        <div key={index} className="grid grid-cols-2 gap-3">
          {row.kind === "same" ? (
            <>
              <Block block={row.before} tone="same" />
              <Block block={row.after} tone="same" />
            </>
          ) : row.kind === "added" ? (
            <>
              <Block block={null} tone="same" />
              <Block block={row.after} tone="added" />
            </>
          ) : row.kind === "removed" ? (
            <>
              <Block block={row.before} tone="removed" />
              <Block block={null} tone="same" />
            </>
          ) : (
            <>
              <Block block={row.before} tone="changed">{row.words ? <Words parts={row.words} show="before" /> : undefined}</Block>
              <Block block={row.after} tone="changed">{row.words ? <Words parts={row.words} show="after" /> : undefined}</Block>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

function Inline({ rows }: { rows: DiffRow[] }) {
  return (
    <div className="mx-auto grid max-w-2xl gap-2">
      {rows.map((row, index) =>
        row.kind === "same" ? (
          <Block key={index} block={row.after} tone="same" />
        ) : row.kind === "added" ? (
          <Block key={index} block={row.after} tone="added" />
        ) : row.kind === "removed" ? (
          <Block key={index} block={row.before} tone="removed" />
        ) : (
          <Block key={index} block={row.after} tone="changed">{row.words ? <Words parts={row.words} show="both" /> : undefined}</Block>
        ),
      )}
    </div>
  )
}

const optionLabel = (row: RevisionRow) => `${whenLabel(row.created_at)}, ${row.author_name}, ${KIND_LABEL[row.kind].toLowerCase()}`

/**
 * Compare two versions at block level, side by side or inline. The left side is a saved version, the right side is
 * the current working copy or another saved version. Restoring the left version goes through `onRestore`.
 */
export function CompareDialog({ open, onOpenChange, ...rest }: CompareProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] max-w-5xl flex-col gap-4">
        {/* Mounted only while open, so each opening starts from the version that was clicked. */}
        <CompareBody onOpenChange={onOpenChange} {...rest} />
      </DialogContent>
    </Dialog>
  )
}

type CompareProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  adapter: EditorAdapter
  revisions: RevisionRow[]
  initialId: string | null
  current: Side
  canRestore: boolean
  onRestore: (row: RevisionRow) => void
}

function CompareBody({
  onOpenChange,
  adapter,
  revisions,
  initialId,
  current,
  canRestore,
  onRestore,
}: Omit<CompareProps, "open">) {
  const [leftId, setLeftId] = useState<string | null>(initialId)
  const [rightId, setRightId] = useState<string>(CURRENT)
  const [mode, setMode] = useState<"side" | "inline">("side")
  const [details, setDetails] = useState<Record<string, RevisionDetail>>({})
  const [failed, setFailed] = useState(false)
  const requested = useRef(new Set<string>())

  useEffect(() => {
    for (const id of [leftId, rightId]) {
      if (!id || id === CURRENT || details[id] || requested.current.has(id)) continue
      requested.current.add(id)
      adapter
        .getRevision(id)
        .then((detail) => setDetails((prev) => ({ ...prev, [id]: detail })))
        .catch(() => setFailed(true))
    }
  }, [leftId, rightId, adapter, details])

  const side = (id: string | null): Side | null => {
    if (id === CURRENT) return current
    const detail = id ? details[id] : null
    return detail ? { title: detail.title ?? "", excerpt: detail.excerpt ?? "", doc: detail.content } : null
  }
  const left = side(leftId)
  const right = side(rightId)
  const rows = useMemo(() => (left && right ? diffDocs(left.doc, right.doc) : null), [left, right])
  const stats = rows ? diffStats(rows) : null
  const titleChange = left && right && left.title !== right.title ? wordDiff(left.title, right.title) : null
  const leftRow = revisions.find((row) => row.id === leftId) ?? null

  const options = revisions.map((row) => ({ value: row.id, label: optionLabel(row) }))
  const unchanged = stats && stats.added + stats.removed + stats.changed === 0 && !titleChange

  return (
    <>
        <DialogHeader>
          <DialogTitle>Compare versions</DialogTitle>
          <DialogDescription>Blocks that differ are marked. Restoring puts the older version in the draft. The live post doesn’t change until you publish.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1 text-xs font-medium text-muted-foreground">
            Older
            <EditorSelect ariaLabel="Older version" value={leftId ?? ""} onValueChange={setLeftId} options={options} placeholder="Choose a version" />
          </div>
          <div className="grid gap-1 text-xs font-medium text-muted-foreground">
            Newer
            <EditorSelect ariaLabel="Newer version" value={rightId} onValueChange={setRightId} options={[{ value: CURRENT, label: "Current draft" }, ...options]} />
          </div>
        </div>

        <div className="min-h-[240px] flex-1 overflow-y-auto rounded-lg border border-border bg-background p-3" aria-live="polite">
          {failed ? (
            <p className="p-4 text-sm text-muted-foreground">A version couldn’t be loaded. Close this and try again.</p>
          ) : !rows ? (
            <div className="grid h-full place-items-center p-8" aria-busy="true">
              <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden />
            </div>
          ) : (
            <div className="grid gap-3">
              {titleChange ? (
                <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
                  <p className="mb-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Title</p>
                  <Words parts={titleChange} show="both" />
                </div>
              ) : null}
              {unchanged ? <p className="p-4 text-center text-sm text-muted-foreground">These two versions have the same content.</p> : mode === "side" ? <SideBySide rows={rows} /> : <Inline rows={rows} />}
            </div>
          )}
        </div>

        <DialogFooter className="items-center gap-2 sm:justify-between sm:space-x-0">
          <div className="flex items-center gap-3">
            <div role="group" aria-label="Layout" className="flex rounded-md border border-border p-0.5">
              <Button type="button" size="sm" variant={mode === "side" ? "secondary" : "ghost"} aria-pressed={mode === "side"} onClick={() => setMode("side")}>
                <Columns2 aria-hidden />
                Side by side
              </Button>
              <Button type="button" size="sm" variant={mode === "inline" ? "secondary" : "ghost"} aria-pressed={mode === "inline"} onClick={() => setMode("inline")}>
                <Rows3 aria-hidden />
                Inline
              </Button>
            </div>
            {stats ? (
              <p className="text-xs text-muted-foreground">
                {stats.changed} changed · {stats.added} added · {stats.removed} removed
              </p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {canRestore && leftRow ? (
              <Button type="button" variant="primary" onClick={() => onRestore(leftRow)}>
                <RotateCcw aria-hidden />
                Restore the older version
              </Button>
            ) : null}
          </div>
        </DialogFooter>
    </>
  )
}
