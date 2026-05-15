import * as React from "react"
import { Blocks, Link2, RefreshCw, Search, X } from "lucide-react"
import { PageScaffold } from "@/components/page-scaffold/page-scaffold"
import { SectionHeader } from "@/components/section-header"
import { PluginCard } from "@/components/plugin-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Notice } from "@/components/notice"
import { cn } from "@/lib/utils"
import { api, type CatalogEntry, type InstalledSource } from "@/lib/api"
import type { HarborData } from "@/hooks/use-harbor-data"

interface PluginsPageProps {
  data: HarborData
  onOpenPlugin: (slug: string) => void
}

function categoryOf(value?: string): string {
  return value && value.trim().length > 0 ? value : "general"
}

interface ConnectedGroup {
  category: string
  sources: InstalledSource[]
}

function groupConnected(
  sources: InstalledSource[],
  catalog: CatalogEntry[],
): ConnectedGroup[] {
  const byCategory = new Map<string, InstalledSource[]>()
  for (const source of sources) {
    const entry = catalog.find(
      (c) => c.defaultNamespace === source.namespace || c.slug === source.id,
    )
    const cat = categoryOf(entry?.category)
    if (!byCategory.has(cat)) byCategory.set(cat, [])
    byCategory.get(cat)!.push(source)
  }
  return [...byCategory.entries()]
    .map(([category, items]) => ({
      category,
      sources: items.sort((a, b) =>
        (a.name ?? a.id).localeCompare(b.name ?? b.id),
      ),
    }))
    .sort((a, b) => a.category.localeCompare(b.category))
}

