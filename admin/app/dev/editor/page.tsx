import { notFound } from "next/navigation"
import { devHarnessEnabled } from "@/lib/dev-harness"

export const dynamic = "force-dynamic"

export default async function Page() {
  // The import sits inside a branch on a build-time constant, so a production build drops the harness (and its
  // sample document) from the bundle entirely, not just from the routes.
  if (process.env.NODE_ENV === "development") {
    if (devHarnessEnabled()) {
      const { EditorHarness } = await import("./harness")
      return <EditorHarness />
    }
  }
  notFound()
}
