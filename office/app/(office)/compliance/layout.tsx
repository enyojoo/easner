import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Compliance - Easner",
  robots: {
    index: false,
    noindex: true,
    follow: false,
    nofollow: true,
  },
}

export default function ComplianceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
