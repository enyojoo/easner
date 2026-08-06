import Link from "next/link"
import { PersonalBankingCtas } from "./personal-banking-ctas"
import { DownloadEmailForm } from "./download-email-form"
import { DownloadQr } from "./download-qr"
import { SUPPORT_EMAIL } from "@/lib/marketing/constants"
import { downloadCard, downloadSupport } from "@/lib/marketing/content/download"

export function DownloadCard() {
  return (
    <section className="bg-[#F6F3EB] pb-12 pt-0 sm:pb-16 md:pb-24">
      <div className="mx-auto max-w-4xl space-y-4 px-4 sm:space-y-6 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[#E4DED1] bg-white/85 px-4 py-8 text-center shadow-[0_18px_60px_rgba(15,17,16,0.08)] backdrop-blur sm:rounded-[2rem] sm:px-10 sm:py-10 md:py-14">
          <p className="text-sm font-medium text-[#6F756F] sm:text-[15px]">{downloadCard.qrLabel}</p>
          <div className="mt-4 flex justify-center sm:mt-5">
            <DownloadQr size={188} />
          </div>
          <p className="mt-6 text-[13px] leading-5 text-[#6F756F] sm:text-sm">
            {downloadCard.emailDivider}
          </p>
          <div className="mx-auto mt-3 w-full max-w-md">
            <DownloadEmailForm src="download-page" />
          </div>
          <div className="mt-6 flex justify-center">
            <PersonalBankingCtas surface="download-page" align="center" />
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
