import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Profile - Easner",
  description: "Manage your personal profile, account settings, and preferences for your Easner money transfer account.",
  robots: {
    index: false,
    noindex: true,
    follow: false,
    nofollow: true,
  },
}

export default function UserProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
