import { Schema } from "effect";
//#region ../core-effect/src/control.ts
const EXEC_DEFAULT_TIMEOUT_MS = 6e5;
const EXEC_MAX_TIMEOUT_MS = 6e5;
const ROUTES = {
	users: { me: "/users/me" },
	auth: {
		device: "/auth/device",
		poll: "/auth/poll",
		claimUserCode: "/auth/claim-user-code",
		workspaceKey: "/auth/workspace-key",
		mcp: { start: "/auth/mcp/start" }
	},
	apiKeys: { revoke: "/api-keys/revoke" },
	invites: {
		mine: "/invites/mine",
		accept: "/invites/accept"
	},
	workspaces: {
		list: "/workspaces/list",
		create: "/workspaces/create",
		get: "/workspaces/get",
		invites: {
			list: "/workspaces/invites/list",
			send: "/workspaces/invites/send",
			revoke: "/workspaces/invites/revoke"
		}
	},
	agents: {
		announce: "/agents/announce",
		list: "/agents/list",
		update: "/agents/update"
	},
	runs: {
		list: "/runs/list",
		get: "/runs/get",
		graph: "/runs/graph",
		cancel: "/runs/cancel",
		artifacts: {
			list: (runId) => `/runs/${runId}/artifacts/list`,
			get: (runId) => `/runs/${runId}/artifacts/get`
		}
	},
	orbit: {
		apps: {
			list: "/orbit/apps/list",
			inspect: "/orbit/apps/inspect",
			publish: "/orbit/apps/publish",
			open: "/orbit/apps/open",
			disable: "/orbit/apps/disable"
		},
		jobs: {
			list: "/orbit/jobs/list",
			inspect: "/orbit/jobs/inspect",
			versions: "/orbit/jobs/versions",
			publish: "/orbit/jobs/publish",
			run: "/orbit/jobs/run",
			disable: "/orbit/jobs/disable"
		}
	},
	triggers: {
		inspect: "/triggers/inspect",
		activate: "/triggers/activate",
		list: "/triggers/list",
		get: "/triggers/get",
		pause: "/triggers/pause",
		resume: "/triggers/resume",
		disable: "/triggers/disable",
		replay: "/triggers/replay",
		deliveries: {
			list: "/triggers/deliveries/list",
			get: "/triggers/deliveries/get"
		},
		limits: {
			get: "/triggers/limits/get",
			update: "/triggers/limits/update"
		}
	},
	workflows: {
		list: "/workflows/list",
		get: "/workflows/get"
	},
	plugins: {
		sources: {
			list: "/plugins/sources/list",
			get: "/plugins/sources/get",
			add: "/plugins/sources/add",
			refresh: "/plugins/sources/refresh",
			remove: "/plugins/sources/remove",
			visibility: { set: "/plugins/sources/visibility/set" },
			oauth: {
				start: "/plugins/sources/oauth/start",
				reconnect: "/plugins/sources/oauth/reconnect",
				setupHints: "/plugins/sources/oauth/setup-hints"
			}
		},
		installJobs: { get: "/plugins/install-jobs/get" },
		skills: {
			installed: { list: "/plugins/skills/installed/list" },
			list: "/plugins/skills/list",
			check: "/plugins/skills/check",
			get: "/plugins/skills/get",
			install: { record: "/plugins/skills/install/record" },
			uninstall: { record: "/plugins/skills/uninstall/record" }
		},
		tools: {
			list: "/plugins/tools/list",
			search: "/plugins/tools/search",
			describe: "/plugins/tools/describe",
			schema: "/plugins/tools/schema",
			schemas: "/plugins/tools/schemas"
		},
		meta: { search: "/plugins/meta/search" },
		registry: {
			list: "/plugins/registry/list",
			install: "/plugins/registry/install"
		},
		oauth: { workspaceClients: {
			list: "/plugins/oauth/workspace-clients/list",
			set: "/plugins/oauth/workspace-clients/set",
			delete: "/plugins/oauth/workspace-clients/delete"
		} }
	},
	exec: "/plugins/execute",
	internal: {
		resolveUser: "/internal/resolve-user",
		userWorkspaces: "/internal/user-workspaces",
		clientWorkspaceSelection: {
			get: "/internal/client-workspace-selection/get",
			set: "/internal/client-workspace-selection/set",
			select: "/internal/client-workspace-selection/select",
			clear: "/internal/client-workspace-selection/clear"
		}
	}
};
const CATEGORY_LABELS = {
	search: "Search",
	ai: "AI",
	comms: "Communication",
	dev: "Developer Tools",
	data: "Data",
	web: "Web",
	media: "Media",
	infra: "Infrastructure",
	observability: "Observability",
	analytics: "Analytics",
	storage: "Storage",
	other: "Other"
};
const CATEGORY_SLUGS = [
	"search",
	"ai",
	"comms",
	"dev",
	"data",
	"web",
	"media",
	"infra",
	"observability",
	"analytics",
	"storage",
	"other"
];
const WORKSPACE_ROLES = [
	"owner",
	"admin",
	"member",
	"viewer"
];
const PLUGIN_TRANSPORTS = [
	"http",
	"sse",
	"auto"
];
const DASHBOARD_SECTIONS = [
	"overview",
	"runs",
	"agents",
	"settings",
	"settings_members",
	"settings_invites",
	"settings_audit",
	"settings_account"
];
function buildHarborLinks(base) {
	const origin = base.replace(/\/$/, "");
	const path = (p) => `${origin}${p}`;
	return {
		base: origin,
		marketing: {
			home: path("/"),
			connect_guide: path("/connect"),
			docs: "https://docs.tryharbor.ai",
			skills: path("/skills"),
			github: "https://github.com/zonko-hbr/harbor",
			support_email: "mailto:support@tryharbor.ai"
		},
		dashboard: {
			overview: path("/dashboard/overview"),
			runs: path("/dashboard/traces"),
			agents: path("/dashboard/agents"),
			settings: path("/dashboard/settings"),
			settings_members: path("/dashboard/settings?tab=members"),
			settings_invites: path("/dashboard/settings?tab=invites"),
			settings_audit: path("/dashboard/settings?tab=audit"),
			settings_account: path("/dashboard/settings?tab=account")
		},
		templates: { plugin_detail: path("/dashboard/plugins/{slug}") }
	};
}
function dashboardSectionUrl(base, section) {
	return buildHarborLinks(base).dashboard[section];
}
function pluginDashboardUrl(base, slug) {
	if (!slug || typeof slug !== "string" || slug.trim().length === 0) return null;
	return `${base.replace(/\/$/, "")}/dashboard/plugins/${encodeURIComponent(slug)}`;
}
const WorkspaceRoleSchema = Schema.Literals(WORKSPACE_ROLES);
const WorkspaceRow = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	slug: Schema.String,
	role: Schema.optional(Schema.String),
	created_at: Schema.optional(Schema.String),
	updated_at: Schema.optional(Schema.String)
});
const WorkspaceInviteRow = Schema.Struct({
	id: Schema.String,
	email: Schema.String,
	role: Schema.String,
	workspace_id: Schema.String,
	invited_by: Schema.optional(Schema.String),
	created_at: Schema.optional(Schema.String),
	expires_at: Schema.optional(Schema.String),
	status: Schema.optional(Schema.String)
});
const WorkspaceOauthClient = Schema.Struct({
	workspace_id: Schema.String,
	slug: Schema.String,
	client_id: Schema.String,
	redirect_uri: Schema.optional(Schema.String),
	scope: Schema.optional(Schema.String),
	updated_at: Schema.optional(Schema.String),
	created_by: Schema.optional(Schema.String)
});
const ControlClientIdentity = Schema.Struct({
	clientName: Schema.NonEmptyString,
	clientVersion: Schema.NonEmptyString,
	machineId: Schema.optional(Schema.String),
	agentFamily: Schema.optional(Schema.String)
});
//#endregion
export { CATEGORY_LABELS, CATEGORY_SLUGS, ControlClientIdentity, DASHBOARD_SECTIONS, EXEC_DEFAULT_TIMEOUT_MS, EXEC_MAX_TIMEOUT_MS, PLUGIN_TRANSPORTS, ROUTES, WORKSPACE_ROLES, WorkspaceInviteRow, WorkspaceOauthClient, WorkspaceRoleSchema, WorkspaceRow, buildHarborLinks, dashboardSectionUrl, pluginDashboardUrl };

//# sourceMappingURL=control.mjs.map