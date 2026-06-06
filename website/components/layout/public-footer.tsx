import Link from "next/link"
import { Linkedin } from "lucide-react"
import { CONTACT_PATH } from "@/lib/marketing/constants"

export function PublicFooter() {
  return (
    <footer className="w-full border-t border-[#E4DED1] bg-white/86 backdrop-blur-md">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex flex-col items-center sm:items-start gap-2">
              <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                © {new Date().getFullYear()} Easner Group, Inc.
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="https://x.com/easnerbanking"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-easner-primary transition-colors"
                  aria-label="X (Twitter)"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/company/easner/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-easner-primary transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-6 gap-y-2 sm:space-x-0">
              <Link
                href="/terms"
                className="text-xs sm:text-sm text-gray-500 hover:text-easner-primary transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="text-xs sm:text-sm text-gray-500 hover:text-easner-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/compliance"
                className="text-xs sm:text-sm text-gray-500 hover:text-easner-primary transition-colors"
              >
                Compliance
              </Link>
            </div>
          </div>
          <div className="text-center sm:text-left text-xs sm:text-sm text-gray-500 mb-4">
            <p>
              Have questions?{" "}
              <Link href={CONTACT_PATH} className="text-easner-primary hover:underline">
                Contact us
              </Link>
              .
            </p>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-400 text-center sm:text-left max-w-4xl mx-auto space-y-3 leading-relaxed">
              <p>
                Easner Group, Inc. (&quot;Easner&quot;) is a financial technology company, not a bank or
                investment adviser. Banking, payment, verification, and card services available through
                Easner Personal (mobile app) and Easner Business (web dashboard) are provided by licensed
                partners. Easner does not provide investment, legal, tax, or financial advice.
              </p>
              <p>
                Easner is not FDIC-insured and does not hold customer deposits. Banking services are
                provided by third-party banking partners, not by Easner.
              </p>
              <p>
                Where enabled, stablecoin and wallet features are supported through infrastructure
                partners and may operate on public blockchains. Digital assets are not legal tender, are
                not backed by a government, and are not FDIC-insured or protected by SIPC. Blockchain
                transactions may be public and irreversible.
              </p>
              <p>
                Corporate and personal card products, when available, are issued by a third-party issuer
                and are subject to credit approval.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
