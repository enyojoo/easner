"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { PublicHeader } from "@/components/layout/public-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Shield, Zap, Globe, TrendingUp, Users, DollarSign } from "lucide-react"
import { currencyService } from "@/lib/database"

interface Currency {
  id: string
  code: string
  name: string
  symbol: string
  flag: string
}

interface ExchangeRate {
  id: string
  from_currency: string
  to_currency: string
  rate: number
  fee_type: string
  fee_amount: number
}

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()

  // Currency converter state
  const [sendAmount, setSendAmount] = useState("")
  const [sendCurrency, setSendCurrency] = useState("USD")
  const [receiveCurrency, setReceiveCurrency] = useState("NGN")
  const [receiveAmount, setReceiveAmount] = useState("")
  const [exchangeRate, setExchangeRate] = useState(0)
  const [loading, setLoading] = useState(false)

  // Data state
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)

  // Load currencies and exchange rates
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [currenciesData, ratesData] = await Promise.all([
          currencyService.getAll(),
          currencyService.getExchangeRates(),
        ])

        setCurrencies(currenciesData)
        setExchangeRates(ratesData)
        setDataLoaded(true)
      } catch (error) {
        console.error("Error loading data:", error)
        // Fallback to static data
        setCurrencies([
          { id: "1", code: "USD", name: "US Dollar", symbol: "$", flag: "/flags/usa.svg" },
          { id: "2", code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "/flags/nigeria.svg" },
          { id: "3", code: "GBP", name: "British Pound", symbol: "£", flag: "/flags/uk.svg" },
          { id: "4", code: "EUR", name: "Euro", symbol: "€", flag: "/flags/eu.svg" },
          { id: "5", code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "/flags/canada.svg" },
        ])
        setExchangeRates([
          { id: "1", from_currency: "USD", to_currency: "NGN", rate: 1650, fee_type: "free", fee_amount: 0 },
          { id: "2", from_currency: "GBP", to_currency: "NGN", rate: 2100, fee_type: "free", fee_amount: 0 },
          { id: "3", from_currency: "EUR", to_currency: "NGN", rate: 1800, fee_type: "free", fee_amount: 0 },
          { id: "4", from_currency: "CAD", to_currency: "NGN", rate: 1200, fee_type: "free", fee_amount: 0 },
        ])
        setDataLoaded(true)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Calculate exchange rate and receive amount
  useEffect(() => {
    if (!dataLoaded || !sendAmount || sendCurrency === receiveCurrency) {
      setReceiveAmount("")
      setExchangeRate(0)
      return
    }

    const rate = exchangeRates.find((r) => r.from_currency === sendCurrency && r.to_currency === receiveCurrency)

    if (rate) {
      const amount = Number.parseFloat(sendAmount)
      if (!isNaN(amount)) {
        const converted = amount * rate.rate
        setReceiveAmount(converted.toFixed(2))
        setExchangeRate(rate.rate)
      }
    } else {
      setReceiveAmount("")
      setExchangeRate(0)
    }
  }, [sendAmount, sendCurrency, receiveCurrency, exchangeRates, dataLoaded])

  const handleSendMoney = () => {
    if (!sendAmount || !receiveAmount || !exchangeRate) {
      return
    }

    const transactionData = {
      sendAmount: Number.parseFloat(sendAmount),
      sendCurrency,
      receiveAmount: Number.parseFloat(receiveAmount),
      receiveCurrency,
      exchangeRate,
    }

    if (user) {
      // User is logged in, go directly to send page with data
      const params = new URLSearchParams({
        sendAmount: sendAmount,
        sendCurrency,
        receiveAmount: receiveAmount,
        receiveCurrency,
        exchangeRate: exchangeRate.toString(),
      })
      router.push(`/user/send?${params.toString()}`)
    } else {
      // User not logged in, store data and redirect to login
      sessionStorage.setItem("pendingTransaction", JSON.stringify(transactionData))
      router.push("/login?redirect=/user/send")
    }
  }

  const getSendCurrencySymbol = () => {
    const currency = currencies.find((c) => c.code === sendCurrency)
    return currency?.symbol || "$"
  }

  const getReceiveCurrencySymbol = () => {
    const currency = currencies.find((c) => c.code === receiveCurrency)
    return currency?.symbol || "₦"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Send Money
              <span className="text-blue-600"> Globally</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Fast, secure, and affordable international money transfers. Send money to your loved ones anywhere in the
              world with the best exchange rates.
            </p>
          </div>

          {/* Currency Converter */}
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Send Money Now</CardTitle>
                <CardDescription className="text-center">
                  Get the best exchange rates with zero hidden fees
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Send Amount */}
                <div className="space-y-2">
                  <Label htmlFor="send-amount">You Send</Label>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Input
                        id="send-amount"
                        type="number"
                        placeholder="0.00"
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        className="text-lg h-12"
                      />
                    </div>
                    <Select value={sendCurrency} onValueChange={setSendCurrency}>
                      <SelectTrigger className="w-32 h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.id} value={currency.code}>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{currency.symbol}</span>
                              <span>{currency.code}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Exchange Rate Display */}
                {exchangeRate > 0 && (
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-600">
                      1 {sendCurrency} = {exchangeRate.toLocaleString()} {receiveCurrency}
                    </p>
                  </div>
                )}

                {/* Receive Amount */}
                <div className="space-y-2">
                  <Label htmlFor="receive-amount">Recipient Gets</Label>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Input
                        id="receive-amount"
                        type="text"
                        value={
                          receiveAmount
                            ? `${getReceiveCurrencySymbol()}${Number.parseFloat(receiveAmount).toLocaleString()}`
                            : ""
                        }
                        readOnly
                        className="text-lg h-12 bg-gray-50"
                        placeholder="0.00"
                      />
                    </div>
                    <Select value={receiveCurrency} onValueChange={setReceiveCurrency}>
                      <SelectTrigger className="w-32 h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.id} value={currency.code}>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{currency.symbol}</span>
                              <span>{currency.code}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Send Money Button */}
                <Button
                  onClick={handleSendMoney}
                  disabled={!sendAmount || !receiveAmount || loading}
                  className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "Loading..." : "Send Money"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                {/* Fee Information */}
                <div className="text-center text-sm text-gray-600">
                  <p>✓ No hidden fees • ✓ Best exchange rates • ✓ Secure transfers</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose NovaPay?</h2>
            <p className="text-xl text-gray-600">Experience the future of international money transfers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600">
                Send money in minutes, not days. Our advanced technology ensures rapid transfers worldwide.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Bank-Level Security</h3>
              <p className="text-gray-600">
                Your money and data are protected with enterprise-grade encryption and security measures.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Reach</h3>
              <p className="text-gray-600">
                Send money to over 100 countries with competitive exchange rates and low fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">1M+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>

            <div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">$2B+</div>
              <div className="text-gray-600">Money Transferred</div>
            </div>

            <div>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">99.9%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Send Money?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join millions of users who trust NovaPay for their international transfers
          </p>
          <div className="space-x-4">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => router.push("/register")}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/login")}
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">NovaPay</h3>
              <p className="text-gray-400">Making international money transfers simple, fast, and affordable.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Send Money</li>
                <li>Exchange Rates</li>
                <li>Mobile App</li>
                <li>Business</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Security</li>
                <li>Status</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Careers</li>
                <li>Press</li>
                <li>Legal</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 NovaPay. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
