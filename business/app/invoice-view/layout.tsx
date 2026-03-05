import { BusinessLogo } from "@/components/brand/business-logo"

export default function InvoiceViewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex justify-center pt-8 pb-4">
        <BusinessLogo size="lg" href="/" />
      </div>
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {children}
      </main>
    </div>
  )
}
