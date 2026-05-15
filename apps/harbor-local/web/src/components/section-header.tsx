import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  title: string
  description?: string
  icon?: React.ReactNode
  count?: number
  countLabel?: string
  action?: React.ReactNode
  className?: string
}

export function SectionHeader({
  title,
  description,
  icon,
  count,
  countLabel,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mx-auto mb-3 flex w-full max-w-[1176px] items-end justify-between gap-3",
        className,
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-foreground">
          {icon ? (
            <span className="text-muted-foreground [&_svg]:size-4">{icon}</span>
          ) : null}
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {typeof count === "number" ? (
            <span className="text-xs text-muted-foreground tabular-nums">
              {count}
              {countLabel ? ` ${countLabel}` : ""}
            </span>
          ) : null}
        </div>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
