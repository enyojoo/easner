"use client"

import { useEffect, useMemo, useState } from "react"
import { del } from "idb-keyval"
import { EMPTY_DOC } from "@easner/blog-content"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { EditorSelect } from "@/components/editor/editor-select"
import { PostEditor } from "@/components/editor/post-editor"
import type { CommentRow, EditorAdapter, EditorLookups, PostFull, ReviewState, Viewer } from "@/components/editor/types"
import { readImageSize } from "@/lib/media"
import { validateUpload } from "@/lib/blog/crops"
import type { AdminRole } from "@/lib/roles"
import { EVERY_BLOCK_DOC } from "./sample-doc"

/**
 * Development harness: mounts the real editor with a local, in-memory adapter and no Supabase, so every block,
 * menu, paste path, upload and autosave state can be exercised without signing in. Enabled only when
 * NODE_ENV=development and ADMIN_DEV_HARNESS=1 (app/dev/layout.tsx answers 404 otherwise).
 */

const NOW = () => new Date().toISOString()

function samplePost(doc: PostFull["draft_content"], over: Partial<PostFull> = {}): PostFull {
  return {
    id: "harness-post",
    slug: "draft-harness",
    status: "draft",
    title: "",
    excerpt: null,
    cover_path: null,
    cover_alt: null,
    cover_focal_point: null,
    og_image_path: null,
    content: null,
    draft_content: doc,
    has_unpublished_changes: true,
    category_id: null,
    product_page: null,
    featured: false,
    seo_title: null,
    seo_description: null,
    canonical_url: null,
    noindex: false,
    focus_keyword: null,
    summary: null,
    content_modified_at: null,
    word_count: 0,
    reading_minutes: 0,
    published_at: null,
    scheduled_for: null,
    created_at: NOW(),
    // Old on purpose: a backup kept on this device (IndexedDB) is newer, so reloading restores it.
    updated_at: "2026-01-01T00:00:00.000Z",
    created_by: "harness-writer",
    claims_flagged: false,
    claims_matches: [],
    authorIds: [],
    ...over,
  }
}

const LOOKUPS: EditorLookups = {
  categories: [
    { id: "c1", name: "Business", slug: "business" },
    { id: "c2", name: "Personal", slug: "personal" },
    { id: "c3", name: "Global money", slug: "global-money" },
  ],
  authors: [
    { id: "a1", name: "Ada Okafor", slug: "ada-okafor", title: "Head of Product", avatar_path: "/dev/sample-image", bio: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Writes about moving money." }] }] } },
    { id: "a2", name: "Guest Writer", slug: "guest-writer", title: null, avatar_path: null, bio: null },
  ],
  otherPosts: [
    { id: "p2", slug: "how-payroll-works", title: "How payroll works", status: "published", seo_title: null, seo_description: "Pay a team in many countries from one account.", focus_keyword: "global payroll" },
  ],
  publishedSlugs: ["how-payroll-works"],
  linkTargets: [
    { label: "Home", href: "/", kind: "page" },
    { label: "Business Banking", href: "/business", kind: "page" },
    { label: "Personal Banking", href: "/personal", kind: "page" },
    { label: "Payroll", href: "/payroll", kind: "page" },
    { label: "Pricing", href: "/pricing", kind: "page" },
    { label: "How payroll works", href: "/blog/how-payroll-works", kind: "post" },
  ],
}

type Controls = { offline: boolean; saves: number }

const clearBackup = () => void del("easner-admin:post-backup:harness-post").catch(() => undefined)

const controls: Controls = { offline: false, saves: 0 }

type HarnessAdapter = EditorAdapter & { snapshot: () => PostFull }

function makeAdapter(start: PostFull): HarnessAdapter {
  let post = start
  let comments: CommentRow[] = []
  let approvals: Array<{ approver: string; name: string; at: string }> = []
  const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))
  const set = (patch: Partial<PostFull>) => {
    post = { ...post, ...patch, updated_at: NOW() }
    return post
  }
  const guard = () => {
    if (controls.offline) throw Object.assign(new Error("Failed to fetch"), { offline: true })
  }
  return {
    kind: "local",
    snapshot: () => post,
    async saveDraft(_id, snapshot) {
      await delay()
      guard()
      controls.saves += 1
      set({ title: snapshot.title, excerpt: snapshot.excerpt || null, draft_content: snapshot.doc })
      return { updatedAt: post.updated_at }
    },
    async saveSettings(_id, patch) {
      await delay(120)
      guard()
      set(patch)
      return { updatedAt: post.updated_at, slug: post.slug }
    },
    async setAuthors(_id, ids) {
      set({ authorIds: ids })
    },
    async uploadImage(file) {
      const problem = validateUpload(file)
      if (problem) throw new Error(problem)
      const size = await readImageSize(file).catch(() => ({ width: 0, height: 0 }))
      const form = new FormData()
      form.append("file", file)
      const response = await fetch("/dev/upload", { method: "POST", body: form })
      const { id, url } = (await response.json()) as { id: string; url: string }
      return { id, path: url, url, width: size.width || null, height: size.height || null, mime: file.type, size: file.size, alt: null, caption: null }
    },
    async submitForReview() {
      return set({ status: "in_review" })
    },
    async withdraw() {
      return set({ status: "draft" })
    },
    async requestChanges(_id, comment) {
      if (comment) comments = [...comments, { id: crypto.randomUUID(), post_id: post.id, parent_id: null, author_id: "harness-editor", author_name: "Harness Editor", body: comment, quote: null, kind: "change_request", resolved_at: null, created_at: NOW() }]
      approvals = []
      return set({ status: "changes_requested" })
    },
    async approve() {
      approvals = [...approvals, { approver: "harness-editor", name: "Harness Editor", at: NOW() }]
      return post
    },
    async publish() {
      await delay(400)
      const next = set({ status: "published", published_at: post.published_at ?? NOW(), content: post.draft_content, draft_content: null, has_unpublished_changes: false })
      return { post: next, website: { status: "skipped" as const, note: "Harness: no website to notify." } }
    },
    async unpublish() {
      const next = set({ status: "draft", draft_content: post.content, has_unpublished_changes: true })
      return { post: next, website: { status: "skipped" as const, note: "Harness: no website to notify." } }
    },
    async previewLink() {
      return { skipped: "The harness has no website to preview on." }
    },
    async notifyWebsite() {
      return { status: "skipped" as const, note: "Harness: no website to notify." }
    },
    async reviewState(): Promise<ReviewState> {
      return { flagged: post.claims_flagged, matches: post.claims_matches, needed: post.claims_flagged ? 2 : 0, have: approvals.length, approvals, creator: post.created_by, creator_is_editor: false }
    },
    async listComments() {
      return comments
    },
    async addComment(_id, input) {
      const row: CommentRow = { id: crypto.randomUUID(), post_id: post.id, parent_id: input.parentId ?? null, author_id: "me", author_name: "You", body: input.body, quote: input.quote ?? null, kind: "comment", resolved_at: null, created_at: NOW() }
      comments = [...comments, row]
      return row
    },
    async resolveComment(commentId, resolved) {
      comments = comments.map((row) => (row.id === commentId ? { ...row, resolved_at: resolved ? NOW() : null } : row))
    },
  }
}

