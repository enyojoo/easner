import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"
import { NotFoundActions } from "@/components/marketing/not-found-actions"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F6F3EB] text-[#0F1110]">
      <PublicHeader />
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 pt-[4.5rem] pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6F756F]">404</p>
          <h1 className="mt-4 font-unbounded text-3xl font-bold leading-tight text-[#0F1110] sm:text-4xl">
            Page not found
          </h1>
          <p className="mt-4 text-lg leading-8 text-[#5F665F]">
            The page you are looking for does not exist or may have moved.
          </p>
          <NotFoundActions />
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
