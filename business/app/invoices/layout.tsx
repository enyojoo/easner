"use client"

import type React from "react"
import { DashboardShell } from "@/components/dashboard-shell"

export default function InvoicesLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell mainClassName="overflow-y-auto">{children}</DashboardShell>
}
