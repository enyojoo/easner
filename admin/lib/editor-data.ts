"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/lib/auth-context"
import { fetchPost } from "@/lib/blog/post-api"
import { KNOWN_SITE_PATHS } from "@/lib/blog/site-routes"
import { PRODUCT_PAGES } from "@easner/blog-content"
import { useAuthors, useMembersLite } from "@/lib/queries-pages"
import { useCategories } from "@/lib/queries"
import { supabase } from "@/lib/supabase"
import type { EditorLookups, OtherPost, Viewer } from "@/components/editor/types"

async function fetchOtherPosts(): Promise<OtherPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title, status, seo_title, seo_description, focus_keyword")
    .order("updated_at", { ascending: false })
    .limit(1000)
  if (error) throw error
  return (data ?? []) as OtherPost[]
}

const PAGE_LABEL: Record<string, string> = {
  "/": "Home",
  ...Object.fromEntries(Object.values(PRODUCT_PAGES).map((page) => [page.path, page.label])),
}

/** Everything the editor reads besides the post: categories, authors, other posts (duplicate checks, link picker). */
export function useEditorLookups(): { lookups: EditorLookups | null; viewer: Viewer | null } {
  const { user, role } = useAuth()
  const categories = useCategories()
  const authors = useAuthors()
  const members = useMembersLite()
  const others = useQuery({ queryKey: ["admin", "post-lookups"], queryFn: fetchOtherPosts, staleTime: 30_000 })

  const lookups = useMemo<EditorLookups | null>(() => {
    if (!categories.data || !authors.data || !others.data) return null
    const published = others.data.filter((post) => post.status === "published")
    return {
      categories: categories.data.filter((category) => !category.archived_at).map(({ id, name, slug }) => ({ id, name, slug })),
      authors: authors.data.map(({ id, name, slug, title, avatar_path, bio }) => ({ id, name, slug, title, avatar_path, bio })),
      otherPosts: others.data,
      publishedSlugs: published.map((post) => post.slug),
      linkTargets: [
        ...KNOWN_SITE_PATHS.map((path) => ({ label: PAGE_LABEL[path] ?? path.replace(/^\//, "").replace(/[-/]/g, " ") ?? path, href: path, kind: "page" as const })),
        ...published.map((post) => ({ label: post.title || post.slug, href: `/blog/${post.slug}`, kind: "post" as const })),
      ],
    }
  }, [categories.data, authors.data, others.data])

  const name = members.data?.find((member) => member.user_id === user?.id)?.name
  const viewer = useMemo<Viewer | null>(
    () => (user && role ? { id: user.id, role, name: name || user.email || "You" } : null),
    [user, role, name],
  )
  return { lookups, viewer }
}

export function usePostForEditor(id: string) {
  const { adminQueriesEnabled } = useAuth()
  return useQuery({
    queryKey: ["admin", "post", id],
    queryFn: () => fetchPost(id),
    enabled: adminQueriesEnabled,
    // The editor owns the state once it mounts; never refetch over the person's typing.
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
  })
}