const ROLES: Array<{ role: AdminRole; id: string; label: string }> = [
  { role: "writer", id: "harness-writer", label: "Writer (author)" },
  { role: "editor", id: "harness-editor", label: "Editor" },
  { role: "owner", id: "harness-owner", label: "Owner" },
]

export function EditorHarness() {
  const [sample, setSample] = useState<"empty" | "every">("empty")
  const [roleIndex, setRoleIndex] = useState(0)
  const [offline, setOffline] = useState(false)
  const [generation, setGeneration] = useState(0)
  useEffect(() => {
    // The editor listens to the browser's online and offline events, so the harness fires them too.
    const was = controls.offline
    controls.offline = offline
    if (offline !== was) window.dispatchEvent(new Event(offline ? "offline" : "online"))
  }, [offline])

  const adapter = useMemo(() => {
    void generation
    return makeAdapter(
      samplePost(sample === "every" ? EVERY_BLOCK_DOC : EMPTY_DOC, sample === "every" ? { title: "Sending money to Nigeria", excerpt: "How cross-border payments work, and what to check first.", category_id: "c3", authorIds: ["a1"] } : {}),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- a new adapter only on Reset or when the sample changes.
  }, [generation])
  // Switching role keeps the post exactly as the adapter has it, so a Writer's submission reaches the Editor.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initial = useMemo(() => adapter.snapshot(), [adapter, roleIndex])
  const current = ROLES[roleIndex]
  const viewer: Viewer = { id: current.id, role: current.role, name: current.label }

  return (
    <>
      <PostEditor key={`${generation}-${current.id}`} initialPost={initial} adapter={adapter} viewer={viewer} lookups={LOOKUPS} backHref="/dev/editor" />
      <div
        role="region"
        aria-label="Development harness controls"
        className="fixed bottom-3 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-popover px-4 py-2 text-sm text-foreground shadow-lift"
      >
        <span className="font-medium text-muted-foreground">Harness</span>
        <EditorSelect
          ariaLabel="Role"
          className="w-44"
          value={String(roleIndex)}
          onValueChange={(value) => setRoleIndex(Number(value))}
          options={ROLES.map((role, index) => ({ value: String(index), label: role.label }))}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => (clearBackup(), setSample(sample === "every" ? "empty" : "every"), setGeneration((n) => n + 1))}>
          {sample === "every" ? "Empty post" : "Load every block"}
        </Button>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={offline} onCheckedChange={(value) => setOffline(value === true)} aria-label="Simulate offline" />
          Simulate offline
        </label>
        <Button type="button" variant="outline" size="sm" onClick={() => (clearBackup(), setGeneration((n) => n + 1))}>
          Reset
        </Button>
      </div>
    </>
  )
}
