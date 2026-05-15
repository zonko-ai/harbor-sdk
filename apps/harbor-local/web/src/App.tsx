import * as React from "react"
import { Sidebar, type PageId } from "@/components/sidebar/sidebar"
import { OverviewPage } from "@/pages/overview-page"
import { PluginsPage } from "@/pages/plugins-page"
import { PluginDetailPage } from "@/pages/plugin-detail-page"
import { TracesPage } from "@/pages/traces-page"
import { useHarborData } from "@/hooks/use-harbor-data"
import { Notice } from "@/components/notice"

type Route =
  | { kind: "overview" }
  | { kind: "plugins" }
  | { kind: "plugin-detail"; slug: string }
  | { kind: "traces" }

function parseHash(): Route {
  const raw = window.location.hash.replace(/^#\/?/, "")
  const segments = raw.split("/").filter(Boolean)
  const head = segments[0]
  if (head === "plugins") {
    const slug = segments[1]
    return slug ? { kind: "plugin-detail", slug: decodeURIComponent(slug) } : { kind: "plugins" }
  }
  if (head === "traces") return { kind: "traces" }
  return { kind: "overview" }
}

function navigationFor(route: Route): PageId {
  return route.kind === "plugin-detail" ? "plugins" : route.kind
}

function hrefFor(route: Route): string {
  if (route.kind === "overview") return "#overview"
  if (route.kind === "plugins") return "#plugins"
  if (route.kind === "traces") return "#traces"
  return `#plugins/${encodeURIComponent(route.slug)}`
}

export function App() {
  const data = useHarborData()
  const [route, setRoute] = React.useState<Route>(() => parseHash())

  React.useEffect(() => {
    function sync() {
      setRoute(parseHash())
    }
    window.addEventListener("hashchange", sync)
    return () => window.removeEventListener("hashchange", sync)
  }, [])

  const navigate = React.useCallback((next: Route) => {
    const href = hrefFor(next)
    if (window.location.hash !== href) {
      window.location.hash = href
    } else {
      setRoute(next)
    }
  }, [])

  const goto = React.useCallback(
    (page: PageId) => navigate({ kind: page } as Route),
    [navigate],
  )

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[16rem_minmax(0,1fr)] bg-background text-foreground">
      <Sidebar currentPage={navigationFor(route)} onNavigate={goto} health={data.health} />
      <div className="flex min-w-0 flex-col">
        {data.error ? (
          <div className="px-4 sm:px-8 pt-4">
            <Notice tone="error" message={data.error} />
          </div>
        ) : null}
        {route.kind === "overview" ? (
          <OverviewPage data={data} onNavigate={(p) => goto(p)} />
        ) : route.kind === "plugins" ? (
          <PluginsPage
            data={data}
            onOpenPlugin={(slug) => navigate({ kind: "plugin-detail", slug })}
          />
        ) : route.kind === "plugin-detail" ? (
          <PluginDetailPage
            data={data}
            slug={route.slug}
            onBack={() => navigate({ kind: "plugins" })}
          />
        ) : (
          <TracesPage data={data} />
        )}
      </div>
    </div>
  )
}
