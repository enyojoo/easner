"use client"

import { AuthGuard } from "@/components/auth-guard"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { Send, HelpCircle, MessageCircle, Phone, Mail } from "lucide-react"

export default function SupportPage() {
  const [ticketData, setTicketData] = useState({
    subject: "",
    category: "",
    priority: "medium",
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmitTicket = async () => {
    setSubmitting(true)
    try {
      // Submit support ticket logic here
      console.log("Support ticket submitted:", ticketData)
      setTicketData({
        subject: "",
        category: "",
        priority: "medium",
        message: "",
      })
    } catch (error) {
      console.error("Error submitting ticket:", error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthGuard requireAuth={true}>
      <UserDashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
              <p className="text-gray-600">Get help with your account and transactions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Submit a Support Ticket
                </CardTitle>
                <CardDescription>Describe your issue and we'll get back to you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={ticketData.subject}
                    onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={ticketData.category}
                      onValueChange={(value) => setTicketData({ ...ticketData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transaction">Transaction Issue</SelectItem>
                        <SelectItem value="account">Account Problem</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="billing">Billing Question</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={ticketData.priority}
                      onValueChange={(value) => setTicketData({ ...ticketData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={ticketData.message}
                    onChange={(e) => setTicketData({ ...ticketData, message: e.target.value })}
                    placeholder="Please provide detailed information about your issue..."
                    rows={6}
                  />
                </div>
                <Button
                  onClick={handleSubmitTicket}
                  disabled={submitting || !ticketData.subject || !ticketData.category || !ticketData.message}
                  className="w-full bg-novapay-primary hover:bg-novapay-primary-600"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? "Submitting..." : "Submit Ticket"}
                </Button>
              </CardContent>
            </Card>

            {/* Contact Information & FAQ */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-novapay-primary" />
                    <div>
                      <p className="font-medium">Email Support</p>
                      <p className="text-sm text-gray-600">support@novapay.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-novapay-primary" />
                    <div>
                      <p className="font-medium">Phone Support</p>
                      <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>Business Hours:</strong>
                    </p>
                    <p>Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                    <p>Saturday: 10:00 AM - 4:00 PM EST</p>
                    <p>Sunday: Closed</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">How long do transfers take?</h4>
                    <p className="text-sm text-gray-600">
                      Most transfers are completed within 1-3 business days, depending on the destination country and
                      payment method.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">What are the transfer fees?</h4>
                    <p className="text-sm text-gray-600">
                      Fees vary by currency pair and transfer amount. You can see the exact fee before confirming your
                      transfer.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">How can I track my transfer?</h4>
                    <p className="text-sm text-gray-600">
                      You can track your transfer status in the Transactions section of your dashboard.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </UserDashboardLayout>
    </AuthGuard>
  )
}
