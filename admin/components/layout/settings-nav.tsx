"use client"

import { usePathname, useRouter } from "next/navigation"
import { FilterTabs } from "@/components/ui/filter-tabs"
import { settingsTabs, type SettingsTab } from "@/lib/nav-config"

/** The Settings tabs. Each tab is its own route under /settings, so it has an address and the back button works. */
export function SettingsNav() {
  const pathname = usePathname()
  const router = useRouter()
  const active = settingsTabs.find((tab) => tab.value !== "team" && pathname?.startsWith(tab.href))?.value ?? "team"
  const hrefOf = (value: SettingsTab) => settingsTabs.find((tab) => tab.value === value)?.href ?? "/settings"
  return (
    <FilterTabs<SettingsTab>
      ariaLabel="Settings sections"
      tabs={settingsTabs.map(({ value, label }) => ({ value, label }))}
      value={active}
      onChange={(value) => router.push(hrefOf(value))}
      onTabHover={(value) => router.prefetch(hrefOf(value))}
    />
  )
}
