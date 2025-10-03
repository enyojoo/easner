import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Early Access - Easner",
  description: "Manage early access requests and user onboarding process for the Easner platform.",
  robots: {
    index: false,
    noindex: true,
    follow: false,
    nofollow: true,
  },
}

export default function AdminEarlyAccessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
