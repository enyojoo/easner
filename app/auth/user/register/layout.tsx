import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Register - Easner",
  description: "Join Easner to send money internationally with zero fees. Create your account and start saving on transfers today.",
  robots: {
    index: true,
    follow: true,
  },
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
