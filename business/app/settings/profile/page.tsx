import { redirect } from "next/navigation"

export default function ProfileSettingsRedirect() {
  redirect("/settings?tab=personal")
}
