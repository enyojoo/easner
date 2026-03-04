import Link from "next/link"
import { Linkedin, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PublicFooter() {
  return (
    <footer className="w-full border-t bg-white/80 backdrop-blur-md">
      {/* CTA: Move Money with Ease */}
      <section className="py-20 md:py-28 bg-slate-50 relative">
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `url('https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/worldmap.svg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-unbounded mb-6">
              Move Money with Ease
            </h2>
            <p className="text-lg md:text-xl text-gray-500 leading-relaxed">
              From the US and EU to Africa and Asia, Easner provides financial infrastructure that makes global money movement simple, compliant, and instant — for individuals, SMEs, and institutions alike.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="gap-2 bg-easner-primary hover:bg-easner-primary-600 shadow-md">
                <Link href="/access">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex flex-col items-center sm:items-start gap-2">
              <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">© {new Date().getFullYear()} Easner Inc.</div>
              <div className="flex items-center gap-3">
                <a href="https://x.com/easnerapp" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-easner-primary transition-colors" aria-label="X (Twitter)">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="https://www.linkedin.com/company/easner/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-easner-primary transition-colors" aria-label="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-6 sm:space-x-8">
              <Link href="/blog" className="text-xs sm:text-sm text-gray-500 hover:text-easner-primary transition-colors">Blog</Link>
              <Link href="/about" className="text-xs sm:text-sm text-gray-500 hover:text-easner-primary transition-colors">About</Link>
              <Link href="/terms" className="text-xs sm:text-sm text-gray-500 hover:text-easner-primary transition-colors">Terms</Link>
              <Link href="/privacy" className="text-xs sm:text-sm text-gray-500 hover:text-easner-primary transition-colors">Privacy Policy</Link>
            </div>
          </div>
          <div className="text-center sm:text-left text-xs sm:text-sm text-gray-500 mb-4">
            <p>Have questions? Email us at{" "}
              <a href="mailto:hello@easner.com" className="text-easner-primary hover:underline">hello@easner.com</a>
            </p>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center max-w-4xl mx-auto leading-relaxed">
              Easner is a financial technology company and not a bank, exchange, or asset custodian. Easner does not facilitate FDIC insurance or hold deposits. Easner acts as a technology platform facilitating money movement services. Payment products are provided in partnership with licensed institutions. Cards are issued by partners licensed in their respective jurisdictions.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
