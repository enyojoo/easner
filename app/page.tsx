"use client"

import { useRouter } from "next/navigation"
import { PublicHeader } from "@/components/layout/public-header"
import { CurrencyConverter } from "@/components/currency-converter"
import { useAuth } from "@/lib/auth-context"

export default function HomePage() {
  const router = useRouter()
  const { user, isAdmin } = useAuth()

  const handleSendMoney = (data: {
    sendAmount: string
    sendCurrency: string
    receiveCurrency: string
    receiveAmount: number
    exchangeRate: number
    fee: number
  }) => {
    if (user) {
      if (isAdmin) {
        router.push("/admin/dashboard")
      } else {
        // User is logged in, go to send page with conversion data
        const params = new URLSearchParams({
          sendAmount: data.sendAmount,
          sendCurrency: data.sendCurrency,
          receiveCurrency: data.receiveCurrency,
          receiveAmount: data.receiveAmount.toString(),
          exchangeRate: data.exchangeRate.toString(),
          fee: data.fee.toString(),
          step: "2",
        })
        router.push(`/user/send?${params.toString()}`)
      }
    } else {
      // User is not logged in, store conversion data and redirect to login
      sessionStorage.setItem("redirectAfterLogin", "/user/send")
      sessionStorage.setItem("conversionData", JSON.stringify(data))
      router.push("/login")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-novapay-primary-50 via-white to-blue-50">
      <PublicHeader />

      <main className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-novapay-primary-100 to-novapay-primary-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-100 to-novapay-primary-100 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 lg:pt-10 lg:pb-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[calc(100vh-200px)]">
            {/* Left Side - Hero Content */}
            <div className="space-y-6 lg:space-y-8 w-full text-center lg:text-left">
              <div className="space-y-4">
                <h1 className="sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-gray-900 text-5xl">
                  Send Money
                  <span className="block text-novapay-primary">Instantly</span>
                </h1>

                <p className="lg:text-2xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 text-lg">
                  Transfer money between supported currencies with the best exchange rates and zero fees
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 gap-2 lg:gap-2 w-full max-w-lg mx-auto lg:max-w-none lg:mx-0">
                <div className="group flex items-start space-x-4 p-4 rounded-2xl hover:bg-white/50 transition-all duration-300 text-left">
                  <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-amber-600 text-2xl">⚡</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-xl text-gray-900">Instant Transfers</h3>
                    <p className="text-gray-600 leading-relaxed">Money delivered within minutes</p>
                  </div>
                </div>

                <div className="group flex items-start space-x-4 p-4 rounded-2xl hover:bg-white/50 transition-all duration-300 text-left">
                  <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-green-600 text-2xl">🔒</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-xl text-gray-900">Secure & Safe</h3>
                    <p className="text-gray-600 leading-relaxed">Bank-level security for all transactions</p>
                  </div>
                </div>

                <div className="group flex items-start space-x-4 p-4 rounded-2xl hover:bg-white/50 transition-all duration-300 text-left">
                  <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-amber-600 text-2xl">💰</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-xl text-gray-900">Best Rates</h3>
                    <p className="text-gray-600 leading-relaxed">Competitive exchange rates, zero fees</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Currency Converter */}
            <div className="flex justify-center w-full">
              <div className="w-full max-w-md">
                <CurrencyConverter onSendMoney={handleSendMoney} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
