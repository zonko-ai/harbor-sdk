import * as React from "react"
import { Blocks } from "lucide-react"
import { cn } from "@/lib/utils"

interface PluginIconProps {
  title?: string
  slug?: string
  iconUrl?: string
  category?: string
  className?: string
}

function hashHue(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h) % 360
}

export function PluginIcon({
  title,
  slug,
  iconUrl,
  category,
  className,
}: PluginIconProps) {
  const [errored, setErrored] = React.useState(false)
  const seed = slug ?? title ?? category ?? "plugin"
  const hue = hashHue(seed)
  const bg = `oklch(28% 0.06 ${hue})`
  const fg = `oklch(86% 0.12 ${hue})`
  const initial = (title ?? slug ?? "?").trim().charAt(0).toUpperCase()

  if (iconUrl && !errored) {
    return (
      <div
        className={cn(
          "relative grid place-items-center rounded-md border border-border/70 bg-card overflow-hidden",
          className,
        )}
      >
        <img
          src={iconUrl}
          alt={title ?? slug ?? "plugin icon"}
          className="size-full object-contain p-1.5"
          onError={() => setErrored(true)}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative grid place-items-center rounded-md border border-border/70 font-semibold text-sm",
        className,
      )}
      style={{ background: bg, color: fg }}
      aria-hidden
    >
      {initial !== "?" ? (
        initial
      ) : (
        <Blocks className="size-4" strokeWidth={1.75} />
      )}
    </div>
  )
}
