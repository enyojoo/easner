"use client"

import type React from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { InvoicesProvider } from "@/lib/invoices-context"

export default function InvoicesLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell mainClassName="overflow-y-auto">
      <InvoicesProvider>{children}</InvoicesProvider>
    </DashboardShell>
  )
}
