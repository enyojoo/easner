import { notFound } from "next/navigation"
import { UseCaseView } from "@/components/marketing/use-case-view"
import { findUseCase, useCasePath, useCasesFor } from "@/lib/marketing/content/use-cases"
import { marketingMetadata } from "@/lib/marketing/metadata"
import { socialImages } from "@/lib/marketing/social-images"

export const dynamicParams = false

export function generateStaticParams() {
  return useCasesFor("business").map((page) => ({ useCase: page.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ useCase: string }> }) {
  const { useCase } = await params
  const page = findUseCase("business", useCase)
  if (!page) notFound()
  return marketingMetadata({ metadata: page.content.metadata, path: useCasePath(page), images: [socialImages.business] })
}

export default async function UseCasePageRoute({ params }: { params: Promise<{ useCase: string }> }) {
  const { useCase } = await params
  const page = findUseCase("business", useCase)
  if (!page) notFound()
  return <UseCaseView page={page} />
}
