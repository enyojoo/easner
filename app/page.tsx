"use client"

import { useRouter } from "next/navigation"
import { PublicHeader } from "@/components/layout/public-header"
import { CurrencyConverter } from "@/components/currency-converter"

export default function HomePage() {
  const router = useRouter()

  const handleSendMoney = () => {
    // Redirect to login if not authenticated
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
      <PublicHeader />

      <main className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[600px]">
          {/* Left Side - Hero Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Send Money
                <span className="text-purple-600"> Instantly</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Transfer money between Russia and Nigeria with the best exchange rates and zero fees
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-xl">⚡</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Instant Transfers</h3>
                  <p className="text-gray-600">Money delivered within minutes</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-xl">🔒</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Secure & Safe</h3>
                  <p className="text-gray-600">Bank-level security for all transactions</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-xl">💰</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Best Rates</h3>
                  <p className="text-gray-600">Competitive exchange rates, zero fees</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Currency Converter */}
          <div className="flex justify-center lg:justify-end">
            <CurrencyConverter onSendMoney={handleSendMoney} />
          </div>
        </div>
      </main>
    </div>
  )
}
