import Link from "next/link"
import { Download } from "lucide-react"
import { BetaDownloadButtons } from "./beta-download-buttons"
import { SUPPORT_EMAIL } from "@/lib/marketing/constants"
import { downloadCard, downloadSupport } from "@/lib/marketing/content/download"

export function DownloadCard() {
  return (
    <section className="bg-[#F6F3EB] pb-12 pt-0 sm:pb-16 md:pb-24">
      <div className="mx-auto max-w-4xl space-y-4 px-4 sm:space-y-6 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[#E4DED1] bg-white/85 px-4 py-8 text-center shadow-[0_18px_60px_rgba(15,17,16,0.08)] backdrop-blur sm:rounded-[2rem] sm:px-10 sm:py-10 md:py-14">
          <div className="mx-auto w-full max-w-lg">
            <BetaDownloadButtons layout="grid" className="w-full" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#E4DED1] bg-[#F8F6F0] p-4 sm:rounded-[1.75rem] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-[#E4DED1] bg-white text-[#007ACC] sm:size-11">
              <Download className="size-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-balance font-unbounded text-base font-bold text-[#0F1110] sm:text-lg md:text-xl">
                {downloadCard.installHints.headline}
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 sm:gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-[#0F1110] sm:text-base">
                    {downloadCard.installHints.ios.label}
                  </h3>
                  <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-sm leading-6 text-[#5F665F] sm:text-base sm:leading-7">
                    {downloadCard.installHints.ios.steps.map((step) => (
                      <li key={step} className="text-pretty">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#0F1110] sm:text-base">
                    {downloadCard.installHints.android.label}
                  </h3>
                  <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-sm leading-6 text-[#5F665F] sm:text-base sm:leading-7">
                    {downloadCard.installHints.android.steps.map((step) => (
                      <li key={step} className="text-pretty">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E4DED1] bg-[#F8F6F0] p-4 sm:rounded-[1.75rem] sm:p-8">
          <div className="min-w-0 flex-1">
            <h2 className="text-balance font-unbounded text-base font-bold text-[#0F1110] sm:text-lg md:text-xl">
              {downloadSupport.headline}
            </h2>
            <p className="mt-2 text-pretty text-sm leading-6 text-[#5F665F] sm:text-base sm:leading-7">
              {downloadSupport.body}
            </p>
            <p className="mt-3 text-sm leading-6 text-[#5F665F] sm:mt-4 sm:text-base sm:leading-7">
              <strong className="text-[#0F1110]">{downloadSupport.emailLabel}:</strong>{" "}
              <Link
                href={`mailto:${SUPPORT_EMAIL}`}
                className="break-all font-semibold text-[#007ACC] hover:underline sm:break-normal"
              >
                {SUPPORT_EMAIL}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
