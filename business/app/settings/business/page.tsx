import { redirect } from "next/navigation"

export default function BusinessSettingsRedirect() {
  redirect("/settings?tab=business")
}
