"use client"

import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import { useState } from "react"

export default function UserSupportPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  const faqItems = [
    {
      question: 'How do I send money?',
      answer: 'To send money, click the "Send Money" button on your dashboard, enter the amount and select currencies, choose a recipient, make payment using the displayed method, and confirm your transaction.'
    },
    {
      question: 'What are the fees?',
      answer: 'We charge absolutely no fees on any transaction. Send money worldwide completely free with Easner.'
    },
    {
      question: 'How long does it take?',
      answer: 'All transactions are completed within 5 minutes or less, ensuring your money reaches its destination quickly and efficiently.'
    }
  ]

  const handleEmailSupport = () => {
    window.open("mailto:support@easner.com?subject=Support Request", "_blank")
  }

  const handleOpenTelegram = () => {
    window.open('https://t.me/enyosam', '_blank')
  }


  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index)
  }

  return (
    <UserDashboardLayout>
      <div className="space-y-0">
        {/* Header - Mobile Style */}
        <div className="bg-white p-5 sm:p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Support</h1>
          <p className="text-base text-gray-600">We're here to help you</p>
        </div>

        {/* Content */}
        <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-5 sm:pb-6 space-y-4 sm:space-y-5">
          {/* Contact Options */}
          <Card className="bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Get in Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              {/* Email Support */}
              <div 
                className="flex items-center justify-between py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={handleEmailSupport}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">📧</div>
                  <div>
                    <h3 className="font-medium text-gray-900">Email Support</h3>
                    <p className="text-sm text-gray-600">support@easner.com</p>
                  </div>
                </div>
                <div className="text-gray-400">›</div>
              </div>

              {/* Telegram Chat */}
              <div 
                className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={handleOpenTelegram}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">💬</div>
                  <div>
                    <h3 className="font-medium text-gray-900">Telegram Chat</h3>
                    <p className="text-sm text-gray-600">Chat with us on Telegram</p>
                  </div>
                </div>
                <div className="text-gray-400">›</div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              {faqItems.map((item, index) => (
                <div key={index} className="border-b border-gray-100 last:border-b-0">
                  <button
                    className="w-full text-left py-4 focus:outline-none"
                    onClick={() => toggleFAQ(index)}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 pr-4">{item.question}</h3>
                      <div className="text-gray-400 transform transition-transform duration-200">
                        {expandedFAQ === index ? '−' : '+'}
                      </div>
                    </div>
                  </button>
                  {expandedFAQ === index && (
                    <div className="pb-4">
                      <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Support Hours */}
          <Card className="bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Support Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">All week from 8 am to 11pm GMT+3</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </UserDashboardLayout>
  )
}
