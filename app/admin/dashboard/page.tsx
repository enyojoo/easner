"use client"

import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"

export default function AdminDashboardPage() {
  return (
    <AdminDashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
        <div className="text-gray-600">Admin overview will be built here</div>
      </div>
    </AdminDashboardLayout>
  )
}
