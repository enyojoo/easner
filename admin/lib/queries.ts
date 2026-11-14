"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/lib/auth-context"
import type { AdminRole } from "@/lib/roles"
import { supabase } from "@/lib/supabase"

/** Query keys. Jump to reads these caches without fetching. */
export const adminKeys = {
  posts: () => ["admin", "posts"] as const,
  categories: () => ["admin", "categories"] as const,
  team: () => ["admin", "team"] as const,
}

export type PostStatus = "draft" | "in_review" | "changes_requested" | "scheduled" | "published" | "archived"

export type PostRow = {
  id: string
  slug: string
  title: string
  status: PostStatus
  cover_path: string | null
  cover_alt: string | null
  category_id: string | null
  created_by: string
  updated_at: string
  published_at: string | null
  scheduled_for: string | null
  has_unpublished_changes: boolean
  authors: Array<{ id: string; name: string }>
}

export type CategoryRow = {
  id: string
  slug: string
  name: string
  description: string
  sort_order: number
  seo_title: string | null
  seo_description: string | null
  archived_at: string | null
  updated_at: string
}

export type MemberRow = {
  user_id: string
  role: AdminRole
  name: string
  email: string
  created_at: string
}

export type InviteRow = {
  id: string
  email: string
  role: AdminRole
  name: string
  created_at: string
}

type RawPost = Omit<PostRow, "authors"> & {
  blog_post_authors: Array<{ position: number; blog_authors: { id: string; name: string } | null }> | null
}

const POST_LIST_COLUMNS =
  "id, slug, title, status, cover_path, cover_alt, category_id, created_by, updated_at, published_at, scheduled_for, has_unpublished_changes, blog_post_authors(position, blog_authors(id, name))"

async function fetchPosts(): Promise<PostRow[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(POST_LIST_COLUMNS)
    .order("updated_at", { ascending: false })
    .limit(1000)
  if (error) throw error
  return ((data ?? []) as unknown as RawPost[]).map(({ blog_post_authors, ...post }) => ({
    ...post,
    authors: (blog_post_authors ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((row) => row.blog_authors)
      .filter((author): author is { id: string; name: string } => Boolean(author)),
  }))
}

async function fetchCategories(): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from("blog_categories")
    .select("id, slug, name, description, sort_order, seo_title, seo_description, archived_at, updated_at")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
  if (error) throw error
  return (data ?? []) as CategoryRow[]
}

async function fetchTeam(): Promise<{ members: MemberRow[]; invites: InviteRow[] }> {
  const [members, invites] = await Promise.all([
    supabase.from("admin_members").select("user_id, role, name, email, created_at").order("created_at"),
    supabase
      .from("admin_invites")
      .select("id, email, role, name, created_at")
      .is("accepted_at", null)
      .is("revoked_at", null)
      .order("created_at"),
  ])
  if (members.error) throw members.error
  if (invites.error) throw invites.error
  return { members: (members.data ?? []) as MemberRow[], invites: (invites.data ?? []) as InviteRow[] }
}

export function usePosts() {
  const { adminQueriesEnabled } = useAuth()
  return useQuery({
    queryKey: adminKeys.posts(),
    queryFn: fetchPosts,
    enabled: adminQueriesEnabled,
    meta: { webPersist: "reduced" },
  })
}

export function useCategories() {
  const { adminQueriesEnabled } = useAuth()
  return useQuery({
    queryKey: adminKeys.categories(),
    queryFn: fetchCategories,
    enabled: adminQueriesEnabled,
    meta: { webPersist: "reduced" },
  })
}

export function useTeam() {
  const { adminQueriesEnabled } = useAuth()
  return useQuery({
    queryKey: adminKeys.team(),
    queryFn: fetchTeam,
    enabled: adminQueriesEnabled,
    meta: { webPersist: "reduced" },
  })
}

/** "Sep 24" this year, "Sep 24, 2025" otherwise (25-office.md: dates). */
export function formatListDate(value: string | null | undefined): string {
  if (!value) return "–"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "–"
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return date.toLocaleDateString("en-US", sameYear ? { month: "short", day: "numeric" } : { month: "short", day: "numeric", year: "numeric" })
}

/** The message a Supabase/PostgREST error carries, for a toast. Database errors are written for people. */
export function errorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string" && error.message) {
    const message = error.message
    if (/row-level security|permission denied/i.test(message)) return "You don’t have permission to do that."
    if (/duplicate key/i.test(message)) return "That’s already taken."
    return message
  }
  return fallback
}
