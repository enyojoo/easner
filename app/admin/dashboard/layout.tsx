import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard - Easner",
  description: "Admin dashboard for managing Easner platform operations, users, and transactions.",
  robots: {
    index: false,
    noindex: true,
    follow: false,
    nofollow: true,
  },
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
