import * as React from "react"
import { cn } from "@/lib/utils"
import { PageHeader, type PageHeaderProps } from "../page-header/page-header"

export interface PageScaffoldProps extends PageHeaderProps {
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export function PageScaffold({
  children,
  className,
  contentClassName,
  ...header
}: PageScaffoldProps) {
  return (
    <div className={cn("flex min-h-full min-w-0 flex-col", className)}>
      <PageHeader {...header} />
      <main
        className={cn(
          "mx-auto w-full max-w-6xl px-4 sm:px-8 flex min-h-0 flex-1 flex-col pt-6",
          contentClassName,
        )}
      >
        {children}
        <div aria-hidden className="h-8 shrink-0" />
      </main>
    </div>
  )
}
