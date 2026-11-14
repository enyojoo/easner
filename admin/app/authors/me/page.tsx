"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { AuthorFields, draftFromAuthor, EMPTY_AUTHOR, saveAuthor, validateAuthor, type AuthorDraft } from "@/components/authors/author-form"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader } from "@/components/ui/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/auth-context"
import { errorMessage } from "@/lib/queries"
import { pageKeys, useMyAuthor } from "@/lib/queries-pages"
import { permissionsFor } from "@/lib/roles"
import { SITE_ORIGIN } from "@easner/blog-content"

/** My profile (OffBlogTaxonomy): every member edits their own author profile. The URL changes only by an Editor. */
export default function MyProfilePage() {
  const { role } = useAuth()
  const { canManageAuthors } = permissionsFor(role)
  const queryClient = useQueryClient()
  const query = useMyAuthor()
  const [draft, setDraft] = useState<AuthorDraft>(EMPTY_AUTHOR)
  const [loadedId, setLoadedId] = useState<string | null>(null)
  const [showErrors, setShowErrors] = useState(false)

  useEffect(() => {
    if (query.data && query.data.id !== loadedId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- seed the form once from the server row.
      setDraft(draftFromAuthor(query.data))
      setLoadedId(query.data.id)
    }
  }, [query.data, loadedId])

  const errors = validateAuthor(draft, { checkSlug: canManageAuthors })
  const save = useMutation({
    mutationFn: () => saveAuthor(query.data!.id, draft, canManageAuthors),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: pageKeys.myAuthor() }),
        queryClient.invalidateQueries({ queryKey: pageKeys.authors() }),
      ])
      toast.success("Profile saved")
    },
    onError: (error) => toast.error(errorMessage(error, "Couldn’t save your profile. Try again.")),
  })

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-3">
          <Link href="/authors">
            <ArrowLeft aria-hidden />
            Authors
          </Link>
        </Button>
      </div>
      <PageHeader title="My profile" description="How you appear on your posts and your author page. There’s no public email." />
      {query.isError ? (
        <Card padding="none">
          <EmptyState
            title="Your profile didn’t load"
            message={errorMessage(query.error, "Check your connection and try again.")}
            actions={
              <Button type="button" variant="outline" size="sm" onClick={() => void query.refetch()}>
                Try again
              </Button>
            }
          />
        </Card>
      ) : !query.data || loadedId !== query.data.id ? (
        <Card className="space-y-4 p-6" aria-busy="true">
          <Skeleton className="size-14 rounded-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-24 w-full" />
        </Card>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setShowErrors(true)
            if (Object.keys(errors).length === 0 && !save.isPending) save.mutate()
          }}
        >
          <Card className="space-y-6 p-6">
            <AuthorFields
              draft={draft}
              onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
              errors={showErrors ? errors : {}}
              editor={canManageAuthors}
            />
            <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-4">
              <Button asChild variant="outline">
                <a href={`${SITE_ORIGIN}/blog/authors/${query.data.slug}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink aria-hidden />
                  View author page
                </a>
              </Button>
              <Button type="submit" variant="primary" loading={save.isPending} loadingLabel="Saving…">
                Save
              </Button>
            </div>
          </Card>
        </form>
      )}
    </div>
  )
}
