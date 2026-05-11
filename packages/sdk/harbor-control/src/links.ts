// Harbor dashboard URL builder — env-agnostic mirror of
// apps/lighthouse/src/links.ts. Takes a plain base URL string instead
// of a LighthouseBindings object so any consumer (lighthouse, coast,
// future MCP surfaces, docs) can import this without dragging in
// worker-specific bindings.

export interface HarborLinks {
  /** Root of the Harbor web app (no trailing slash). */
  base: string;
  /** Public marketing + external links that are safe to share unauthenticated. */
  marketing: {
    home: string;
    connect_guide: string;
    docs: string;
    skills: string;
    github: string;
    support_email: string;
  };
  /** In-app dashboard surfaces. Require a signed-in session. */
  dashboard: {
    overview: string;
    runs: string;
    agents: string;
    settings: string;
    settings_members: string;
    settings_invites: string;
    settings_audit: string;
    settings_account: string;
  };
  /** URL templates — replace `{slug}` with the plugin's registry slug. */
  templates: {
    plugin_detail: string;
  };
}

/**
 * Named dashboard "sections" resolvable via the `hrbr://harbor/links`
 * resource. Stays in lockstep with `HarborLinks.dashboard`.
 */
export const DASHBOARD_SECTIONS = [
  "overview",
  "runs",
  "agents",
  "settings",
  "settings_members",
  "settings_invites",
  "settings_audit",
  "settings_account",
] as const;
export type DashboardSection = (typeof DASHBOARD_SECTIONS)[number];

/**
 * Build the full link catalog. `base` should be the origin (no trailing
 * slash) of the Harbor web app: e.g. `http://localhost:3000`,
 * `https://stag.tryharbor.ai`, `https://tryharbor.ai`.
 */
export function buildHarborLinks(base: string): HarborLinks {
  const origin = base.replace(/\/$/, "");
  const path = (p: string) => `${origin}${p}`;
  return {
    base: origin,
    marketing: {
      home: path("/"),
      connect_guide: path("/connect"),
      docs: "https://docs.tryharbor.ai",
      skills: path("/skills"),
      github: "https://github.com/zonko-hbr/harbor",
      support_email: "mailto:support@tryharbor.ai",
    },
    dashboard: {
      overview: path("/dashboard/overview"),
      runs: path("/dashboard/traces"),
      agents: path("/dashboard/agents"),
      settings: path("/dashboard/settings"),
      settings_members: path("/dashboard/settings?tab=members"),
      settings_invites: path("/dashboard/settings?tab=invites"),
      settings_audit: path("/dashboard/settings?tab=audit"),
      settings_account: path("/dashboard/settings?tab=account"),
    },
    templates: {
      plugin_detail: path("/dashboard/plugins/{slug}"),
    },
  };
}

/** Resolve a single dashboard section to its URL. */
export function dashboardSectionUrl(
  base: string,
  section: DashboardSection,
): string {
  return buildHarborLinks(base).dashboard[section];
}

/**
 * Dashboard URL for a single plugin by slug. Slug is URL-encoded so
 * registry slugs with reserved characters (none today but defensive)
 * never break the route.
 */
export function pluginDashboardUrl(base: string, slug: string | null | undefined): string | null {
  if (!slug || typeof slug !== "string" || slug.trim().length === 0) return null;
  const origin = base.replace(/\/$/, "");
  return `${origin}/dashboard/plugins/${encodeURIComponent(slug)}`;
}
