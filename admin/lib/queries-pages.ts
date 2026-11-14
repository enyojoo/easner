"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/lib/auth-context"
import type { AdminRole } from "@/lib/roles"
import { supabase } from "@/lib/supabase"

/** Queries for Authors, Media, Overview and the Posts nav count. Cache-first, same persisted cache as lib/queries.ts. */

export const pageKeys = {
  authors: () => ["admin", "authors"] as const,
  myAuthor: () => ["admin", "my-author"] as const,
  members: () => ["admin", "members-lite"] as const,
  media: () => ["admin", "media"] as const,
  mediaUsage: () => ["admin", "media-usage"] as const,
  postFlags: () => ["admin", "post-flags"] as const,
}

// ---------------------------------------------------------------------------------------------------------------
// Bio (jsonb, a one-paragraph doc) ⇄ plain text
// ---------------------------------------------------------------------------------------------------------------

export const BIO_MAX = 280

export function bioToText(bio: unknown): string {
  if (typeof bio === "string") return bio
  if (!bio || typeof bio !== "object") return ""
  const out: string[] = []
  const visit = (node: unknown) => {
    if (!node || typeof node !== "object") return
    const n = node as { type?: string; text?: string; content?: unknown[] }
    if (n.type === "text" && typeof n.text === "string") out.push(n.text)
    for (const child of n.content ?? []) visit(child)
    if (n.type === "paragraph") out.push("\n")
  }
  visit(bio)
  return out.join("").trim()
}

export function textToBio(text: string): unknown {
  const value = text.trim()
  if (!value) return null
  return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: value }] }] }
}

// ---------------------------------------------------------------------------------------------------------------
// Authors
// ---------------------------------------------------------------------------------------------------------------

export type AuthorRow = {
  id: string
  slug: string
  name: string
  title: string | null
  location: string | null
  avatar_path: string | null
  bio: unknown
  x_url: string | null
  linkedin_url: string | null
  github_url: string | null
  website_url: string | null
  member_id: string | null
  post_count: number
  member_role: AdminRole | null
}

type RawAuthor = Omit<AuthorRow, "post_count" | "member_role"> & {
  blog_post_authors: Array<{ count: number }> | null
  admin_members: { role: AdminRole } | { role: AdminRole }[] | null
}

const AUTHOR_COLUMNS =
  "id, slug, name, title, location, avatar_path, bio, x_url, linkedin_url, github_url, website_url, member_id, blog_post_authors(count), admin_members(role)"

function mapAuthor({ blog_post_authors, admin_members, ...author }: RawAuthor): AuthorRow {
  const member = Array.isArray(admin_members) ? admin_members[0] : admin_members
  return { ...author, post_count: blog_post_authors?.[0]?.count ?? 0, member_role: member?.role ?? null }
}

async function fetchAuthors(): Promise<AuthorRow[]> {
  const { data, error } = await supabase.from("blog_authors").select(AUTHOR_COLUMNS).order("name")
  if (error) throw error
  return ((data ?? []) as unknown as RawAuthor[]).map(mapAuthor)
}

/** The signed-in member's own author profile, created on first use by ensure_my_author(). */
export async function fetchMyAuthor(): Promise<AuthorRow> {
  const ensured = await supabase.rpc("ensure_my_author")
  if (ensured.error) throw ensured.error
  const id = (ensured.data as { id?: string } | null)?.id
  if (!id) throw new Error("Couldn’t load your profile.")
  const { data, error } = await supabase.from("blog_authors").select(AUTHOR_COLUMNS).eq("id", id).single()
  if (error) throw error
  return mapAuthor(data as unknown as RawAuthor)
}

export type AuthorProfileGap = "photo" | "bio" | null
export function profileGap(author: Pick<AuthorRow, "avatar_path" | "bio">): AuthorProfileGap {
  if (!author.avatar_path) return "photo"
  if (!bioToText(author.bio)) return "bio"
  return null
}

