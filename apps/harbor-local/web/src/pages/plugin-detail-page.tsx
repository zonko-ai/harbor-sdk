import * as React from "react"
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Code2,
  Check,
  Link2,
  Loader2,
  PlayCircle,
  Plug,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react"
import { PageScaffold } from "@/components/page-scaffold/page-scaffold"
import { PluginIcon } from "@/components/plugin-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Notice } from "@/components/notice"
import { cn, timeAgo } from "@/lib/utils"
import {
  api,
  type CatalogEntry,
  type InstalledSource,
  type ToolHit,
} from "@/lib/api"
import type { HarborData } from "@/hooks/use-harbor-data"

interface PluginDetailPageProps {
  data: HarborData
  slug: string
  onBack: () => void
}

function authLabel(entry: CatalogEntry): string {
  const mode = entry.auth?.mode
  if (mode === "oauth2") return "OAuth 2.0"
  if (mode === "bearer") return "Bearer token"
  if (mode === "query") return "Query key"
  return "No auth"
}

function statusVariant(status: string | undefined) {
  const s = String(status ?? "")
  if (s === "ready" || s === "not_required" || s === "ok") return "success" as const
  if (s.includes("required") || s.includes("pending") || s === "stale") return "warning" as const
  if (s.includes("error") || s === "failed") return "destructive" as const
  return "secondary" as const
}

