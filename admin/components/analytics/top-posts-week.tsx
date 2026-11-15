"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCount, rangeForPeriod } from "@/lib/analytics/aggregate"
import { useAnalyticsStatus, useTopPosts } from "@/lib/analytics/hooks"
import { isoDay } from "@/lib/analytics/paths"

/** Overview's "Top posts this week". Renders nothing until analytics is connected and has data, so a new team sees no empty card. */
export function TopPostsThisWeek() {
  const [today] = useState(() => isoDay(new Date()))
  const range = useMemo(() => rangeForPeriod("7d", today), [today])
  const status = useAnalyticsStatus()
  const ready = status.data?.state === "ready"
  const query = useTopPosts(range, 5, ready)
  const rows = query.data ?? []
  if (!ready || rows.length === 0) return null
  return (
    <section aria-labelledby="top-posts" className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 id="top-posts" className="text-base font-semibold text-foreground">Top posts this week</h2>
        <Link href="/analytics?tab=blog&period=7d" className="text-sm font-medium text-primary-text hover:underline">View analytics</Link>
      </div>
      <Card padding="none" className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Post</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Readers</TableHead>
              <TableHead className="text-right">Shares</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((post) => (
              <TableRow key={post.post_id}>
                <TableCell className="max-w-[420px]">
                  <Link href={`/posts/${post.post_id}`} className="block truncate font-medium text-foreground hover:underline">{post.title || "Untitled"}</Link>
                  <span className="block truncate text-xs text-muted-foreground">{post.category_name ?? "No category"}</span>
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatCount(post.views)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatCount(post.readers)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatCount(post.share_clicks)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </section>
  )
}