export function PluginsPage({ data, onOpenPlugin }: PluginsPageProps) {
  const [search, setSearch] = React.useState("")
  const [category, setCategory] = React.useState<string>("all")
  const [notice, setNotice] = React.useState<{
    tone: "info" | "error" | "success"
    message: string
  } | null>(null)
  const [busyId, setBusyId] = React.useState<string | null>(null)

  const q = search.trim().toLowerCase()

  const categories = React.useMemo(() => {
    const set = new Set(data.catalog.map((entry) => categoryOf(entry.category)))
    return ["all", ...[...set].sort()]
  }, [data.catalog])

  const filteredCatalog = React.useMemo(() => {
    return data.catalog.filter((entry) => {
      if (category !== "all" && categoryOf(entry.category) !== category) return false
      if (!q) return true
      return [
        entry.displayName,
        entry.slug,
        entry.description,
        entry.defaultNamespace,
        entry.category,
      ].some((v) => String(v ?? "").toLowerCase().includes(q))
    })
  }, [data.catalog, category, q])

  const connectedSources = React.useMemo(() => {
    if (!q) return data.sources
    return data.sources.filter((source) => {
      const entry = data.catalog.find(
        (c) => c.defaultNamespace === source.namespace || c.slug === source.id,
      )
      return [
        source.name,
        source.namespace,
        source.id,
        entry?.displayName,
        entry?.description,
        entry?.category,
      ].some((v) => String(v ?? "").toLowerCase().includes(q))
    })
  }, [data.sources, data.catalog, q])

  const connectedGroups = React.useMemo(
    () => groupConnected(connectedSources, data.catalog),
    [connectedSources, data.catalog],
  )

  const availableCatalog = React.useMemo(
    () =>
      filteredCatalog.filter(
        (entry) =>
          !data.sources.some(
            (source) =>
              source.id === entry.slug ||
              source.namespace === entry.defaultNamespace,
          ),
      ),
    [filteredCatalog, data.sources],
  )

  const handleConnect = React.useCallback(
    async (entry: CatalogEntry) => {
      const slug = entry.slug
      setBusyId(slug)
      setNotice(null)
      try {
        const oauth = entry.auth?.mode === "oauth2"
        const result = await api.install({ slug, connect: oauth })
        if (result.oauth?.authorizationUrl) {
          window.open(result.oauth.authorizationUrl, "_blank", "noopener,noreferrer")
          setNotice({
            tone: "info",
            message: `Opened OAuth for ${result.oauth.sourceId}. Return after approval and refresh.`,
          })
        } else {
          setNotice({ tone: "success", message: `Installed ${result.source.id}.` })
        }
        await data.refetch()
        onOpenPlugin(slug)
      } catch (err) {
        setNotice({
          tone: "error",
          message: err instanceof Error ? err.message : String(err),
        })
      } finally {
        setBusyId(null)
      }
    },
    [data, onOpenPlugin],
  )

  return (
    <PageScaffold
      title="Plugins"
      titleIcon={<Blocks className="size-7" strokeWidth={1.75} />}
      description="Your connected MCP plugins and the local catalog."
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
      <div className="flex flex-col gap-5">
        {notice ? (
          <Notice
            tone={notice.tone}
            message={notice.message}
            onDismiss={() => setNotice(null)}
          />
        ) : null}

        <div className="mx-auto w-full max-w-[1176px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plugins, namespaces, descriptions…"
              className="h-10 pl-10 pr-10"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        <section>
          <SectionHeader
            title="Connected"
            count={data.sources.length}
            countLabel={data.sources.length === 1 ? "plugin" : "plugins"}
            icon={<Link2 />}
          />
          {data.sources.length === 0 ? (
            <div className="mx-auto w-full max-w-[1176px] rounded-md border border-dashed border-border/70 bg-card/40 p-10 text-center">
              <p className="text-sm font-medium text-foreground">
                No plugins installed yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Pick one from the catalog below to install it locally.
              </p>
            </div>
          ) : connectedGroups.length === 0 ? (
            <div className="mx-auto w-full max-w-[1176px] rounded-md border border-dashed border-border/70 bg-card/40 p-8 text-center text-sm text-muted-foreground">
              No connected plugins match this search.
            </div>
          ) : (
            <div className="mx-auto grid max-w-[1176px] grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {connectedGroups.flatMap((group) =>
                group.sources.map((source) => {
                  const entry = data.catalog.find(
                    (c) =>
                      c.defaultNamespace === source.namespace ||
                      c.slug === source.id,
                  )
                  const synthetic: CatalogEntry = entry ?? {
                    slug: source.id,
                    displayName: source.name ?? source.id,
                    defaultNamespace: source.namespace ?? source.id,
                    endpoint: source.endpoint ?? "",
                    category: group.category,
                  }
                  return (
                    <PluginCard
                      key={source.id}
                      entry={synthetic}
                      source={source}
                      onClick={() => onOpenPlugin(synthetic.slug)}
                    />
                  )
                }),
              )}
            </div>
          )}
        </section>

        <section>
          <SectionHeader
            title="Available"
            count={availableCatalog.length}
            countLabel={availableCatalog.length === 1 ? "plugin" : "plugins"}
            icon={<Blocks />}
            action={
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-8 w-auto min-w-[140px] text-xs"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "all" ? "All categories" : c}
                  </option>
                ))}
              </Select>
            }
          />
          {availableCatalog.length === 0 ? (
            <div className="mx-auto w-full max-w-[1176px] rounded-md border border-dashed border-border/70 bg-card/40 p-8 text-center text-sm text-muted-foreground">
              No catalog plugins match this filter.
            </div>
          ) : (
            <div className="mx-auto grid max-w-[1176px] grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {availableCatalog.map((entry) => (
                <PluginCard
                  key={entry.slug}
                  entry={entry}
                  onClick={() => onOpenPlugin(entry.slug)}
                  onConnect={() => void handleConnect(entry)}
                  disabled={
                    entry.localAvailability?.selectable === false ||
                    busyId === entry.slug
                  }
                  disabledLabel={
                    busyId === entry.slug ? "Installing…" : "Unavailable"
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </PageScaffold>
  )
}
