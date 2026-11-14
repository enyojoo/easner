"use client"

import { QueryClient } from "@tanstack/react-query"

/**
 * Browser-side singleton QueryClient (Office pattern): one client per tab so client navigations keep the cache,
 * a fresh client per server render.
 */

let browserClient: QueryClient | null = null
const BROWSER_QUERY_CACHE_GC_MS = 24 * 60 * 60 * 1000

function createAdminQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: BROWSER_QUERY_CACHE_GC_MS,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
    },
  })
}

export function getBrowserQueryClient(): QueryClient {
  if (typeof window === "undefined") return createAdminQueryClient()
  if (!browserClient) browserClient = createAdminQueryClient()
  return browserClient
}

export function clearBrowserQueryClient(): void {
  browserClient?.clear()
}
