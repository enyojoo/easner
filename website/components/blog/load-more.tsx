"use client"

import Link from "next/link"
import { useState, useTransition, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { pagePath } from "@/lib/blog/urls"
import { loadMorePosts } from "@/app/(marketing)/blog/actions"

/**
 * "Load more posts": appends the next page of cards in place, and sits beside a real `?page=N` link so crawlers and
 * no-JS readers can page. Both lead to the same posts.
 */
export function LoadMore({ base, nextPage, pageCount }: { base: string; nextPage: number; pageCount: number }) {
  const [appended, setAppended] = useState<ReactNode[]>([])
  const [next, setNext] = useState(nextPage)
  const [pending, start] = useTransition()
  const done = next > pageCount

  return (
    <>
      {appended}
      {!done && (
        <div className="flex items-center justify-center gap-4 pt-10">
          <Button
            type="button"
            variant="outline"
            pill
            disabled={pending}
            onClick={() =>
              start(async () => {
                const grid = await loadMorePosts(next)
                setAppended((list) => [...list, <div key={next} className="pt-10">{grid}</div>])
                setNext((n) => n + 1)
              })
            }
          >
            {pending ? "Loading…" : "Load more posts"}
          </Button>
          <Link href={pagePath(base, next)} className="inline-flex min-h-11 items-center text-[13px] text-web-meta underline underline-offset-2 hover:text-web-ink">
            Page {next}
          </Link>
        </div>
      )}
    </>
  )
}