export function PluginDetailPage({ data, slug, onBack }: PluginDetailPageProps) {
  const entry: CatalogEntry | undefined = data.catalog.find(
    (c) => c.slug === slug || c.defaultNamespace === slug,
  )
  const matchedSources: InstalledSource[] = data.sources.filter((s) => {
    if (entry) {
      return (
        s.namespace === entry.defaultNamespace ||
        s.id === entry.slug ||
        s.id === slug
      )
    }
    return s.id === slug || s.namespace === slug
  })
  const syntheticEntry: CatalogEntry =
    entry ??
    (matchedSources[0]
      ? {
          slug: matchedSources[0].id,
          displayName: matchedSources[0].name ?? matchedSources[0].id,
          defaultNamespace: matchedSources[0].namespace ?? matchedSources[0].id,
          endpoint: matchedSources[0].endpoint ?? "",
        }
      : {
          slug,
          displayName: slug,
          defaultNamespace: slug,
          endpoint: "",
        })

  const [notice, setNotice] = React.useState<{
    tone: "info" | "error" | "success"
    message: string
  } | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [tools, setTools] = React.useState<ToolHit[]>([])
  const [toolsLoading, setToolsLoading] = React.useState(false)
  const [toolSearch, setToolSearch] = React.useState("")

  const namespace = matchedSources[0]?.namespace ?? syntheticEntry.defaultNamespace
  const hasSources = matchedSources.length > 0

  const refetchTools = React.useCallback(
    async (showLoader = true) => {
      if (!hasSources) {
        setTools([])
        return
      }
      if (showLoader) setToolsLoading(true)
      try {
        const result = await api.searchTools(namespace, 200, namespace)
        setTools(result.hits ?? [])
      } catch (err) {
        setNotice({
          tone: "error",
          message: err instanceof Error ? err.message : String(err),
        })
      } finally {
        setToolsLoading(false)
      }
    },
    [hasSources, namespace],
  )

  React.useEffect(() => {
    void refetchTools()
  }, [refetchTools])

  const handleInstall = React.useCallback(async () => {
    setBusy(true)
    setNotice(null)
    try {
      const oauth = entry?.auth?.mode === "oauth2"
      const result = await api.install({ slug, connect: oauth })
      if (result.oauth?.authorizationUrl) {
        window.open(result.oauth.authorizationUrl, "_blank", "noopener,noreferrer")
        setNotice({
          tone: "info",
          message: `Opened OAuth for ${result.oauth.sourceId}. Return after approval and refresh.`,
        })
      } else {
        setNotice({
          tone: "success",
          message: `Installed ${result.source.id}.`,
        })
      }
      await data.refetch()
      await refetchTools()
    } catch (err) {
      setNotice({
        tone: "error",
        message: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setBusy(false)
    }
  }, [data, entry, slug, refetchTools])

  const handleReconnect = React.useCallback(
    async (sourceId: string) => {
      setBusy(true)
      try {
        const result = await api.connect({ sourceId, slug })
        window.open(result.authorizationUrl, "_blank", "noopener,noreferrer")
        setNotice({
          tone: "info",
          message: `Opened OAuth for ${sourceId}. Return after approval and refresh.`,
        })
      } catch (err) {
        setNotice({
          tone: "error",
          message: err instanceof Error ? err.message : String(err),
        })
      } finally {
        setBusy(false)
      }
    },
    [slug],
  )

  const handleRefreshSource = React.useCallback(
    async (sourceId: string) => {
      setBusy(true)
      try {
        const result = await api.refresh(sourceId)
        setNotice({
          tone: "success",
          message: `Refreshed · ${result.toolCount ?? 0} tools indexed.`,
        })
        await data.refetch()
        await refetchTools(false)
      } catch (err) {
        setNotice({
          tone: "error",
          message: err instanceof Error ? err.message : String(err),
        })
      } finally {
        setBusy(false)
      }
    },
    [data, refetchTools],
  )

  const handleRemoveSource = React.useCallback(
    async (sourceId: string) => {
      const confirmed = window.confirm(
        "Disconnect this MCP plugin? Existing traces stay in place, but its tools will no longer be available locally.",
      )
      if (!confirmed) return
      setBusy(true)
      try {
        const result = await api.remove(sourceId)
        setNotice({
          tone: "success",
          message: result.removed ? `Disconnected ${sourceId}.` : `${sourceId} was already disconnected.`,
        })
        setTools([])
        await data.refetch()
      } catch (err) {
        setNotice({
          tone: "error",
          message: err instanceof Error ? err.message : String(err),
        })
      } finally {
        setBusy(false)
      }
    },
    [data],
  )

  const filteredTools = React.useMemo(() => {
    const q = toolSearch.trim().toLowerCase()
    if (!q) return tools
    return tools.filter(
      (hit) =>
        hit.toolId.toLowerCase().includes(q) ||
        (hit.description ?? "").toLowerCase().includes(q),
    )
  }, [tools, toolSearch])

  return (
    <PageScaffold
      title={syntheticEntry.displayName}
      titleIcon={
        <PluginIcon
          title={syntheticEntry.displayName}
          slug={syntheticEntry.slug}
          iconUrl={syntheticEntry.iconUrl}
          category={syntheticEntry.category}
          className="size-9"
        />
      }
      description={
        hasSources
          ? `${matchedSources.length} connected account${matchedSources.length === 1 ? "" : "s"}.`
          : entry
            ? "Install this plugin to start invoking its tools locally."
            : "This plugin is not in the local catalog."
      }
      action={
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="size-3.5" />
          Back to plugins
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        {notice ? (
          <Notice
            tone={notice.tone}
            message={notice.message}
            onDismiss={() => setNotice(null)}
          />
        ) : null}

        <MetadataSection entry={syntheticEntry} />

        {hasSources ? (
          <ConnectedAccountsSection
            sources={matchedSources}
            entry={syntheticEntry}
            busy={busy}
            onRefresh={handleRefreshSource}
            onReconnect={handleReconnect}
            onRemove={handleRemoveSource}
          />
        ) : entry ? (
          <NotConnectedSection entry={entry} busy={busy} onInstall={handleInstall} />
        ) : null}

        {hasSources ? (
          <ToolsSection
            tools={filteredTools}
            allCount={tools.length}
            loading={toolsLoading}
            search={toolSearch}
            onSearch={setToolSearch}
            onRefresh={() => void refetchTools()}
            onReportError={(message) => setNotice({ tone: "error", message })}
            onReportSuccess={(message) =>
              setNotice({ tone: "success", message })
            }
            onTraced={() => data.refetch()}
          />
        ) : null}
      </div>
    </PageScaffold>
  )
}

function MetadataSection({ entry }: { entry: CatalogEntry }) {
  return (
    <section className="mx-auto w-full max-w-[1176px] rounded-lg border border-border bg-card overflow-hidden">
      <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        <Metadata label="Namespace" value={entry.defaultNamespace} mono />
        <Metadata label="Auth" value={authLabel(entry)} />
        <Metadata label="Transport" value={entry.transport ?? "streamable-http"} />
        <Metadata label="Category" value={entry.category ?? "general"} />
      </div>
      {entry.endpoint ? (
        <div className="border-t border-border px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
            Endpoint
          </p>
          <p className="mt-1 font-mono text-[12.5px] break-all text-foreground">
            {entry.endpoint}
          </p>
        </div>
      ) : null}
      {entry.description ? (
        <div className="border-t border-border px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
            About
          </p>
          <p className="mt-1 text-sm text-foreground leading-relaxed">
            {entry.description}
          </p>
        </div>
      ) : null}
    </section>
  )
}

function Metadata({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-foreground break-all",
          mono ? "font-mono text-[12.5px]" : "text-sm",
        )}
      >
        {value}
      </p>
    </div>
  )
}

function NotConnectedSection({
  entry,
  busy,
  onInstall,
}: {
  entry: CatalogEntry
  busy: boolean
  onInstall: () => void
}) {
  return (
    <section className="mx-auto w-full max-w-[1176px] rounded-lg border border-dashed border-border/70 bg-card/40 p-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="grid size-10 place-items-center rounded-md bg-muted/40 text-muted-foreground">
          <Plug className="size-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            No connected accounts yet
          </p>
          <p className="mt-1 max-w-md text-xs text-muted-foreground">
            {entry.auth?.mode === "oauth2"
              ? "Connect through OAuth to start using this plugin's tools locally."
              : "Install this plugin to start using its tools locally."}
          </p>
        </div>
        <Button onClick={onInstall} disabled={busy} size="sm">
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Plug className="size-3.5" />}
          {entry.auth?.mode === "oauth2" ? "Connect" : "Install plugin"}
        </Button>
      </div>
    </section>
  )
}

