// Canonical Harbor API route paths.
//
// Source of truth for every path `coast` and `lighthouse` POST to. When a
// Harbor API route moves, update here first and the import graph follows.
// Keep this file pure and side-effect free — no Effect, no network, no
// cross-imports. That way it's safe to import anywhere (workers, node,
// browser) with zero overhead.

// Most paths here are workspace-scoped. `/internal/*` is pre-workspace
// (used before the MCP session has bound a workspace), and `/users/*` +
// `/invites/*` are authenticated user-level surfaces for profile state
// and incoming invites.
export const ROUTES = {
  users: {
    me: "/users/me",
  },
  auth: {
    device: "/auth/device",
    poll: "/auth/poll",
    claimUserCode: "/auth/claim-user-code",
    workspaceKey: "/auth/workspace-key",
    mcp: {
      start: "/auth/mcp/start",
    },
  },
  apiKeys: {
    revoke: "/api-keys/revoke",
  },
  invites: {
    mine: "/invites/mine",
    accept: "/invites/accept",
  },
  workspaces: {
    list: "/workspaces/list",
    create: "/workspaces/create",
    get: "/workspaces/get",
    invites: {
      list: "/workspaces/invites/list",
      send: "/workspaces/invites/send",
      revoke: "/workspaces/invites/revoke",
    },
  },
  agents: {
    announce: "/agents/announce",
    list: "/agents/list",
    update: "/agents/update",
  },
  runs: {
    list: "/runs/list",
    get: "/runs/get",
    graph: "/runs/graph",
    cancel: "/runs/cancel",
    artifacts: {
      list: (runId: string) => `/runs/${runId}/artifacts/list`,
      get: (runId: string) => `/runs/${runId}/artifacts/get`,
    },
  },
  orbit: {
    apps: {
      list: "/orbit/apps/list",
      inspect: "/orbit/apps/inspect",
      publish: "/orbit/apps/publish",
      open: "/orbit/apps/open",
      disable: "/orbit/apps/disable",
    },
    jobs: {
      list: "/orbit/jobs/list",
      inspect: "/orbit/jobs/inspect",
      versions: "/orbit/jobs/versions",
      publish: "/orbit/jobs/publish",
      run: "/orbit/jobs/run",
      disable: "/orbit/jobs/disable",
    },
  },
  workflows: {
    list: "/workflows/list",
    get: "/workflows/get",
  },
  plugins: {
    invoke: "/plugins/invoke",
    sources: {
      list: "/plugins/sources/list",
      get: "/plugins/sources/get",
      add: "/plugins/sources/add",
      probe: "/plugins/sources/probe",
      refresh: "/plugins/sources/refresh",
      remove: "/plugins/sources/remove",
      visibility: {
        set: "/plugins/sources/visibility/set",
      },
      verification: {
        get: "/plugins/sources/verification/get",
        probe: "/plugins/sources/verification/probe",
        set: "/plugins/sources/verification/set",
      },
      oauth: {
        start: "/plugins/sources/oauth/start",
        reconnect: "/plugins/sources/oauth/reconnect",
        setupHints: "/plugins/sources/oauth/setup-hints",
      },
    },
    installJobs: {
      get: "/plugins/install-jobs/get",
      list: "/plugins/install-jobs/list",
    },
    skills: {
      installed: {
        list: "/plugins/skills/installed/list",
      },
      list: "/plugins/skills/list",
      check: "/plugins/skills/check",
      get: "/plugins/skills/get",
      install: {
        record: "/plugins/skills/install/record",
      },
      uninstall: {
        record: "/plugins/skills/uninstall/record",
      },
    },
    tools: {
      list: "/plugins/tools/list",
      search: "/plugins/tools/search",
      describe: "/plugins/tools/describe",
      schema: "/plugins/tools/schema",
      schemas: "/plugins/tools/schemas",
    },
    meta: {
      search: "/plugins/meta/search",
    },
    registry: {
      list: "/plugins/registry/list",
      install: "/plugins/registry/install",
    },
    oauth: {
      workspaceClients: {
        list: "/plugins/oauth/workspace-clients/list",
        set: "/plugins/oauth/workspace-clients/set",
        delete: "/plugins/oauth/workspace-clients/delete",
      },
    },
  },
  exec: "/plugins/execute",
  internal: {
    resolveUser: "/internal/resolve-user",
    userWorkspaces: "/internal/user-workspaces",
    clientWorkspaceSelection: {
      get: "/internal/client-workspace-selection/get",
      set: "/internal/client-workspace-selection/set",
      select: "/internal/client-workspace-selection/select",
      clear: "/internal/client-workspace-selection/clear",
    },
  },
} as const;

export type Routes = typeof ROUTES;
