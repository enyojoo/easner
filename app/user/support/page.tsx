"use client"

import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, MessageCircle, Clock, ExternalLink } from "lucide-react"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function UserSupportPage() {
  return (
    <AuthGuard requireAuth={true}>
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
          </div>
        </div>
      </UserDashboardLayout>
    </AuthGuard>
  )
}
