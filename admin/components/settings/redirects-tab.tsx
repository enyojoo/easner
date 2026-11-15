"use client"

import { RedirectsView } from "@/components/redirects/redirects-view"
import { useAuth } from "@/lib/auth-context"
import { usePosts } from "@/lib/queries"
import { useRedirectMutations, useRedirects } from "@/lib/queries-redirects"
import { permissionsFor } from "@/lib/roles"

export function RedirectsTab() {
  const { role } = useAuth()
  const { canManageRedirects } = permissionsFor(role)
  const posts = usePosts()
  const { rows, isLoading } = useRedirects()
  const { add, remove } = useRedirectMutations()
  return (
    <RedirectsView
      redirects={rows}
      posts={(posts.data ?? []).map(({ id, slug, title, status }) => ({ id, slug, title, status }))}
      canEdit={canManageRedirects}
      loading={isLoading || posts.isLoading}
      onAdd={(from, toPostId) => add.mutateAsync({ from, toPostId })}
      onRemove={(from) => remove.mutateAsync(from)}
    />
  )
}
