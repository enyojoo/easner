"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, History as HistoryIcon, RotateCcw, Save, Send, GitCompare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { EditorAdapter, RevisionKind, RevisionRow } from "@/components/editor/types"
import { isMilestone, KIND_LABEL, whenLabel, wordDelta } from "@/lib/blog/revision-format"
import { cn } from "@/lib/utils"

const KIND_ICON: Record<RevisionKind, typeof Save> = { autosave: Save, submit: Send, publish: CheckCircle2, restore: RotateCcw }

/**
 * History: every version of the post, newest first. Milestones (submitted, published, restored) and autosaves are
 * told apart, each with who, when and how many words it added or removed. Compare opens the two-version diff.
 */
export function HistoryPanel({
  adapter,
  postId,
  refreshKey,
  canRestore,
  onCompare,
  onRestore,
  onLoaded,
}: {
  adapter: EditorAdapter
  postId: string
  /** Changes whenever something happened that adds a version (publish, submit, restore). */
  refreshKey: string
  canRestore: boolean
  onCompare: (row: RevisionRow) => void
  onRestore: (row: RevisionRow) => void
  onLoaded?: (rows: RevisionRow[]) => void
}) {
  const [rows, setRows] = useState<RevisionRow[] | null>(null)
  const [error, setError] = useState(false)
  const [milestonesOnly, setMilestonesOnly] = useState(false)

  useEffect(() => {
    let alive = true
    adapter
      .listRevisions(postId)
      .then((next) => {
        if (!alive) return
        setRows(next)
        setError(false)
        onLoaded?.(next)
      })
      .catch(() => alive && setError(true))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when the key says a version was added
  }, [adapter, postId, refreshKey])

  const shown = useMemo(() => {
    if (!rows) return []
    // The delta compares each version with the one before it in time, whether or not it is filtered out.
    return rows.map((row, index) => ({ row, before: rows[index + 1]?.word_count ?? null })).filter(({ row }) => !milestonesOnly || isMilestone(row.kind))
  }, [rows, milestonesOnly])

  if (error) {
    return <p className="p-4 text-sm text-muted-foreground">History couldn’t be loaded. Try again in a moment.</p>
  }
  if (!rows) {
    return (
      <div className="grid gap-3 p-4" aria-busy="true">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }
  if (!rows.length) {
    return (
      <div className="grid justify-items-center gap-2 p-8 text-center">
        <HistoryIcon className="size-6 text-muted-foreground" aria-hidden />
        <p className="text-sm font-medium text-foreground">No versions yet</p>
        <p className="text-sm text-muted-foreground">Versions appear as you write: autosaves every few minutes, and a milestone each time the post is submitted or published.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {rows.length} {rows.length === 1 ? "version" : "versions"}
        </p>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" className="size-3.5 accent-[var(--primary)]" checked={milestonesOnly} onChange={(event) => setMilestonesOnly(event.target.checked)} />
          Milestones only
        </label>
      </div>
      <ol className="grid gap-1" aria-label="Versions of this post">
        {shown.map(({ row, before }) => {
          const Icon = KIND_ICON[row.kind]
          const milestone = isMilestone(row.kind)
          return (
            <li key={row.id} className="group rounded-lg border border-transparent px-2 py-2 hover:border-border hover:bg-muted/40">
              <div className="flex items-start gap-3">
                <span className={cn("mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full", milestone ? "bg-success-surface text-success-text" : "bg-muted text-muted-foreground")}>
                  <Icon className="size-3.5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm", milestone ? "font-medium text-foreground" : "text-foreground")}>{KIND_LABEL[row.kind]}</p>
                  <p className="text-xs leading-5 text-muted-foreground">
                    {row.author_name} · {whenLabel(row.created_at)}
                  </p>
                  <p className="text-xs leading-5 text-muted-foreground">{wordDelta(row.word_count, before)}</p>
                </div>
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                  <Button type="button" variant="ghost" size="sm" aria-label={`Compare the ${KIND_LABEL[row.kind].toLowerCase()} from ${whenLabel(row.created_at)}`} onClick={() => onCompare(row)}>
                    <GitCompare aria-hidden />
                  </Button>
                  {canRestore ? (
                    <Button type="button" variant="ghost" size="sm" aria-label={`Restore the version from ${whenLabel(row.created_at)}`} onClick={() => onRestore(row)}>
                      <RotateCcw aria-hidden />
                    </Button>
                  ) : null}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
      {milestonesOnly && !shown.length ? <p className="text-sm text-muted-foreground">No milestones yet.</p> : null}
    </div>
  )
}
