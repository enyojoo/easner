import type { Metadata } from "next"
import { SettingsNav } from "@/components/layout/settings-nav"
import { PageHeader } from "@/components/ui/page-header"

export const metadata: Metadata = { title: "Settings" }

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Your team, redirects, media and categories." />
      <SettingsNav />
      {children}
    </div>
  )
}
