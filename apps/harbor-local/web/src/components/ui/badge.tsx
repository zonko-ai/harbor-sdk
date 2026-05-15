import * as React from "react"
import { cn } from "@/lib/utils"

type Variant = "default" | "secondary" | "success" | "warning" | "destructive" | "outline"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
}

const variants: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground",
  secondary: "border-border/70 bg-muted/40 text-muted-foreground",
  success: "border border-success/40 bg-success/15 text-success",
  warning: "border border-warning/40 bg-warning/15 text-warning",
  destructive: "border border-destructive/40 bg-destructive/15 text-destructive",
  outline: "border border-border text-foreground",
}

export function Badge({
  className,
  variant = "secondary",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium border border-transparent",
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
