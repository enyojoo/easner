import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login - Easner",
  description: "Sign in to your Easner account to send money internationally with zero fees and instant transfers.",
  robots: {
    index: true,
    follow: true,
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
