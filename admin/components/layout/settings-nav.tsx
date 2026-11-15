"use client"

import { usePathname, useRouter } from "next/navigation"
import { FilterTabs } from "@/components/ui/filter-tabs"
import { settingsTabs, type SettingsTab } from "@/lib/nav-config"

/** The Settings tabs. Each tab is its own route under /settings, so each has an address that can be shared or bookmarked. */
export function SettingsNav() {
  const pathname = usePathname()
  const router = useRouter()
  const active = settingsTabs.find((tab) => tab.value !== "team" && pathname?.startsWith(tab.href))?.value ?? "team"
  const hrefOf = (value: SettingsTab) => settingsTabs.find((tab) => tab.value === value)?.href ?? "/settings"
  return (
    // Like Office's Settings: the tabs scroll sideways on a narrow screen, and switching tabs doesn't add a Back step.
    <div className="overflow-x-auto">
      <FilterTabs<SettingsTab>
        ariaLabel="Settings sections"
        tabs={settingsTabs.map(({ value, label }) => ({ value, label }))}
        value={active}
        onChange={(value) => value !== active && router.replace(hrefOf(value))}
        onTabHover={(value) => router.prefetch(hrefOf(value))}
        className="min-w-max"
      />
    </div>
  )
}
