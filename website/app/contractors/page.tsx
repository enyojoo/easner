import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"

export default function ContractorsPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main className="pt-16">
        <section className="py-20 md:py-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 font-unbounded">
              Contractors
            </h1>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}
