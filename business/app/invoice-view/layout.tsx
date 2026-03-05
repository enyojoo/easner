import type { Metadata } from "next"
import { businessInfo } from "@/lib/business-info"

export const metadata: Metadata = {
  title: `Invoice from ${businessInfo.name}`,
  description: `View your invoice from ${businessInfo.name}`,
}

export default function InvoiceViewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 flex flex-col items-center justify-center w-full px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  )
}