function ConnectedAccountsSection({
  sources,
  entry,
  busy,
  onRefresh,
  onReconnect,
  onRemove,
}: {
  sources: InstalledSource[]
  entry: CatalogEntry
  busy: boolean
  onRefresh: (sourceId: string) => void
  onReconnect: (sourceId: string) => void
  onRemove: (sourceId: string) => void
}) {
  return (
    <section>
      <div className="mx-auto mb-2 flex w-full max-w-[1176px] items-center gap-2 px-1">
        <h2 className="text-sm font-semibold tracking-tight">Connected accounts</h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          {sources.length}
        </span>
      </div>
      <div className="mx-auto w-full max-w-[1176px] grid grid-cols-1 gap-3 md:grid-cols-2">
        {sources.map((source) => {
          const oauthStatus = source.oauth?.status
          return (
            <div
              key={source.id}
              className="rounded-lg border border-border bg-card overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-medium text-foreground truncate">
                      {source.name ?? source.id}
                    </span>
                    <Badge variant={statusVariant(source.status)}>
                      {source.status}
                    </Badge>
                    {oauthStatus && oauthStatus !== "not_required" ? (
                      <Badge variant={statusVariant(oauthStatus)}>
                        {oauthStatus.replaceAll("_", " ")}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 font-mono text-[11.5px] text-muted-foreground break-all">
                    {source.namespace ?? source.id}
                  </p>
                  {source.endpoint ? (
                    <p className="mt-0.5 text-[11px] text-muted-foreground/70 break-all">
                      {source.endpoint}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 border-t border-border bg-muted/10 px-3 py-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRefresh(source.id)}
                  disabled={busy}
                >
                  <RefreshCw className="size-3" />
                  Refresh tools
                </Button>
                {source.auth?.kind === "oauth2" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReconnect(source.id)}
                    disabled={busy}
                  >
                    <Link2 className="size-3" />
                    Reconnect
                  </Button>
                ) : null}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRemove(source.id)}
                  disabled={busy}
                >
                  <Trash2 className="size-3 text-destructive" />
                  Disconnect
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

interface ToolsSectionProps {
  tools: ToolHit[]
  allCount: number
  loading: boolean
  search: string
  onSearch: (next: string) => void
  onRefresh: () => void
  onReportError: (message: string) => void
  onReportSuccess: (message: string) => void
  onTraced: () => void
}

function ToolsSection({
  tools,
  allCount,
  loading,
  search,
  onSearch,
  onRefresh,
  onReportError,
  onReportSuccess,
  onTraced,
}: ToolsSectionProps) {
  return (
    <section>
      <div className="mx-auto mb-2 flex w-full max-w-[1176px] flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold tracking-tight">Tools</h2>
          <span className="text-xs text-muted-foreground tabular-nums">
            {allCount}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Filter tools…"
              className="h-8 w-56 pl-8 text-xs"
            />
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw
              className={cn("size-3", loading && "animate-spin")}
            />
            Reload
          </Button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1176px] rounded-lg border border-border bg-card overflow-hidden">
        {loading && tools.length === 0 ? (
          <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            Loading tools…
          </div>
        ) : tools.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-foreground">
              {search ? "No tools match this filter" : "No tools indexed yet"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {search ? "Try a different keyword." : "Click Reload to refresh tool schemas."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {tools.map((hit) => (
              <ToolRow
                key={hit.toolId}
                hit={hit}
                onReportError={onReportError}
                onReportSuccess={onReportSuccess}
                onTraced={onTraced}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

interface ToolRowProps {
  hit: ToolHit
  onReportError: (message: string) => void
  onReportSuccess: (message: string) => void
  onTraced: () => void
}

function ToolRow({ hit, onReportError, onReportSuccess, onTraced }: ToolRowProps) {
  const [open, setOpen] = React.useState(false)
  const [schema, setSchema] = React.useState<unknown | null>(null)
  const [schemaLoading, setSchemaLoading] = React.useState(false)
  const [input, setInput] = React.useState("{}")
  const [output, setOutput] = React.useState<unknown | null>(null)
  const [outputAt, setOutputAt] = React.useState<number | null>(null)
  const [outputError, setOutputError] = React.useState<string | null>(null)
  const [invoking, setInvoking] = React.useState(false)

  const toggle = React.useCallback(async () => {
    const next = !open
    setOpen(next)
    if (next && schema === null) {
      setSchemaLoading(true)
      try {
        const result = await api.toolSchema(hit.toolId)
        setSchema(result)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        setSchema(null)
        onReportError(message)
      } finally {
        setSchemaLoading(false)
      }
    }
  }, [open, schema, hit.toolId, onReportError])

  const handleInvoke = React.useCallback(async () => {
    let parsed: unknown
    try {
      parsed = JSON.parse(input || "{}")
    } catch {
      onReportError("Input must be valid JSON.")
      return
    }
    setInvoking(true)
    setOutputError(null)
    try {
      const result = await api.invokeTool(hit.toolId, parsed)
      setOutput(result)
      setOutputAt(Date.now())
      onReportSuccess(`Invoked ${hit.toolId}.`)
      onTraced()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setOutput(null)
      setOutputError(message)
    } finally {
      setInvoking(false)
    }
  }, [input, hit.toolId, onReportError, onReportSuccess, onTraced])

  return (
    <li className={cn(open && "bg-accent/15")}>
      <button
        type="button"
        onClick={() => void toggle()}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/30"
        aria-expanded={open}
      >
        <span className="text-muted-foreground">
          {open ? (
            <ChevronDown className="size-3.5" />
          ) : (
            <ChevronRight className="size-3.5" />
          )}
        </span>
        <span className="grid size-7 place-items-center rounded-md bg-muted/30 text-muted-foreground shrink-0">
          <Code2 className="size-3.5" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[12.5px] text-foreground truncate">
            {hit.toolId}
          </p>
          {hit.description ? (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
              {hit.description}
            </p>
          ) : null}
        </div>
        {hit.namespace ? (
          <Badge variant="secondary" className="shrink-0 text-[10px]">
            {hit.namespace}
          </Badge>
        ) : null}
      </button>

      {open ? (
        <div className="border-t border-border bg-background/30 px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 min-w-0">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
                Schema
              </p>
              {schemaLoading ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  Loading schema…
                </div>
              ) : schema !== null ? (
                <pre className="max-h-64 overflow-auto rounded-md border border-border bg-card p-3 text-[11px] font-mono leading-relaxed">
{JSON.stringify(schema, null, 2)}
                </pre>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Schema unavailable.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
                Input
              </p>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                spellCheck={false}
                className="min-h-[120px]"
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => void handleInvoke()}
                  disabled={invoking}
                >
                  {invoking ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <PlayCircle className="size-3.5" />
                  )}
                  Invoke
                </Button>
                {output !== null || outputError !== null ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setOutput(null)
                      setOutputError(null)
                      setOutputAt(null)
                    }}
                  >
                    <Trash2 className="size-3.5" />
                    Clear
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          {output !== null ? (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
                  Result
                </p>
                {outputAt ? (
                  <span className="text-[10.5px] text-muted-foreground tabular-nums">
                    {timeAgo(outputAt)}
                  </span>
                ) : null}
              </div>
              <pre className="max-h-72 overflow-auto rounded-md border border-border bg-card p-3 text-[11px] font-mono leading-relaxed">
{JSON.stringify(output, null, 2)}
              </pre>
            </div>
          ) : outputError ? (
            <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              {outputError}
            </div>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}
