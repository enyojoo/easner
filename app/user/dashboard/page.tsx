import { AuthGuard } from "@/components/auth-guard"
import UserDashboardLayout from "./layout"

export default function UserDashboardPage() {
  // ... existing code ...

  return (
    <AuthGuard requireAuth={true}>
      <UserDashboardLayout>{/* ... existing page content ... */}</UserDashboardLayout>
    </AuthGuard>
  )
}
