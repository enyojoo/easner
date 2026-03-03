'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle, Linkedin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { PublicHeader } from '@/components/layout/public-header'
import { CurrencyConverter } from '@/components/currency-converter'
import { TrustedBy } from '@/components/trusted-by'

export default function HomePage() {
  const router = useRouter()

  const handleSendMoney = (data: {
    sendAmount: string
    sendCurrency: string
    receiveCurrency: string
    receiveAmount: number
    exchangeRate: number
    fee: number
  }) => {
    // Redirect to early access form instead of normal flow
    router.push("/access")
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main
        className="min-h-screen"
        style={{ paddingTop: '4.5rem' }}
      >
        <Hero onSendMoney={handleSendMoney} />
        <EasnerForIndividuals />
        <EasnerForBusiness />
        <ComplianceSecurity />
        <GlobalReach />
      </main>
      {/* Footer */}
      <footer className="w-full border-t bg-white/80 backdrop-blur-md">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
              <div className="flex flex-col items-center sm:items-start gap-2">
                <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">© {new Date().getFullYear()} Easner Inc.</div>
                <div className="flex items-center gap-3">
                  <a href="https://x.com/easnerapp" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-easner-primary transition-colors" aria-label="X (Twitter)">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a href="https://www.linkedin.com/company/easner/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-easner-primary transition-colors" aria-label="LinkedIn">
                    <Linkedin className="h-4 w-4" />
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-6 sm:space-x-8">
                <Link href="/terms" className="text-xs sm:text-sm text-gray-500 hover:text-easner-primary transition-colors">
                  Terms
                </Link>
                <Link href="/privacy" className="text-xs sm:text-sm text-gray-500 hover:text-easner-primary transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/kyc-policy" className="text-xs sm:text-sm text-gray-500 hover:text-easner-primary transition-colors">
                  KYC Policy
                </Link>
                <Link href="/aml-policy" className="text-xs sm:text-sm text-gray-500 hover:text-easner-primary transition-colors">
                  AML Policy
                </Link>
              </div>
            </div>
            <div className="text-center sm:text-left text-xs sm:text-sm text-gray-500 mb-4">
              <p>Have questions about something else?</p>
              <p>
                Email us at{" "}
                <a href="mailto:hello@easner.com" className="text-easner-primary hover:underline">
                  hello@easner.com
                </a>
              </p>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-400 text-center max-w-4xl mx-auto leading-relaxed">
                Easner is a financial technology company and not a bank, exchange, or asset custodian. Easner does not facilitate FDIC insurance or hold deposits. Easner acts as a technology platform facilitating money movement services. Payment products are provided in partnership with licensed institutions. Cards are issued by partners licensed in their respective jurisdictions.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ----------------------- Sections -----------------------

function Hero({ onSendMoney }: { onSendMoney: (data: {
  sendAmount: string
  sendCurrency: string
  receiveCurrency: string
  receiveAmount: number
  exchangeRate: number
  fee: number
}) => void }) {
  const router = useRouter()

  return (
    <section className="relative bg-white pt-10 pb-8 sm:pt-12 sm:pb-10 md:pt-14 md:pb-12 lg:pt-16 lg:pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-easner-primary-50/10 pointer-events-none" style={{ clipPath: 'ellipse(80% 50% at 50% 0%)' }} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 sm:space-y-8"
        >
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-900 font-unbounded">
              Move Money
              <br />
              <span className="text-easner-primary">Globally Like SMS</span>.
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto">
              API-first cross-border payment infrastructure for US and EU businesses. Built-in KYC/AML, instant payouts, and treasury operations.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <Button size="lg" className="gap-2 bg-easner-primary hover:bg-easner-primary-600" onClick={() => router.push("/access")}>
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
      {/* Currency converter - secondary, below the fold feel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-12 sm:mt-16 pb-6 sm:pb-8 md:pb-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <div className="w-full max-w-sm sm:max-w-md">
            <CurrencyConverter onSendMoney={onSendMoney} />
          </div>
          <TrustedBy />
        </motion.div>
      </div>
    </section>
  )
}

// Section 2: Easner for Individuals
function EasnerForIndividuals() {
  const router = useRouter()

  return (
    <section className="bg-slate-50 py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-unbounded mb-6">
                Send money anywhere. Instantly.
              </h2>
              <p className="text-lg md:text-xl text-gray-500 leading-relaxed mb-8">
                No waiting days. Just low-cost, bank-to-bank transfers between the US, Europe, Africa, and Asia — making global payments instant.
              </p>
              <div className="flex justify-center lg:justify-start">
                <Button size="lg" className="gap-2 bg-easner-primary hover:bg-easner-primary-600" onClick={() => router.push("/access")}>
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="relative overflow-hidden">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative w-full rounded-2xl overflow-hidden shadow-xl border-2 border-easner-primary"
              >
                <Image
                  src="https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/ew1.png"
                  alt="Easner Web App"
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                  style={{ maxHeight: '500px', objectFit: 'contain' }}
                  unoptimized
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Section 3: Easner for Business
function EasnerForBusiness() {
  const router = useRouter()

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative overflow-hidden order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative w-full rounded-2xl overflow-hidden shadow-xl border-2 border-easner-primary"
              >
                <Image
                  src="https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/eb1.png"
                  alt="Easner Business Banking"
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                  style={{ maxHeight: '500px', objectFit: 'contain' }}
                  unoptimized
                />
              </motion.div>
            </div>
            <div className="order-1 lg:order-2 text-center lg:text-left flex flex-col items-center lg:items-start">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-unbounded mb-6">
                Business banking without borders.
              </h2>
              <p className="text-lg md:text-xl text-gray-500 leading-relaxed mb-8">
                Manage accounts, cards, invoices, and cross-border payments from one dashboard. Automate payouts, FX, and treasury operations through the Easner API — with compliance, reconciliation, and transparency built in.
              </p>
              <div className="flex justify-center lg:justify-start">
                <Button size="lg" className="gap-2 bg-easner-primary hover:bg-easner-primary-600" onClick={() => router.push("/access")}>
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Section 4: Compliance & Security
function ComplianceSecurity() {
  const complianceFeatures = [
    "Built-in KYC/KYB onboarding",
    "AI-powered AML and sanctions checks",
    "HSM-backed custody",
    "GDPR-compliant data residency"
  ]

  return (
    <section className="bg-slate-50 py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-unbounded mb-6">
                Compliance is built in, not added later.
              </h2>
              <p className="text-lg md:text-xl text-gray-500 leading-relaxed mb-8">
                Easner embeds verification, AML, and encryption at the core of every transaction. Our partners move money globally with full confidence in security and oversight.
              </p>
              <ul className="space-y-3">
                {complianceFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-easner-primary mt-0.5 flex-shrink-0" />
                    <span className="text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative flex justify-center lg:justify-end">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-xl border-2 border-easner-primary"
              >
                <Image
                  src="https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/security.svg"
                  alt="Security Shield"
                  width={600}
                  height={600}
                  className="w-full h-auto"
                  unoptimized
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Section 5: Global Reach
function GlobalReach() {
  const router = useRouter()

  return (
    <section className="py-20 md:py-28 bg-slate-50 relative">
      {/* World Map Background */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `url('https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/worldmap.svg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-unbounded mb-6">
            Move Money with Ease
          </h2>
          <p className="text-lg md:text-xl text-gray-500 leading-relaxed">
            From the US and EU to Africa and Asia, Easner provides financial infrastructure that makes global money movement simple, compliant, and instant — for individuals, SMEs, and institutions alike.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" className="gap-2 bg-easner-primary hover:bg-easner-primary-600 shadow-md" onClick={() => router.push("/access")}>
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

