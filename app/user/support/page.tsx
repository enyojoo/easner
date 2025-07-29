"use client"

import type React from "react"
import { useState } from "react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageCircle, Phone, Mail, Clock, Send, AlertCircle, CheckCircle } from "lucide-react"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function UserSupportPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    priority: "medium",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setMessage({ type: "success", text: "Your support request has been submitted successfully!" })
      setFormData({
        subject: "",
        message: "",
        priority: "medium",
      })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to submit support request. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard requireAuth={true}>
      <UserDashboardLayout>
        <div className="p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
              <p className="text-gray-600">Get help with your account and transactions</p>
            </div>

            {/* Contact Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
                  <p className="text-sm text-gray-600 mb-4">Chat with our support team in real-time</p>
                  <Button variant="outline" className="w-full bg-transparent">
                    Start Chat
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
                  <p className="text-sm text-gray-600 mb-4">Call us for immediate assistance</p>
                  <Button variant="outline" className="w-full bg-transparent">
                    +1 (555) 123-4567
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
                  <p className="text-sm text-gray-600 mb-4">Send us an email for detailed help</p>
                  <Button variant="outline" className="w-full bg-transparent">
                    support@novapay.com
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Live Chat & Phone</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>Monday - Friday: 9:00 AM - 8:00 PM EST</li>
                      <li>Saturday: 10:00 AM - 6:00 PM EST</li>
                      <li>Sunday: 12:00 PM - 5:00 PM EST</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Email Support</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>24/7 - We respond within 24 hours</li>
                      <li>Priority support for urgent issues</li>
                      <li>Detailed responses with screenshots</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Submit a Support Request</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {message && (
                    <Alert
                      className={message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}
                    >
                      {message.type === "error" ? (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      <AlertDescription className={message.type === "error" ? "text-red-700" : "text-green-700"}>
                        {message.text}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Brief description of your issue"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-novapay-primary focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Please describe your issue in detail..."
                      rows={6}
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-novapay-primary hover:bg-novapay-primary-600"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {loading ? "Submitting..." : "Submit Request"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">How long do transfers take?</h4>
                    <p className="text-sm text-gray-600">
                      Most transfers are completed within 1-3 business days. Same-currency transfers are usually
                      instant.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">What are the transfer fees?</h4>
                    <p className="text-sm text-gray-600">
                      Fees vary by currency pair and transfer amount. You'll see the exact fee before confirming any
                      transfer.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">How can I track my transfer?</h4>
                    <p className="text-sm text-gray-600">
                      You can track all your transfers in the Transactions section of your dashboard using the
                      transaction ID.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Is my money safe?</h4>
                    <p className="text-sm text-gray-600">
                      Yes, we use bank-level security and encryption to protect your funds and personal information.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </UserDashboardLayout>
    </AuthGuard>
  )
}
