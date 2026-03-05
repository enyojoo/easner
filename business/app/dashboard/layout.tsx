"use client"

import type React from "react"
import { DashboardShell } from "@/components/dashboard-shell"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell constrained>{children}</DashboardShell>
}
