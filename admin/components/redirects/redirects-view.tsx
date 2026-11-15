"use client"

import { useMemo, useState } from "react"
import { ArrowRight, Plus, Signpost, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { formatListDate } from "@/lib/queries"
import { StatusBadge } from "@/components/ui/status-badge"
import { PageHeader } from "@/components/ui/page-header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EditorSelect } from "@/components/editor/editor-select"
import { normalizeFromSlug, validateRedirect } from "@/lib/blog/redirects"

export type RedirectItem = {
  from_slug: string
  created_at: string
  created_by_name: string | null
  to_post: { id: string; slug: string; title: string; status: string } | null
}
export type RedirectPostOption = { id: string; slug: string; title: string; status: string }

const COLUMNS = ["From", "To", "Why", "Added", ""]


/**
 * The Redirects screen: old blog URLs and the posts they lead to (301). Editors and Owners add and remove. The checks
 * mirror the database: no redirect from a URL a post uses, no duplicates, and the target must be published.
 * Takes its data as props, so the dev harness can run it without Supabase.
 */
export function RedirectsView({
  redirects,
  posts,
  canEdit,
  loading,
  onAdd,
  onRemove,
}: {
  redirects: RedirectItem[]
  posts: RedirectPostOption[]
  canEdit: boolean
  loading?: boolean
  onAdd: (from: string, toPostId: string) => Promise<void>
  onRemove: (from: string) => Promise<void>
}) {
  const [adding, setAdding] = useState(false)
  const [from, setFrom] = useState("")
  const [target, setTarget] = useState("")
  const [touched, setTouched] = useState(false)
  const [pending, setPending] = useState(false)
  const [removing, setRemoving] = useState<RedirectItem | null>(null)

  const published = useMemo(() => posts.filter((post) => post.status === "published").sort((a, b) => a.title.localeCompare(b.title)), [posts])
  const problem = validateRedirect({
    from,
    targetId: target || null,
    posts,
    existing: redirects.map((row) => ({ from: row.from_slug, to_post_id: row.to_post?.id ?? "" })),
  })

  const open = () => {
    setFrom("")
    setTarget("")
    setTouched(false)
    setAdding(true)
  }

  const add = async () => {
    setTouched(true)
    if (problem) return
    setPending(true)
    try {
      await onAdd(normalizeFromSlug(from), target)
      setAdding(false)
      toast.success("Redirect added", { description: `/blog/${normalizeFromSlug(from)} now leads to the post. Readers get it within a minute.` })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn’t add the redirect.")
    } finally {
      setPending(false)
    }
  }

  const remove = async () => {
    if (!removing) return
    setPending(true)
    try {
      await onRemove(removing.from_slug)
      toast.success("Redirect removed")
      setRemoving(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn’t remove the redirect.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Redirects"
        description="Old blog addresses and where they send readers. Most are added for you when a slug changes."
        actions={
          canEdit ? (
            <Button type="button" size="sm" variant="outline" onClick={open}>
              <Plus aria-hidden />
              New redirect
            </Button>
          ) : null
        }
      />

      <Card padding="none">
        {!loading && redirects.length === 0 ? (
          <EmptyState
            icon={Signpost}
            title="No redirects yet"
            message="When a published post changes its URL, the old one lands here and keeps working. You can also point an old URL at a post yourself."
            actions={
              canEdit ? (
                <Button type="button" size="sm" variant="outline" onClick={open}>
                  New redirect
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {COLUMNS.map((column, index) => (
                  <TableHead key={index} className={index === 4 ? "w-14" : undefined}>
                    {column || <span className="sr-only">Actions</span>}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {redirects.map((row) => (
                <TableRow key={row.from_slug}>
                  <TableCell className="font-mono text-[13px]">/blog/{row.from_slug}</TableCell>
                  <TableCell>
                    {row.to_post ? (
                      <div className="flex min-w-0 items-center gap-2">
                        <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{row.to_post.title || row.to_post.slug}</p>
                          <p className="truncate font-mono text-xs text-muted-foreground">/blog/{row.to_post.slug}</p>
                          {row.to_post.status !== "published" ? <p className="text-xs text-warning-text">Not live, so this redirect is off until it is published.</p> : null}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">The post was deleted</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status="draft" showIcon={false}>
                      {row.created_by_name ? "Manual" : "Slug changed"}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatListDate(row.created_at)} · {row.created_by_name ?? "System"}
                  </TableCell>
                  <TableCell className="text-right">
                    {canEdit ? (
                      <Button type="button" variant="ghost" size="sm" aria-label={`Remove the redirect from /blog/${row.from_slug}`} onClick={() => setRemoving(row)}>
                        <Trash2 aria-hidden />
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
      <p className="text-[13px] leading-[18px] text-muted-foreground">
        All redirects are permanent (301). A redirect can’t point to another redirect; chains are collapsed when added.
      </p>

      <Dialog open={adding} onOpenChange={(next) => !pending && setAdding(next)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add a redirect</DialogTitle>
            <DialogDescription>Readers who open the old URL are sent to the post with a permanent redirect.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="Old URL" hint="Only the part after /blog/. You can paste the whole address." error={touched && problem && !problem.startsWith("Choose") ? problem : undefined}>
              <Input value={from} placeholder="old-post-title" autoComplete="off" spellCheck={false} onChange={(event) => setFrom(event.target.value)} />
            </Field>
            <div className="grid gap-1.5">
              <span className="text-sm font-medium text-foreground">Leads to</span>
              <EditorSelect
                ariaLabel="Post it leads to"
                value={target}
                onValueChange={setTarget}
                placeholder="Choose a published post"
                options={published.map((post) => ({ value: post.id, label: post.title || post.slug }))}
              />
              {touched && problem?.startsWith("Choose") ? <p className="text-xs text-destructive-text">{problem}</p> : null}
              {published.length === 0 ? <p className="text-xs text-muted-foreground">Only published posts can be a target. None is published yet.</p> : null}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:space-x-0">
            <Button type="button" variant="outline" disabled={pending} onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button type="button" variant="primary" loading={pending} onClick={() => void add()}>
              Add redirect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(next) => !next && !pending && setRemoving(null)}
        title="Remove this redirect?"
        description={removing ? `/blog/${removing.from_slug} stops leading anywhere and shows the not found page. Links that still use it break.` : undefined}
        confirmLabel="Remove redirect"
        tone="destructive"
        pending={pending}
        onConfirm={remove}
      />
    </div>
  )
}
