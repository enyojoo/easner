"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, PenLine } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { useAuth } from "@/lib/auth-context"
import { createPost } from "@/lib/blog/post-api"
import { adminKeys, errorMessage } from "@/lib/queries"

/** Creates an empty draft owned by the signed-in person, then opens it in the editor. */
export default function NewPostPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { adminQueriesEnabled, user } = useAuth()
  const started = useRef(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Wait for the session: a draft is created as the person signed in.
    if (!adminQueriesEnabled || !user || started.current) return
    started.current = true
    createPost()
      .then((id) => {
        void queryClient.invalidateQueries({ queryKey: adminKeys.posts() })
        router.replace(`/posts/${id}`)
      })
      .catch((cause) => setError(errorMessage(cause, "Couldn’t start a new post.")))
  }, [adminQueriesEnabled, user, router, queryClient])

  if (error) {
    return (
      <div className="mx-auto max-w-md pt-24">
        <EmptyState
          icon={PenLine}
          title="Couldn’t start a new post"
          message={error}
          actions={
            <Button asChild variant="outline" size="sm">
              <Link href="/posts">Back to Posts</Link>
            </Button>
          }
        />
      </div>
    )
  }
  return (
    <div className="flex h-dvh items-center justify-center gap-2 text-sm text-muted-foreground" role="status">
      <Loader2 className="size-4 animate-spin" aria-hidden />
      Starting a new draft…
    </div>
  )
}
