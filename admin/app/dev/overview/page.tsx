import { notFound } from "next/navigation"
import { devHarnessEnabled } from "@/lib/dev-harness"

export const dynamic = "force-dynamic"

export default async function Page() {
  // Same guard as /dev/analytics: the import sits behind a build-time NODE_ENV check, so production bundles never carry the sample data.
  if (process.env.NODE_ENV === "development") {
    if (devHarnessEnabled()) {
      const { OverviewHarness } = await import("./harness")
      return <OverviewHarness />
    }
  }
  notFound()
}
