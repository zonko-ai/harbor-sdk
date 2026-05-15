import * as React from "react"
import {
  ArrowRight,
  Activity,
  BarChart3,
  Blocks,
  LayoutDashboard,
  PlayCircle,
  PlugZap,
  RefreshCw,
  TerminalSquare,
} from "lucide-react"
import { PageScaffold } from "@/components/page-scaffold/page-scaffold"
import { SectionHeader } from "@/components/section-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn, timeAgo } from "@/lib/utils"
import type { HarborData } from "@/hooks/use-harbor-data"

const DAY_MS = 24 * 60 * 60 * 1000
const DAY_FORMATTER = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" })

interface OverviewPageProps {
  data: HarborData
  onNavigate: (page: "plugins" | "traces") => void
}

interface DailyPoint {
  day: string
  date: Date
  count: number
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function dateKey(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${month}-${day}`
}

function buildDailyPoints(rows: { createdAt?: string; startedAt?: string }[]): DailyPoint[] {
  const today = startOfLocalDay(new Date())
  const counts = new Map<string, number>()
  for (const trace of rows) {
    const stamp = new Date(trace.createdAt ?? trace.startedAt ?? 0)
    if (!Number.isFinite(stamp.getTime())) continue
    const k = dateKey(startOfLocalDay(stamp))
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today.getTime() + (i - 29) * DAY_MS)
    const day = dateKey(date)
    return { day, date, count: counts.get(day) ?? 0 }
  })
}

export function OverviewPage({ data, onNavigate }: OverviewPageProps) {
  const [hoveredDay, setHoveredDay] = React.useState<string | null>(null)

  const ready = data.sources.filter((s) => s.status === "ready").length
  const attention = data.sources.filter((s) => {
    const status = s.oauth?.status
    return status && status !== "ready" && status !== "not_required"
  }).length
  const setupComplete = data.sources.length > 0
  const total = data.traces.length
  const successCount = data.traces.filter((t) => t.ok || t.status === "ok").length
  const errorCount = total - successCount
  const successWidth = total > 0 ? (successCount / total) * 100 : 0
  const errorWidth = total > 0 ? (errorCount / total) * 100 : 0
  const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0

  const points = React.useMemo(() => buildDailyPoints(data.traces), [data.traces])
  const peak = Math.max(1, ...points.map((p) => p.count))
  const activity = points.reduce((sum, p) => sum + p.count, 0)
  const first = points[0]
  const last = points[points.length - 1]
  const hoveredPoint = hoveredDay ? points.find((p) => p.day === hoveredDay) : null

  return (
    <PageScaffold
      title="Overview"
      titleIcon={<LayoutDashboard className="size-7" strokeWidth={1.75} />}
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={() => void data.refetch()}
          disabled={data.loading}
        >
          <RefreshCw className={cn("size-3.5", data.loading && "animate-spin")} />
          Refresh
        </Button>
      }
    >
      <div className="space-y-8">
        <section>
          {!setupComplete ? (
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <PlugZap className="size-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  Finish setting up{" "}
                  <span className="font-serif italic bg-clip-text text-transparent [background-image:linear-gradient(90deg,#0077b6_0%,#00b4d8_50%,#90e0ef_100%)]">
                    Harbor Local
                  </span>
                </h2>
              </div>
              <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
                Install your first MCP plugin to unlock local tool invocation and traces.
              </p>
            </div>
          ) : (
            <SectionHeader
              title="Setup"
              description="Manage installed plugins and the local MCP catalog."
              icon={<PlugZap />}
            />
          )}

          <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-[1fr_auto_1fr]">
            <SetupTile
              title="Connect plugins"
              description="Install MCPs from the local catalog. OAuth and bearer-key auth are handled locally."
              action="Plugins"
              onClick={() => onNavigate("plugins")}
              prominent={!setupComplete}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl font-semibold tracking-tight tabular-nums">
                  {data.sources.length}
                </span>
                <div className="flex flex-col text-xs text-muted-foreground">
                  <span>{ready} ready</span>
                  {attention > 0 ? (
                    <span className="text-warning">{attention} need attention</span>
                  ) : (
                    <span>{data.catalog.length} available in catalog</span>
                  )}
                </div>
              </div>
            </SetupTile>

            <div className="relative hidden min-w-24 items-center justify-center lg:flex" aria-hidden>
              <div
                className="absolute left-[-12px] top-1/2 h-0.5 -translate-y-1/2 overflow-hidden rounded-full bg-foreground/20"
                style={{ right: "calc(50% + 24px)" }}
              />
              <div
                className="absolute right-[-12px] top-1/2 h-0.5 -translate-y-1/2 overflow-hidden rounded-full bg-foreground/20"
                style={{ left: "calc(50% + 24px)" }}
              />
              <span className="relative grid size-12 place-items-center rounded-md border border-border bg-card text-foreground">
                <Blocks className="size-5" strokeWidth={1.75} />
              </span>
            </div>

            <SetupTile
              title="Inspect traces"
              description="Every MCP tool invocation is recorded with inputs, outputs, timing and errors."
              action="Traces"
              onClick={() => onNavigate("traces")}
              prominent={!setupComplete}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl font-semibold tracking-tight tabular-nums">
                  {total}
                </span>
                <div className="flex flex-col text-xs text-muted-foreground">
                  <span>{successCount} succeeded</span>
                  {errorCount > 0 ? (
                    <span className="text-destructive">{errorCount} failed</span>
                  ) : (
                    <span>0 errors</span>
                  )}
                </div>
              </div>
            </SetupTile>
          </div>
        </section>

        <section>
          <SectionHeader
            title="Last 30 days"
            description="Trace volume and health across the last month."
            icon={<TerminalSquare />}
            action={
              <button
                type="button"
                onClick={() => onNavigate("traces")}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                View traces
                <ArrowRight className="size-3.5" />
              </button>
            }
          />

          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="grid grid-cols-1 divide-y divide-border border-b border-border sm:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] sm:divide-x sm:divide-y-0 bg-muted/10">
              <Metric label="Traces" value={total} />
              <div className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Health
                  </p>
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {successRate}%
                  </span>
                </div>
                <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-muted">
                  <span className="bg-success" style={{ width: `${successWidth}%` }} />
                  <span className="bg-destructive" style={{ width: `${errorWidth}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{successCount.toLocaleString()} ok</span>
                  <span>{errorCount.toLocaleString()} err</span>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="min-w-0 rounded-md border border-border bg-background/40 p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Daily traces</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {activity > 0 ? "Runs created per day" : "No trace activity in the last 30 days"}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-2 py-1 text-[11px] text-muted-foreground">
                    <BarChart3 className="size-3" />
                    {peak.toLocaleString()} peak day
                  </div>
                </div>

                {activity > 0 ? (
                  <>
                    <div className="relative mt-4 h-40 w-full" onMouseLeave={() => setHoveredDay(null)}>
                      <div className="absolute inset-x-0 bottom-0 top-2 grid grid-rows-4 text-muted-foreground/20" aria-hidden>
                        {[0, 1, 2, 3].map((i) => (
                          <span key={i} className="border-t border-current" />
                        ))}
                      </div>
                      <div
                        className="absolute inset-0 grid items-end gap-1"
                        style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}
                      >
                        {points.map((point) => {
                          const height = point.count === 0 ? 3 : Math.max(8, (point.count / peak) * 100)
                          const active = hoveredPoint?.day === point.day
                          return (
                            <button
                              key={point.day}
                              type="button"
                              aria-label={`${point.count.toLocaleString()} traces on ${DAY_FORMATTER.format(point.date)}`}
                              title={`${point.count.toLocaleString()} traces on ${DAY_FORMATTER.format(point.date)}`}
                              onMouseEnter={() => setHoveredDay(point.day)}
                              onFocus={() => setHoveredDay(point.day)}
                              className="group flex h-full items-end focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                            >
                              <span
                                className={cn(
                                  "w-full rounded-t-sm transition-colors",
                                  active ? "bg-foreground" : "bg-foreground/40 group-hover:bg-foreground/70",
                                )}
                                style={{ height: `${height}%` }}
                              />
                            </button>
                          )
                        })}
                      </div>
                      {hoveredPoint ? (
                        <div className="pointer-events-none absolute right-3 top-3 rounded-md border border-border bg-popover/95 px-3 py-2 text-xs text-popover-foreground shadow-sm">
                          <p className="font-medium">{DAY_FORMATTER.format(hoveredPoint.date)}</p>
                          <p className="mt-1 text-muted-foreground">
                            {hoveredPoint.count.toLocaleString()} {hoveredPoint.count === 1 ? "trace" : "traces"}
                          </p>
                        </div>
                      ) : null}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{first ? DAY_FORMATTER.format(first.date) : ""}</span>
                      <span>{last ? DAY_FORMATTER.format(last.date) : ""}</span>
                    </div>
                  </>
                ) : (
                  <NoActivityState />
                )}
              </div>
            </div>
          </div>
        </section>

