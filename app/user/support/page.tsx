"use client"

import type React from "react"

import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Mail,
  MessageCircle,
  Clock,
  Phone,
  AlertTriangle,
  Send,
  ExternalLink,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function UserSupportPage() {
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
    priority: "normal",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Reset form
    setContactForm({ subject: "", message: "", priority: "normal" })
    setIsSubmitting(false)

    // Show success message (you can implement toast notification here)
    alert("Your message has been sent! We'll get back to you within 24 hours.")
  }

  const faqItems = [
    {
      id: "transaction-time",
      question: "How long do transactions take?",
      answer:
        "Most transactions are processed within 5-30 minutes. Same currency transfers are usually instant, while cross-currency transfers may take up to 2 hours depending on the currencies involved.",
    },
    {
      id: "fees",
      question: "What are the transaction fees?",
      answer:
        "Fees vary by currency pair and transaction amount. You can see the exact fee before confirming any transaction. Many currency pairs have zero fees for transfers above certain amounts.",
    },
    {
      id: "limits",
      question: "Are there transaction limits?",
      answer:
        "Yes, there are daily and monthly limits based on your account verification level. You can view your current limits in your profile settings.",
    },
    {
      id: "security",
      question: "How secure are my transactions?",
      answer:
        "We use bank-level encryption and security measures. All transactions are monitored 24/7, and we never store your banking credentials.",
    },
    {
      id: "cancel",
      question: "Can I cancel a transaction?",
      answer:
        "You can cancel a transaction within 10 minutes of creation if it hasn't been processed yet. After processing begins, cancellation may not be possible.",
    },
  ]

  return (
    <UserDashboardLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Center</h1>
            <p className="text-gray-600">Get help with your NOVAPAY account and transactions</p>
          </div>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Email Support */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Email Support</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                <p className="text-gray-600 text-sm">Get detailed help via email</p>
                <div className="space-y-2">
                  <p className="font-medium text-novapay-primary">support@novapay.app</p>
                  <p className="text-xs text-gray-500">Response within 24 hours</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => window.open("mailto:support@novapay.app", "_blank")}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </CardContent>
            </Card>

            {/* WhatsApp Support */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">WhatsApp</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                <p className="text-gray-600 text-sm">Quick chat support</p>
                <div className="space-y-2">
                  <p className="font-medium text-novapay-primary">+1 (555) 123-4567</p>
                  <p className="text-xs text-gray-500">Available 9 AM - 6 PM UTC</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full bg-green-50 hover:bg-green-100"
                  onClick={() => window.open("https://wa.me/15551234567", "_blank")}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat on WhatsApp
                </Button>
              </CardContent>
            </Card>

            {/* X (Twitter) Support */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ExternalLink className="h-6 w-6 text-gray-600" />
                </div>
                <CardTitle className="text-lg">X (Twitter)</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                <p className="text-gray-600 text-sm">Public support & updates</p>
                <div className="space-y-2">
                  <p className="font-medium text-novapay-primary">@novapayapp</p>
                  <p className="text-xs text-gray-500">Follow for updates</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => window.open("https://twitter.com/novapayapp", "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Follow on X
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Support Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Support Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Email Support</h4>
                  <p className="text-sm text-gray-600">24/7 - We respond within 24 hours</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Live Chat (WhatsApp)</h4>
                  <p className="text-sm text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM UTC</p>
                  <p className="text-sm text-gray-600">Saturday: 10:00 AM - 4:00 PM UTC</p>
                  <p className="text-sm text-gray-600">Sunday: Closed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Contact Form</CardTitle>
              <p className="text-sm text-gray-600">Send us a message and we'll get back to you soon</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <select
                      id="priority"
                      value={contactForm.priority}
                      onChange={(e) => setContactForm({ ...contactForm, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-novapay-primary focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Please describe your issue in detail..."
                    rows={5}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-novapay-primary hover:bg-novapay-primary-600"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqItems.map((item) => (
                <Collapsible
                  key={item.id}
                  open={openFaq === item.id}
                  onOpenChange={(isOpen) => setOpenFaq(isOpen ? item.id : null)}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-4 h-auto text-left hover:bg-gray-50">
                      <span className="font-medium">{item.question}</span>
                      {openFaq === item.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Emergency Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 text-sm mb-3">
                For urgent issues like unauthorized transactions or account security concerns:
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100 bg-transparent"
                  onClick={() =>
                    window.open("mailto:emergency@novapay.app?subject=URGENT: Account Security Issue", "_blank")
                  }
                >
                  <Mail className="h-4 w-4 mr-2" />
                  emergency@novapay.app
                </Button>
                <Button
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100 bg-transparent"
                  onClick={() =>
                    window.open(
                      "https://wa.me/15551234567?text=URGENT: I need immediate help with my NOVAPAY account",
                      "_blank",
                    )
                  }
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Emergency WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </UserDashboardLayout>
  )
}
