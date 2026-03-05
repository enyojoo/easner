"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SettingsPersonalTab } from "@/components/settings/settings-personal-tab"
import { SettingsBusinessTab } from "@/components/settings/settings-business-tab"
import { SettingsTeamTab } from "@/components/settings/settings-team-tab"
import { SettingsCommunicationTab } from "@/components/settings/settings-communication-tab"

const TABS = ["personal", "business", "team", "communication"] as const
type TabValue = (typeof TABS)[number]

function SettingsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tab = (searchParams.get("tab") || "personal") as TabValue
  const validTab = TABS.includes(tab) ? tab : "personal"

  const handleTabChange = (value: string) => {
    router.push(`/settings?tab=${value}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
      </div>

      <Tabs value={validTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <SettingsPersonalTab />
        </TabsContent>
        <TabsContent value="business" className="mt-6">
          <SettingsBusinessTab />
        </TabsContent>
        <TabsContent value="team" className="mt-6">
          <SettingsTeamTab />
        </TabsContent>
        <TabsContent value="communication" className="mt-6">
          <SettingsCommunicationTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded-lg" />}>
      <SettingsContent />
    </Suspense>
  )
}
