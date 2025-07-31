import { AuthGuard } from "@/components/auth-guard"
import AdminDashboardLayout from "@/layouts/admin-dashboard"

export default function AdminSettingsPage() {
  // ... existing code ...

  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      <AdminDashboardLayout>{/* ... existing page content ... */}</AdminDashboardLayout>
    </AuthGuard>
  )
}
