import { Schema } from "effect";

//#region ../core-effect/src/control.d.ts
declare const EXEC_DEFAULT_TIMEOUT_MS = 600000;
declare const EXEC_MAX_TIMEOUT_MS = 600000;
declare const ROUTES: {
  readonly users: {
    readonly me: "/users/me";
  };
  readonly auth: {
    readonly device: "/auth/device";
    readonly poll: "/auth/poll";
    readonly claimUserCode: "/auth/claim-user-code";
    readonly workspaceKey: "/auth/workspace-key";
    readonly mcp: {
      readonly start: "/auth/mcp/start";
    };
  };
  readonly apiKeys: {
    readonly revoke: "/api-keys/revoke";
  };
  readonly invites: {
    readonly mine: "/invites/mine";
    readonly accept: "/invites/accept";
  };
  readonly workspaces: {
    readonly list: "/workspaces/list";
    readonly create: "/workspaces/create";
    readonly get: "/workspaces/get";
    readonly invites: {
      readonly list: "/workspaces/invites/list";
      readonly send: "/workspaces/invites/send";
      readonly revoke: "/workspaces/invites/revoke";
    };
  };
  readonly agents: {
    readonly announce: "/agents/announce";
    readonly list: "/agents/list";
    readonly update: "/agents/update";
  };
  readonly runs: {
    readonly list: "/runs/list";
    readonly get: "/runs/get";
    readonly graph: "/runs/graph";
    readonly cancel: "/runs/cancel";
    readonly artifacts: {
      readonly list: (runId: string) => string;
      readonly get: (runId: string) => string;
    };
  };
  readonly orbit: {
    readonly apps: {
      readonly list: "/orbit/apps/list";
      readonly inspect: "/orbit/apps/inspect";
      readonly publish: "/orbit/apps/publish";
      readonly open: "/orbit/apps/open";
      readonly disable: "/orbit/apps/disable";
    };
    readonly jobs: {
      readonly list: "/orbit/jobs/list";
      readonly inspect: "/orbit/jobs/inspect";
      readonly versions: "/orbit/jobs/versions";
      readonly publish: "/orbit/jobs/publish";
      readonly run: "/orbit/jobs/run";
      readonly disable: "/orbit/jobs/disable";
    };
  };
  readonly triggers: {
    readonly inspect: "/triggers/inspect";
    readonly activate: "/triggers/activate";
    readonly list: "/triggers/list";
    readonly get: "/triggers/get";
    readonly pause: "/triggers/pause";
    readonly resume: "/triggers/resume";
    readonly disable: "/triggers/disable";
    readonly replay: "/triggers/replay";
    readonly deliveries: {
      readonly list: "/triggers/deliveries/list";
      readonly get: "/triggers/deliveries/get";
    };
    readonly limits: {
      readonly get: "/triggers/limits/get";
      readonly update: "/triggers/limits/update";
    };
  };
  readonly workflows: {
    readonly list: "/workflows/list";
    readonly get: "/workflows/get";
  };
  readonly plugins: {
    readonly sources: {
      readonly list: "/plugins/sources/list";
      readonly get: "/plugins/sources/get";
      readonly add: "/plugins/sources/add";
      readonly refresh: "/plugins/sources/refresh";
      readonly remove: "/plugins/sources/remove";
      readonly visibility: {
        readonly set: "/plugins/sources/visibility/set";
      };
      readonly oauth: {
        readonly start: "/plugins/sources/oauth/start";
        readonly reconnect: "/plugins/sources/oauth/reconnect";
        readonly setupHints: "/plugins/sources/oauth/setup-hints";
      };
    };
    readonly installJobs: {
      readonly get: "/plugins/install-jobs/get";
    };
    readonly skills: {
      readonly installed: {
        readonly list: "/plugins/skills/installed/list";
      };
      readonly list: "/plugins/skills/list";
      readonly check: "/plugins/skills/check";
      readonly get: "/plugins/skills/get";
      readonly install: {
        readonly record: "/plugins/skills/install/record";
      };
      readonly uninstall: {
        readonly record: "/plugins/skills/uninstall/record";
      };
    };
    readonly tools: {
      readonly list: "/plugins/tools/list";
      readonly search: "/plugins/tools/search";
      readonly describe: "/plugins/tools/describe";
      readonly schema: "/plugins/tools/schema";
      readonly schemas: "/plugins/tools/schemas";
    };
    readonly meta: {
      readonly search: "/plugins/meta/search";
    };
    readonly registry: {
      readonly list: "/plugins/registry/list";
      readonly install: "/plugins/registry/install";
    };
    readonly oauth: {
      readonly workspaceClients: {
        readonly list: "/plugins/oauth/workspace-clients/list";
        readonly set: "/plugins/oauth/workspace-clients/set";
        readonly delete: "/plugins/oauth/workspace-clients/delete";
      };
    };
  };
  readonly exec: "/plugins/execute";
  readonly internal: {
    readonly resolveUser: "/internal/resolve-user";
    readonly userWorkspaces: "/internal/user-workspaces";
    readonly clientWorkspaceSelection: {
      readonly get: "/internal/client-workspace-selection/get";
      readonly set: "/internal/client-workspace-selection/set";
      readonly select: "/internal/client-workspace-selection/select";
      readonly clear: "/internal/client-workspace-selection/clear";
    };
  };
};
type Routes = typeof ROUTES;
declare const CATEGORY_LABELS: Record<string, string>;
declare const CATEGORY_SLUGS: readonly ["search", "ai", "comms", "dev", "data", "web", "media", "infra", "observability", "analytics", "storage", "other"];
type CategorySlug = (typeof CATEGORY_SLUGS)[number];
declare const WORKSPACE_ROLES: readonly ["owner", "admin", "member", "viewer"];
type ControlWorkspaceRole = (typeof WORKSPACE_ROLES)[number];
declare const PLUGIN_TRANSPORTS: readonly ["http", "sse", "auto"];
type PluginTransport = (typeof PLUGIN_TRANSPORTS)[number];
interface HarborLinks {
  readonly base: string;
  readonly marketing: {
    readonly home: string;
    readonly connect_guide: string;
    readonly docs: string;
    readonly skills: string;
    readonly github: string;
    readonly support_email: string;
  };
  readonly dashboard: {
    readonly overview: string;
    readonly runs: string;
    readonly agents: string;
    readonly settings: string;
    readonly settings_members: string;
    readonly settings_invites: string;
    readonly settings_audit: string;
    readonly settings_account: string;
  };
  readonly templates: {
    readonly plugin_detail: string;
  };
}
declare const DASHBOARD_SECTIONS: readonly ["overview", "runs", "agents", "settings", "settings_members", "settings_invites", "settings_audit", "settings_account"];
type DashboardSection = (typeof DASHBOARD_SECTIONS)[number];
declare function buildHarborLinks(base: string): HarborLinks;
declare function dashboardSectionUrl(base: string, section: DashboardSection): string;
declare function pluginDashboardUrl(base: string, slug: string | null | undefined): string | null;
declare const WorkspaceRoleSchema: Schema.Literals<readonly ["owner", "admin", "member", "viewer"]>;
declare const WorkspaceRow: Schema.Struct<{
  readonly id: Schema.String;
  readonly name: Schema.String;
  readonly slug: Schema.String;
  readonly role: Schema.optional<Schema.String>;
  readonly created_at: Schema.optional<Schema.String>;
  readonly updated_at: Schema.optional<Schema.String>;
}>;
type WorkspaceRow = typeof WorkspaceRow.Type;
declare const WorkspaceInviteRow: Schema.Struct<{
  readonly id: Schema.String;
  readonly email: Schema.String;
  readonly role: Schema.String;
  readonly workspace_id: Schema.String;
  readonly invited_by: Schema.optional<Schema.String>;
  readonly created_at: Schema.optional<Schema.String>;
  readonly expires_at: Schema.optional<Schema.String>;
  readonly status: Schema.optional<Schema.String>;
}>;
type WorkspaceInviteRow = typeof WorkspaceInviteRow.Type;
declare const WorkspaceOauthClient: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly slug: Schema.String;
  readonly client_id: Schema.String;
  readonly redirect_uri: Schema.optional<Schema.String>;
  readonly scope: Schema.optional<Schema.String>;
  readonly updated_at: Schema.optional<Schema.String>;
  readonly created_by: Schema.optional<Schema.String>;
}>;
type WorkspaceOauthClient = typeof WorkspaceOauthClient.Type;
declare const ControlClientIdentity: Schema.Struct<{
  readonly clientName: Schema.NonEmptyString;
  readonly clientVersion: Schema.NonEmptyString;
  readonly machineId: Schema.optional<Schema.String>;
  readonly agentFamily: Schema.optional<Schema.String>;
}>;
type ControlClientIdentity = typeof ControlClientIdentity.Type;
//#endregion
export { CATEGORY_LABELS, CATEGORY_SLUGS, CategorySlug, ControlClientIdentity, ControlWorkspaceRole, DASHBOARD_SECTIONS, DashboardSection, EXEC_DEFAULT_TIMEOUT_MS, EXEC_MAX_TIMEOUT_MS, HarborLinks, PLUGIN_TRANSPORTS, PluginTransport, ROUTES, Routes, WORKSPACE_ROLES, WorkspaceInviteRow, WorkspaceOauthClient, WorkspaceRoleSchema, WorkspaceRow, buildHarborLinks, dashboardSectionUrl, pluginDashboardUrl };
//# sourceMappingURL=control.d.mts.map