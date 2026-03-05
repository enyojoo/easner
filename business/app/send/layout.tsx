"use client"

import type React from "react"
import { DashboardShell } from "@/components/dashboard-shell"

export default function SendLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}
