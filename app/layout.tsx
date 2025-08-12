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
 title: "NOVAMONEY - Send Money | International Money Transfer",
 description: "Transfer money between supported currencies with the best exchange rates and zero fees. Send money abroad and make international money transfer online for free.",
 keywords: "money transfer, send money abroad, international payments, send money app, transfer money overseas, international money transfer, transfer money online, send money online",
 formatDetection: {
   email: false,
   address: false,
   telephone: false,
 },
 metadataBase: new URL("https://www.novamoney.net"),
 alternates: {
   canonical: "/",
 },
 icons: {
   icon: "https://cldup.com/iMvs-lKmIe.svg",
   shortcut: "https://cldup.com/iMvs-lKmIe.svg",
   apple: "https://cldup.com/iMvs-lKmIe.svg",
 },
 openGraph: {
   title: "NOVAMONEY - Send Money | International Money Transfer",
   description: "Transfer money between supported currencies with the best exchange rates and zero fees. Send money abroad and make international money transfer online for free.",
   url: "https://www.novamoney.net",
   siteName: "NOVAMONEY",
   locale: "en_US",
   type: "website",
   images: [
     {
       url: "https://cldup.com/o8bbjNRTtm.png",
       width: 1200,
       height: 630,
       alt: "NOVAMONEY",
     },
   ],
 },
 twitter: {
   card: "summary_large_image",
   title: "NOVAMONEY - Send Money | International Money Transfer",
   description: "Transfer money between supported currencies with the best exchange rates and zero fees. Send money abroad and make international money transfer online for free.",
   creator: "@novamoneyapp",
   images: ["https://cldup.com/o8bbjNRTtm.png"],
 },
 robots: {
   index: true,
   follow: true,
   googleBot: {
     index: true,
     follow: true,
     "max-video-preview": -1,
     "max-image-preview": "large",
     "max-snippet": -1,
   },
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
