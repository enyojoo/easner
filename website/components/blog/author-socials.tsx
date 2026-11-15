import { Github, Globe } from "lucide-react"
import type { BlogAuthor } from "@/lib/blog/types"
import { LinkedInIcon, XIcon } from "./social-icons"

type Socials = Pick<BlogAuthor, "name" | "xUrl" | "linkedinUrl" | "githubUrl" | "websiteUrl">

/**
 * An author's social links as brand marks with accessible names ("Ada Okafor on X"). With `labels` the network name is
 * shown beside the mark (author page pills); without, it is an icon-only link (author card).
 */
export function AuthorSocials({
  author,
  labels = false,
  linkClassName,
}: {
  author: Socials
  labels?: boolean
  linkClassName?: string
}) {
  const items = [
    { url: author.xUrl, name: "X", icon: <XIcon width={16} height={16} /> },
    { url: author.linkedinUrl, name: "LinkedIn", icon: <LinkedInIcon width={16} height={16} /> },
    { url: author.githubUrl, name: "GitHub", icon: <Github className="size-4" aria-hidden="true" /> },
    { url: author.websiteUrl, name: "Website", icon: <Globe className="size-4" aria-hidden="true" /> },
  ].filter((i) => i.url)
  if (items.length === 0) return null
  return (
    <>
      {items.map((i) => (
        <a
          key={i.name}
          href={i.url!}
          target="_blank"
          rel="me noopener"
          aria-label={`${author.name} on ${i.name}`}
          title={i.name}
          className={linkClassName}
        >
          {i.icon}
          {labels && i.name}
        </a>
      ))}
    </>
  )
}
