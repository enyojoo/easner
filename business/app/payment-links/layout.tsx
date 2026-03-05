"use client"

import type React from "react"
import { DashboardShell } from "@/components/dashboard-shell"

export default function PaymentLinksLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}
