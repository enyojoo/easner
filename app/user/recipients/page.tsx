import { AuthGuard } from "@/components/auth-guard"
import UserDashboardLayout from "@/components/user-dashboard-layout"

export default function RecipientsPage() {
  // ... existing code ...

  return (
    <AuthGuard requireAuth={true}>
      <UserDashboardLayout>{/* ... existing page content ... */}</UserDashboardLayout>
    </AuthGuard>
  )
}
