import { ProtectedRoute } from "@/components/auth/protected-route"
import UserDashboardLayout from "@/components/layouts/user-dashboard-layout"

export default function SendMoney() {
  return (
    <ProtectedRoute>
      <UserDashboardLayout>{/* existing page content */}</UserDashboardLayout>
    </ProtectedRoute>
  )
}
