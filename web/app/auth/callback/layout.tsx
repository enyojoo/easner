import { Suspense } from "react"

export default function AuthCallbackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse text-muted-foreground">Loading...</div></div>}>{children}</Suspense>
}
