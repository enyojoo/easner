import { AuthGuard } from "@/components/auth/auth-guard"
import UserDashboardLayout from "@/layouts/user-dashboard-layout"

export default function UserDashboardPage() {
  // ... existing code ...

  return (
    <AuthGuard>
      <UserDashboardLayout>{/* ... existing JSX content ... */}</UserDashboardLayout>
    </AuthGuard>
  )
}
