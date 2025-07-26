"use client"

import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"

export default function UserTransactionsPage() {
  return (
    <UserDashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Transactions</h1>
        <div className="text-gray-600">Transaction history will be built here</div>
      </div>
    </UserDashboardLayout>
  )
}
