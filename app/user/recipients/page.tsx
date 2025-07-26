"use client"

import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"

export default function UserRecipientsPage() {
  return (
    <UserDashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Recipients</h1>
        <div className="text-gray-600">Saved recipients will be built here</div>
      </div>
    </UserDashboardLayout>
  )
}
