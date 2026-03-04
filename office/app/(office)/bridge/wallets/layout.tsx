import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Wallets - Easner",
  robots: {
    index: false,
    noindex: true,
    follow: false,
    nofollow: true,
  },
}

export default function BridgeWalletsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
