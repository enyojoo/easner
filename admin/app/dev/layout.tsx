import { notFound } from "next/navigation"
import { devHarnessEnabled } from "@/lib/dev-harness"

/** Everything under /dev is a development tool: 404 unless NODE_ENV=development and ADMIN_DEV_HARNESS=1. */
export default function DevLayout({ children }: { children: React.ReactNode }) {
  if (!devHarnessEnabled()) notFound()
  return children
}
