import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageHeaderProps {
  title: React.ReactNode
  titleIcon?: React.ReactNode
  description?: React.ReactNode
  eyebrow?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  titleIcon,
  description,
  eyebrow,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl px-4 sm:px-8 pt-2 pb-4",
        className,
      )}
    >
      {eyebrow ? (
        <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {eyebrow}
        </div>
      ) : null}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-3">
            {titleIcon ? <div className="shrink-0">{titleIcon}</div> : null}
            <h1 className="truncate text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
          </div>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {action ? (
          <div className="flex shrink-0 items-center gap-2">{action}</div>
        ) : null}
      </div>
    </div>
  )
}
