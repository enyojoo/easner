"use client"

import type React from "react"
import { CustomersProvider } from "@/lib/customers-context"
import { InvoicesProvider } from "@/lib/invoices-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CustomersProvider>
      <InvoicesProvider>{children}</InvoicesProvider>
    </CustomersProvider>
  )
}
