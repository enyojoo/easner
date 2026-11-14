"use client"

/** Browser-side access to a post: reads, draft saves, settings, review and comments. RLS and the functions decide. */
import { EMPTY_DOC, type DocNode } from "@easner/blog-content"
import { uploadBlogImage } from "@/lib/media"
import { supabase } from "@/lib/supabase"
import { slugFromTitle } from "@/lib/blog/slug"
import type {
  CommentRow,
  DraftSnapshot,
  EditorAdapter,
  PostFull,
  ReviewState,
  SettingsPatch,
  WebsiteResult,
} from "@/components/editor/types"

export const POST_COLUMNS =
  "id, slug, status, title, excerpt, cover_path, cover_alt, cover_focal_point, og_image_path, content, draft_content, has_unpublished_changes, category_id, product_page, featured, seo_title, seo_description, canonical_url, noindex, focus_keyword, summary, content_modified_at, word_count, reading_minutes, published_at, scheduled_for, created_at, updated_at, created_by, claims_flagged, claims_matches, blog_post_authors(author_id, position)"

type RawPost = Omit<PostFull, "authorIds" | "claims_matches"> & {
  claims_matches: string[] | null
  blog_post_authors: Array<{ author_id: string; position: number }> | null
}

export function mapPost(raw: RawPost): PostFull {
  const { blog_post_authors, claims_matches, ...post } = raw
  return {
    ...post,
    claims_matches: claims_matches ?? [],
    authorIds: (blog_post_authors ?? []).slice().sort((a, b) => a.position - b.position).map((row) => row.author_id),
  }
}

export async function fetchPost(id: string): Promise<PostFull | null> {
  const { data, error } = await supabase.from("blog_posts").select(POST_COLUMNS).eq("id", id).maybeSingle()
  if (error) throw error
  return data ? mapPost(data as unknown as RawPost) : null
}

const randomSuffix = () => Math.random().toString(16).slice(2, 8)

/** A new, empty draft owned by the signed-in person. The slug is a placeholder until the title gives a real one. */
export async function createPost(): Promise<string> {
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({ slug: `draft-${randomSuffix()}`, title: "", draft_content: EMPTY_DOC })
    .select("id")
    .single()
  if (error) throw error
  return data.id as string
}

export function isOfflineError(error: unknown): boolean {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return true
  const message = error && typeof error === "object" && "message" in error ? String((error as { message: unknown }).message) : ""
  return /failed to fetch|networkerror|load failed|network request failed/i.test(message)
}

async function authedJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error("Sign in again to continue.")
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
  const json = (await response.json().catch(() => ({}))) as T & { error?: string }
  if (!response.ok) throw new Error(json.error ?? "That didn’t work. Try again.")
  return json
}

export const callBlogAction = (action: string, postId: string, extra: Record<string, unknown> = {}) =>
  authedJson<{ website: WebsiteResult }>("/api/blog/action", { action, postId, ...extra })

export const fetchPreviewLink = (postId: string) => authedJson<{ url: string } | { skipped: string }>("/api/blog/preview-link", { postId })

async function rpcPost(fn: string, args: Record<string, unknown>): Promise<void> {
  const { error } = await supabase.rpc(fn, args)
  if (error) throw error
}

function authorName(row: { admin_members: { name: string } | { name: string }[] | null }): string {
  const member = Array.isArray(row.admin_members) ? row.admin_members[0] : row.admin_members
  return member?.name || "Someone on the team"
}

const COMMENT_COLUMNS = "id, post_id, parent_id, author_id, body, quote, kind, resolved_at, created_at, admin_members(name)"

type RawComment = Omit<CommentRow, "author_name"> & { admin_members: { name: string } | { name: string }[] | null }

const mapComment = ({ admin_members, ...row }: RawComment): CommentRow => ({ ...row, author_name: authorName({ admin_members }) })

