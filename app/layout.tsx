import type React from "react"
import type { Metadata } from "next"
import { Poppins } from 'next/font/google'
import { AuthProvider } from "@/lib/auth-context"
import { PostHogProvider } from "@/components/posthog-provider"
import "./globals.css"

const poppins = Poppins({
 subsets: ["latin"],
 weight: ["300", "400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
 title: "NOVAMONEY - Send Money Instantly",
 description: "Transfer money between supported currencies with the best exchange rates and zero fees",
 icons: {
   icon: "https://cldup.com/iMvs-lKmIe.svg",
   shortcut: "https://cldup.com/iMvs-lKmIe.svg",
   apple: "https://cldup.com/iMvs-lKmIe.svg",
 },
    generator: 'v0.dev'
}

export default function RootLayout({
 children,
}: {
 children: React.ReactNode
}) {
 return (
   <html lang="en">
     <body className={poppins.className}>
       <PostHogProvider>
         <AuthProvider>{children}</AuthProvider>
       </PostHogProvider>
     </body>
   </html>
 )
}
