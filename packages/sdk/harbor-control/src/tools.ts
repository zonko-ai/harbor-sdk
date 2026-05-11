// MCP tool name catalog shared between lighthouse and any future
// surface that wants to advertise/dispatch the same tool names
// (e.g. a coast `hrbr mcp call <tool>` shim).
//
// Pure string constants — importable from worker or node.

export const TOOL_NAMES = {
  profile: "profile",
  workspace: "workspace",
  plugins: "plugins",
  sources: "sources",
  exec: "exec",
  skill: "skill",
  jobs: "jobs",
  workflow: "workflow",
} as const;

export type ToolName = (typeof TOOL_NAMES)[keyof typeof TOOL_NAMES];

// Action enums per tool. These are the source of truth for JSON-schema
// `enum` emission and dispatcher exhaustiveness checks.

export const PROFILE_ACTIONS = [
  "current",
  "invite_list",
  "invite_accept",
  "settings",
] as const;
export type ProfileAction = (typeof PROFILE_ACTIONS)[number];

export const WORKSPACE_ACTIONS = [
  "list",
  "current",
  "select",
  "clear",
  "create",
  "invite_list",
  "invite_send",
  "invite_revoke",
] as const;
export type WorkspaceAction = (typeof WORKSPACE_ACTIONS)[number];

// `plugins` is read-only. `list` (no namespace) is the canonical
// install / connection check; `registry` browses installable entries;
// `tools` drills into one installed source; `search` is a keyword
// index over DISCOVERED tools only; `schema` returns exact I/O shapes.
export const PLUGINS_ACTIONS = [
  "list",
  "registry",
  "tools",
  "search",
  "schema",
] as const;
export type PluginsAction = (typeof PLUGINS_ACTIONS)[number];

// `sources` is mutations only. `install` (registry) and `add` (custom
// MCP endpoint) return `oauth_url` inline when the source needs OAuth
// so no second call is required for the common case. `connect` re-runs
// the OAuth authorize step explicitly.
export const SOURCES_ACTIONS = [
  "install",
  "add",
  "connect",
  "refresh",
  "remove",
  "auth_status",
] as const;
export type SourcesAction = (typeof SOURCES_ACTIONS)[number];

// `skill` is read-only. Returns the SKILL.md content for a plugin's
// shipped agent skill so the caller can inline it into its own context.
// No local install — the response is the markdown body verbatim.
export const SKILL_ACTIONS = ["list", "get"] as const;
export type SkillAction = (typeof SKILL_ACTIONS)[number];

// `workflow` is read-only. Returns the curated workflow body for an
// agent to fetch on demand after onboarding hands it a workflow_id.
// Catalog is workspace-bound (auth) but content is the same for every
// workspace today — Phase 2 may scope custom workflows per workspace.
export const WORKFLOW_ACTIONS = ["list", "get"] as const;
export type WorkflowAction = (typeof WORKFLOW_ACTIONS)[number];

// `jobs` exposes workspace-scoped named functions. Agents use it to
// discover, inspect, publish, run, version-list, and disable jobs without
// knowing API routes, D1 tables, or execution-lane internals.
export const JOBS_ACTIONS = [
  "list",
  "inspect",
  "publish",
  "run",
  "versions",
  "disable",
] as const;
export type JobsAction = (typeof JOBS_ACTIONS)[number];

// Role enum (re-used in workspace.invite_send).
export const WORKSPACE_ROLES = ["owner", "admin", "member", "viewer"] as const;
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

// Transport enum for sources.add.
export const PLUGIN_TRANSPORTS = ["http", "sse", "auto"] as const;
export type PluginTransport = (typeof PLUGIN_TRANSPORTS)[number];
