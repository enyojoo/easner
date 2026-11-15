import { notFound } from "next/navigation"
import { devHarnessEnabled } from "@/lib/dev-harness"

export const dynamic = "force-dynamic"

/** `/dev/screens/<posts|authors|my-profile|media|categories|settings>`: the real screen on seeded in-memory rows, in the real shell. */
export default async function Page({ params }: { params: Promise<{ screen: string }> }) {
  // The import sits behind a build-time NODE_ENV check so production bundles never carry the seed data.
  if (process.env.NODE_ENV === "development") {
    if (devHarnessEnabled()) {
      const { screen } = await params
      const { ScreensHarness } = await import("./harness")
      return <ScreensHarness screen={screen} />
    }
  }
  notFound()
}