export function useAuthors() {
  const { adminQueriesEnabled } = useAuth()
  return useQuery({
    queryKey: pageKeys.authors(),
    queryFn: fetchAuthors,
    enabled: adminQueriesEnabled,
    meta: { webPersist: "reduced" },
  })
}

export function useMyAuthor() {
  const { adminQueriesEnabled } = useAuth()
  return useQuery({
    queryKey: pageKeys.myAuthor(),
    queryFn: fetchMyAuthor,
    enabled: adminQueriesEnabled,
    staleTime: 60_000,
  })
}

export type MemberLite = { user_id: string; name: string; email: string; role: AdminRole }

export function useMembersLite() {
  const { adminQueriesEnabled } = useAuth()
  return useQuery({
    queryKey: pageKeys.members(),
    queryFn: async (): Promise<MemberLite[]> => {
      const { data, error } = await supabase.from("admin_members").select("user_id, name, email, role").order("name")
      if (error) throw error
      return (data ?? []) as MemberLite[]
    },
    enabled: adminQueriesEnabled,
    meta: { webPersist: "reduced" },
  })
}

// ---------------------------------------------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------------------------------------------

export type MediaRow = {
  id: string
  path: string
  width: number | null
  height: number | null
  mime: string
  size: number | null
  alt: string | null
  caption: string | null
  created_at: string
}

export type MediaUsageRow = { media_id: string; post_id: string; in_cover: boolean; in_content: boolean }

export function useMedia() {
  const { adminQueriesEnabled } = useAuth()
  return useQuery({
    queryKey: pageKeys.media(),
    queryFn: async (): Promise<MediaRow[]> => {
      const { data, error } = await supabase
        .from("blog_media")
        .select("id, path, width, height, mime, size, alt, caption, created_at")
        .order("created_at", { ascending: false })
        .limit(2000)
      if (error) throw error
      return (data ?? []) as MediaRow[]
    },
    enabled: adminQueriesEnabled,
    meta: { webPersist: "reduced" },
  })
}

export function useMediaUsage() {
  const { adminQueriesEnabled } = useAuth()
  return useQuery({
    queryKey: pageKeys.mediaUsage(),
    queryFn: async (): Promise<MediaUsageRow[]> => {
      const { data, error } = await supabase.rpc("blog_media_usage")
      if (error) throw error
      return (data ?? []) as MediaUsageRow[]
    },
    enabled: adminQueriesEnabled,
    meta: { webPersist: "reduced" },
  })
}

// ---------------------------------------------------------------------------------------------------------------
// Review flags (Overview, Posts nav count)
// ---------------------------------------------------------------------------------------------------------------

export type PostFlagRow = {
  id: string
  title: string
  slug: string
  status: "draft" | "in_review" | "changes_requested" | "scheduled" | "published" | "archived"
  created_by: string
  updated_at: string
  published_at: string | null
  scheduled_for: string | null
  claims_flagged: boolean
  has_unpublished_changes: boolean
}

export function usePostFlags() {
  const { adminQueriesEnabled } = useAuth()
  return useQuery({
    queryKey: pageKeys.postFlags(),
    queryFn: async (): Promise<PostFlagRow[]> => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, status, created_by, updated_at, published_at, scheduled_for, claims_flagged, has_unpublished_changes")
        .order("updated_at", { ascending: false })
        .limit(1000)
      if (error) throw error
      return (data ?? []) as PostFlagRow[]
    },
    enabled: adminQueriesEnabled,
    meta: { webPersist: "reduced" },
  })
}

/** Amber count on the Posts nav item: reviews waiting (Editors, Owners) or changes requested on your drafts (Writers). */
export function usePostsAttentionCount(): number {
  const { role, user } = useAuth()
  const { data } = usePostFlags()
  if (!data || !role) return 0
  if (role === "writer") return data.filter((p) => p.status === "changes_requested" && p.created_by === user?.id).length
  return data.filter((p) => p.status === "in_review").length
}
