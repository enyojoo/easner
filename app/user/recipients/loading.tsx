import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"

export default function Loading() {
  return (
    <UserDashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-novapay-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading recipients...</p>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  )
}
