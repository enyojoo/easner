"use client"

import { useState } from "react"
import { RedirectsView, type RedirectItem, type RedirectPostOption } from "@/components/redirects/redirects-view"
import { Checkbox } from "@/components/ui/checkbox"

/** Development harness for the Redirects screen: local data, no Supabase. Same rules as the database functions. */
const POSTS: RedirectPostOption[] = [
  { id: "p1", slug: "how-payroll-works", title: "How payroll works", status: "published" },
  { id: "p2", slug: "sending-money-to-nigeria", title: "Sending money to Nigeria", status: "published" },
  { id: "p3", slug: "a-draft-about-fees", title: "A draft about fees", status: "draft" },
]
const day = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString()

export function RedirectsHarness() {
  const [rows, setRows] = useState<RedirectItem[]>([
    { from_slug: "payroll-explained", created_at: day(3), created_by_name: "Ada Okafor", to_post: POSTS[0] },
    { from_slug: "send-money-nigeria", created_at: day(11), created_by_name: null, to_post: POSTS[1] },
  ])
  const [canEdit, setCanEdit] = useState(true)
  const [empty, setEmpty] = useState(false)
  return (
    <div className="mx-auto max-w-5xl p-8">
      <RedirectsView
        redirects={empty ? [] : rows}
        posts={POSTS}
        canEdit={canEdit}
        onAdd={async (from, toPostId) => {
          await new Promise((resolve) => setTimeout(resolve, 250))
          setEmpty(false)
          setRows((current) => [{ from_slug: from, created_at: new Date().toISOString(), created_by_name: "You", to_post: POSTS.find((post) => post.id === toPostId) ?? null }, ...current])
        }}
        onRemove={async (from) => {
          await new Promise((resolve) => setTimeout(resolve, 250))
          setRows((current) => current.filter((row) => row.from_slug !== from))
        }}
      />
      <div className="fixed bottom-3 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full border border-border bg-popover px-4 py-2 text-sm shadow-lift">
        <span className="font-medium text-muted-foreground">Harness</span>
        <label className="flex items-center gap-2">
          <Checkbox checked={canEdit} onCheckedChange={(value) => setCanEdit(value === true)} aria-label="Editor or owner" />
          Editor or owner
        </label>
        <label className="flex items-center gap-2">
          <Checkbox checked={empty} onCheckedChange={(value) => setEmpty(value === true)} aria-label="Show the empty state" />
          Empty state
        </label>
      </div>
    </div>
  )
}
