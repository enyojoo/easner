"use client"

import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Send, TrendingUp, Users, Clock } from "lucide-react"
import Link from "next/link"

// Mock data
const recentTransactions = [
  {
    id: "1",
    recipient: "John Doe",
    amount: "₦45,000.00",
    status: "completed",
    date: "2024-01-15",
    type: "sent",
  },
  {
    id: "2",
    recipient: "Jane Smith",
    amount: "₽12,500.00",
    status: "processing",
    date: "2024-01-14",
    type: "sent",
  },
  {
    id: "3",
    recipient: "Mike Johnson",
    amount: "₦78,900.00",
    status: "completed",
    date: "2024-01-13",
    type: "sent",
  },
]

export default function UserDashboardPage() {
  // Mock user name - this would come from auth context
  const userName = "Alex"

  return (
    <UserDashboardLayout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hi {userName} 👋🏻</h1>
          <p className="text-gray-600">Overview of your account and recent activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Sent</CardTitle>
              <TrendingUp className="h-4 w-4 text-novapay-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">₦2,450,000</div>
              <p className="text-xs text-green-600">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Transactions</CardTitle>
              <Send className="h-4 w-4 text-novapay-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">47</div>
              <p className="text-xs text-green-600">+3 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Recipients</CardTitle>
              <Users className="h-4 w-4 text-novapay-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">12</div>
              <p className="text-xs text-gray-500">Active recipients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg. Time</CardTitle>
              <Clock className="h-4 w-4 text-novapay-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">3.2 min</div>
              <p className="text-xs text-gray-500">Transfer time</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Send Money Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Quick Send</CardTitle>
              <CardDescription>Send money instantly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-novapay-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-8 w-8 text-novapay-primary" />
                </div>
                <p className="text-sm text-gray-600 mb-4">Start a new money transfer</p>
                <Link href="/user/send">
                  <Button className="w-full bg-novapay-primary hover:bg-novapay-primary-600">Send Money</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Transactions</CardTitle>
                <CardDescription>Your latest money transfers</CardDescription>
              </div>
              <Link href="/user/transactions">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-novapay-primary-100 rounded-full flex items-center justify-center">
                        <Send className="h-5 w-5 text-novapay-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.recipient}</p>
                        <p className="text-sm text-gray-500">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{transaction.amount}</p>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </UserDashboardLayout>
  )
}
