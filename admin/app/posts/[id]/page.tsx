"use client"

import { use } from "react"
import Link from "next/link"
import { FileText } from "lucide-react"
import { PostEditor } from "@/components/editor/post-editor"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { supabaseAdapter } from "@/lib/blog/post-api"
import { useEditorLookups, usePostForEditor } from "@/lib/editor-data"

function EditorSkeleton() {
  return (
    <div className="flex h-dvh flex-col">
      <div className="h-14 border-b border-border" />
      <div className="mx-auto w-full max-w-[720px] space-y-4 px-6 pt-16">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="mt-8 h-40 w-full" />
      </div>
    </div>
  )
}

export default function PostEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const post = usePostForEditor(id)
  const { lookups, viewer } = useEditorLookups()

  if (post.isError || (post.isSuccess && !post.data)) {
    return (
      <div className="mx-auto max-w-md pt-24">
        <EmptyState
          icon={FileText}
          title="This post isn’t available"
          message="It may have been deleted, or you may not have access to it."
          actions={
            <Button asChild variant="outline" size="sm">
              <Link href="/posts">Back to Posts</Link>
            </Button>
          }
        />
      </div>
    )
  }
  if (!post.data || !lookups || !viewer) return <EditorSkeleton />
  return <PostEditor key={post.data.id} initialPost={post.data} adapter={supabaseAdapter} viewer={viewer} lookups={lookups} />
}
