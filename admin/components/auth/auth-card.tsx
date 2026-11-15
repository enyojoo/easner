import * as React from "react"

import { Card, CardBody } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type AuthCardProps = {
  title: string
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
  /** The first step: more air between the title and the form, as in OffBlogAuth. */
  spacious?: boolean
}

/** The sign-in card: a centred 24 semibold title and one line under it, then a 16 stack. */
export function AuthCard({ title, description, children, className, spacious = false }: AuthCardProps) {
  return (
    <Card padding="lg" className={cn("w-full max-w-md", className)}>
      <CardBody className={cn("grid gap-4", spacious && "gap-8")}>
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-[-0.015em] text-foreground">{title}</h1>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {children}
      </CardBody>
    </Card>
  )
}
