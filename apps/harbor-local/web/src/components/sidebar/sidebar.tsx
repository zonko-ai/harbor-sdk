import * as React from "react"
import { Activity, Blocks, LayoutDashboard, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

export type PageId = "overview" | "plugins" | "traces"

interface NavItem {
  segment: PageId
  title: string
  icon: LucideIcon
}

interface NavGroup {
  label?: string
  items: NavItem[]
}

const NAV: NavGroup[] = [
  { items: [{ segment: "overview", title: "Overview", icon: LayoutDashboard }] },
  {
    label: "PLATFORM",
    items: [
      { segment: "plugins", title: "Plugins", icon: Blocks },
      { segment: "traces", title: "Traces", icon: Activity },
    ],
  },
]

export interface SidebarProps {
  currentPage: PageId
  onNavigate: (page: PageId) => void
  health: { status?: string; projectRoot?: string } | null
}

export function Sidebar({ currentPage, onNavigate, health }: SidebarProps) {
  return (
    <aside className="flex h-screen w-64 flex-col gap-1 bg-sidebar text-sidebar-foreground border-r border-sidebar-border p-3 sticky top-0">
      <div className="flex items-center gap-2.5 px-2 py-2 mb-2">
        <img
          src="/brand/harbor-icon-128.png"
          alt="Harbor"
          width={32}
          height={32}
          className="size-8 rounded-md shrink-0 select-none"
          draggable={false}
        />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold leading-tight tracking-tight truncate">
            Harbor Local
          </span>
          <span className="text-[11px] text-muted-foreground leading-tight">
            MCP console
          </span>
        </div>
      </div>

      {NAV.map((group, i) => (
        <nav key={group.label ?? `g-${i}`} className="flex flex-col gap-0.5 mt-1">
          {group.label ? (
            <div className="px-2.5 pt-2 pb-1 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/70">
              {group.label}
            </div>
          ) : null}
          {group.items.map((item) => {
            const Icon = item.icon
            const active = item.segment === currentPage
            return (
              <button
                key={item.segment}
                type="button"
                onClick={() => onNavigate(item.segment)}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors text-left",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" strokeWidth={1.75} />
                <span className="truncate">{item.title}</span>
              </button>
            )
          })}
        </nav>
      ))}

      <div className="mt-auto pt-2 border-t border-sidebar-border space-y-2">
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/70 uppercase">
            Theme
          </span>
          <ThemeToggle variant="segmented" />
        </div>

        <div className="flex items-center gap-2 px-2 py-1">
          <span
            className={cn(
              "size-2 rounded-full",
              health ? "bg-success" : "bg-muted-foreground",
            )}
          />
          <span className="text-xs text-muted-foreground">
            {health ? "Runtime online" : "Checking…"}
          </span>
        </div>
        {health?.projectRoot ? (
          <p className="px-2 text-[10.5px] text-muted-foreground/70 font-mono break-all leading-tight">
            {health.projectRoot}/.harbor
          </p>
        ) : null}
      </div>
    </aside>
  )
}
