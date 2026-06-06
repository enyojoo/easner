import type { ReactNode } from "react"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"

interface MarketingPageShellProps {
  children: ReactNode
}

export function MarketingPageShell({ children }: MarketingPageShellProps) {
  return (
    <div className="min-h-screen bg-[#F6F3EB] text-[#0F1110]">
      <PublicHeader />
      <main className="relative overflow-hidden pt-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_18%_10%,rgba(0,122,204,0.12),transparent_32%),linear-gradient(180deg,#FFFFFF_0%,rgba(246,243,235,0)_75%)]" />
        <div className="relative">{children}</div>
      </main>
      <PublicFooter />
    </div>
  )
}
