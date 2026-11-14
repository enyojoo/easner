import type { ReactNode } from "react"
import { Monitor, Smartphone } from "lucide-react"
import { BRAND, BrandLogo } from "@easner/shared"

const COPY = {
  title: "Easner admin works best on a wide screen",
  lede: "Posts, the editor, media and analytics are laid out for a keyboard and plenty of horizontal room.",
  detail:
    "The admin isn't supported on phones or small tablets. Use a laptop, a desktop or a large tablet in landscape, then come back here.",
}

type DesktopMinViewportGateProps = {
  children: ReactNode
}

/**
 * Hides the app below the `lg` breakpoint (1024px) and shows a calm, explicit
 * explanation plus next steps. CSS-only (no resize listener) so there is no
 * layout flash on small viewports.
 */
export function DesktopMinViewportGate({ children }: DesktopMinViewportGateProps) {
  const copy = COPY

  return (
    <>
      <main
        className="fixed inset-0 z-[200] flex flex-col overflow-y-auto bg-background lg:hidden"
        aria-labelledby="easner-viewport-gate-title"
      >
        <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center gap-8 px-6 py-12 text-center">
          <BrandLogo href={BRAND.url} size="lg" className="mx-auto h-8 w-auto" />

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Screen size
            </p>
            <h1
              id="easner-viewport-gate-title"
              className="font-sans text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            >
              {copy.title}
            </h1>
            <p className="text-pretty text-base leading-relaxed text-muted-foreground">{copy.lede}</p>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{copy.detail}</p>
          </div>

          <ul className="flex flex-col gap-4 border-y border-border py-6 text-left text-sm text-muted-foreground">
            <li className="flex gap-3">
              <Monitor className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <span>
                <span className="font-medium text-foreground">Minimum width</span> – about 1024
                pixels wide. Many full-size tablets in <span className="text-foreground">landscape</span>{" "}
                qualify; most phones and small tablets in portrait do not.
              </span>
            </li>
            <li className="flex gap-3">
              <Smartphone className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <span>
                <span className="font-medium text-foreground">Reading the blog</span> – published posts are on{" "}
                <a href={BRAND.url} className="text-primary-text underline-offset-4 hover:underline">
                  easner.com
                </a>{" "}
                and work on any screen.
              </span>
            </li>
          </ul>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href={BRAND.url}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
            >
              Go to easner.com
            </a>
            <a
              href={`mailto:${BRAND.email}`}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-secondary px-6 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              Email support
            </a>
          </div>
        </div>
      </main>

      <div className="hidden min-h-dvh lg:block">{children}</div>
    </>
  )
}
