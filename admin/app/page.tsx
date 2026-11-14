import { redirect } from "next/navigation"
import { ADMIN_HOME } from "@/lib/nav-config"

export default function Home() {
  redirect(ADMIN_HOME)
}
