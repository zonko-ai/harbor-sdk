import * as React from "react"

export type ThemePreference = "light" | "dark" | "system"
export type ResolvedTheme = "light" | "dark"

const STORAGE_KEY = "harbor-local-theme"

function readStoredPreference(): ThemePreference {
  if (typeof window === "undefined") return "system"
  const raw = window.localStorage.getItem(STORAGE_KEY)
  return raw === "light" || raw === "dark" || raw === "system" ? raw : "system"
}

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return true
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

function applyResolved(theme: ResolvedTheme) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  root.classList.toggle("dark", theme === "dark")
  root.setAttribute("data-theme", theme)
}

export interface ThemeContextValue {
  preference: ThemePreference
  resolved: ResolvedTheme
  setPreference: (next: ThemePreference) => void
  toggle: () => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = React.useState<ThemePreference>(() =>
    readStoredPreference(),
  )
  const [systemDark, setSystemDark] = React.useState<boolean>(() => systemPrefersDark())

  // Track system preference changes so "system" updates live.
  React.useEffect(() => {
    if (typeof window === "undefined") return
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = (event: MediaQueryListEvent) => setSystemDark(event.matches)
    media.addEventListener("change", handler)
    return () => media.removeEventListener("change", handler)
  }, [])

  const resolved: ResolvedTheme =
    preference === "system" ? (systemDark ? "dark" : "light") : preference

  // Apply class to <html> whenever resolved theme changes.
  React.useEffect(() => {
    applyResolved(resolved)
  }, [resolved])

  const setPreference = React.useCallback((next: ThemePreference) => {
    setPreferenceState(next)
    try {
      if (next === "system") window.localStorage.removeItem(STORAGE_KEY)
      else window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore storage errors (private mode, etc.)
    }
  }, [])

  const toggle = React.useCallback(() => {
    setPreference(resolved === "dark" ? "light" : "dark")
  }, [resolved, setPreference])

  const value = React.useMemo(
    () => ({ preference, resolved, setPreference, toggle }),
    [preference, resolved, setPreference, toggle],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return ctx
}
