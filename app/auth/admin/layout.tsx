import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Authentication - Easner",
  description: "Admin login for managing Easner platform operations and user accounts.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