export const supabaseAdapter: EditorAdapter = {
  kind: "supabase",

  async saveDraft(postId, snapshot: DraftSnapshot) {
    const { data, error } = await supabase
      .from("blog_posts")
      .update({ title: snapshot.title, excerpt: snapshot.excerpt || null, draft_content: snapshot.doc as DocNode })
      .eq("id", postId)
      .select("updated_at")
      .single()
    if (error) throw error
    return { updatedAt: data.updated_at as string }
  },

  async saveSettings(postId, patch: SettingsPatch) {
    const { data, error } = await supabase.from("blog_posts").update(patch).eq("id", postId).select("updated_at, slug").single()
    if (error) throw error
    return { updatedAt: data.updated_at as string, slug: data.slug as string }
  },

  async setAuthors(postId, authorIds) {
    const { error: removeError } = await supabase.from("blog_post_authors").delete().eq("post_id", postId)
    if (removeError) throw removeError
    if (!authorIds.length) return
    const { error } = await supabase
      .from("blog_post_authors")
      .insert(authorIds.map((author_id, position) => ({ post_id: postId, author_id, position })))
    if (error) throw error
  },

  uploadImage: (file, postId, onProgress) => uploadBlogImage(file, { folder: "posts", postId, onProgress }),

  async submitForReview(postId) {
    await rpcPost("submit_for_review", { p_post_id: postId })
    return (await fetchPost(postId)) as PostFull
  },
  async withdraw(postId) {
    await rpcPost("withdraw_submission", { p_post_id: postId })
    return (await fetchPost(postId)) as PostFull
  },
  async requestChanges(postId, comment) {
    await rpcPost("request_changes", { p_post_id: postId, p_comment: comment || null })
    return (await fetchPost(postId)) as PostFull
  },
  async approve(postId) {
    await rpcPost("approve_post", { p_post_id: postId })
    return (await fetchPost(postId)) as PostFull
  },
  async publish(postId, opts) {
    const { website } = await callBlogAction("publish", postId, { significant: opts.significant })
    return { post: (await fetchPost(postId)) as PostFull, website }
  },
  async unpublish(postId) {
    const { website } = await callBlogAction("unpublish", postId)
    return { post: (await fetchPost(postId)) as PostFull, website }
  },
  previewLink: fetchPreviewLink,
  async notifyWebsite(postId, change) {
    return (await callBlogAction("revalidate", postId, change)).website
  },

  async reviewState(postId) {
    const { data, error } = await supabase.rpc("blog_post_review_state", { p_post_id: postId })
    if (error) throw error
    const state = (data ?? {}) as Partial<ReviewState>
    return {
      flagged: Boolean(state.flagged),
      matches: state.matches ?? [],
      needed: state.needed ?? 0,
      have: state.have ?? 0,
      approvals: state.approvals ?? [],
      creator: state.creator ?? "",
      creator_is_editor: Boolean(state.creator_is_editor),
    }
  },

  async listComments(postId) {
    const { data, error } = await supabase
      .from("blog_post_comments")
      .select(COMMENT_COLUMNS)
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
    if (error) throw error
    return ((data ?? []) as unknown as RawComment[]).map(mapComment)
  },
  async addComment(postId, input) {
    const { data, error } = await supabase
      .from("blog_post_comments")
      .insert({ post_id: postId, body: input.body, quote: input.quote ?? null, parent_id: input.parentId ?? null, kind: "comment" })
      .select(COMMENT_COLUMNS)
      .single()
    if (error) throw error
    return mapComment(data as unknown as RawComment)
  },
  async resolveComment(commentId, resolved) {
    const { data: me } = await supabase.auth.getUser()
    const { error } = await supabase
      .from("blog_post_comments")
      .update({ resolved_at: resolved ? new Date().toISOString() : null, resolved_by: resolved ? (me.user?.id ?? null) : null })
      .eq("id", commentId)
    if (error) throw error
  },
}

/** Copies a post into a new draft owned by the signed-in person. Returns the new id. */
export async function duplicatePostRow(sourceId: string): Promise<string> {
  const source = await fetchPost(sourceId)
  if (!source) throw new Error("That post couldn’t be found.")
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      slug: `${slugFromTitle(source.title) || "post"}-copy-${randomSuffix()}`.slice(0, 120),
      title: source.title ? `Copy of ${source.title}` : "",
      excerpt: source.excerpt,
      draft_content: source.draft_content ?? source.content ?? EMPTY_DOC,
      category_id: source.category_id,
      product_page: source.product_page,
      cover_path: source.cover_path,
      cover_alt: source.cover_alt,
      cover_focal_point: source.cover_focal_point,
      seo_title: source.seo_title,
      seo_description: source.seo_description,
      focus_keyword: source.focus_keyword,
    })
    .select("id")
    .single()
  if (error) throw error
  const id = data.id as string
  if (source.authorIds.length) {
    await supabase.from("blog_post_authors").insert(source.authorIds.map((author_id, position) => ({ post_id: id, author_id, position })))
  }
  return id
}
