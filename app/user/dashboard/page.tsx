import { ProtectedRoute } from "@/components/auth/protected-route"
import UserDashboardLayout from "./layout"

export default function UserDashboard() {
  return (
    <ProtectedRoute>
      <UserDashboardLayout>{/* existing page content */}</UserDashboardLayout>
    </ProtectedRoute>
  )
}
