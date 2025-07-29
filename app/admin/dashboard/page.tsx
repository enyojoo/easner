import { AuthGuard } from "@/components/auth/auth-guard"
import AdminDashboardLayout from "@/layouts/admin-dashboard-layout"

export default function AdminDashboardPage() {
  // ... existing code ...

  return (
    <AuthGuard requireAdmin>
      <AdminDashboardLayout>{/* ... existing JSX content ... */}</AdminDashboardLayout>
    </AuthGuard>
  )
}
