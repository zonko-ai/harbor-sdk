import * as React from "react"
import { Plus, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { PluginIcon } from "./plugin-icon"
import { BorderBeam } from "./border-beam"
import { useIconColor } from "@/hooks/use-icon-color"
import { Badge } from "./ui/badge"
import type { CatalogEntry, InstalledSource } from "@/lib/api"

interface PluginCardProps {
  entry: CatalogEntry
  source?: InstalledSource | undefined
  onClick?: () => void
  onConnect?: () => void
  disabled?: boolean
  disabledLabel?: string
  className?: string
}

function authLabel(entry: CatalogEntry): string {
  const mode = entry.auth?.mode
  if (mode === "oauth2") return "OAuth"
  if (mode === "bearer") return "API key"
  if (mode === "query") return "Query key"
  return "No auth"
}

export const PluginCard = React.memo(function PluginCard({
  entry,
  source,
  onClick,
  onConnect,
  disabled,
  disabledLabel = "Coming soon",
  className,
}: PluginCardProps) {
  const [hovered, setHovered] = React.useState(false)
  const beamColor = useIconColor(entry.slug ?? entry.defaultNamespace, entry.iconUrl)
  const handleCardClick = disabled ? undefined : (onClick ?? onConnect)

  const card = (
    <div
      className={cn(
        "group/card relative flex h-full items-center gap-3 overflow-hidden rounded-md border border-border bg-card px-4 py-3.5",
        disabled
          ? "cursor-not-allowed opacity-90"
          : "cursor-pointer",
        "focus-visible:outline-none focus-within:ring-1 focus-within:ring-ring/50 transition-colors",
        className,
      )}
      onClick={handleCardClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      role={handleCardClick ? "button" : undefined}
      tabIndex={handleCardClick ? 0 : -1}
      aria-disabled={disabled || undefined}
      title={entry.description ?? undefined}
      onKeyDown={(e) => {
        if (handleCardClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault()
          handleCardClick()
        }
      }}
    >
      <PluginIcon
        title={entry.displayName}
        slug={entry.slug}
        iconUrl={entry.iconUrl}
        category={entry.category}
        className="size-10 shrink-0"
      />

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5 text-sm font-medium leading-tight text-foreground">
          <span className="truncate">{entry.displayName}</span>
          <Badge variant="secondary" className="text-[10px]">
            MCP
          </Badge>
        </div>
        {entry.description ? (
          <span className="mt-1 block truncate text-xs leading-snug text-muted-foreground">
            {entry.description}
          </span>
        ) : null}
        <span className="mt-1 block truncate text-[11px] leading-tight text-muted-foreground/70 font-mono">
          {entry.defaultNamespace} · {authLabel(entry)}
        </span>
      </div>

      {disabled ? (
        <span className="inline-flex shrink-0 items-center rounded-md border border-border/70 bg-muted/40 px-2 py-1 text-[11px] font-medium text-muted-foreground">
          {disabledLabel}
        </span>
      ) : source ? (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-success/40 bg-success/15 px-2 py-1 text-[11px] font-medium text-success">
          <Check className="size-3" />
          Connected
        </span>
      ) : onConnect ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onConnect()
          }}
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border/70 px-2 py-1 text-[11px] font-medium text-foreground transition-colors duration-150 hover:bg-accent"
          aria-label={`Connect ${entry.displayName}`}
        >
          <Plus className="size-3" />
          Connect
        </button>
      ) : null}
    </div>
  )

  if (disabled) {
    return <div className="h-full rounded-md">{card}</div>
  }

  return (
    <BorderBeam
      color={beamColor}
      active={hovered}
      duration={2.4}
      size={32}
      className="h-full rounded-md"
    >
      {card}
    </BorderBeam>
  )
})
