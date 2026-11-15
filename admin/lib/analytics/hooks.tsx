"use client"

import { createContext, useContext, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/lib/auth-context"
import { createSupabaseSource } from "./supabase-source"
import type { AnalyticsSource, DateRange } from "./source"
import type { Dimension } from "./types.ts"

/** The dashboard reads through a source: live Supabase by default, sample data in the dev harness (/dev/analytics). */
interface Ctx {
  id: "live" | "sample"
  source: AnalyticsSource
  /** Sample data needs no sign-in. */
  alwaysEnabled: boolean
}

const liveSource = createSupabaseSource()
const AnalyticsContext = createContext<Ctx>({ id: "live", source: liveSource, alwaysEnabled: false })

export function AnalyticsSourceProvider({ id, source, children }: { id: "live" | "sample"; source: AnalyticsSource; children: React.ReactNode }) {
  const value = useMemo(() => ({ id, source, alwaysEnabled: id === "sample" }), [id, source])
  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

export function useAnalyticsMode(): "live" | "sample" {
  return useContext(AnalyticsContext).id
}

const FIVE_MIN = 5 * 60_000

function useRollup<T>(key: unknown[], run: (source: AnalyticsSource) => Promise<T>, enabled = true) {
  const ctx = useContext(AnalyticsContext)
  const { adminQueriesEnabled } = useAuth()
  return useQuery({
    queryKey: ["admin", "analytics", ctx.id, ...key],
    queryFn: () => run(ctx.source),
    enabled: enabled && (ctx.alwaysEnabled || adminQueriesEnabled),
    staleTime: FIVE_MIN,
    meta: ctx.id === "live" ? { webPersist: "reduced" } : undefined,
  })
}

const r = (range: DateRange) => `${range.from}:${range.to}`

export const useAnalyticsStatus = () => useRollup(["status"], (s) => s.status())
export const useDaily = (path: string, range: DateRange, enabled = true) => useRollup(["daily", path, r(range)], (s) => s.daily(path, range), enabled)
export const useDailyBy = (path: string, range: DateRange, dimension: Dimension, value: string, enabled = true) =>
  useRollup(["daily-by", path, dimension, value, r(range)], (s) => s.dailyBy(path, range, dimension, value), enabled && value !== "")
export const usePages = (range: DateRange) => useRollup(["pages", r(range)], (s) => s.pages(range))
export const useBreakdown = (range: DateRange, path: string, dimension: Parameters<AnalyticsSource["breakdown"]>[2], enabled = true) =>
  useRollup(["breakdown", path, dimension, r(range)], (s) => s.breakdown(range, path, dimension), enabled)
export const useSearch = (range: DateRange, scope: "site" | "blog", postId?: string) => useRollup(["search", scope, postId ?? "", r(range)], (s) => s.search(range, scope, postId))
export const useTopPosts = (range: DateRange, limit: number, enabled = true) => useRollup(["top-posts", limit, r(range)], (s) => s.topPosts(range, limit), enabled)
export const usePostDaily = (postId: string, range: DateRange) => useRollup(["post-daily", postId, r(range)], (s) => s.postDaily(postId, range))
export const useFeedback = (postId?: string) => useRollup(["feedback", postId ?? "all"], (s) => s.feedback(postId))
export const useVitals = (range: DateRange) => useRollup(["vitals", r(range)], (s) => s.vitals(range))