        <section>
          <SectionHeader
            title="Recent invocations"
            icon={<Activity />}
            action={
              <button
                type="button"
                onClick={() => onNavigate("traces")}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                All traces
                <ArrowRight className="size-3.5" />
              </button>
            }
          />
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {data.traces.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm font-medium text-foreground">No tool calls yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Invoke a tool from Plugins to record your first trace.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {data.traces.slice(0, 5).map((trace) => {
                  const ok = trace.ok || trace.status === "ok"
                  return (
                    <li key={trace.id ?? `${trace.toolId}-${trace.createdAt}`}>
                      <button
                        type="button"
                        onClick={() => onNavigate("traces")}
                        className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left hover:bg-accent/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Badge variant={ok ? "success" : "destructive"}>
                            {ok ? "ok" : "failed"}
                          </Badge>
                          <span className="font-mono text-[13px] truncate">
                            {trace.toolId ?? "unknown"}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {trace.namespace ?? ""}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                          {timeAgo(trace.createdAt ?? trace.startedAt)}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </PageScaffold>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
        {value.toLocaleString()}
      </p>
    </div>
  )
}

function NoActivityState() {
  return (
    <div className="mt-4 rounded-lg border border-border bg-background/80 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            <PlayCircle className="size-3" />
            No recent activity
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">
            Run a tool to start recording traces.
          </p>
        </div>
        <div className="grid shrink-0 grid-cols-10 gap-1.5" aria-hidden>
          {Array.from({ length: 30 }, (_, i) => (
            <span
              key={i}
              className="size-3 rounded-[3px] bg-muted"
              style={{ opacity: 0.18 + (i % 5) * 0.08 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function SetupTile({
  title,
  description,
  action,
  onClick,
  prominent,
  children,
}: {
  title: string
  description: string
  action: string
  onClick: () => void
  prominent: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex h-full flex-col justify-between overflow-hidden rounded-md border border-border bg-card text-left transition-colors hover:border-foreground/20",
        prominent ? "min-h-44 p-5" : "min-h-32 p-4",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
            {title}
          </p>
          <p
            className={cn(
              "leading-relaxed text-muted-foreground",
              prominent ? "mt-2 max-w-md text-sm" : "mt-1 max-w-sm text-xs",
            )}
          >
            {description}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-foreground">
          {action}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
      <div className="mt-5">{children}</div>
    </button>
  )
}
