import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Virtual Accounts - Easner",
  robots: {
    index: false,
    noindex: true,
    follow: false,
    nofollow: true,
  },
}

export default function VirtualAccountsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
