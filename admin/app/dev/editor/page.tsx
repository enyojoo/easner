import { notFound } from "next/navigation"
import { devHarnessEnabled } from "@/lib/dev-harness"

export const dynamic = "force-dynamic"

export default async function Page() {
  // The dynamic import sits behind a build-time constant (NODE_ENV), so a production build drops the harness entirely.
  if (process.env.NODE_ENV !== "development" || !devHarnessEnabled()) notFound()
  const { EditorHarness } = await import("./harness")
  return <EditorHarness />
}
