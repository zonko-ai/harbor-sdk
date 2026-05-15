import * as React from "react"
import { AlertTriangle, CheckCircle2, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface NoticeProps {
  tone?: "info" | "error" | "success"
  message: string
  onDismiss?: () => void
  className?: string
}

export function Notice({ tone = "info", message, onDismiss, className }: NoticeProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-6xl items-center gap-2.5 rounded-md border px-3 py-2 text-sm",
        tone === "error"
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : tone === "success"
            ? "border-success/40 bg-success/10 text-success"
            : "border-border bg-card text-foreground",
        className,
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      {tone === "error" ? (
        <AlertTriangle className="size-4 shrink-0" />
      ) : tone === "success" ? (
        <CheckCircle2 className="size-4 shrink-0" />
      ) : null}
      <span className="flex-1">{message}</span>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md p-1 text-current/70 hover:bg-foreground/5"
          aria-label="Dismiss"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  )
}
