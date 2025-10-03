import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard - Easner",
  description: "Your personal dashboard for managing money transfers, viewing transaction history, and monitoring your account activity.",
  robots: {
    index: false,
    follow: false,
    noindex: true,
    nofollow: true,
  },
}

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
