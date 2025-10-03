import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Transactions - Easner",
  description: "View your money transfer history, track transaction status, and monitor all your international transfers.",
  robots: {
    index: false,
    noindex: true,
    follow: false,
    nofollow: true,
  },
}

export default function TransactionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
