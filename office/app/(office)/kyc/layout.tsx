import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "KYC - Easner",
  robots: {
    index: false,
    noindex: true,
    follow: false,
    nofollow: true,
  },
}

export default function KYCLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
