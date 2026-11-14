"use client"

import * as React from "react"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { getBrowserQueryClient } from "@/lib/query/query-client"
import { useAuth } from "@/lib/auth-context"
import {
  ADMIN_WEB_QUERY_CACHE_BUSTER,
  ADMIN_WEB_QUERY_CACHE_MAX_AGE_MS,
  createAdminQueryPersister,
  probeStoredAdminUserId,
  shouldPersistAdminQuery,
} from "@/lib/query/web-persist"

/**
 * Persisted query provider (Office's pattern): reloads paint every page from the on-device cache immediately, then
 * freshen silently. No global fetching bar: background refreshes are invisible.
 */
export function AdminQueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getBrowserQueryClient()
  const { user } = useAuth()
  // Seeded synchronously: PersistQueryClientProvider restores exactly once, on the first commit.
  const [restoredUserId] = React.useState<string | null>(() => probeStoredAdminUserId())
  const persistedUserId = user?.id ?? restoredUserId
  const persister = React.useMemo(() => createAdminQueryPersister(persistedUserId), [persistedUserId])

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        buster: ADMIN_WEB_QUERY_CACHE_BUSTER,
        maxAge: ADMIN_WEB_QUERY_CACHE_MAX_AGE_MS,
        dehydrateOptions: { shouldDehydrateQuery: shouldPersistAdminQuery },
      }}
    >
      {children}
      {process.env.NODE_ENV !== "production" ? (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      ) : null}
    </PersistQueryClientProvider>
  )
}
