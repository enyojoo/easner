'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Code2, ShieldCheck, CreditCard, BarChart3, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import { PublicHeader } from '@/components/layout/public-header'
import { CurrencyConverter } from '@/components/currency-converter'

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
      <main className="min-h-screen">
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
              <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">© 2025 Easner Inc.</div>
              <div className="flex items-center space-x-6 sm:space-x-8">
                <Link href="/terms" className="text-xs sm:text-sm text-gray-500 hover:text-easner-primary transition-colors">
                  Terms
                </Link>
                <Link href="/privacy" className="text-xs sm:text-sm text-gray-500 hover:text-easner-primary transition-colors">
                  Privacy Policy
                </Link>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-400 text-center max-w-4xl mx-auto leading-relaxed">
                Easner is not a bank and does not hold cryptocurrency or other digital assets. All financial services are provided through licensed partners and regulated financial institutions. Easner acts as a technology platform facilitating money movement services.
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
    <section className="relative bg-gradient-to-br from-easner-primary-50 via-blue-50 to-purple-50 py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-easner-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left Side - Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 sm:space-y-8 order-1 lg:order-1 text-center lg:text-left"
          >
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-bold leading-tight text-gray-900 font-unbounded">
                Money Move
                <br />
                <span className="text-easner-primary">Globally Like SMS</span>.
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-xl text-gray-500 leading-relaxed max-w-2xl text-center lg:text-left">
                Easner lets individuals, businesses, and financial institutions send and receive money across borders — instantly, compliantly, and powered by stablecoins under the hood.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3 justify-center lg:justify-start">
              <Button size="lg" className="gap-2 bg-easner-primary hover:bg-easner-primary-600" onClick={() => router.push("/access")}>
                Early Access <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {/* Right Side - Currency Converter */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center lg:justify-end order-2 lg:order-2"
          >
            <div className="w-full max-w-sm sm:max-w-sm md:max-w-md">
              <div id="currency-converter" className="relative">
                <CurrencyConverter onSendMoney={onSendMoney} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Section 2: Easner for Individuals
function EasnerForIndividuals() {
  const router = useRouter()

  return (
    <section className="bg-gray-50 py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-unbounded mb-6">
                Send money anywhere. Instantly.
              </h2>
              <p className="text-lg md:text-xl text-gray-500 leading-relaxed mb-8">
                No wallets. No crypto apps. No waiting days. Just low-cost, bank-to-bank transfers between Europe, Africa, and Asia — powered by Stablecoins under the hood, making global payments instant.
              </p>
              <Button size="lg" className="gap-2 bg-easner-primary hover:bg-easner-primary-600" onClick={() => router.push("/access")}>
                Early Access <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative overflow-hidden">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative w-full rounded-lg overflow-hidden shadow-xl border-2 border-easner-primary"
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
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative overflow-hidden order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative w-full rounded-lg overflow-hidden shadow-xl border-2 border-easner-primary"
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
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-unbounded mb-6">
                Business banking without borders.
              </h2>
              <p className="text-lg md:text-xl text-gray-500 leading-relaxed mb-8">
                Manage accounts, cards, invoices, and cross-border payments from one dashboard. Automate payouts, FX, and treasury operations through the Easner API — with compliance, reconciliation, and transparency built in.
              </p>
              <Button size="lg" className="gap-2 bg-easner-primary hover:bg-easner-primary-600" onClick={() => router.push("/access")}>
                Early Access <ArrowRight className="h-4 w-4" />
              </Button>
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
    <section className="bg-gray-50 py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-unbounded mb-6">
                Compliance is built in, not added later.
              </h2>
              <p className="text-lg md:text-xl text-gray-500 leading-relaxed mb-8">
                Easner embeds verification, AML, and encryption at the core of every transaction powered by Stellar. Our partners move money globally with full confidence in security and oversight.
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
                className="relative w-full max-w-md"
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
    <section className="py-16 md:py-20 relative">
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
            Built in Europe. Connecting the world.
          </h2>
          <p className="text-lg md:text-xl text-gray-500 leading-relaxed">
            From the EU to Africa and Asia, Easner provides financial infrastructure that makes global money movement simple, compliant, and instant — for individuals, SMEs, and institutions alike.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" className="gap-2 bg-easner-primary hover:bg-easner-primary-600 shadow-md" onClick={() => router.push("/access")}>
              Early Access <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2 border-easner-primary/30 hover:bg-easner-primary/5" onClick={() => router.push("/access")}>
              Explore the API
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

