import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "User Authentication - Easner",
  description: "Sign in to your Easner account to send money internationally with zero fees.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function UserAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
