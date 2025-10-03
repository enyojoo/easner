"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PublicHeader } from "@/components/layout/public-header"
import { CurrencyConverter } from "@/components/currency-converter"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Shield, Zap, Globe, Users, TrendingUp, CheckCircle, Star, Download, Code, Building2, Heart, Smartphone, Send, DollarSign, Clock, Lock } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function HomePage() {
  const router = useRouter()
  const [accordionValue, setAccordionValue] = useState("item-0")

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

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-easner-primary-50 to-blue-50 py-8 sm:py-12 md:py-12 lg:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
              {/* Left Side - Hero Content */}
              <div className="space-y-6 sm:space-y-8 order-1 lg:order-1 text-center lg:text-left">
                <div className="space-y-4 sm:space-y-6">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-bold leading-tight text-gray-900 font-unbounded">
                    Send money
                    <br />
                    globally like
                    <br />
                    <span className="text-easner-primary">a domestic</span>
                    <br />
                    <span className="text-easner-primary">transfer</span>
                  </h1>

                  <p className="text-lg sm:text-xl md:text-2xl lg:text-xl text-gray-600 leading-relaxed max-w-2xl font-poppins text-center lg:text-left">
                    Stop losing money to fees. Easner uses stablecoin infrastructure to make cross-border payments as simple and affordable as sending money to your neighbor.
                  </p>
                </div>

                {/* Key Benefits */}
                <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-xl mx-auto lg:mx-0">
                  <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                      <Clock className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="font-semibold text-gray-900 font-unbounded text-xs sm:text-sm">Instant</div>
                  </div>
                  <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="font-semibold text-gray-900 font-unbounded text-xs sm:text-sm">Zero fees</div>
                  </div>
                  <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                      <Lock className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="font-semibold text-gray-900 font-unbounded text-xs sm:text-sm">Secure</div>
                  </div>
                </div>
              </div>

              {/* Right Side - Currency Converter */}
              <div className="flex justify-center lg:justify-end order-2 lg:order-2">
                <div className="w-full max-w-sm sm:max-w-sm md:max-w-md">
                  <div id="currency-converter" className="relative">
                    <CurrencyConverter onSendMoney={handleSendMoney} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 font-unbounded">
                The hidden cost of sending money abroad
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-poppins">
                Traditional money transfer services charge up to 15% in fees and take days to process. That's money that could stay in your pocket.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start">
              {/* The Problem */}
              <div className="space-y-4 sm:space-y-6 md:space-y-8">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6 md:p-8">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-red-800 mb-3 sm:mb-4 md:mb-6 font-unbounded">Traditional Services</h3>
                  <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between py-2 sm:py-3 border-b border-red-100">
                      <span className="text-xs sm:text-sm md:text-base text-gray-700">Transfer $1,000 to Nigeria</span>
                      <span className="text-xs sm:text-sm md:text-base text-red-600 font-semibold">$150 in fees</span>
                    </div>
                    <div className="flex items-center justify-between py-2 sm:py-3 border-b border-red-100">
                      <span className="text-xs sm:text-sm md:text-base text-gray-700">Processing time</span>
                      <span className="text-xs sm:text-sm md:text-base text-red-600 font-semibold">3-5 business days</span>
                    </div>
                    <div className="flex items-center justify-between py-2 sm:py-3 border-b border-red-100">
                      <span className="text-xs sm:text-sm md:text-base text-gray-700">Hidden costs</span>
                      <span className="text-xs sm:text-sm md:text-base text-red-600 font-semibold">Poor exchange rates</span>
                    </div>
                    <div className="flex items-center justify-between py-2 sm:py-3">
                      <span className="text-xs sm:text-sm md:text-base text-gray-700">Complex process</span>
                      <span className="text-xs sm:text-sm md:text-base text-red-600 font-semibold">Multiple steps</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* The Solution */}
              <div className="space-y-4 sm:space-y-6 md:space-y-8">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 sm:p-6 md:p-8">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-green-800 mb-3 sm:mb-4 md:mb-6 font-unbounded">With Easner</h3>
                  <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between py-2 sm:py-3 border-b border-green-100">
                      <span className="text-xs sm:text-sm md:text-base text-gray-700">Transfer $1,000 to Nigeria</span>
                      <span className="text-xs sm:text-sm md:text-base text-green-600 font-semibold">$0 in fees</span>
                    </div>
                    <div className="flex items-center justify-between py-2 sm:py-3 border-b border-green-100">
                      <span className="text-xs sm:text-sm md:text-base text-gray-700">Processing time</span>
                      <span className="text-xs sm:text-sm md:text-base text-green-600 font-semibold">Minutes</span>
                    </div>
                    <div className="flex items-center justify-between py-2 sm:py-3 border-b border-green-100">
                      <span className="text-xs sm:text-sm md:text-base text-gray-700">Exchange rates</span>
                      <span className="text-xs sm:text-sm md:text-base text-green-600 font-semibold">Real-time, transparent</span>
                    </div>
                    <div className="flex items-center justify-between py-2 sm:py-3">
                      <span className="text-xs sm:text-sm md:text-base text-gray-700">Process</span>
                      <span className="text-xs sm:text-sm md:text-base text-green-600 font-semibold">One simple form</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Savings Highlight */}
            <div className="mt-8 sm:mt-12 md:mt-16 text-center">
              <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-6 rounded-2xl bg-easner-primary-50 border border-easner-primary-200">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-easner-primary flex-shrink-0" />
                <span className="text-base sm:text-lg md:text-2xl font-bold text-gray-900 font-unbounded text-center">
                  Save <span className="text-easner-primary">$150</span> on every $1,000 transfer
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 sm:py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 font-unbounded">
                How Easner works
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-poppins">
                We've simplified international money transfers into three easy steps
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  step: "1",
                  title: "Enter details",
                  description: "Tell us how much you want to send, where it's going, and who should receive it.",
                  icon: <Send className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-easner-primary" />
                },
                {
                  step: "2", 
                  title: "We handle the rest",
                  description: "Our AI handles compliance, finds the best exchange rate, and processes your transfer.",
                  icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-easner-primary" />
                },
                {
                  step: "3",
                  title: "Money arrives",
                  description: "The recipient gets the money in their local bank account within minutes.",
                  icon: <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-easner-primary" />
                }
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-easner-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6">
                    {step.icon}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-easner-primary mb-2">STEP {step.step}</div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 font-unbounded">{step.title}</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 font-poppins leading-relaxed max-w-48 mx-auto">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 font-unbounded">
                Built on proven technology
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-poppins">
                We combine traditional banking with modern blockchain technology to make transfers faster and cheaper
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {[
                {
                  title: "Stellar Network",
                  description: "Lightning-fast stablecoin transfers that settle in seconds, not days.",
                  icon: <Globe className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-easner-primary" />
                },
                {
                  title: "AI Compliance",
                  description: "Automated verification and risk assessment that works 24/7.",
                  icon: <Shield className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-easner-primary" />
                },
                {
                  title: "Banking Integration",
                  description: "Seamless connection to local banks for easy money movement.",
                  icon: <Building2 className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-easner-primary" />
                }
              ].map((tech, index) => (
                <div key={index} className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-200">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-easner-primary-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4 md:mb-6">
                    {tech.icon}
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 font-unbounded">{tech.title}</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 font-poppins leading-relaxed">{tech.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who We Serve */}
        <section className="py-12 sm:py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 font-unbounded">
                Who we serve
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-poppins">
                From individuals to businesses, we make international payments accessible to everyone
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {[
                {
                  title: "Diaspora Families",
                  description: "Send money home to support your loved ones without the high fees.",
                  icon: "👨‍👩‍👧‍👦",
                  color: "from-pink-500 to-rose-500",
                  bgColor: "bg-pink-50",
                  borderColor: "border-pink-200",
                  features: ["Support family back home", "Send in local currency", "Track transfers in real-time", "Zero fees"]
                },
                {
                  title: "Small Businesses", 
                  description: "Pay suppliers and partners globally while keeping costs low.",
                  icon: "🏢",
                  color: "from-blue-500 to-indigo-500",
                  bgColor: "bg-blue-50",
                  borderColor: "border-blue-200",
                  features: ["Pay suppliers globally", "Reduce costs by 100%", "Faster settlement", "API integration"]
                },
                {
                  title: "Fintech Partners",
                  description: "Integrate our payment infrastructure into your platform.",
                  icon: "⚡",
                  color: "from-green-500 to-emerald-500",
                  bgColor: "bg-green-50",
                  borderColor: "border-green-200",
                  features: ["RESTful API", "Real-time webhooks", "SDKs available", "24/7 support"]
                }
              ].map((audience, index) => (
                <div key={index} className={`${audience.bgColor} ${audience.borderColor} border rounded-2xl p-4 sm:p-6 md:p-8 hover:shadow-lg transition-all duration-300 group`}>
                  <div className="text-center mb-3 sm:mb-4 md:mb-6">
                    <div className="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                      {audience.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 font-unbounded">{audience.title}</h3>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 font-poppins leading-relaxed">{audience.description}</p>
                  </div>
                  
                  <div className="space-y-1 sm:space-y-2 md:space-y-3">
                    {audience.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700">
                        <div className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full bg-gradient-to-r ${audience.color} flex items-center justify-center flex-shrink-0`}>
                          <CheckCircle className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 text-white" />
                        </div>
                        <span className="font-poppins">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3 sm:mt-4 md:mt-6 pt-3 sm:pt-4 md:pt-6 border-t border-gray-200">
                    <div className="text-center">
                      <span className="text-xs sm:text-sm text-gray-500 font-poppins">Perfect for</span>
                      <div className="mt-1">
                        {index === 0 && <span className="text-xs bg-pink-100 text-pink-700 px-2 sm:px-3 py-1 rounded-full font-medium">Personal Use</span>}
                        {index === 1 && <span className="text-xs bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full font-medium">Business Use</span>}
                        {index === 2 && <span className="text-xs bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full font-medium">Developer Use</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 font-unbounded">
                Frequently Asked Questions
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-poppins">
                Everything you need to know about sending money internationally with Easner
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full" value={accordionValue} onValueChange={setAccordionValue}>
              {[
                {
                  question: "How much does it cost to send money with Easner?",
                  answer: "Easner charges zero fees for international money transfers. You only pay the real-time exchange rate with no hidden costs, saving you up to 15% compared to traditional services."
                },
                {
                  question: "How fast are international money transfers?",
                  answer: "Transfers are processed instantly using stablecoin technology. Money typically arrives in the recipient's bank account within minutes, not days like traditional services."
                },
                {
                  question: "Which countries can I send money to?",
                  answer: "Currently, we support transfers to Nigeria, Ghana, Kenya, Uganda, and South Africa. We're constantly expanding to more countries to serve the global diaspora community."
                },
                {
                  question: "Is it safe to send money with Easner?",
                  answer: "Yes, Easner uses bank-level security and stablecoin technology. All transfers are encrypted and processed through regulated financial institutions. Your money is always safe."
                },
                {
                  question: "Do I need a bank account to use Easner?",
                  answer: "Yes, you need a bank account to send money, and your recipient needs a bank account to receive it. We're working on additional payment methods for the future."
                },
                {
                  question: "What currencies can I send money in?",
                  answer: "You can send money in USD, EUR, GBP, and other major currencies. Recipients receive money in their local currency (NGN, GHS, KES, UGX, ZAR)."
                },
                {
                  question: "How does Easner compare to Wise, Remitly, or WorldRemit?",
                  answer: "Easner offers zero fees compared to 0.5-3% fees charged by competitors. We also provide instant transfers using stablecoin technology, while traditional services can take 1-3 business days."
                },
                {
                  question: "Can businesses use Easner for international payments?",
                  answer: "Yes, Easner offers business accounts for companies making international payments to suppliers, partners, or employees. We provide API integration and bulk transfer capabilities."
                }
              ].map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-gray-50 rounded-2xl px-4 sm:px-6 md:px-8 mb-4 sm:mb-6">
                  <AccordionTrigger className="text-base sm:text-lg md:text-xl font-bold text-gray-900 font-unbounded hover:text-easner-primary hover:no-underline py-4 sm:py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm sm:text-base md:text-lg text-gray-600 font-poppins leading-relaxed pb-4 sm:pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-easner-primary">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 md:mb-6 font-unbounded">
              Ready to Send money?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8 md:mb-12 font-poppins max-w-4xl mx-auto">
              From diaspora families supporting loved ones back home to businesses making global operations easy, Easner is transforming how the world moves money.
            </p>

            <div className="flex justify-center">
              <Button 
                className="bg-white text-easner-primary hover:bg-gray-50 px-6 py-2.5 text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 group w-auto"
                onClick={() => router.push("/access")}
              >
                Get Early Access
                <Send className="ml-2 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-white/80 backdrop-blur-md">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between py-6 sm:py-8 gap-4">
            <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">© 2025 Easner Inc. All rights reserved.</div>
            <div className="flex items-center space-x-6 sm:space-x-8">
              <Link href="/terms" className="text-xs sm:text-sm text-gray-600 hover:text-easner-primary transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-xs sm:text-sm text-gray-600 hover:text-easner-primary transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
