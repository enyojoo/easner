"use client"

import { useState } from "react"
import { Check, MessageSquare, RotateCcw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { CommentRow } from "@/components/editor/types"
import { cn } from "@/lib/utils"

function ago(value: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000))
  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function CommentsPanel({
  comments,
  loading,
  quote,
  onClearQuote,
  onAdd,
  onResolve,
}: {
  comments: CommentRow[]
  loading: boolean
  quote: string | null
  onClearQuote: () => void
  onAdd: (input: { body: string; quote?: string | null; parentId?: string | null }) => Promise<void>
  onResolve: (id: string, resolved: boolean) => Promise<void>
}) {
  const [body, setBody] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [reply, setReply] = useState("")
  const [busy, setBusy] = useState(false)
  const roots = comments.filter((comment) => !comment.parent_id)
  const repliesOf = (id: string) => comments.filter((comment) => comment.parent_id === id)

  const submit = async (input: { body: string; quote?: string | null; parentId?: string | null }, reset: () => void) => {
    if (!input.body.trim()) return
    setBusy(true)
    try {
      await onAdd({ ...input, body: input.body.trim() })
      reset()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {loading ? <p className="text-sm text-muted-foreground">Loading comments…</p> : null}
        {!loading && roots.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
            <MessageSquare className="size-5" aria-hidden />
            <p>No comments yet. Select text in the post and choose Comment, or write one below.</p>
          </div>
        ) : null}
        <ul className="grid gap-4">
          {roots.map((root) => {
            const resolved = Boolean(root.resolved_at)
            return (
              <li key={root.id} className={cn("rounded-lg border border-border p-3", resolved && "opacity-60", root.kind === "change_request" && "border-warning")}>
                {root.kind === "change_request" ? <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-warning-text">Changes requested</p> : null}
                {root.quote ? <blockquote className="mb-2 border-l-2 border-border pl-2 text-xs italic text-muted-foreground">{root.quote}</blockquote> : null}
                <p className="text-sm font-medium text-foreground">
                  {root.author_name} <span className="font-normal text-muted-foreground">· {ago(root.created_at)}</span>
                </p>
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-foreground">{root.body}</p>
                {repliesOf(root.id).map((item) => (
                  <div key={item.id} className="mt-3 border-t border-border pt-2">
                    <p className="text-sm font-medium text-foreground">
                      {item.author_name} <span className="font-normal text-muted-foreground">· {ago(item.created_at)}</span>
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm text-foreground">{item.body}</p>
                  </div>
                ))}
                <div className="mt-2 flex items-center gap-1">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setReplyTo(replyTo === root.id ? null : root.id)}>
                    Reply
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => void onResolve(root.id, !resolved)}>
                    {resolved ? <RotateCcw aria-hidden /> : <Check aria-hidden />}
                    {resolved ? "Reopen" : "Resolve"}
                  </Button>
                </div>
                {replyTo === root.id ? (
                  <div className="mt-2 grid gap-2">
                    <Textarea aria-label="Reply" rows={2} value={reply} onChange={(event) => setReply(event.target.value)} />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busy || !reply.trim()}
                      onClick={() =>
                        void submit({ body: reply, parentId: root.id }, () => {
                          setReply("")
                          setReplyTo(null)
                        })
                      }
                    >
                      Reply
                    </Button>
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      </div>
      <div className="grid gap-2 border-t border-border p-4">
        {quote ? (
          <div className="flex items-start gap-2 rounded-md bg-muted p-2 text-xs italic text-muted-foreground">
            <span className="min-w-0 flex-1 line-clamp-3">{quote}</span>
            <button type="button" aria-label="Remove quote" onClick={onClearQuote} className="shrink-0 rounded p-0.5 hover:bg-card">
              <X className="size-3.5" aria-hidden />
            </button>
          </div>
        ) : null}
        <Textarea aria-label="New comment" rows={3} placeholder="Write a comment" value={body} onChange={(event) => setBody(event.target.value)} />
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={busy || !body.trim()}
          onClick={() =>
            void submit({ body, quote }, () => {
              setBody("")
              onClearQuote()
            })
          }
        >
          Comment
        </Button>
      </div>
    </div>
  )
}
