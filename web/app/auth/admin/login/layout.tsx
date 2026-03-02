import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Login - Easner",
  description: "Admin login for managing Easner platform operations, users, transactions, and system settings.",
  robots: {
    index: false,
    follow: false,
    noindex: true,
    nofollow: true,
  },
}

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
