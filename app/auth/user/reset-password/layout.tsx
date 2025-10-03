import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reset Password - Easner",
  description: "Set a new password for your Easner account to complete the password reset process.",
  robots: {
    index: true,
    follow: true,
  },
}

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
