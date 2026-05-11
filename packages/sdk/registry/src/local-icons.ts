// @hrbr/registry — committed JSON-backed local plugin icon metadata.
import { REGISTRY_CATALOG_LOCAL_ICONS } from "@hrbr/registry-catalog"
import type { LocalIcon } from "./local-icon-style"

export const LOCAL_ICONS: Record<string, LocalIcon> = REGISTRY_CATALOG_LOCAL_ICONS as Record<string, LocalIcon>

export const LOCAL_ICON_PATHS: Record<string, string> = Object.fromEntries(
  Object.entries(LOCAL_ICONS).map(([slug, icon]) =>
    icon.kind === "single" ? [slug, icon.path] : [slug, icon.light],
  ),
)
