"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, MessageCircle, Phone, Clock, HelpCircle, Shield, CreditCard, Users } from "lucide-react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"

export default function SupportPage() {
  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Center</h1>
          <p className="text-muted-foreground">Get help with your NOVAMONEY account and transactions</p>
        </div>

        {/* Contact Methods */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                Email Support
              </CardTitle>
              <CardDescription>Get help via email within 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => (window.location.href = "mailto:support@novamoney.net")}
              >
                support@novamoney.net
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                Live Chat
              </CardTitle>
              <CardDescription>Chat with our support team in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Start Chat</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-600" />
                Phone Support
              </CardTitle>
              <CardDescription>Call us for urgent matters</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-transparent">
                +1 (555) 123-4567
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Support Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Support Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <p className="font-medium">Email & Chat Support</p>
                <p className="text-sm text-muted-foreground">24/7 Available</p>
              </div>
              <div>
                <p className="font-medium">Phone Support</p>
                <p className="text-sm text-muted-foreground">Mon-Fri: 9AM-6PM EST</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Categories */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  Transactions & Payments
                </CardTitle>
                <CardDescription>Questions about sending money, fees, and payment methods</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Security & Verification
                </CardTitle>
                <CardDescription>Account security, verification, and privacy questions</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                  Account Management
                </CardTitle>
                <CardDescription>Profile settings, limits, and account-related questions</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                  General Help
                </CardTitle>
                <CardDescription>Getting started, features, and general platform questions</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>Follow Us</CardTitle>
            <CardDescription>Stay updated with the latest news and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => window.open("https://twitter.com/novamoneyapp", "_blank")}>
                <MessageCircle className="h-4 w-4 mr-2" />
                @novamoneyapp
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </UserDashboardLayout>
  )
}
