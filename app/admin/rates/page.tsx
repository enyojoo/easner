import { AuthGuard } from "@/components/auth-guard"
import AdminDashboardLayout from "@/components/admin-dashboard-layout"

export default function AdminRatesPage() {
  // ... existing code ...

  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      <AdminDashboardLayout>{/* ... existing page content ... */}</AdminDashboardLayout>
    </AuthGuard>
  )
}
