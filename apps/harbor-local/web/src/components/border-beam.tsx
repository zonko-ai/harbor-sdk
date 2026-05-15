import * as React from "react"
import { cn } from "@/lib/utils"

interface BorderBeamProps {
  children: React.ReactNode
  /** Beam tint. Defaults to a neutral light. */
  color?: string
  /** Animation period in seconds. */
  duration?: number
  /** When false the beam is hidden. Drives the "active on hover" behaviour. */
  active?: boolean
  /** Border thickness in px. */
  borderWidth?: number
  /** Beam length as a percentage of the perimeter (0..100). */
  size?: number
  className?: string
}

/**
 * A rotating conic-gradient ring that fakes a "beam" travelling around a
 * rounded rectangle. The trick:
 *   - outer wrapper carries a rounded border that paints the beam via a
 *     conic gradient rotated by a CSS custom property.
 *   - the inner element re-introduces the card surface so the gradient
 *     only shows on the border, not the fill.
 *   - rotation is driven by `@property --beam-angle` so it animates.
 *
 * Inspired by the BorderBeam pattern but written from scratch.
 */
export function BorderBeam({
  children,
  color = "rgb(190 190 220)",
  duration = 3,
  active = true,
  borderWidth = 1.25,
  size = 35,
  className,
}: BorderBeamProps) {
  const style: React.CSSProperties = {
    // Beam length expressed as a `transparent` cut-out at the end so the
    // visible arc is roughly `size` percent of a 360° sweep.
    ["--beam-color" as string]: color,
    ["--beam-duration" as string]: `${duration}s`,
    ["--beam-size" as string]: `${size}%`,
    ["--beam-border" as string]: `${borderWidth}px`,
  }

  return (
    <div className={cn("border-beam-root", className)} style={style} data-active={active}>
      <div className="border-beam-ring" aria-hidden />
      <div className="border-beam-content">{children}</div>
    </div>
  )
}
