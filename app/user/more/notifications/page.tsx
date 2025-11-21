"use client"

import { useState } from "react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    transactions: true,
    security: true,
    marketing: false,
  })

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <UserDashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-1">
              <Link href="/user/more">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            </div>
            <p className="text-base text-gray-500 ml-12">Manage your notification preferences</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-6 lg:px-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Notification Channels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 pt-4">
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div className="space-y-0.5">
                  <Label htmlFor="email" className="text-base text-gray-900">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <Switch
                  id="email"
                  checked={notifications.email}
                  onCheckedChange={() => handleToggle("email")}
                />
              </div>
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div className="space-y-0.5">
                  <Label htmlFor="push" className="text-base text-gray-900">Push Notifications</Label>
                  <p className="text-sm text-gray-500">Receive push notifications</p>
                </div>
                <Switch
                  id="push"
                  checked={notifications.push}
                  onCheckedChange={() => handleToggle("push")}
                />
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="space-y-0.5">
                  <Label htmlFor="sms" className="text-base text-gray-900">SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                </div>
                <Switch
                  id="sms"
                  checked={notifications.sms}
                  onCheckedChange={() => handleToggle("sms")}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Notification Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 pt-4">
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div className="space-y-0.5">
                  <Label htmlFor="transactions" className="text-base text-gray-900">Transaction Updates</Label>
                  <p className="text-sm text-gray-500">Get notified about transaction status changes</p>
                </div>
                <Switch
                  id="transactions"
                  checked={notifications.transactions}
                  onCheckedChange={() => handleToggle("transactions")}
                />
              </div>
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div className="space-y-0.5">
                  <Label htmlFor="security" className="text-base text-gray-900">Security Alerts</Label>
                  <p className="text-sm text-gray-500">Receive important security notifications</p>
                </div>
                <Switch
                  id="security"
                  checked={notifications.security}
                  onCheckedChange={() => handleToggle("security")}
                />
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing" className="text-base text-gray-900">Marketing Updates</Label>
                  <p className="text-sm text-gray-500">Receive updates about new features and promotions</p>
                </div>
                <Switch
                  id="marketing"
                  checked={notifications.marketing}
                  onCheckedChange={() => handleToggle("marketing")}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </UserDashboardLayout>
  )
}

