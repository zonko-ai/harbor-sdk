import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextValue {
  value: string
  onChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

export function Tabs({
  value,
  onValueChange,
  children,
  className,
}: {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <TabsContext.Provider value={{ value, onChange: onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "inline-flex h-auto items-center justify-start border-b border-border w-full gap-0",
        className,
      )}
      role="tablist"
    >
      {children}
    </div>
  )
}

export function TabsTrigger({
  value,
  className,
  children,
}: {
  value: string
  className?: string
  children: React.ReactNode
}) {
  const ctx = React.useContext(TabsContext)
  if (!ctx) return null
  const active = ctx.value === value
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => ctx.onChange(value)}
      className={cn(
        "relative inline-flex items-center gap-1.5 px-3 py-2.5 -mb-px text-sm font-medium transition-colors border-b-2",
        active
          ? "text-foreground border-foreground"
          : "text-muted-foreground border-transparent hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  className,
  children,
}: {
  value: string
  className?: string
  children: React.ReactNode
}) {
  const ctx = React.useContext(TabsContext)
  if (!ctx || ctx.value !== value) return null
  return <div className={cn("mt-4", className)}>{children}</div>
}
