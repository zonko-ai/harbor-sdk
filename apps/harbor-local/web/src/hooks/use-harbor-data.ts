import * as React from "react"
import { api, type CatalogEntry, type HealthData, type InstalledSource, type InvocationTrace } from "@/lib/api"

export interface HarborData {
  health: HealthData | null
  catalog: CatalogEntry[]
  sources: InstalledSource[]
  traces: InvocationTrace[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useHarborData(): HarborData {
  const [health, setHealth] = React.useState<HealthData | null>(null)
  const [catalog, setCatalog] = React.useState<CatalogEntry[]>([])
  const [sources, setSources] = React.useState<InstalledSource[]>([])
  const [traces, setTraces] = React.useState<InvocationTrace[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const refetch = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [h, c, s, t] = await Promise.all([
        api.health(),
        api.catalog(),
        api.sources(),
        api.invocations(50),
      ])
      setHealth(h)
      setCatalog(c.entries)
      setSources(s.sources)
      setTraces(t.invocations)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void refetch()
  }, [refetch])

  return { health, catalog, sources, traces, loading, error, refetch }
}
