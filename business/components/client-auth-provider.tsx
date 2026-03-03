"use client"

import { AuthProvider } from "@/lib/auth-context"
import { ClientOnly } from "@/components/client-only"
import { LoadingSpinner } from "@/components/loading-spinner"

interface ClientAuthProviderProps {
  children: React.ReactNode
}

export function ClientAuthProvider({ children }: ClientAuthProviderProps) {
  return (
    <ClientOnly fallback={<LoadingSpinner />}>
      <AuthProvider>{children}</AuthProvider>
    </ClientOnly>
  )
}
