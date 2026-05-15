import * as React from "react"
import { Activity, RefreshCw, X } from "lucide-react"
import { PageScaffold } from "@/components/page-scaffold/page-scaffold"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { cn, formatDuration, timeAgo } from "@/lib/utils"
import type { InvocationTrace } from "@/lib/api"
import type { HarborData } from "@/hooks/use-harbor-data"

interface TracesPageProps {
  data: HarborData
}

type DateFilter = "all" | "24h" | "7d" | "30d"
type StatusFilter = "all" | "ok" | "failed"

function withinDate(trace: InvocationTrace, filter: DateFilter): boolean {
  if (filter === "all") return true
  const t = new Date(trace.createdAt ?? trace.startedAt ?? 0).getTime()
  if (!Number.isFinite(t)) return false
  const hours = filter === "24h" ? 24 : filter === "7d" ? 24 * 7 : 24 * 30
  return t >= Date.now() - hours * 60 * 60 * 1000
}

export function TracesPage({ data }: TracesPageProps) {
  const [namespace, setNamespace] = React.useState<string>("all")
  const [status, setStatus] = React.useState<StatusFilter>("all")
  const [dateFilter, setDateFilter] = React.useState<DateFilter>("all")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)

  const namespaces = React.useMemo(() => {
    const set = new Set<string>()
    for (const trace of data.traces) {
      if (trace.namespace) set.add(trace.namespace)
    }
    return ["all", ...[...set].sort()]
  }, [data.traces])

  const filtered = React.useMemo(() => {
    return data.traces.filter((trace) => {
      if (namespace !== "all" && trace.namespace !== namespace) return false
      const ok = trace.ok || trace.status === "ok"
      if (status === "ok" && !ok) return false
      if (status === "failed" && ok) return false
      if (!withinDate(trace, dateFilter)) return false
      return true
    })
  }, [data.traces, namespace, status, dateFilter])

  const selected =
    filtered.find((trace) => trace.id === selectedId) ??
    data.traces.find((trace) => trace.id === selectedId) ??
    null

  React.useEffect(() => {
    if (selectedId && !data.traces.some((trace) => trace.id === selectedId)) {
      setSelectedId(null)
    }
  }, [data.traces, selectedId])

  return (
    <PageScaffold
      title="Traces"
      titleIcon={<Activity className="size-7" strokeWidth={1.75} />}
      description="Execution history for tools invoked through the local MCP runtime."
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
      <div className="flex flex-col gap-4">
        <div className="mx-auto flex w-full max-w-[1176px] flex-wrap items-center gap-2">
          <FilterField label="Plugin">
            <Select
              value={namespace}
              onChange={(e) => setNamespace(e.target.value)}
              className="h-8 w-auto min-w-[160px] text-xs"
            >
              {namespaces.map((ns) => (
                <option key={ns} value={ns}>
                  {ns === "all" ? "All plugins" : ns}
                </option>
              ))}
            </Select>
          </FilterField>
          <FilterField label="Status">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              className="h-8 w-auto min-w-[120px] text-xs"
            >
              <option value="all">All statuses</option>
              <option value="ok">Succeeded</option>
              <option value="failed">Failed</option>
            </Select>
          </FilterField>
          <FilterField label="Window">
            <Select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="h-8 w-auto min-w-[140px] text-xs"
            >
              <option value="all">All time</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </Select>
          </FilterField>
          <div className="ml-auto text-xs text-muted-foreground tabular-nums">
            {filtered.length} of {data.traces.length}
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1176px] grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {filtered.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm font-medium text-foreground">
                  {data.traces.length === 0 ? "No traces yet" : "No traces match these filters"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {data.traces.length === 0
                    ? "Invoke a tool from a connected plugin to record your first trace."
                    : "Clear filters to see all recorded invocations."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-card border-b border-border">
                      <Th>Tool</Th>
                      <Th>Plugin</Th>
                      <Th align="right">Duration</Th>
                      <Th align="right">When</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((trace) => {
                      const ok = trace.ok || trace.status === "ok"
                      const isSelected = trace.id === selected?.id
                      return (
                        <tr
                          key={trace.id ?? `${trace.toolId}-${trace.createdAt}`}
                          onClick={() => setSelectedId(trace.id ?? null)}
                          className={cn(
                            "border-b border-border/60 cursor-pointer transition-colors",
                            isSelected ? "bg-accent/60" : "hover:bg-accent/30",
                          )}
                        >
                          <td className="px-3 py-2.5 align-middle">
                            <div className="flex items-center gap-2 min-w-0">
                              <Badge variant={ok ? "success" : "destructive"} className="shrink-0">
                                {ok ? "ok" : "fail"}
                              </Badge>
                              <span className="font-mono text-[12.5px] truncate max-w-[260px]">
                                {trace.toolId ?? "unknown"}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 align-middle text-xs text-muted-foreground">
                            {trace.namespace ?? "—"}
                          </td>
                          <td className="px-3 py-2.5 align-middle text-xs text-muted-foreground tabular-nums text-right">
                            {formatDuration(trace.durationMs)}
                          </td>
                          <td className="px-3 py-2.5 align-middle text-xs text-muted-foreground tabular-nums text-right whitespace-nowrap">
                            {timeAgo(trace.createdAt ?? trace.startedAt)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <aside className="rounded-lg border border-border bg-card overflow-hidden flex flex-col lg:sticky lg:top-4 h-fit max-h-[calc(100vh-8rem)]">
            <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold tracking-tight">Trace detail</h2>
              {selected ? (
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label="Clear selection"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {selected ? <TraceDetail trace={selected} /> : (
                <p className="text-xs text-muted-foreground">
                  Select a row to inspect inputs, outputs, timing and errors.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </PageScaffold>
  )
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode
  align?: "left" | "right"
}) {
  return (
    <th
      className={cn(
        "px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground",
        align === "right" ? "text-right" : "text-left",
      )}
    >
      {children}
    </th>
  )
}

function TraceDetail({ trace }: { trace: InvocationTrace }) {
  const ok = trace.ok || trace.status === "ok"
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={ok ? "success" : "destructive"}>{ok ? "succeeded" : "failed"}</Badge>
          {trace.namespace ? <Badge variant="secondary">{trace.namespace}</Badge> : null}
        </div>
        <p className="font-mono text-sm text-foreground break-all">{trace.toolId ?? "unknown"}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <Field label="Duration" value={formatDuration(trace.durationMs)} />
        <Field label="When" value={timeAgo(trace.createdAt ?? trace.startedAt)} />
        {trace.createdAt ? (
          <Field
            label="Started"
            value={new Date(trace.createdAt).toLocaleString()}
            className="col-span-2"
          />
        ) : null}
      </div>

      {trace.input !== undefined ? (
        <CodeBlock label="Input" value={trace.input} />
      ) : null}
      {trace.output !== undefined ? (
        <CodeBlock label="Output" value={trace.output} />
      ) : null}
      {trace.error !== undefined && trace.error !== null ? (
        <CodeBlock label="Error" value={trace.error} variant="destructive" />
      ) : null}

      <details>
        <summary className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground cursor-pointer hover:text-foreground">
          Raw trace
        </summary>
        <pre className="mt-2 max-h-72 overflow-auto rounded-md border border-border bg-background/70 p-3 text-[11px] font-mono leading-relaxed">
{JSON.stringify(trace, null, 2)}
        </pre>
      </details>
    </div>
  )
}

function Field({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={className}>
      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
        {label}
      </p>
      <p className="mt-0.5 text-foreground tabular-nums">{value}</p>
    </div>
  )
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
        {label}
      </span>
      {children}
    </div>
  )
}

function CodeBlock({
  label,
  value,
  variant = "default",
}: {
  label: string
  value: unknown
  variant?: "default" | "destructive"
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium mb-1.5">
        {label}
      </p>
      <pre
        className={cn(
          "max-h-56 overflow-auto rounded-md border p-3 text-[11px] font-mono leading-relaxed",
          variant === "destructive"
            ? "border-destructive/40 bg-destructive/10 text-destructive"
            : "border-border bg-background/70 text-foreground",
        )}
      >
{typeof value === "string" ? value : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  )
}
