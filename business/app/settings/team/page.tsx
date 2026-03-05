import { redirect } from "next/navigation"

export default function TeamSettingsRedirect() {
  redirect("/settings?tab=team")
}
