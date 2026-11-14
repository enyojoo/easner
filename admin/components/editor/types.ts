import type { DocNode } from "@easner/blog-content"
import type { AdminRole } from "@/lib/roles"
import type { BlogMedia } from "@/lib/media"
import type { PostStatus } from "@/lib/queries"

export type FocalPoint = { x: number; y: number }

/** A post as the editor holds it: every column the admin edits, plus its authors. */
export type PostFull = {
  id: string
  slug: string
  status: PostStatus
  title: string
  excerpt: string | null
  cover_path: string | null
  cover_alt: string | null
  cover_focal_point: FocalPoint | null
  og_image_path: string | null
  content: DocNode | null
  draft_content: DocNode | null
  has_unpublished_changes: boolean
  category_id: string | null
  product_page: string | null
  featured: boolean
  seo_title: string | null
  seo_description: string | null
  canonical_url: string | null
  noindex: boolean
  focus_keyword: string | null
  summary: string | null
  content_modified_at: string | null
  word_count: number
  reading_minutes: number
  published_at: string | null
  scheduled_for: string | null
  created_at: string
  updated_at: string
  created_by: string
  claims_flagged: boolean
  claims_matches: string[]
  authorIds: string[]
}

/** Columns the settings panel writes straight to `blog_posts` (the draft doc, title and excerpt go through autosave). */
export type SettingsPatch = Partial<
  Pick<
    PostFull,
    | "slug"
    | "cover_path"
    | "cover_alt"
    | "cover_focal_point"
    | "og_image_path"
    | "category_id"
    | "product_page"
    | "featured"
    | "seo_title"
    | "seo_description"
    | "canonical_url"
    | "noindex"
    | "focus_keyword"
  >
>

export type DraftSnapshot = { title: string; excerpt: string; doc: DocNode }

export type WebsiteResult = { status: "ok" | "skipped" | "failed"; note?: string }

export type ReviewState = {
  flagged: boolean
  matches: string[]
  needed: number
  have: number
  approvals: Array<{ approver: string; name: string; at: string }>
  creator: string
  creator_is_editor: boolean
}

export type CommentRow = {
  id: string
  post_id: string
  parent_id: string | null
  author_id: string | null
  author_name: string
  body: string
  quote: string | null
  kind: "comment" | "change_request" | "brand"
  resolved_at: string | null
  created_at: string
}

export type Viewer = { id: string; name: string; role: AdminRole }

export type RevisionKind = "autosave" | "submit" | "publish" | "restore"

/** One row of History: who, when, what kind, and how many words the version has (the list never carries the doc). */
export type RevisionRow = {
  id: string
  kind: RevisionKind
  created_at: string
  created_by: string | null
  author_name: string
  title: string | null
  word_count: number | null
}

export type RevisionDetail = RevisionRow & { content: DocNode | null; excerpt: string | null }

/** The answer to a lock claim: you hold it, or someone else does (and whether you may take over). */
export type LockClaim = {
  acquired: boolean
  took_over: boolean
  holder_id: string | null
  holder_name: string | null
  can_take_over: boolean
}

/** Someone on the post right now (seen in the last 2 minutes). */
export type PresenceViewer = { user_id: string; name: string; avatar_path: string | null; seen_at: string; holds_lock: boolean }

export type AuthorOption = {
  id: string
  name: string
  slug: string
  title: string | null
  avatar_path: string | null
  bio: unknown
}

export type CategoryOption = { id: string; name: string; slug: string }

export type OtherPost = {
  id: string
  slug: string
  title: string
  status: PostStatus
  seo_title: string | null
  seo_description: string | null
  focus_keyword: string | null
}

/**
 * Everything the editor needs from the outside. The real adapter talks to Supabase and the route handlers; the dev
 * harness (`/dev/editor`) uses a local one, so the editor can be exercised without a sign-in.
 */
export interface EditorAdapter {
  kind: "supabase" | "local"
  /** How often the lock heartbeat runs. The harness shortens it; the default is 30 seconds. */
  lockHeartbeatMs?: number
  /** Saves title, excerpt and the working doc. Throws `{ offline: true }` when the network is down. */
  saveDraft(postId: string, snapshot: DraftSnapshot): Promise<{ updatedAt: string }>
  saveSettings(postId: string, patch: SettingsPatch): Promise<{ updatedAt: string; slug: string }>
  setAuthors(postId: string, authorIds: string[]): Promise<void>
  uploadImage(file: File, postId: string, onProgress?: (fraction: number) => void): Promise<BlogMedia>

  submitForReview(postId: string): Promise<PostFull>
  withdraw(postId: string): Promise<PostFull>
  requestChanges(postId: string, comment: string): Promise<PostFull>
  approve(postId: string): Promise<PostFull>
  publish(postId: string, opts: { significant: boolean }): Promise<{ post: PostFull; website: WebsiteResult }>
  unpublish(postId: string): Promise<{ post: PostFull; website: WebsiteResult }>
  /** Schedules (or reschedules) at a UTC instant. The cron route publishes it when due. */
  schedule(postId: string, at: Date): Promise<PostFull>
  unschedule(postId: string): Promise<PostFull>
  previewLink(postId: string): Promise<{ url: string } | { skipped: string }>
  /** Tells the website a live post's slug, category or author changed. */
  notifyWebsite(postId: string, change: { oldSlug?: string; oldCategorySlug?: string }): Promise<WebsiteResult>

  listRevisions(postId: string): Promise<RevisionRow[]>
  getRevision(revisionId: string): Promise<RevisionDetail>
  /** Copies a version into the draft (never live). Returns the post as it is afterwards. */
  restoreRevision(revisionId: string): Promise<PostFull>

  /** Takes or refreshes the edit lock (the heartbeat). `takeOver` is for editors and owners. */
  claimLock(postId: string, takeOver: boolean): Promise<LockClaim>
  releaseLock(postId: string): Promise<void>
  /** Marks the person as viewing without taking the lock. */
  touchPresence(postId: string): Promise<void>
  viewers(postId: string): Promise<PresenceViewer[]>

  reviewState(postId: string): Promise<ReviewState>
  listComments(postId: string): Promise<CommentRow[]>
  addComment(postId: string, input: { body: string; quote?: string | null; parentId?: string | null }): Promise<CommentRow>
  resolveComment(commentId: string, resolved: boolean): Promise<void>
}

export type EditorLookups = {
  categories: CategoryOption[]
  authors: AuthorOption[]
  otherPosts: OtherPost[]
  publishedSlugs: string[]
  linkTargets: Array<{ label: string; href: string; kind: "page" | "post" }>
}
