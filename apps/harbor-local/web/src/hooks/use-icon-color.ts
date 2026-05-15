import * as React from "react"

const cache = new Map<string, string>()

function hashSeed(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = (h * 16777619) >>> 0
  }
  return h
}

/**
 * Returns a deterministic accent colour for a plugin, derived from its
 * slug. When a real icon URL is supplied we attempt to sample its
 * dominant hue from a thumbnail; failing that we fall back to the hash
 * colour so cards still get a consistent tint without flashing.
 */
export function useIconColor(seed: string | undefined, iconUrl?: string | undefined): string {
  const fallback = React.useMemo(() => {
    const hue = (hashSeed(seed ?? "plugin") % 360 + 360) % 360
    return `oklch(78% 0.18 ${hue})`
  }, [seed])

  const [sampled, setSampled] = React.useState<string | null>(() => {
    return iconUrl ? cache.get(iconUrl) ?? null : null
  })

  React.useEffect(() => {
    if (!iconUrl) {
      setSampled(null)
      return
    }
    const cached = cache.get(iconUrl)
    if (cached) {
      setSampled(cached)
      return
    }
    let cancelled = false
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      try {
        const w = 16
        const h = 16
        const canvas = document.createElement("canvas")
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext("2d", { willReadFrequently: true })
        if (!ctx) return
        ctx.drawImage(img, 0, 0, w, h)
        const pixels = ctx.getImageData(0, 0, w, h).data
        let r = 0
        let g = 0
        let b = 0
        let count = 0
        for (let i = 0; i < pixels.length; i += 4) {
          const alpha = pixels[i + 3]!
          if (alpha < 200) continue
          const pr = pixels[i]!
          const pg = pixels[i + 1]!
          const pb = pixels[i + 2]!
          // Skip near-black / near-white pixels so the beam picks the
          // brand colour rather than icon glyph backgrounds.
          const max = Math.max(pr, pg, pb)
          const min = Math.min(pr, pg, pb)
          if (max - min < 18) continue
          r += pr
          g += pg
          b += pb
          count += 1
        }
        if (!count || cancelled) return
        const avg = `rgb(${Math.round(r / count)} ${Math.round(g / count)} ${Math.round(b / count)})`
        cache.set(iconUrl, avg)
        setSampled(avg)
      } catch {
        // CORS-tainted canvas etc. — fall back to hash colour silently.
      }
    }
    img.onerror = () => {
      cache.set(iconUrl, fallback)
      if (!cancelled) setSampled(fallback)
    }
    img.src = iconUrl
    return () => {
      cancelled = true
    }
  }, [iconUrl, fallback])

  return sampled ?? fallback
}
