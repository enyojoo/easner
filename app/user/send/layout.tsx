import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Send Money - Easner",
  description: "Send money internationally with zero fees using Easner. Transfer money to family and friends worldwide instantly.",
  robots: {
    index: false,
    noindex: true,
    follow: false,
    nofollow: true,
  },
}

export default function SendMoneyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
