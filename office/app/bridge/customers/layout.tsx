import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Customers - Easner",
  robots: {
    index: false,
    noindex: true,
    follow: false,
    nofollow: true,
  },
}

export default function BridgeCustomersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
