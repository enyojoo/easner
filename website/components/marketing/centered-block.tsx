"use client"

interface CenteredBlockProps {
  headline: string
  body: string
  stat?: string
  className?: string
}

export function CenteredBlock({ headline, body, stat, className = "bg-white" }: CenteredBlockProps) {
  return (
    <section className={`py-16 md:py-24 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-unbounded text-3xl font-semibold leading-tight text-[#0F1110] sm:text-4xl">{headline}</h2>
        <p className="mt-6 text-lg leading-8 text-[#5F665F]">{body}</p>
        {stat && (
          <div className="mt-8 inline-flex rounded-2xl border border-[#BFE3FA] bg-[#EAF5FD] px-6 py-4 text-sm font-semibold leading-7 text-[#0A2540] shadow-sm sm:text-base">
            {stat}
          </div>
        )}
      </div>
    </section>
  )
}
