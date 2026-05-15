import * as React from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme, type ThemePreference } from "@/hooks/use-theme"

const OPTIONS: Array<{ value: ThemePreference; label: string; icon: typeof Sun }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
]

interface ThemeToggleProps {
  variant?: "segmented" | "compact"
  className?: string
}

export function ThemeToggle({ variant = "segmented", className }: ThemeToggleProps) {
  const { preference, setPreference, toggle, resolved } = useTheme()

  if (variant === "compact") {
    const Icon = resolved === "dark" ? Sun : Moon
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
        title={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
          className,
        )}
      >
        <Icon className="size-3.5" strokeWidth={1.75} />
      </button>
    )
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md border border-border bg-card p-0.5",
        className,
      )}
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon
        const active = preference === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setPreference(option.value)}
            title={option.label}
            aria-label={option.label}
            className={cn(
              "inline-flex h-6 w-6 items-center justify-center rounded transition-colors",
              active
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" strokeWidth={1.75} />
          </button>
        )
      })}
    </div>
  )
}
