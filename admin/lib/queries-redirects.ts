"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { RedirectItem } from "@/components/redirects/redirects-view"
import { useAuth } from "@/lib/auth-context"
import { adminKeys, errorMessage } from "@/lib/queries"
import { useMembersLite } from "@/lib/queries-pages"
import { supabase } from "@/lib/supabase"

const redirectKeys = { all: ["admin", "redirects"] as const }

type Raw = {
  from_slug: string
  to_post_id: string
  created_at: string
  created_by: string | null
  blog_posts: { id: string; slug: string; title: string; status: string } | { id: string; slug: string; title: string; status: string }[] | null
}

export function useRedirects() {
  const { adminQueriesEnabled } = useAuth()
  const members = useMembersLite()
  const query = useQuery({
    queryKey: redirectKeys.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_redirects")
        .select("from_slug, to_post_id, created_at, created_by, blog_posts(id, slug, title, status)")
        .order("created_at", { ascending: false })
        .limit(1000)
      if (error) throw error
      return (data ?? []) as unknown as Raw[]
    },
    enabled: adminQueriesEnabled,
  })
  const names = new Map((members.data ?? []).map((member) => [member.user_id, member.name || member.email]))
  const rows: RedirectItem[] = (query.data ?? []).map((row) => ({
    from_slug: row.from_slug,
    created_at: row.created_at,
    created_by_name: row.created_by ? (names.get(row.created_by) ?? "Someone on the team") : null,
    to_post: Array.isArray(row.blog_posts) ? (row.blog_posts[0] ?? null) : row.blog_posts,
  }))
  return { rows, isLoading: query.isLoading, error: query.error ? errorMessage(query.error, "Couldn’t load the redirects.") : null }
}

export function useRedirectMutations() {
  const queryClient = useQueryClient()
  const refresh = () => queryClient.invalidateQueries({ queryKey: redirectKeys.all })
  const add = useMutation({
    mutationFn: async ({ from, toPostId }: { from: string; toPostId: string }) => {
      const { error } = await supabase.rpc("add_blog_redirect", { p_from_slug: from, p_to_post_id: toPostId })
      if (error) throw new Error(errorMessage(error, "Couldn’t add the redirect."))
    },
    onSuccess: refresh,
  })
  const remove = useMutation({
    mutationFn: async (from: string) => {
      const { error } = await supabase.from("blog_redirects").delete().eq("from_slug", from)
      if (error) throw new Error(errorMessage(error, "Couldn’t remove the redirect."))
    },
    onSuccess: () => {
      void refresh()
      void queryClient.invalidateQueries({ queryKey: adminKeys.posts() })
    },
  })
  return { add, remove }
}
