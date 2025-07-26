"use client"

import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"

export default function AdminUsersPage() {
  return (
    <AdminDashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">User Management</h1>
        <div className="text-gray-600">User management will be built here</div>
      </div>
    </AdminDashboardLayout>
  )
}
