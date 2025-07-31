import { AuthGuard } from "@/components/auth-guard"
import AdminDashboardLayout from "./layout"

export default function AdminDashboardPage() {
  // ... existing code ...

  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      <AdminDashboardLayout>{/* ... existing page content ... */}</AdminDashboardLayout>
    </AuthGuard>
  )
}
