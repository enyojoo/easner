import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Transactions - Easner",
  description: "Monitor and manage all money transfer transactions across the Easner platform.",
  robots: {
    index: false,
    noindex: true,
    follow: false,
    nofollow: true,
  },
}

export default function AdminTransactionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
