"use client"

import type React from "react"

import { useState } from "react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, MessageCircle, Twitter, Send, Clock, Shield } from "lucide-react"

export default function SupportPage() {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Support request:", formData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Support Center</h1>
          <p className="text-muted-foreground">Get help with your NOVAPAY account and transactions</p>
        </div>

        {/* Contact Methods */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="text-center">
              <Mail className="h-12 w-12 mx-auto text-blue-600" />
              <CardTitle>Email Support</CardTitle>
              <CardDescription>Send us an email for detailed inquiries</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full" onClick={() => window.open("mailto:support@novapay.com", "_blank")}>
                Email Us
              </Button>
              <p className="text-sm text-muted-foreground mt-2">support@novapay.com</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto text-green-600" />
              <CardTitle>WhatsApp</CardTitle>
              <CardDescription>Chat with us on WhatsApp for quick support</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => window.open("https://wa.me/2348123456789", "_blank")}
              >
                Chat on WhatsApp
              </Button>
              <p className="text-sm text-muted-foreground mt-2">+234 812 345 6789</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Twitter className="h-12 w-12 mx-auto text-blue-400" />
              <CardTitle>Twitter/X</CardTitle>
              <CardDescription>DM us on X for quick responses</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                className="w-full bg-black hover:bg-gray-800"
                onClick={() => window.open("https://x.com/novapayapp", "_blank")}
              >
                Message on X
              </Button>
              <p className="text-sm text-muted-foreground mt-2">@novapayapp</p>
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
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold">Email Support</h4>
                <p className="text-sm text-muted-foreground">24/7 - We respond within 24 hours</p>
              </div>
              <div>
                <h4 className="font-semibold">WhatsApp & X DM</h4>
                <p className="text-sm text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM (WAT)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Quick Contact Form
            </CardTitle>
            <CardDescription>Send us a message directly from here</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="What can we help you with?"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Describe your issue or question in detail..."
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold">How long do transactions take?</h4>
              <p className="text-sm text-muted-foreground">
                Most transactions are processed within 1-3 business days, depending on the destination country and
                payment method.
              </p>
            </div>
            <div>
              <h4 className="font-semibold">What are your exchange rates?</h4>
              <p className="text-sm text-muted-foreground">
                We offer competitive exchange rates that are updated in real-time. You can view current rates on the
                send money page.
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Is my money safe?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, NOVAPAY is fully regulated and your funds are protected. We use bank-level security to keep your
                money and data safe.
              </p>
            </div>
            <div>
              <h4 className="font-semibold">How can I track my transaction?</h4>
              <p className="text-sm text-muted-foreground">
                You can track your transaction status in real-time from your dashboard or transactions page using your
                transaction ID.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Shield className="h-5 w-5" />
              Emergency Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">
              For urgent issues related to failed transactions or security concerns, please contact us immediately via
              WhatsApp or email with "URGENT" in the subject line.
            </p>
          </CardContent>
        </Card>
      </div>
    </UserDashboardLayout>
  )
}
