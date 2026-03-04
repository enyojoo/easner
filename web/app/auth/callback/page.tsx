"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code")
      const errorParam = searchParams.get("error")

      if (errorParam) {
        setError(errorParam === "access_denied" ? "Sign in was cancelled" : errorParam)
        setTimeout(() => router.replace("/auth/login"), 2000)
        return
      }

      if (code) {
        try {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) {
            setError(exchangeError.message)
            setTimeout(() => router.replace("/auth/login"), 2000)
            return
          }
          // Success - redirect based on user type (admin vs regular)
          const isAdmin = data?.user?.user_metadata?.isAdmin ?? false
          router.replace(isAdmin ? "/admin/dashboard" : "/user/dashboard")
        } catch (err: any) {
          setError(err?.message || "Failed to complete sign in")
          setTimeout(() => router.replace("/auth/login"), 2000)
        }
        return
      }

      // No code - might be hash-based (implicit flow) or direct visit
      // Check if we already have a session (e.g. from hash fragment auto-processing)
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const isAdmin = session.user?.user_metadata?.isAdmin ?? false
        router.replace(isAdmin ? "/admin/dashboard" : "/user/dashboard")
      } else {
        // No session, redirect to login
        router.replace("/auth/login")
      }
    }

    handleCallback()
  }, [router, searchParams])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-6">
          <p className="text-destructive mb-2">{error}</p>
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
