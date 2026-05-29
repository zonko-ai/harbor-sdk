import { Context, Effect, Schema } from "effect";

//#region ../plugins/src/lifecycle.d.ts
type LifecycleRegistryEntry = {
  readonly slug: string;
  readonly kind: SourceKind;
  readonly display_name: string;
  readonly description: string;
  readonly category?: string | undefined;
  readonly icon_url?: string | null | undefined;
  readonly links?: unknown;
  readonly default_namespace?: string | undefined;
  readonly auth: AuthConfig;
  readonly config: Record<string, unknown>;
  readonly manifest?: {
    readonly tools?: ReadonlyArray<unknown> | undefined;
    readonly shared_defs?: unknown;
  } | undefined;
  readonly availability?: {
    readonly selectable: boolean;
  } | undefined;
  readonly oauth_client?: unknown;
};
type LifecycleInstallInput = {
  readonly entry: LifecycleRegistryEntry;
  readonly workspaceId: string;
  readonly actorId: string;
  readonly sourceId: string;
  readonly namespace: string;
  readonly sourceConfig: SourceConfig;
  readonly authConfig: AuthConfig;
  readonly detectedStatus?: SourceStatus | string | undefined;
  readonly primaryCredentialValue?: string | undefined;
  readonly toolInsertConcurrency?: number | undefined;
  readonly workerEnv?: Record<string, string | undefined> | undefined;
  readonly encryptionKey?: string | undefined;
};
type LifecycleRefreshInput = {
  readonly source: PluginSource;
  readonly config: SourceConfig;
  readonly authConfig: AuthConfig;
  readonly actorId: string;
  readonly entry?: LifecycleRegistryEntry | undefined;
  readonly primaryCredentialValue?: string | undefined;
  readonly workerEnv?: Record<string, string | undefined> | undefined;
  readonly encryptionKey?: string | undefined;
};
type LifecycleRemoveInput = {
  readonly sourceId: string;
  readonly workspaceId: string;
};
type LifecycleDetectInput = {
  readonly entry: LifecycleRegistryEntry;
  readonly sourceConfig: SourceConfig;
  readonly authConfig: AuthConfig;
  readonly workerEnv?: Record<string, string | undefined> | undefined;
};
type LifecycleSourceResult = {
  readonly source_id: string;
  readonly tool_count: number;
  readonly status: SourceStatus | string;
  readonly source?: PluginSource | undefined;
};
type LifecycleDetectResult = {
  readonly sourceConfig: SourceConfig;
  readonly authConfig: AuthConfig;
  readonly status?: SourceStatus | string | undefined;
};
type PluginLifecycleShape = {
  readonly install: (input: LifecycleInstallInput) => Effect.Effect<LifecycleSourceResult, unknown>;
  readonly refresh: (input: LifecycleRefreshInput) => Effect.Effect<LifecycleSourceResult, unknown>;
  readonly remove: (input: LifecycleRemoveInput) => Effect.Effect<{
    readonly source_id: string;
    readonly removed: boolean;
  }, unknown>;
  readonly detect: (input: LifecycleDetectInput) => Effect.Effect<LifecycleDetectResult, unknown>;
};
declare const PluginLifecycle_base: Context.ServiceClass<PluginLifecycle, "PluginLifecycle", PluginLifecycleShape>;
declare class PluginLifecycle extends PluginLifecycle_base {}
//#endregion
//#region ../plugins/src/index.d.ts
declare const SourceKind: Schema.Literals<readonly ["mcp", "cli", "api"]>;
type SourceKind = typeof SourceKind.Type;
declare const McpOAuthDiscovery: Schema.Struct<{
  readonly authorization_server: Schema.String;
  readonly authorization_endpoint: Schema.String;
  readonly token_endpoint: Schema.String;
  readonly registration_endpoint: Schema.optional<Schema.String>;
  readonly scopes_supported: Schema.$Array<Schema.String>;
  readonly has_dynamic_registration: Schema.Boolean; /** RFC 8414 §2: URL of provider developer portal / docs for registering apps. */
  readonly service_documentation: Schema.optional<Schema.String>; /** RFC 8414 §2: URL of provider policy / ToS (for display only). */
  readonly op_policy_uri: Schema.optional<Schema.String>;
  readonly op_tos_uri: Schema.optional<Schema.String>; /** RFC 8414 §2. If `["none"]` the AS treats clients as public (PKCE-only). */
  readonly token_endpoint_auth_methods_supported: Schema.optional<Schema.$Array<Schema.String>>; /** RFC 9728: the MCP resource identifier from Protected Resource Metadata. */
  readonly resource: Schema.optional<Schema.String>; /** RFC 9728: documentation URL for the resource (provider's app registration docs). */
  readonly resource_documentation: Schema.optional<Schema.String>; /** RFC 7009 / RFC 8414 §2: endpoint to revoke access/refresh tokens. */
  readonly revocation_endpoint: Schema.optional<Schema.String>;
}>;
type McpOAuthDiscovery = typeof McpOAuthDiscovery.Type;
/**
 * Pre-configured OAuth client credentials for providers that do NOT support
 * RFC 7591 dynamic client registration (GitHub, PostHog proxy client, etc.).
 *
 * Per MCP Authorization spec (2025-03-26 §2.3) clients MAY use pre-registered
 * OAuth clients when the authorization server does not advertise a
 * `registration_endpoint`. All fields are optional so the shape is backwards
 * compatible with existing ready sources that rely on dynamic registration.
 */
declare const McpOAuthClientConfig: Schema.Struct<{
  readonly client_id: Schema.optional<Schema.String>; /** Some providers accept public clients (PKCE-only). Leave unset in that case. */
  readonly client_secret: Schema.optional<Schema.String>; /** Overrides the server-built callback URL. Used by providers that pin redirect_uri (PostHog). */
  readonly redirect_uri: Schema.optional<Schema.String>; /** Extra scope override if the user needs something beyond `scopes_supported`. */
  readonly scope: Schema.optional<Schema.String>;
}>;
type McpOAuthClientConfig = typeof McpOAuthClientConfig.Type;
declare const ComposioStaticAuthScheme: Schema.Literals<readonly ["API_KEY", "BEARER_TOKEN", "BASIC"]>;
type ComposioStaticAuthScheme = typeof ComposioStaticAuthScheme.Type;
declare const ComposioStaticAuthConfig: Schema.Struct<{
  readonly auth_scheme: Schema.Literals<readonly ["API_KEY", "BEARER_TOKEN", "BASIC"]>;
  readonly credential_map: Schema.$Record<Schema.NonEmptyString, Schema.String>;
  readonly validate_credentials: Schema.optional<Schema.Boolean>;
}>;
type ComposioStaticAuthConfig = typeof ComposioStaticAuthConfig.Type;
declare const MCPSourceConfig: Schema.Struct<{
  readonly kind: Schema.Literal<"mcp">;
  readonly endpoint: Schema.NonEmptyString;
  readonly transport: Schema.Literals<readonly ["http", "sse", "auto"]>;
  readonly auth_mode: Schema.optional<Schema.Literals<readonly ["none", "bearer", "api_key", "oauth2"]>>;
  readonly oauth_redirect_url: Schema.optional<Schema.String>;
  readonly oauth_scopes: Schema.optional<Schema.$Array<Schema.String>>;
  readonly oauth_discovery: Schema.optional<Schema.Struct<{
    readonly authorization_server: Schema.String;
    readonly authorization_endpoint: Schema.String;
    readonly token_endpoint: Schema.String;
    readonly registration_endpoint: Schema.optional<Schema.String>;
    readonly scopes_supported: Schema.$Array<Schema.String>;
    readonly has_dynamic_registration: Schema.Boolean; /** RFC 8414 §2: URL of provider developer portal / docs for registering apps. */
    readonly service_documentation: Schema.optional<Schema.String>; /** RFC 8414 §2: URL of provider policy / ToS (for display only). */
    readonly op_policy_uri: Schema.optional<Schema.String>;
    readonly op_tos_uri: Schema.optional<Schema.String>; /** RFC 8414 §2. If `["none"]` the AS treats clients as public (PKCE-only). */
    readonly token_endpoint_auth_methods_supported: Schema.optional<Schema.$Array<Schema.String>>; /** RFC 9728: the MCP resource identifier from Protected Resource Metadata. */
    readonly resource: Schema.optional<Schema.String>; /** RFC 9728: documentation URL for the resource (provider's app registration docs). */
    readonly resource_documentation: Schema.optional<Schema.String>; /** RFC 7009 / RFC 8414 §2: endpoint to revoke access/refresh tokens. */
    readonly revocation_endpoint: Schema.optional<Schema.String>;
  }>>;
  readonly oauth_client_config: Schema.optional<Schema.Struct<{
    readonly client_id: Schema.optional<Schema.String>; /** Some providers accept public clients (PKCE-only). Leave unset in that case. */
    readonly client_secret: Schema.optional<Schema.String>; /** Overrides the server-built callback URL. Used by providers that pin redirect_uri (PostHog). */
    readonly redirect_uri: Schema.optional<Schema.String>; /** Extra scope override if the user needs something beyond `scopes_supported`. */
    readonly scope: Schema.optional<Schema.String>;
  }>>;
  /**
   * Static HTTP headers injected on every MCP request to this source.
   * Values may contain template tokens that the invoker resolves at
   * call time:
   *   - `{{env:VAR_NAME}}` — substituted from the API Worker env
   *     (Wrangler secret). Used for platform-level auth keys like
   *     Composio's `x-api-key` that are Harbor-wide, not per-user.
   * See apps/api/src/plugins/invoker/mcp.ts for the resolver.
   */
  readonly default_headers: Schema.optional<Schema.$Record<Schema.String, Schema.String>>;
  /**
   * Composio auth-config id used by Connect to initiate the per-user
   * Composio OAuth flow. When set, `/plugins/sources/oauth/start` calls
   * Composio's `connected_accounts` endpoint instead of the generic
   * OAuth discovery flow. See docs/plans/google-workspace-composio-swap.md.
   */
  readonly composio_auth_config_id: Schema.optional<Schema.NonEmptyString>;
  /**
   * Static credential import metadata for Composio-backed MCP sources.
   * The raw credential values stay in plugin_credentials; this field only
   * records how install-time secret env keys should be translated into
   * Composio's connected-account `state.val` shape.
   */
  readonly composio_static_auth: Schema.optional<Schema.Struct<{
    readonly auth_scheme: Schema.Literals<readonly ["API_KEY", "BEARER_TOKEN", "BASIC"]>;
    readonly credential_map: Schema.$Record<Schema.NonEmptyString, Schema.String>;
    readonly validate_credentials: Schema.optional<Schema.Boolean>;
  }>>;
}>;
type MCPSourceConfig = typeof MCPSourceConfig.Type;
declare const CustomMcpAddConfig: Schema.Struct<{
  readonly kind: Schema.Literal<"mcp">;
  readonly endpoint: Schema.NonEmptyString;
  readonly transport: Schema.optional<Schema.Literals<readonly ["http", "sse", "auto"]>>;
}>;
type CustomMcpAddConfig = typeof CustomMcpAddConfig.Type;
declare const CliLauncher: Schema.Literals<readonly ["binary", "npx", "uvx", "bunx"]>;
type CliLauncher = typeof CliLauncher.Type;
declare const CliCwdPolicy: Schema.Literals<readonly ["workspace", "configured", "call"]>;
type CliCwdPolicy = typeof CliCwdPolicy.Type;
/**
 * CLI sources still use the `cli` source kind, but the execution lane behind
 * them is Harbor sand.
 */
declare const CliSandResultDefaults: Schema.Struct<{
  readonly sand_stdin_mode: Schema.optional<Schema.Literals<readonly ["none", "json", "text"]>>;
  readonly sand_result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
  readonly streaming: Schema.optional<Schema.Boolean>;
  readonly timeout_ms: Schema.optional<Schema.Number>;
}>;
type CliSandResultDefaults = typeof CliSandResultDefaults.Type;
declare const CliSourceConfig: Schema.Struct<{
  readonly kind: Schema.Literal<"cli">;
  readonly namespace: Schema.NonEmptyString;
  readonly launcher: Schema.Literals<readonly ["binary", "npx", "uvx", "bunx"]>;
  readonly command: Schema.NonEmptyString;
  readonly args: Schema.optional<Schema.$Array<Schema.String>>;
  readonly cwd_policy: Schema.Literals<readonly ["workspace", "configured", "call"]>;
  readonly cwd: Schema.optional<Schema.String>;
  readonly allowed_env_keys: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
  readonly sand_sandbox_policy: Schema.optional<Schema.Struct<{
    readonly filesystem: Schema.optional<Schema.Literals<readonly ["workspace", "cwd", "custom", "none"]>>;
    readonly network: Schema.optional<Schema.Literals<readonly ["inherit", "deny", "allowlist"]>>;
    readonly readable_paths: Schema.optional<Schema.$Array<Schema.String>>;
    readonly writable_paths: Schema.optional<Schema.$Array<Schema.String>>;
    readonly allowed_hosts: Schema.optional<Schema.$Array<Schema.String>>;
  }>>;
  readonly sand_secret_bindings: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly secret_name: Schema.NonEmptyString;
    readonly env: Schema.NonEmptyString;
    readonly required: Schema.optional<Schema.Boolean>;
  }>>>;
  readonly sand_runtime: Schema.optional<Schema.Struct<{
    readonly artifacts: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
      readonly id: Schema.String;
      readonly kind: Schema.Literal<"temp_dir">;
      readonly prefix: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly id: Schema.String;
      readonly kind: Schema.Literal<"temp_file">;
      readonly filename: Schema.NonEmptyString;
      readonly prefix: Schema.optional<Schema.NonEmptyString>;
      readonly parent_artifact_id: Schema.optional<Schema.String>;
      readonly contents: Schema.optional<Schema.String>;
    }>]>>>;
    readonly env: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly env: Schema.String;
      readonly value: Schema.Union<readonly [Schema.Struct<{
        readonly kind: Schema.Literal<"literal">;
        readonly value: Schema.String;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"artifact_path">;
        readonly artifact_id: Schema.String;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"secret_env">;
        readonly env: Schema.String;
      }>]>;
    }>>>;
    readonly args: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
      readonly kind: Schema.Literal<"literal">;
      readonly value: Schema.String;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"artifact_path">;
      readonly artifact_id: Schema.String;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"secret_env">;
      readonly env: Schema.String;
    }>]>>>;
  }>>;
  readonly cli_result_defaults: Schema.optional<Schema.Struct<{
    readonly sand_stdin_mode: Schema.optional<Schema.Literals<readonly ["none", "json", "text"]>>;
    readonly sand_result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
    readonly streaming: Schema.optional<Schema.Boolean>;
    readonly timeout_ms: Schema.optional<Schema.Number>;
  }>>;
  readonly sand_runtime_constraints: Schema.optional<Schema.Struct<{
    readonly os: Schema.optional<Schema.$Array<Schema.Literals<readonly ["darwin", "linux", "windows"]>>>;
    readonly arch: Schema.optional<Schema.$Array<Schema.Literals<readonly ["arm64", "x64"]>>>;
    readonly requires_sandbox_runtime: Schema.optional<Schema.Boolean>;
  }>>;
}>;
type CliSourceConfig = typeof CliSourceConfig.Type;
declare const ApiAuthConfig: Schema.Struct<{
  readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
  readonly required: Schema.optional<Schema.Boolean>;
  readonly env: Schema.optional<Schema.String>;
  readonly secret_name: Schema.optional<Schema.NonEmptyString>;
  readonly header_name: Schema.optional<Schema.String>;
  readonly query_param: Schema.optional<Schema.String>;
  readonly prefix: Schema.optional<Schema.String>;
  readonly username_env: Schema.optional<Schema.String>;
  readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
  readonly password_env: Schema.optional<Schema.String>;
  readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
}>;
type ApiAuthConfig = typeof ApiAuthConfig.Type;
declare const ApiSourceConfig: Schema.Struct<{
  readonly kind: Schema.Literal<"api">;
  readonly protocol: Schema.optional<Schema.Literals<readonly ["openapi", "graphql", "http"]>>;
  readonly base_url: Schema.NonEmptyString;
  readonly allowed_hosts: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
  readonly spec_url: Schema.optional<Schema.String>;
  readonly graphql_endpoint: Schema.optional<Schema.String>;
  readonly graphql_schema_url: Schema.optional<Schema.String>;
  readonly default_headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
  readonly timeout_ms: Schema.optional<Schema.Number>;
  readonly auth: Schema.optional<Schema.Struct<{
    readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
    readonly required: Schema.optional<Schema.Boolean>;
    readonly env: Schema.optional<Schema.String>;
    readonly secret_name: Schema.optional<Schema.NonEmptyString>;
    readonly header_name: Schema.optional<Schema.String>;
    readonly query_param: Schema.optional<Schema.String>;
    readonly prefix: Schema.optional<Schema.String>;
    readonly username_env: Schema.optional<Schema.String>;
    readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
    readonly password_env: Schema.optional<Schema.String>;
    readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
  }>>;
}>;
type ApiSourceConfig = typeof ApiSourceConfig.Type;
declare const SourceConfig: Schema.Union<readonly [Schema.Struct<{
  readonly kind: Schema.Literal<"mcp">;
  readonly endpoint: Schema.NonEmptyString;
  readonly transport: Schema.Literals<readonly ["http", "sse", "auto"]>;
  readonly auth_mode: Schema.optional<Schema.Literals<readonly ["none", "bearer", "api_key", "oauth2"]>>;
  readonly oauth_redirect_url: Schema.optional<Schema.String>;
  readonly oauth_scopes: Schema.optional<Schema.$Array<Schema.String>>;
  readonly oauth_discovery: Schema.optional<Schema.Struct<{
    readonly authorization_server: Schema.String;
    readonly authorization_endpoint: Schema.String;
    readonly token_endpoint: Schema.String;
    readonly registration_endpoint: Schema.optional<Schema.String>;
    readonly scopes_supported: Schema.$Array<Schema.String>;
    readonly has_dynamic_registration: Schema.Boolean; /** RFC 8414 §2: URL of provider developer portal / docs for registering apps. */
    readonly service_documentation: Schema.optional<Schema.String>; /** RFC 8414 §2: URL of provider policy / ToS (for display only). */
    readonly op_policy_uri: Schema.optional<Schema.String>;
    readonly op_tos_uri: Schema.optional<Schema.String>; /** RFC 8414 §2. If `["none"]` the AS treats clients as public (PKCE-only). */
    readonly token_endpoint_auth_methods_supported: Schema.optional<Schema.$Array<Schema.String>>; /** RFC 9728: the MCP resource identifier from Protected Resource Metadata. */
    readonly resource: Schema.optional<Schema.String>; /** RFC 9728: documentation URL for the resource (provider's app registration docs). */
    readonly resource_documentation: Schema.optional<Schema.String>; /** RFC 7009 / RFC 8414 §2: endpoint to revoke access/refresh tokens. */
    readonly revocation_endpoint: Schema.optional<Schema.String>;
  }>>;
  readonly oauth_client_config: Schema.optional<Schema.Struct<{
    readonly client_id: Schema.optional<Schema.String>; /** Some providers accept public clients (PKCE-only). Leave unset in that case. */
    readonly client_secret: Schema.optional<Schema.String>; /** Overrides the server-built callback URL. Used by providers that pin redirect_uri (PostHog). */
    readonly redirect_uri: Schema.optional<Schema.String>; /** Extra scope override if the user needs something beyond `scopes_supported`. */
    readonly scope: Schema.optional<Schema.String>;
  }>>;
  /**
   * Static HTTP headers injected on every MCP request to this source.
   * Values may contain template tokens that the invoker resolves at
   * call time:
   *   - `{{env:VAR_NAME}}` — substituted from the API Worker env
   *     (Wrangler secret). Used for platform-level auth keys like
   *     Composio's `x-api-key` that are Harbor-wide, not per-user.
   * See apps/api/src/plugins/invoker/mcp.ts for the resolver.
   */
  readonly default_headers: Schema.optional<Schema.$Record<Schema.String, Schema.String>>;
  /**
   * Composio auth-config id used by Connect to initiate the per-user
   * Composio OAuth flow. When set, `/plugins/sources/oauth/start` calls
   * Composio's `connected_accounts` endpoint instead of the generic
   * OAuth discovery flow. See docs/plans/google-workspace-composio-swap.md.
   */
  readonly composio_auth_config_id: Schema.optional<Schema.NonEmptyString>;
  /**
   * Static credential import metadata for Composio-backed MCP sources.
   * The raw credential values stay in plugin_credentials; this field only
   * records how install-time secret env keys should be translated into
   * Composio's connected-account `state.val` shape.
   */
  readonly composio_static_auth: Schema.optional<Schema.Struct<{
    readonly auth_scheme: Schema.Literals<readonly ["API_KEY", "BEARER_TOKEN", "BASIC"]>;
    readonly credential_map: Schema.$Record<Schema.NonEmptyString, Schema.String>;
    readonly validate_credentials: Schema.optional<Schema.Boolean>;
  }>>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"cli">;
  readonly namespace: Schema.NonEmptyString;
  readonly launcher: Schema.Literals<readonly ["binary", "npx", "uvx", "bunx"]>;
  readonly command: Schema.NonEmptyString;
  readonly args: Schema.optional<Schema.$Array<Schema.String>>;
  readonly cwd_policy: Schema.Literals<readonly ["workspace", "configured", "call"]>;
  readonly cwd: Schema.optional<Schema.String>;
  readonly allowed_env_keys: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
  readonly sand_sandbox_policy: Schema.optional<Schema.Struct<{
    readonly filesystem: Schema.optional<Schema.Literals<readonly ["workspace", "cwd", "custom", "none"]>>;
    readonly network: Schema.optional<Schema.Literals<readonly ["inherit", "deny", "allowlist"]>>;
    readonly readable_paths: Schema.optional<Schema.$Array<Schema.String>>;
    readonly writable_paths: Schema.optional<Schema.$Array<Schema.String>>;
    readonly allowed_hosts: Schema.optional<Schema.$Array<Schema.String>>;
  }>>;
  readonly sand_secret_bindings: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly secret_name: Schema.NonEmptyString;
    readonly env: Schema.NonEmptyString;
    readonly required: Schema.optional<Schema.Boolean>;
  }>>>;
  readonly sand_runtime: Schema.optional<Schema.Struct<{
    readonly artifacts: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
      readonly id: Schema.String;
      readonly kind: Schema.Literal<"temp_dir">;
      readonly prefix: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly id: Schema.String;
      readonly kind: Schema.Literal<"temp_file">;
      readonly filename: Schema.NonEmptyString;
      readonly prefix: Schema.optional<Schema.NonEmptyString>;
      readonly parent_artifact_id: Schema.optional<Schema.String>;
      readonly contents: Schema.optional<Schema.String>;
    }>]>>>;
    readonly env: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly env: Schema.String;
      readonly value: Schema.Union<readonly [Schema.Struct<{
        readonly kind: Schema.Literal<"literal">;
        readonly value: Schema.String;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"artifact_path">;
        readonly artifact_id: Schema.String;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"secret_env">;
        readonly env: Schema.String;
      }>]>;
    }>>>;
    readonly args: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
      readonly kind: Schema.Literal<"literal">;
      readonly value: Schema.String;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"artifact_path">;
      readonly artifact_id: Schema.String;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"secret_env">;
      readonly env: Schema.String;
    }>]>>>;
  }>>;
  readonly cli_result_defaults: Schema.optional<Schema.Struct<{
    readonly sand_stdin_mode: Schema.optional<Schema.Literals<readonly ["none", "json", "text"]>>;
    readonly sand_result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
    readonly streaming: Schema.optional<Schema.Boolean>;
    readonly timeout_ms: Schema.optional<Schema.Number>;
  }>>;
  readonly sand_runtime_constraints: Schema.optional<Schema.Struct<{
    readonly os: Schema.optional<Schema.$Array<Schema.Literals<readonly ["darwin", "linux", "windows"]>>>;
    readonly arch: Schema.optional<Schema.$Array<Schema.Literals<readonly ["arm64", "x64"]>>>;
    readonly requires_sandbox_runtime: Schema.optional<Schema.Boolean>;
  }>>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"api">;
  readonly protocol: Schema.optional<Schema.Literals<readonly ["openapi", "graphql", "http"]>>;
  readonly base_url: Schema.NonEmptyString;
  readonly allowed_hosts: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
  readonly spec_url: Schema.optional<Schema.String>;
  readonly graphql_endpoint: Schema.optional<Schema.String>;
  readonly graphql_schema_url: Schema.optional<Schema.String>;
  readonly default_headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
  readonly timeout_ms: Schema.optional<Schema.Number>;
  readonly auth: Schema.optional<Schema.Struct<{
    readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
    readonly required: Schema.optional<Schema.Boolean>;
    readonly env: Schema.optional<Schema.String>;
    readonly secret_name: Schema.optional<Schema.NonEmptyString>;
    readonly header_name: Schema.optional<Schema.String>;
    readonly query_param: Schema.optional<Schema.String>;
    readonly prefix: Schema.optional<Schema.String>;
    readonly username_env: Schema.optional<Schema.String>;
    readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
    readonly password_env: Schema.optional<Schema.String>;
    readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
  }>>;
}>]>;
type SourceConfig = typeof SourceConfig.Type;
declare const AuthTemplate: Schema.Union<readonly [Schema.Struct<{
  readonly kind: Schema.Literal<"header">;
  readonly header_name: Schema.NonEmptyString;
  readonly value_template: Schema.NonEmptyString;
  readonly secret_slot: Schema.NonEmptyString;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"query">;
  readonly query_param: Schema.NonEmptyString;
  readonly value_template: Schema.NonEmptyString;
  readonly secret_slot: Schema.NonEmptyString;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"basic">;
  readonly username_slot: Schema.NonEmptyString;
  readonly password_slot: Schema.NonEmptyString;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"oauth_grant">;
  readonly header_name: Schema.optional<Schema.String>;
  readonly value_template: Schema.optional<Schema.String>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"none">;
}>]>;
type AuthTemplate = typeof AuthTemplate.Type;
declare const AuthConfig: Schema.Struct<{
  readonly method: Schema.Literals<readonly ["header", "bearer", "query", "basic", "none"]>;
  readonly header_name: Schema.optional<Schema.String>;
  readonly query_param: Schema.optional<Schema.String>;
  readonly prefix: Schema.optional<Schema.String>;
  readonly credential_id: Schema.optional<Schema.String>;
  readonly credential_value: Schema.optional<Schema.String>;
}>;
type AuthConfig = typeof AuthConfig.Type;
declare const PersistedAuthConfig: Schema.Struct<{
  readonly method: Schema.Literals<readonly ["header", "bearer", "query", "basic", "none"]>;
  readonly header_name: Schema.optional<Schema.String>;
  readonly query_param: Schema.optional<Schema.String>;
  readonly prefix: Schema.optional<Schema.String>;
  readonly credential_id: Schema.optional<Schema.String>;
}>;
type PersistedAuthConfig = typeof PersistedAuthConfig.Type;
/**
 * Workspace-scoped preconfigured OAuth client. A workspace admin registers
 * this ONCE per provider (identified by `registry_slug`) so every member in
 * the workspace inherits it. Replaces the per-install user-facing form for
 * providers that don't support RFC 7591 dynamic client registration.
 *
 * The secret is never returned over the wire — only `has_client_secret`
 * is exposed. See apps/api/src/routes/plugins/oauth.ts for the listing
 * endpoint that redacts secrets.
 */
declare const WorkspaceOAuthClient: Schema.Struct<{
  readonly registry_slug: Schema.String;
  readonly client_id: Schema.String;
  readonly has_client_secret: Schema.Boolean;
  readonly redirect_uri: Schema.optional<Schema.String>;
  readonly scope: Schema.optional<Schema.String>;
  readonly created_by: Schema.String;
  readonly created_at: Schema.String;
  readonly updated_at: Schema.String;
}>;
type WorkspaceOAuthClient = typeof WorkspaceOAuthClient.Type;
declare const WorkspaceOAuthClientListBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
}>;
type WorkspaceOAuthClientListBody = typeof WorkspaceOAuthClientListBody.Type;
declare const WorkspaceOAuthClientListResult: Schema.Struct<{
  readonly data: Schema.$Array<Schema.Struct<{
    readonly registry_slug: Schema.String;
    readonly client_id: Schema.String;
    readonly has_client_secret: Schema.Boolean;
    readonly redirect_uri: Schema.optional<Schema.String>;
    readonly scope: Schema.optional<Schema.String>;
    readonly created_by: Schema.String;
    readonly created_at: Schema.String;
    readonly updated_at: Schema.String;
  }>>;
  readonly total: Schema.Number;
}>;
type WorkspaceOAuthClientListResult = typeof WorkspaceOAuthClientListResult.Type;
declare const WorkspaceOAuthClientSetBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly registry_slug: Schema.NonEmptyString;
  readonly client_id: Schema.NonEmptyString;
  readonly client_secret: Schema.optional<Schema.String>;
  readonly redirect_uri: Schema.optional<Schema.String>;
  readonly scope: Schema.optional<Schema.String>;
}>;
type WorkspaceOAuthClientSetBody = typeof WorkspaceOAuthClientSetBody.Type;
declare const WorkspaceOAuthClientSetResult: Schema.Struct<{
  readonly ok: Schema.Literal<true>;
  readonly seeded_sources: Schema.Number;
}>;
type WorkspaceOAuthClientSetResult = typeof WorkspaceOAuthClientSetResult.Type;
declare const WorkspaceOAuthClientDeleteBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly registry_slug: Schema.NonEmptyString;
}>;
type WorkspaceOAuthClientDeleteBody = typeof WorkspaceOAuthClientDeleteBody.Type;
declare const WorkspaceOAuthClientDeleteResult: Schema.Struct<{
  readonly ok: Schema.Literal<true>;
}>;
type WorkspaceOAuthClientDeleteResult = typeof WorkspaceOAuthClientDeleteResult.Type;
declare const SOURCE_STATUSES: readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"];
declare const SourceStatus: Schema.Literals<readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"]>;
type SourceStatus = typeof SourceStatus.Type;
declare const SourceVisibility: Schema.Literals<readonly ["personal", "workspace"]>;
type SourceVisibility = typeof SourceVisibility.Type;
declare const SourceVerificationStatus: Schema.Literals<readonly ["pending", "verified", "failed"]>;
type SourceVerificationStatus = typeof SourceVerificationStatus.Type;
declare const SourceVerificationSummary: Schema.Struct<{
  readonly source_id: Schema.String;
  readonly machine_id: Schema.NonEmptyString;
  readonly agent_id: Schema.NonEmptyString;
  readonly status: Schema.Literals<readonly ["pending", "verified", "failed"]>;
  readonly verified: Schema.Boolean;
  readonly checked_at: Schema.String;
  readonly error: Schema.optional<Schema.String>;
}>;
type SourceVerificationSummary = typeof SourceVerificationSummary.Type;
declare const SourceVerification: Schema.Struct<{
  readonly id: Schema.String;
  readonly workspace_id: Schema.String;
  readonly source_id: Schema.String;
  readonly machine_id: Schema.NonEmptyString;
  readonly agent_id: Schema.NonEmptyString;
  readonly status: Schema.Literals<readonly ["pending", "verified", "failed"]>;
  readonly verified: Schema.Boolean;
  readonly error: Schema.optional<Schema.String>;
  readonly details: Schema.optional<Schema.Unknown>;
  readonly checked_at: Schema.String;
  readonly created_by: Schema.optional<Schema.String>;
  readonly created_at: Schema.String;
  readonly updated_at: Schema.String;
}>;
type SourceVerification = typeof SourceVerification.Type;
declare const PluginSourceCreator: Schema.Struct<{
  readonly id: Schema.String;
  readonly name: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly email: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly avatar_url: Schema.optional<Schema.NullOr<Schema.String>>;
}>;
type PluginSourceCreator = typeof PluginSourceCreator.Type;
declare const McpServerInfo: Schema.Struct<{
  readonly name: Schema.String;
  readonly version: Schema.optional<Schema.String>;
}>;
type McpServerInfo = typeof McpServerInfo.Type;
declare const McpIcon: Schema.Struct<{
  readonly src: Schema.String;
  readonly mimeType: Schema.optional<Schema.String>;
  readonly sizes: Schema.optional<Schema.String>;
}>;
type McpIcon = typeof McpIcon.Type;
declare const McpAnnotations: Schema.Struct<{
  readonly title: Schema.optional<Schema.String>;
  readonly readOnlyHint: Schema.optional<Schema.Boolean>;
  readonly destructiveHint: Schema.optional<Schema.Boolean>;
  readonly idempotentHint: Schema.optional<Schema.Boolean>;
  readonly openWorldHint: Schema.optional<Schema.Boolean>;
}>;
type McpAnnotations = typeof McpAnnotations.Type;
declare const SourceLink: Schema.Struct<{
  readonly label: Schema.String;
  readonly url: Schema.String;
  readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
}>;
type SourceLink = typeof SourceLink.Type;
declare const PluginSource: Schema.Struct<{
  readonly id: Schema.String;
  readonly workspace_id: Schema.String;
  readonly kind: Schema.Literals<readonly ["mcp", "cli", "api"]>;
  readonly namespace: Schema.String;
  readonly display_name: Schema.String;
  readonly description: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly config: Schema.Unknown;
  readonly auth_config: Schema.Unknown;
  readonly status: Schema.Literals<readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"]>;
  readonly install_status: Schema.optional<Schema.Literals<readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"]>>;
  readonly effective_status: Schema.optional<Schema.Literals<readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"]>>;
  readonly runnable: Schema.optional<Schema.Boolean>;
  readonly redacted: Schema.optional<Schema.Boolean>;
  readonly non_runnable_reason: Schema.optional<Schema.String>;
  readonly tool_count: Schema.Number;
  readonly last_synced_at: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly error: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly verified: Schema.optional<Schema.Boolean>;
  readonly last_verified_at: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly last_verify_error: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly latest_verification: Schema.optional<Schema.Struct<{
    readonly source_id: Schema.String;
    readonly machine_id: Schema.NonEmptyString;
    readonly agent_id: Schema.NonEmptyString;
    readonly status: Schema.Literals<readonly ["pending", "verified", "failed"]>;
    readonly verified: Schema.Boolean;
    readonly checked_at: Schema.String;
    readonly error: Schema.optional<Schema.String>;
  }>>;
  readonly sand_missing_required_secret_envs: Schema.optional<Schema.$Array<Schema.String>>;
  readonly category: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly links: Schema.optional<Schema.NullOr<Schema.$Array<Schema.Struct<{
    readonly label: Schema.String;
    readonly url: Schema.String;
    readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
  }>>>>;
  readonly icon_url: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly shared_defs: Schema.optional<Schema.NullOr<Schema.Unknown>>;
  readonly registry_slug: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly mcp_protocol_version: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly mcp_server_info: Schema.optional<Schema.Unknown>;
  readonly mcp_capabilities: Schema.optional<Schema.Unknown>;
  readonly mcp_instructions: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly mcp_prompt_count: Schema.optional<Schema.Number>;
  readonly mcp_resource_count: Schema.optional<Schema.Number>;
  readonly mcp_resource_template_count: Schema.optional<Schema.Number>;
  readonly generated_types: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly created_by: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly created_by_user: Schema.optional<Schema.NullOr<Schema.Struct<{
    readonly id: Schema.String;
    readonly name: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly email: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly avatar_url: Schema.optional<Schema.NullOr<Schema.String>>;
  }>>>;
  readonly source_visibility: Schema.optional<Schema.Literals<readonly ["personal", "workspace"]>>;
  readonly caller_status: Schema.optional<Schema.Literals<readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"]>>;
  readonly created_at: Schema.String;
  readonly updated_at: Schema.String;
}>;
type PluginSource = typeof PluginSource.Type;
declare function effectivePluginSourceStatus(source: Pick<PluginSource, 'status' | 'caller_status' | 'effective_status'>): SourceStatus;
declare function isPluginSourceRunnable(source: Pick<PluginSource, 'status' | 'caller_status' | 'effective_status' | 'tool_count' | 'runnable'>): boolean;
declare function displayPluginSourceStatus(source: Pick<PluginSource, 'status' | 'caller_status' | 'effective_status' | 'tool_count'>): SourceStatus;
type PluginSourceDisplayStatus = SourceStatus | 'awaiting_oauth';
declare const AWAITING_OAUTH_SOURCE_STATUSES: Set<"pending" | "discovering" | "ready" | "needs_credentials" | "credentials_error" | "mcp_disconnected" | "spec_error" | "refreshing" | "requires_oauth" | "reconnect_required" | "no_tools" | "verification_required" | "verification_failed">;
declare function isPluginSourceAwaitingOauth(source: Pick<PluginSource, 'status' | 'caller_status' | 'effective_status'>): boolean;
interface PluginSourceDomainView {
  readonly status: PluginSourceDisplayStatus;
  readonly effective_status: PluginSourceDisplayStatus;
  readonly caller_runnable: boolean;
  readonly runnable: boolean;
  readonly tool_count: number;
}
declare function pluginSourceDomainView(source: Pick<PluginSource, 'status' | 'caller_status' | 'effective_status' | 'tool_count' | 'runnable'>): PluginSourceDomainView;
type PluginSourceDomainAction = {
  readonly kind: 'connect';
  readonly namespace: string;
} | {
  readonly kind: 'list_tools';
  readonly namespace: string;
};
declare function pluginSourceNextAction(source: PluginSource): PluginSourceDomainAction;
declare function registryAgentSkillSlug(entry: unknown, fallbackSlug?: string | null): string | null;
interface PluginSourceToolCallabilityInput {
  readonly namespace: string;
  readonly kind?: string | undefined;
  readonly status?: string | undefined;
  readonly caller_status?: string | undefined;
  readonly effective_status?: string | undefined;
  readonly tool_count?: number | undefined;
  readonly runnable?: boolean | undefined;
}
declare function isPluginSourceToolCallable(source: PluginSourceToolCallabilityInput): boolean;
declare function pluginToolNamespaceSummary(source: PluginSourceToolCallabilityInput): {
  namespace: string;
  mode: string;
  status: string;
  tool_count: number;
};
type PluginSourceHealthInput = Pick<PluginSource, 'status' | 'caller_status' | 'effective_status' | 'tool_count' | 'runnable'>;
interface PluginSourceGroupHealth {
  readonly activeCount: number;
  readonly worstStatus: SourceStatus | null;
}
declare function summarizePluginSourceGroupHealth(sources: readonly PluginSourceHealthInput[]): PluginSourceGroupHealth;
type PluginSourceSelectionInput = Pick<PluginSource, 'id' | 'status' | 'caller_status' | 'effective_status' | 'tool_count' | 'runnable' | 'last_synced_at' | 'updated_at' | 'created_at'>;
declare function comparePluginSourcesForDisplay(a: PluginSourceSelectionInput, b: PluginSourceSelectionInput): number;
declare function selectRepresentativePluginSource<T extends PluginSourceSelectionInput>(sources: readonly T[]): T | null;
declare const MCPToolBinding: Schema.Struct<{
  readonly kind: Schema.Literal<"mcp">;
  readonly tool_name: Schema.String;
  readonly cached_input_schema: Schema.optional<Schema.Unknown>;
  readonly cached_output_schema: Schema.optional<Schema.Unknown>;
}>;
type MCPToolBinding = typeof MCPToolBinding.Type;
declare const MCPPromptBinding: Schema.Struct<{
  readonly kind: Schema.Literal<"mcp_prompt">;
  readonly prompt_name: Schema.String;
}>;
type MCPPromptBinding = typeof MCPPromptBinding.Type;
declare const MCPResourceReadBinding: Schema.Struct<{
  readonly kind: Schema.Literal<"mcp_resource_read">;
  readonly uri: Schema.String;
}>;
type MCPResourceReadBinding = typeof MCPResourceReadBinding.Type;
declare const MCPResourceTemplateBinding: Schema.Struct<{
  readonly kind: Schema.Literal<"mcp_resource_template">;
  readonly uri_template: Schema.String;
}>;
type MCPResourceTemplateBinding = typeof MCPResourceTemplateBinding.Type;
declare const ApiRequestBinding: Schema.Struct<{
  readonly kind: Schema.Literal<"api_request">;
  readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
  readonly path: Schema.NonEmptyString;
  readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
  readonly query: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
  readonly body_template: Schema.optional<Schema.Unknown>;
  readonly timeout_ms: Schema.optional<Schema.Number>;
  readonly auth: Schema.optional<Schema.Struct<{
    readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
    readonly required: Schema.optional<Schema.Boolean>;
    readonly env: Schema.optional<Schema.String>;
    readonly secret_name: Schema.optional<Schema.NonEmptyString>;
    readonly header_name: Schema.optional<Schema.String>;
    readonly query_param: Schema.optional<Schema.String>;
    readonly prefix: Schema.optional<Schema.String>;
    readonly username_env: Schema.optional<Schema.String>;
    readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
    readonly password_env: Schema.optional<Schema.String>;
    readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
  }>>;
}>;
type ApiRequestBinding = typeof ApiRequestBinding.Type;
declare const ApiGraphqlBinding: Schema.Struct<{
  readonly kind: Schema.Literal<"api_graphql">;
  readonly path: Schema.optional<Schema.NonEmptyString>;
  readonly document: Schema.NonEmptyString;
  readonly operation_name: Schema.optional<Schema.NonEmptyString>;
  readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
  readonly variables_template: Schema.optional<Schema.Unknown>;
  readonly timeout_ms: Schema.optional<Schema.Number>;
  readonly auth: Schema.optional<Schema.Struct<{
    readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
    readonly required: Schema.optional<Schema.Boolean>;
    readonly env: Schema.optional<Schema.String>;
    readonly secret_name: Schema.optional<Schema.NonEmptyString>;
    readonly header_name: Schema.optional<Schema.String>;
    readonly query_param: Schema.optional<Schema.String>;
    readonly prefix: Schema.optional<Schema.String>;
    readonly username_env: Schema.optional<Schema.String>;
    readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
    readonly password_env: Schema.optional<Schema.String>;
    readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
  }>>;
}>;
type ApiGraphqlBinding = typeof ApiGraphqlBinding.Type;
declare const CliArgTemplateLiteral: Schema.Struct<{
  readonly kind: Schema.Literal<"literal">;
  readonly value: Schema.String;
}>;
type CliArgTemplateLiteral = typeof CliArgTemplateLiteral.Type;
declare const CliArgTemplateInput: Schema.Struct<{
  readonly kind: Schema.Literal<"input">;
  readonly path: Schema.NonEmptyString;
}>;
type CliArgTemplateInput = typeof CliArgTemplateInput.Type;
declare const CliArgTemplateOption: Schema.Struct<{
  readonly kind: Schema.Literal<"option">;
  readonly flag: Schema.NonEmptyString;
  readonly path: Schema.NonEmptyString;
  readonly omit_if_empty: Schema.optional<Schema.Boolean>;
}>;
type CliArgTemplateOption = typeof CliArgTemplateOption.Type;
declare const CliArgTemplateFlag: Schema.Struct<{
  readonly kind: Schema.Literal<"flag">;
  readonly flag: Schema.NonEmptyString;
  readonly path: Schema.NonEmptyString;
}>;
type CliArgTemplateFlag = typeof CliArgTemplateFlag.Type;
declare const CliArgTemplatePart: Schema.Union<readonly [Schema.Struct<{
  readonly kind: Schema.Literal<"literal">;
  readonly value: Schema.String;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"input">;
  readonly path: Schema.NonEmptyString;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"option">;
  readonly flag: Schema.NonEmptyString;
  readonly path: Schema.NonEmptyString;
  readonly omit_if_empty: Schema.optional<Schema.Boolean>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"flag">;
  readonly flag: Schema.NonEmptyString;
  readonly path: Schema.NonEmptyString;
}>]>;
type CliArgTemplatePart = typeof CliArgTemplatePart.Type;
declare const CliCommandBinding: Schema.Struct<{
  readonly kind: Schema.Literal<"cli_command">;
  readonly tool_name: Schema.String;
  readonly argv_template: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
    readonly kind: Schema.Literal<"literal">;
    readonly value: Schema.String;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"input">;
    readonly path: Schema.NonEmptyString;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"option">;
    readonly flag: Schema.NonEmptyString;
    readonly path: Schema.NonEmptyString;
    readonly omit_if_empty: Schema.optional<Schema.Boolean>;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"flag">;
    readonly flag: Schema.NonEmptyString;
    readonly path: Schema.NonEmptyString;
  }>]>>;
  readonly sand_stdin_mode: Schema.Literals<readonly ["none", "json", "text"]>;
  readonly sand_result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
  readonly timeout_ms: Schema.optional<Schema.Number>;
  readonly streaming: Schema.optional<Schema.Boolean>;
}>;
type CliCommandBinding = typeof CliCommandBinding.Type;
declare const ToolBinding: Schema.Union<readonly [Schema.Struct<{
  readonly kind: Schema.Literal<"mcp">;
  readonly tool_name: Schema.String;
  readonly cached_input_schema: Schema.optional<Schema.Unknown>;
  readonly cached_output_schema: Schema.optional<Schema.Unknown>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"mcp_prompt">;
  readonly prompt_name: Schema.String;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"mcp_resource_read">;
  readonly uri: Schema.String;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"mcp_resource_template">;
  readonly uri_template: Schema.String;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"api_request">;
  readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
  readonly path: Schema.NonEmptyString;
  readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
  readonly query: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
  readonly body_template: Schema.optional<Schema.Unknown>;
  readonly timeout_ms: Schema.optional<Schema.Number>;
  readonly auth: Schema.optional<Schema.Struct<{
    readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
    readonly required: Schema.optional<Schema.Boolean>;
    readonly env: Schema.optional<Schema.String>;
    readonly secret_name: Schema.optional<Schema.NonEmptyString>;
    readonly header_name: Schema.optional<Schema.String>;
    readonly query_param: Schema.optional<Schema.String>;
    readonly prefix: Schema.optional<Schema.String>;
    readonly username_env: Schema.optional<Schema.String>;
    readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
    readonly password_env: Schema.optional<Schema.String>;
    readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
  }>>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"api_graphql">;
  readonly path: Schema.optional<Schema.NonEmptyString>;
  readonly document: Schema.NonEmptyString;
  readonly operation_name: Schema.optional<Schema.NonEmptyString>;
  readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
  readonly variables_template: Schema.optional<Schema.Unknown>;
  readonly timeout_ms: Schema.optional<Schema.Number>;
  readonly auth: Schema.optional<Schema.Struct<{
    readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
    readonly required: Schema.optional<Schema.Boolean>;
    readonly env: Schema.optional<Schema.String>;
    readonly secret_name: Schema.optional<Schema.NonEmptyString>;
    readonly header_name: Schema.optional<Schema.String>;
    readonly query_param: Schema.optional<Schema.String>;
    readonly prefix: Schema.optional<Schema.String>;
    readonly username_env: Schema.optional<Schema.String>;
    readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
    readonly password_env: Schema.optional<Schema.String>;
    readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
  }>>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"cli_command">;
  readonly tool_name: Schema.String;
  readonly argv_template: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
    readonly kind: Schema.Literal<"literal">;
    readonly value: Schema.String;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"input">;
    readonly path: Schema.NonEmptyString;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"option">;
    readonly flag: Schema.NonEmptyString;
    readonly path: Schema.NonEmptyString;
    readonly omit_if_empty: Schema.optional<Schema.Boolean>;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"flag">;
    readonly flag: Schema.NonEmptyString;
    readonly path: Schema.NonEmptyString;
  }>]>>;
  readonly sand_stdin_mode: Schema.Literals<readonly ["none", "json", "text"]>;
  readonly sand_result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
  readonly timeout_ms: Schema.optional<Schema.Number>;
  readonly streaming: Schema.optional<Schema.Boolean>;
}>]>;
type ToolBinding = typeof ToolBinding.Type;
declare const ToolBindingJson: Schema.fromJsonString<Schema.Union<readonly [Schema.Struct<{
  readonly kind: Schema.Literal<"mcp">;
  readonly tool_name: Schema.String;
  readonly cached_input_schema: Schema.optional<Schema.Unknown>;
  readonly cached_output_schema: Schema.optional<Schema.Unknown>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"mcp_prompt">;
  readonly prompt_name: Schema.String;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"mcp_resource_read">;
  readonly uri: Schema.String;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"mcp_resource_template">;
  readonly uri_template: Schema.String;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"api_request">;
  readonly method: Schema.Literals<readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]>;
  readonly path: Schema.NonEmptyString;
  readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
  readonly query: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
  readonly body_template: Schema.optional<Schema.Unknown>;
  readonly timeout_ms: Schema.optional<Schema.Number>;
  readonly auth: Schema.optional<Schema.Struct<{
    readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
    readonly required: Schema.optional<Schema.Boolean>;
    readonly env: Schema.optional<Schema.String>;
    readonly secret_name: Schema.optional<Schema.NonEmptyString>;
    readonly header_name: Schema.optional<Schema.String>;
    readonly query_param: Schema.optional<Schema.String>;
    readonly prefix: Schema.optional<Schema.String>;
    readonly username_env: Schema.optional<Schema.String>;
    readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
    readonly password_env: Schema.optional<Schema.String>;
    readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
  }>>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"api_graphql">;
  readonly path: Schema.optional<Schema.NonEmptyString>;
  readonly document: Schema.NonEmptyString;
  readonly operation_name: Schema.optional<Schema.NonEmptyString>;
  readonly headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
  readonly variables_template: Schema.optional<Schema.Unknown>;
  readonly timeout_ms: Schema.optional<Schema.Number>;
  readonly auth: Schema.optional<Schema.Struct<{
    readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
    readonly required: Schema.optional<Schema.Boolean>;
    readonly env: Schema.optional<Schema.String>;
    readonly secret_name: Schema.optional<Schema.NonEmptyString>;
    readonly header_name: Schema.optional<Schema.String>;
    readonly query_param: Schema.optional<Schema.String>;
    readonly prefix: Schema.optional<Schema.String>;
    readonly username_env: Schema.optional<Schema.String>;
    readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
    readonly password_env: Schema.optional<Schema.String>;
    readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
  }>>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"cli_command">;
  readonly tool_name: Schema.String;
  readonly argv_template: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
    readonly kind: Schema.Literal<"literal">;
    readonly value: Schema.String;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"input">;
    readonly path: Schema.NonEmptyString;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"option">;
    readonly flag: Schema.NonEmptyString;
    readonly path: Schema.NonEmptyString;
    readonly omit_if_empty: Schema.optional<Schema.Boolean>;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"flag">;
    readonly flag: Schema.NonEmptyString;
    readonly path: Schema.NonEmptyString;
  }>]>>;
  readonly sand_stdin_mode: Schema.Literals<readonly ["none", "json", "text"]>;
  readonly sand_result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
  readonly timeout_ms: Schema.optional<Schema.Number>;
  readonly streaming: Schema.optional<Schema.Boolean>;
}>]>>;
type ToolBindingJson = typeof ToolBindingJson.Type;
declare const SourceConfigJson: Schema.fromJsonString<Schema.Union<readonly [Schema.Struct<{
  readonly kind: Schema.Literal<"mcp">;
  readonly endpoint: Schema.NonEmptyString;
  readonly transport: Schema.Literals<readonly ["http", "sse", "auto"]>;
  readonly auth_mode: Schema.optional<Schema.Literals<readonly ["none", "bearer", "api_key", "oauth2"]>>;
  readonly oauth_redirect_url: Schema.optional<Schema.String>;
  readonly oauth_scopes: Schema.optional<Schema.$Array<Schema.String>>;
  readonly oauth_discovery: Schema.optional<Schema.Struct<{
    readonly authorization_server: Schema.String;
    readonly authorization_endpoint: Schema.String;
    readonly token_endpoint: Schema.String;
    readonly registration_endpoint: Schema.optional<Schema.String>;
    readonly scopes_supported: Schema.$Array<Schema.String>;
    readonly has_dynamic_registration: Schema.Boolean; /** RFC 8414 §2: URL of provider developer portal / docs for registering apps. */
    readonly service_documentation: Schema.optional<Schema.String>; /** RFC 8414 §2: URL of provider policy / ToS (for display only). */
    readonly op_policy_uri: Schema.optional<Schema.String>;
    readonly op_tos_uri: Schema.optional<Schema.String>; /** RFC 8414 §2. If `["none"]` the AS treats clients as public (PKCE-only). */
    readonly token_endpoint_auth_methods_supported: Schema.optional<Schema.$Array<Schema.String>>; /** RFC 9728: the MCP resource identifier from Protected Resource Metadata. */
    readonly resource: Schema.optional<Schema.String>; /** RFC 9728: documentation URL for the resource (provider's app registration docs). */
    readonly resource_documentation: Schema.optional<Schema.String>; /** RFC 7009 / RFC 8414 §2: endpoint to revoke access/refresh tokens. */
    readonly revocation_endpoint: Schema.optional<Schema.String>;
  }>>;
  readonly oauth_client_config: Schema.optional<Schema.Struct<{
    readonly client_id: Schema.optional<Schema.String>; /** Some providers accept public clients (PKCE-only). Leave unset in that case. */
    readonly client_secret: Schema.optional<Schema.String>; /** Overrides the server-built callback URL. Used by providers that pin redirect_uri (PostHog). */
    readonly redirect_uri: Schema.optional<Schema.String>; /** Extra scope override if the user needs something beyond `scopes_supported`. */
    readonly scope: Schema.optional<Schema.String>;
  }>>;
  /**
   * Static HTTP headers injected on every MCP request to this source.
   * Values may contain template tokens that the invoker resolves at
   * call time:
   *   - `{{env:VAR_NAME}}` — substituted from the API Worker env
   *     (Wrangler secret). Used for platform-level auth keys like
   *     Composio's `x-api-key` that are Harbor-wide, not per-user.
   * See apps/api/src/plugins/invoker/mcp.ts for the resolver.
   */
  readonly default_headers: Schema.optional<Schema.$Record<Schema.String, Schema.String>>;
  /**
   * Composio auth-config id used by Connect to initiate the per-user
   * Composio OAuth flow. When set, `/plugins/sources/oauth/start` calls
   * Composio's `connected_accounts` endpoint instead of the generic
   * OAuth discovery flow. See docs/plans/google-workspace-composio-swap.md.
   */
  readonly composio_auth_config_id: Schema.optional<Schema.NonEmptyString>;
  /**
   * Static credential import metadata for Composio-backed MCP sources.
   * The raw credential values stay in plugin_credentials; this field only
   * records how install-time secret env keys should be translated into
   * Composio's connected-account `state.val` shape.
   */
  readonly composio_static_auth: Schema.optional<Schema.Struct<{
    readonly auth_scheme: Schema.Literals<readonly ["API_KEY", "BEARER_TOKEN", "BASIC"]>;
    readonly credential_map: Schema.$Record<Schema.NonEmptyString, Schema.String>;
    readonly validate_credentials: Schema.optional<Schema.Boolean>;
  }>>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"cli">;
  readonly namespace: Schema.NonEmptyString;
  readonly launcher: Schema.Literals<readonly ["binary", "npx", "uvx", "bunx"]>;
  readonly command: Schema.NonEmptyString;
  readonly args: Schema.optional<Schema.$Array<Schema.String>>;
  readonly cwd_policy: Schema.Literals<readonly ["workspace", "configured", "call"]>;
  readonly cwd: Schema.optional<Schema.String>;
  readonly allowed_env_keys: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
  readonly sand_sandbox_policy: Schema.optional<Schema.Struct<{
    readonly filesystem: Schema.optional<Schema.Literals<readonly ["workspace", "cwd", "custom", "none"]>>;
    readonly network: Schema.optional<Schema.Literals<readonly ["inherit", "deny", "allowlist"]>>;
    readonly readable_paths: Schema.optional<Schema.$Array<Schema.String>>;
    readonly writable_paths: Schema.optional<Schema.$Array<Schema.String>>;
    readonly allowed_hosts: Schema.optional<Schema.$Array<Schema.String>>;
  }>>;
  readonly sand_secret_bindings: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly secret_name: Schema.NonEmptyString;
    readonly env: Schema.NonEmptyString;
    readonly required: Schema.optional<Schema.Boolean>;
  }>>>;
  readonly sand_runtime: Schema.optional<Schema.Struct<{
    readonly artifacts: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
      readonly id: Schema.String;
      readonly kind: Schema.Literal<"temp_dir">;
      readonly prefix: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly id: Schema.String;
      readonly kind: Schema.Literal<"temp_file">;
      readonly filename: Schema.NonEmptyString;
      readonly prefix: Schema.optional<Schema.NonEmptyString>;
      readonly parent_artifact_id: Schema.optional<Schema.String>;
      readonly contents: Schema.optional<Schema.String>;
    }>]>>>;
    readonly env: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly env: Schema.String;
      readonly value: Schema.Union<readonly [Schema.Struct<{
        readonly kind: Schema.Literal<"literal">;
        readonly value: Schema.String;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"artifact_path">;
        readonly artifact_id: Schema.String;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"secret_env">;
        readonly env: Schema.String;
      }>]>;
    }>>>;
    readonly args: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
      readonly kind: Schema.Literal<"literal">;
      readonly value: Schema.String;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"artifact_path">;
      readonly artifact_id: Schema.String;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"secret_env">;
      readonly env: Schema.String;
    }>]>>>;
  }>>;
  readonly cli_result_defaults: Schema.optional<Schema.Struct<{
    readonly sand_stdin_mode: Schema.optional<Schema.Literals<readonly ["none", "json", "text"]>>;
    readonly sand_result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
    readonly streaming: Schema.optional<Schema.Boolean>;
    readonly timeout_ms: Schema.optional<Schema.Number>;
  }>>;
  readonly sand_runtime_constraints: Schema.optional<Schema.Struct<{
    readonly os: Schema.optional<Schema.$Array<Schema.Literals<readonly ["darwin", "linux", "windows"]>>>;
    readonly arch: Schema.optional<Schema.$Array<Schema.Literals<readonly ["arm64", "x64"]>>>;
    readonly requires_sandbox_runtime: Schema.optional<Schema.Boolean>;
  }>>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"api">;
  readonly protocol: Schema.optional<Schema.Literals<readonly ["openapi", "graphql", "http"]>>;
  readonly base_url: Schema.NonEmptyString;
  readonly allowed_hosts: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
  readonly spec_url: Schema.optional<Schema.String>;
  readonly graphql_endpoint: Schema.optional<Schema.String>;
  readonly graphql_schema_url: Schema.optional<Schema.String>;
  readonly default_headers: Schema.optional<Schema.$Record<Schema.NonEmptyString, Schema.String>>;
  readonly timeout_ms: Schema.optional<Schema.Number>;
  readonly auth: Schema.optional<Schema.Struct<{
    readonly method: Schema.Literals<readonly ["none", "header", "bearer", "query", "basic"]>;
    readonly required: Schema.optional<Schema.Boolean>;
    readonly env: Schema.optional<Schema.String>;
    readonly secret_name: Schema.optional<Schema.NonEmptyString>;
    readonly header_name: Schema.optional<Schema.String>;
    readonly query_param: Schema.optional<Schema.String>;
    readonly prefix: Schema.optional<Schema.String>;
    readonly username_env: Schema.optional<Schema.String>;
    readonly username_secret_name: Schema.optional<Schema.NonEmptyString>;
    readonly password_env: Schema.optional<Schema.String>;
    readonly password_secret_name: Schema.optional<Schema.NonEmptyString>;
  }>>;
}>]>>;
type SourceConfigJson = typeof SourceConfigJson.Type;
declare const PersistedAuthConfigJson: Schema.fromJsonString<Schema.Struct<{
  readonly method: Schema.Literals<readonly ["header", "bearer", "query", "basic", "none"]>;
  readonly header_name: Schema.optional<Schema.String>;
  readonly query_param: Schema.optional<Schema.String>;
  readonly prefix: Schema.optional<Schema.String>;
  readonly credential_id: Schema.optional<Schema.String>;
}>>;
type PersistedAuthConfigJson = typeof PersistedAuthConfigJson.Type;
declare const PluginTool: Schema.Struct<{
  readonly id: Schema.String;
  readonly workspace_id: Schema.String;
  readonly source_id: Schema.String;
  readonly tool_id: Schema.NonEmptyString;
  readonly name: Schema.NonEmptyString;
  readonly display_name: Schema.NonEmptyString;
  readonly description: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly title: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly input_schema: Schema.optional<Schema.Unknown>;
  readonly output_schema: Schema.optional<Schema.Unknown>;
  readonly shared_defs: Schema.optional<Schema.Unknown>;
  readonly input_type: Schema.optional<Schema.String>;
  readonly output_type: Schema.optional<Schema.String>;
  readonly type_definitions: Schema.optional<Schema.String>;
  readonly annotations: Schema.optional<Schema.Unknown>;
  readonly icons: Schema.optional<Schema.Unknown>;
  readonly binding: Schema.Unknown;
  readonly tags: Schema.optional<Schema.NullOr<Schema.$Array<Schema.NonEmptyString>>>;
  readonly types: Schema.optional<Schema.String>;
  readonly created_at: Schema.String;
  readonly namespace: Schema.optional<Schema.String>;
  readonly js_var: Schema.optional<Schema.String>;
  readonly signature: Schema.optional<Schema.String>;
}>;
type PluginTool = typeof PluginTool.Type;
declare const ResolvedAuth: Schema.Struct<{
  readonly method: Schema.Literals<readonly ["header", "bearer", "query", "none"]>;
  readonly header_name: Schema.optional<Schema.String>;
  readonly query_param: Schema.optional<Schema.String>;
  readonly prefix: Schema.optional<Schema.String>;
  readonly value: Schema.optional<Schema.String>;
}>;
type ResolvedAuth = typeof ResolvedAuth.Type;
declare const CredentialKind: Schema.Literals<readonly ["api_key", "bearer_token", "oauth2_token", "custom"]>;
type CredentialKind = typeof CredentialKind.Type;
declare const PluginCredential: Schema.Struct<{
  readonly id: Schema.String;
  readonly workspace_id: Schema.String;
  readonly source_id: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly name: Schema.String;
  readonly display_name: Schema.String;
  readonly kind: Schema.Literals<readonly ["api_key", "bearer_token", "oauth2_token", "custom"]>;
  readonly status: Schema.Literals<readonly ["active", "expired", "revoked", "error"]>;
  readonly last_used_at: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly created_by: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly created_at: Schema.String;
  readonly updated_at: Schema.String;
}>;
type PluginCredential = typeof PluginCredential.Type;
declare const InvokeResultContent: Schema.Struct<{
  readonly type: Schema.Literals<readonly ["text", "image", "binary"]>;
  readonly mime_type: Schema.optional<Schema.String>;
  readonly data: Schema.String;
}>;
type InvokeResultContent = typeof InvokeResultContent.Type;
declare const InvokeResult: Schema.Struct<{
  readonly result: Schema.Unknown;
  readonly upstream_status: Schema.optional<Schema.Number>;
  readonly content_type: Schema.String;
  readonly content: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly type: Schema.Literals<readonly ["text", "image", "binary"]>;
    readonly mime_type: Schema.optional<Schema.String>;
    readonly data: Schema.String;
  }>>>;
  readonly duration_ms: Schema.Number;
  readonly invocation_id: Schema.String;
  readonly run_id: Schema.optional<Schema.String>;
}>;
type InvokeResult = typeof InvokeResult.Type;
declare const ExecuteResultTextContent: Schema.Struct<{
  readonly type: Schema.Literal<"text">;
  readonly mime_type: Schema.optional<Schema.String>;
  readonly text: Schema.String;
}>;
type ExecuteResultTextContent = typeof ExecuteResultTextContent.Type;
declare const ExecuteResultJsonContent: Schema.Struct<{
  readonly type: Schema.Literal<"json">;
  readonly mime_type: Schema.optional<Schema.String>;
  readonly json: Schema.Unknown;
}>;
type ExecuteResultJsonContent = typeof ExecuteResultJsonContent.Type;
declare const ExecuteSkillBundleFile: Schema.Struct<{
  readonly relative_path: Schema.String;
  readonly content_base64: Schema.String;
  readonly content_hash: Schema.String;
}>;
type ExecuteSkillBundleFile = typeof ExecuteSkillBundleFile.Type;
declare const ExecuteSkillBundle: Schema.Struct<{
  readonly slug: Schema.String;
  readonly name: Schema.optional<Schema.String>;
  readonly description: Schema.optional<Schema.String>;
  readonly content: Schema.String;
  readonly content_hash: Schema.String;
  readonly source_commit: Schema.optional<Schema.String>;
  readonly files: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly relative_path: Schema.String;
    readonly content_base64: Schema.String;
    readonly content_hash: Schema.String;
  }>>>;
}>;
type ExecuteSkillBundle = typeof ExecuteSkillBundle.Type;
declare const ExecuteResultSkillBundleContent: Schema.Struct<{
  readonly type: Schema.Literal<"skill_bundle">;
  readonly skill: Schema.Struct<{
    readonly slug: Schema.String;
    readonly name: Schema.optional<Schema.String>;
    readonly description: Schema.optional<Schema.String>;
    readonly content: Schema.String;
    readonly content_hash: Schema.String;
    readonly source_commit: Schema.optional<Schema.String>;
    readonly files: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly relative_path: Schema.String;
      readonly content_base64: Schema.String;
      readonly content_hash: Schema.String;
    }>>>;
  }>;
}>;
type ExecuteResultSkillBundleContent = typeof ExecuteResultSkillBundleContent.Type;
declare const ExecuteResultContent: Schema.Union<readonly [Schema.Struct<{
  readonly type: Schema.Literal<"text">;
  readonly mime_type: Schema.optional<Schema.String>;
  readonly text: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"json">;
  readonly mime_type: Schema.optional<Schema.String>;
  readonly json: Schema.Unknown;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"skill_bundle">;
  readonly skill: Schema.Struct<{
    readonly slug: Schema.String;
    readonly name: Schema.optional<Schema.String>;
    readonly description: Schema.optional<Schema.String>;
    readonly content: Schema.String;
    readonly content_hash: Schema.String;
    readonly source_commit: Schema.optional<Schema.String>;
    readonly files: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly relative_path: Schema.String;
      readonly content_base64: Schema.String;
      readonly content_hash: Schema.String;
    }>>>;
  }>;
}>]>;
type ExecuteResultContent = typeof ExecuteResultContent.Type;
declare const ExecuteResult: Schema.Struct<{
  readonly result: Schema.Unknown;
  readonly error: Schema.optional<Schema.String>;
  readonly logs: Schema.optional<Schema.Unknown>;
  readonly mode: Schema.Union<readonly [Schema.Literal<"dynamic_worker">, Schema.Literal<"workflow">]>;
  readonly content: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
    readonly type: Schema.Literal<"text">;
    readonly mime_type: Schema.optional<Schema.String>;
    readonly text: Schema.String;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"json">;
    readonly mime_type: Schema.optional<Schema.String>;
    readonly json: Schema.Unknown;
  }>, Schema.Struct<{
    readonly type: Schema.Literal<"skill_bundle">;
    readonly skill: Schema.Struct<{
      readonly slug: Schema.String;
      readonly name: Schema.optional<Schema.String>;
      readonly description: Schema.optional<Schema.String>;
      readonly content: Schema.String;
      readonly content_hash: Schema.String;
      readonly source_commit: Schema.optional<Schema.String>;
      readonly files: Schema.optional<Schema.$Array<Schema.Struct<{
        readonly relative_path: Schema.String;
        readonly content_base64: Schema.String;
        readonly content_hash: Schema.String;
      }>>>;
    }>;
  }>]>>>;
  readonly warnings: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly namespace: Schema.String;
    readonly tool: Schema.String;
    readonly message: Schema.String;
  }>>>;
  readonly run_id: Schema.String;
  readonly workflow_instance_id: Schema.optional<Schema.String>;
}>;
type ExecuteResult = typeof ExecuteResult.Type;
declare const ToolSearchKind: Schema.Literals<readonly ["mcp", "cli_command", "api_request", "api_graphql"]>;
type ToolSearchKind = typeof ToolSearchKind.Type;
declare const ToolSearchResult: Schema.Struct<{
  readonly tool_id: Schema.String;
  readonly display_name: Schema.String;
  readonly description: Schema.optional<Schema.String>;
  readonly source_namespace: Schema.String;
  readonly source_display_name: Schema.String;
  readonly score: Schema.Number;
  readonly js_var: Schema.optional<Schema.String>;
  readonly signature: Schema.optional<Schema.String>;
}>;
type ToolSearchResult = typeof ToolSearchResult.Type;
declare const ToolSignatureHit: Schema.Struct<{
  readonly tool_id: Schema.String;
  readonly name: Schema.String;
  readonly namespace: Schema.String;
  readonly js_var: Schema.String;
  readonly js_name: Schema.String;
  readonly display_name: Schema.String;
  readonly description: Schema.optional<Schema.String>;
  readonly signature: Schema.String;
  readonly input_schema: Schema.optional<Schema.Unknown>;
  readonly output_schema: Schema.optional<Schema.Unknown>;
  readonly shared_defs: Schema.optional<Schema.Unknown>;
  readonly input_type: Schema.optional<Schema.String>;
  readonly output_type: Schema.optional<Schema.String>;
  readonly type_definitions: Schema.optional<Schema.String>;
  readonly call_example: Schema.optional<Schema.String>;
  readonly call: Schema.optional<Schema.Struct<{
    readonly expression: Schema.String;
    readonly example: Schema.String;
  }>>;
  readonly score: Schema.Number;
  readonly kind: Schema.Literals<readonly ["mcp", "cli_command", "api_request", "api_graphql"]>;
}>;
type ToolSignatureHit = typeof ToolSignatureHit.Type;
declare const ToolsSearchResponse: Schema.Struct<{
  readonly hits: Schema.$Array<Schema.Struct<{
    readonly tool_id: Schema.String;
    readonly name: Schema.String;
    readonly namespace: Schema.String;
    readonly js_var: Schema.String;
    readonly js_name: Schema.String;
    readonly display_name: Schema.String;
    readonly description: Schema.optional<Schema.String>;
    readonly signature: Schema.String;
    readonly input_schema: Schema.optional<Schema.Unknown>;
    readonly output_schema: Schema.optional<Schema.Unknown>;
    readonly shared_defs: Schema.optional<Schema.Unknown>;
    readonly input_type: Schema.optional<Schema.String>;
    readonly output_type: Schema.optional<Schema.String>;
    readonly type_definitions: Schema.optional<Schema.String>;
    readonly call_example: Schema.optional<Schema.String>;
    readonly call: Schema.optional<Schema.Struct<{
      readonly expression: Schema.String;
      readonly example: Schema.String;
    }>>;
    readonly score: Schema.Number;
    readonly kind: Schema.Literals<readonly ["mcp", "cli_command", "api_request", "api_graphql"]>;
  }>>;
}>;
type ToolsSearchResponse = typeof ToolsSearchResponse.Type;
declare const ToolDescribeResponse: Schema.Struct<{
  readonly tool_id: Schema.String;
  readonly name: Schema.String;
  readonly namespace: Schema.String;
  readonly js_var: Schema.String;
  readonly js_name: Schema.String;
  readonly display_name: Schema.String;
  readonly description: Schema.optional<Schema.String>;
  readonly signature: Schema.String;
  readonly input_schema: Schema.optional<Schema.Unknown>;
  readonly output_schema: Schema.optional<Schema.Unknown>;
  readonly shared_defs: Schema.optional<Schema.Unknown>;
  readonly input_type: Schema.optional<Schema.String>;
  readonly output_type: Schema.optional<Schema.String>;
  readonly type_definitions: Schema.optional<Schema.String>;
  readonly call_example: Schema.String;
  readonly call: Schema.Struct<{
    readonly expression: Schema.String;
    readonly example: Schema.String;
  }>;
  readonly kind: Schema.Literals<readonly ["mcp", "cli_command", "api_request", "api_graphql"]>;
}>;
type ToolDescribeResponse = typeof ToolDescribeResponse.Type;
declare const ToolSchemaResponse: Schema.Struct<{
  readonly tool_id: Schema.String;
  readonly name: Schema.optional<Schema.String>;
  readonly display_name: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly description: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly title: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly input_schema: Schema.optional<Schema.Unknown>;
  readonly output_schema: Schema.optional<Schema.Unknown>;
  readonly input_type: Schema.optional<Schema.String>;
  readonly output_type: Schema.optional<Schema.String>;
  readonly type_definitions: Schema.optional<Schema.String>;
  readonly shared_defs: Schema.optional<Schema.Unknown>;
  readonly namespace: Schema.optional<Schema.String>;
  readonly source_display_name: Schema.optional<Schema.NullOr<Schema.String>>;
}>;
type ToolSchemaResponse = typeof ToolSchemaResponse.Type;
declare const ToolSchemasResponse: Schema.Struct<{
  readonly data: Schema.$Array<Schema.Struct<{
    readonly tool_id: Schema.String;
    readonly name: Schema.optional<Schema.String>;
    readonly display_name: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly description: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly title: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly input_schema: Schema.optional<Schema.Unknown>;
    readonly output_schema: Schema.optional<Schema.Unknown>;
    readonly input_type: Schema.optional<Schema.String>;
    readonly output_type: Schema.optional<Schema.String>;
    readonly type_definitions: Schema.optional<Schema.String>;
    readonly shared_defs: Schema.optional<Schema.Unknown>;
    readonly namespace: Schema.optional<Schema.String>;
    readonly source_display_name: Schema.optional<Schema.NullOr<Schema.String>>;
  }>>;
}>;
type ToolSchemasResponse = typeof ToolSchemasResponse.Type;
declare const ToolsListResult: Schema.Struct<{
  readonly data: Schema.$Array<Schema.Struct<{
    readonly id: Schema.String;
    readonly workspace_id: Schema.String;
    readonly source_id: Schema.String;
    readonly tool_id: Schema.NonEmptyString;
    readonly name: Schema.NonEmptyString;
    readonly display_name: Schema.NonEmptyString;
    readonly description: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly title: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly input_schema: Schema.optional<Schema.Unknown>;
    readonly output_schema: Schema.optional<Schema.Unknown>;
    readonly shared_defs: Schema.optional<Schema.Unknown>;
    readonly input_type: Schema.optional<Schema.String>;
    readonly output_type: Schema.optional<Schema.String>;
    readonly type_definitions: Schema.optional<Schema.String>;
    readonly annotations: Schema.optional<Schema.Unknown>;
    readonly icons: Schema.optional<Schema.Unknown>;
    readonly binding: Schema.Unknown;
    readonly tags: Schema.optional<Schema.NullOr<Schema.$Array<Schema.NonEmptyString>>>;
    readonly types: Schema.optional<Schema.String>;
    readonly created_at: Schema.String;
    readonly namespace: Schema.optional<Schema.String>;
    readonly js_var: Schema.optional<Schema.String>;
    readonly signature: Schema.optional<Schema.String>;
  }>>;
  readonly total: Schema.optional<Schema.NullOr<Schema.Number>>;
  readonly limit: Schema.Number;
  readonly offset: Schema.Number;
  readonly hasMore: Schema.Boolean;
  readonly nextCursor: Schema.optional<Schema.NullOr<Schema.String>>;
}>;
type ToolsListResult = typeof ToolsListResult.Type;
declare const ToolsReindexResult: Schema.Struct<{
  readonly queued: Schema.Number;
  readonly sources: Schema.$Array<Schema.Struct<{
    readonly source_id: Schema.String;
    readonly namespace: Schema.String;
  }>>;
}>;
type ToolsReindexResult = typeof ToolsReindexResult.Type;
declare const AddToolResult: Schema.Struct<{
  readonly id: Schema.String;
  readonly tool_id: Schema.String;
}>;
type AddToolResult = typeof AddToolResult.Type;
declare const SourceSummary: Schema.Struct<{
  readonly namespace: Schema.String;
  readonly display_name: Schema.String;
  readonly kind: Schema.Literals<readonly ["mcp", "cli", "api"]>;
  readonly tool_count: Schema.Number;
  readonly status: Schema.Literals<readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"]>;
  readonly category: Schema.optional<Schema.String>;
}>;
type SourceSummary = typeof SourceSummary.Type;
declare const OAuthCallbackUrlResult: Schema.Struct<{
  readonly callback_url: Schema.String;
}>;
type OAuthCallbackUrlResult = typeof OAuthCallbackUrlResult.Type;
declare const SourceIdBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly source_id: Schema.String;
}>;
type SourceIdBody = typeof SourceIdBody.Type;
declare const OAuthReconnectBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly source_id: Schema.String;
  readonly grant_id: Schema.optional<Schema.String>;
}>;
type OAuthReconnectBody = typeof OAuthReconnectBody.Type;
declare const OAuthDisconnectResult: Schema.Struct<{
  readonly ok: Schema.Literal<true>;
}>;
type OAuthDisconnectResult = typeof OAuthDisconnectResult.Type;
declare const OAuthConfigureBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly source_id: Schema.String;
  readonly client_id: Schema.optional<Schema.String>;
  readonly client_secret: Schema.optional<Schema.String>;
  readonly redirect_uri: Schema.optional<Schema.String>;
  readonly scope: Schema.optional<Schema.String>;
}>;
type OAuthConfigureBody = typeof OAuthConfigureBody.Type;
declare const OAuthConfigureResult: Schema.Struct<{
  readonly ok: Schema.Literal<true>;
}>;
type OAuthConfigureResult = typeof OAuthConfigureResult.Type;
declare const OAuthSetupHintsBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly source_id: Schema.optional<Schema.String>;
  readonly registry_slug: Schema.optional<Schema.String>;
}>;
type OAuthSetupHintsBody = typeof OAuthSetupHintsBody.Type;
declare const OAuthSetupHintsRegisterUrlSource: Schema.Literals<readonly ["service_documentation", "resource_documentation", "authorization_server_origin", "none"]>;
type OAuthSetupHintsRegisterUrlSource = typeof OAuthSetupHintsRegisterUrlSource.Type;
declare const OAuthSetupHints: Schema.Struct<{
  readonly display_name: Schema.String;
  readonly redirect_uri: Schema.String;
  readonly register_url: Schema.NullOr<Schema.String>;
  readonly register_url_source: Schema.Literals<readonly ["service_documentation", "resource_documentation", "authorization_server_origin", "none"]>;
  readonly scopes_supported: Schema.$Array<Schema.String>;
  readonly requires_client_secret: Schema.Boolean;
  readonly has_dynamic_registration: Schema.Boolean;
  readonly workspace_client_already_configured: Schema.Boolean;
  readonly has_global_client: Schema.Boolean;
  readonly authorization_server_host: Schema.NullOr<Schema.String>;
}>;
type OAuthSetupHints = typeof OAuthSetupHints.Type;
declare const OAuthStartResult: Schema.Struct<{
  readonly authorization_url: Schema.String;
  readonly state: Schema.optional<Schema.String>;
}>;
type OAuthStartResult = typeof OAuthStartResult.Type;
declare const OAuthFlowStatusBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly state: Schema.NonEmptyString;
}>;
type OAuthFlowStatusBody = typeof OAuthFlowStatusBody.Type;
declare const OAuthFlowStatusResult: Schema.Struct<{
  readonly state: Schema.String;
  readonly source_id: Schema.String;
  readonly purpose: Schema.Literals<readonly ["connect", "reconnect"]>;
  readonly grant_id: Schema.NullOr<Schema.String>;
  readonly status: Schema.Literals<readonly ["pending", "consumed", "expired", "superseded", "failed"]>;
  readonly error: Schema.NullOr<Schema.String>;
  readonly expires_at: Schema.String;
  readonly created_at: Schema.String;
  readonly updated_at: Schema.String;
  readonly source_status: Schema.optional<Schema.NullOr<Schema.Literals<readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"]>>>;
  readonly source_tool_count: Schema.optional<Schema.NullOr<Schema.Number>>;
  readonly source_error: Schema.optional<Schema.NullOr<Schema.String>>;
}>;
type OAuthFlowStatusResult = typeof OAuthFlowStatusResult.Type;
declare const SourceListBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly source_id: Schema.optional<Schema.String>;
  readonly registry_slug: Schema.optional<Schema.String>;
  readonly limit: Schema.optional<Schema.Number>;
  readonly offset: Schema.optional<Schema.Number>;
  readonly cursor: Schema.optional<Schema.String>;
  readonly include_total: Schema.optional<Schema.Boolean>;
  readonly machine_id: Schema.optional<Schema.NonEmptyString>;
  readonly agent_id: Schema.optional<Schema.NonEmptyString>;
}>;
type SourceListBody = typeof SourceListBody.Type;
declare const SourceListResult: Schema.Struct<{
  readonly data: Schema.$Array<Schema.Struct<{
    readonly id: Schema.String;
    readonly workspace_id: Schema.String;
    readonly kind: Schema.Literals<readonly ["mcp", "cli", "api"]>;
    readonly namespace: Schema.String;
    readonly display_name: Schema.String;
    readonly description: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly config: Schema.Unknown;
    readonly auth_config: Schema.Unknown;
    readonly status: Schema.Literals<readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"]>;
    readonly install_status: Schema.optional<Schema.Literals<readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"]>>;
    readonly effective_status: Schema.optional<Schema.Literals<readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"]>>;
    readonly runnable: Schema.optional<Schema.Boolean>;
    readonly redacted: Schema.optional<Schema.Boolean>;
    readonly non_runnable_reason: Schema.optional<Schema.String>;
    readonly tool_count: Schema.Number;
    readonly last_synced_at: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly error: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly verified: Schema.optional<Schema.Boolean>;
    readonly last_verified_at: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly last_verify_error: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly latest_verification: Schema.optional<Schema.Struct<{
      readonly source_id: Schema.String;
      readonly machine_id: Schema.NonEmptyString;
      readonly agent_id: Schema.NonEmptyString;
      readonly status: Schema.Literals<readonly ["pending", "verified", "failed"]>;
      readonly verified: Schema.Boolean;
      readonly checked_at: Schema.String;
      readonly error: Schema.optional<Schema.String>;
    }>>;
    readonly sand_missing_required_secret_envs: Schema.optional<Schema.$Array<Schema.String>>;
    readonly category: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly links: Schema.optional<Schema.NullOr<Schema.$Array<Schema.Struct<{
      readonly label: Schema.String;
      readonly url: Schema.String;
      readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
    }>>>>;
    readonly icon_url: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly shared_defs: Schema.optional<Schema.NullOr<Schema.Unknown>>;
    readonly registry_slug: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly mcp_protocol_version: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly mcp_server_info: Schema.optional<Schema.Unknown>;
    readonly mcp_capabilities: Schema.optional<Schema.Unknown>;
    readonly mcp_instructions: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly mcp_prompt_count: Schema.optional<Schema.Number>;
    readonly mcp_resource_count: Schema.optional<Schema.Number>;
    readonly mcp_resource_template_count: Schema.optional<Schema.Number>;
    readonly generated_types: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly created_by: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly created_by_user: Schema.optional<Schema.NullOr<Schema.Struct<{
      readonly id: Schema.String;
      readonly name: Schema.optional<Schema.NullOr<Schema.String>>;
      readonly email: Schema.optional<Schema.NullOr<Schema.String>>;
      readonly avatar_url: Schema.optional<Schema.NullOr<Schema.String>>;
    }>>>;
    readonly source_visibility: Schema.optional<Schema.Literals<readonly ["personal", "workspace"]>>;
    readonly caller_status: Schema.optional<Schema.Literals<readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"]>>;
    readonly created_at: Schema.String;
    readonly updated_at: Schema.String;
  }>>;
  readonly total: Schema.optional<Schema.NullOr<Schema.Number>>;
  readonly limit: Schema.Number;
  readonly offset: Schema.Number;
  readonly hasMore: Schema.Boolean;
  readonly nextCursor: Schema.optional<Schema.NullOr<Schema.String>>;
}>;
type SourceListResult = typeof SourceListResult.Type;
declare const SourceAuthTestBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly source_id: Schema.NonEmptyString;
  readonly override_secrets: Schema.optional<Schema.$Record<Schema.String, Schema.String>>;
}>;
type SourceAuthTestBody = typeof SourceAuthTestBody.Type;
declare const SourceAuthTestRedactedRequest: Schema.Struct<{
  readonly method: Schema.NonEmptyString;
  readonly url: Schema.NonEmptyString;
  readonly headers: Schema.$Record<Schema.String, Schema.String>;
  readonly body_preview: Schema.optional<Schema.String>;
}>;
type SourceAuthTestRedactedRequest = typeof SourceAuthTestRedactedRequest.Type;
declare const SourceAuthTestResult: Schema.Struct<{
  readonly ok: Schema.Boolean;
  readonly http_status: Schema.NullOr<Schema.Number>;
  readonly latency_ms: Schema.Number;
  readonly redacted_request: Schema.Struct<{
    readonly method: Schema.NonEmptyString;
    readonly url: Schema.NonEmptyString;
    readonly headers: Schema.$Record<Schema.String, Schema.String>;
    readonly body_preview: Schema.optional<Schema.String>;
  }>;
  readonly upstream_body_preview: Schema.String;
  readonly provider_diagnosis: Schema.NonEmptyString;
  readonly suggested_fix: Schema.optional<Schema.String>;
}>;
type SourceAuthTestResult = typeof SourceAuthTestResult.Type;
declare const SourceAbandonResult: Schema.Struct<{
  readonly source_id: Schema.String;
  readonly abandoned: Schema.Literal<true>;
}>;
type SourceAbandonResult = typeof SourceAbandonResult.Type;
declare const SourceCleanupStaleResult: Schema.Struct<{
  readonly ok: Schema.Literal<true>;
  readonly ttl_minutes: Schema.Number;
}>;
type SourceCleanupStaleResult = typeof SourceCleanupStaleResult.Type;
declare const SourceVisibilitySetBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly source_id: Schema.String;
  readonly source_visibility: Schema.Literals<readonly ["personal", "workspace"]>;
}>;
type SourceVisibilitySetBody = typeof SourceVisibilitySetBody.Type;
declare const McpProbeBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly endpoint: Schema.NonEmptyString;
}>;
type McpProbeBody = typeof McpProbeBody.Type;
declare const RefreshSourceBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly source_id: Schema.optional<Schema.String>;
  readonly namespace: Schema.optional<Schema.NonEmptyString>;
}>;
type RefreshSourceBody = typeof RefreshSourceBody.Type;
declare const RefreshSourceResult: Schema.Struct<{
  readonly source_id: Schema.String;
  readonly tool_count: Schema.Number;
  readonly status: Schema.Literals<readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"]>;
  readonly source: Schema.Struct<{
    readonly id: Schema.String;
    readonly workspace_id: Schema.String;
    readonly kind: Schema.Literals<readonly ["mcp", "cli", "api"]>;
    readonly namespace: Schema.String;
    readonly display_name: Schema.String;
    readonly description: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly config: Schema.Unknown;
    readonly auth_config: Schema.Unknown;
    readonly status: Schema.Literals<readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"]>;
    readonly install_status: Schema.optional<Schema.Literals<readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"]>>;
    readonly effective_status: Schema.optional<Schema.Literals<readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"]>>;
    readonly runnable: Schema.optional<Schema.Boolean>;
    readonly redacted: Schema.optional<Schema.Boolean>;
    readonly non_runnable_reason: Schema.optional<Schema.String>;
    readonly tool_count: Schema.Number;
    readonly last_synced_at: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly error: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly verified: Schema.optional<Schema.Boolean>;
    readonly last_verified_at: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly last_verify_error: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly latest_verification: Schema.optional<Schema.Struct<{
      readonly source_id: Schema.String;
      readonly machine_id: Schema.NonEmptyString;
      readonly agent_id: Schema.NonEmptyString;
      readonly status: Schema.Literals<readonly ["pending", "verified", "failed"]>;
      readonly verified: Schema.Boolean;
      readonly checked_at: Schema.String;
      readonly error: Schema.optional<Schema.String>;
    }>>;
    readonly sand_missing_required_secret_envs: Schema.optional<Schema.$Array<Schema.String>>;
    readonly category: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly links: Schema.optional<Schema.NullOr<Schema.$Array<Schema.Struct<{
      readonly label: Schema.String;
      readonly url: Schema.String;
      readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
    }>>>>;
    readonly icon_url: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly shared_defs: Schema.optional<Schema.NullOr<Schema.Unknown>>;
    readonly registry_slug: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly mcp_protocol_version: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly mcp_server_info: Schema.optional<Schema.Unknown>;
    readonly mcp_capabilities: Schema.optional<Schema.Unknown>;
    readonly mcp_instructions: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly mcp_prompt_count: Schema.optional<Schema.Number>;
    readonly mcp_resource_count: Schema.optional<Schema.Number>;
    readonly mcp_resource_template_count: Schema.optional<Schema.Number>;
    readonly generated_types: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly created_by: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly created_by_user: Schema.optional<Schema.NullOr<Schema.Struct<{
      readonly id: Schema.String;
      readonly name: Schema.optional<Schema.NullOr<Schema.String>>;
      readonly email: Schema.optional<Schema.NullOr<Schema.String>>;
      readonly avatar_url: Schema.optional<Schema.NullOr<Schema.String>>;
    }>>>;
    readonly source_visibility: Schema.optional<Schema.Literals<readonly ["personal", "workspace"]>>;
    readonly caller_status: Schema.optional<Schema.Literals<readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"]>>;
    readonly created_at: Schema.String;
    readonly updated_at: Schema.String;
  }>;
}>;
type RefreshSourceResult = typeof RefreshSourceResult.Type;
declare const RegistryListBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly slug: Schema.optional<Schema.String>;
}>;
type RegistryListBody = typeof RegistryListBody.Type;
declare const ToolIdBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly tool_id: Schema.String;
}>;
type ToolIdBody = typeof ToolIdBody.Type;
declare const AddSourceBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly kind: Schema.Literals<readonly ["mcp", "cli", "api"]>;
  readonly namespace: Schema.NonEmptyString;
  readonly display_name: Schema.NonEmptyString;
  readonly config: Schema.Unknown;
  readonly auth_config: Schema.optional<Schema.Unknown>;
  readonly description: Schema.optional<Schema.String>;
  readonly category: Schema.optional<Schema.String>;
  readonly icon_url: Schema.optional<Schema.String>;
  readonly links: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly label: Schema.String;
    readonly url: Schema.String;
    readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
  }>>>;
  readonly source_visibility: Schema.optional<Schema.Literals<readonly ["personal", "workspace"]>>;
}>;
type AddSourceBody = typeof AddSourceBody.Type;
declare const AddSourceResult: Schema.Struct<{
  readonly source_id: Schema.String;
  readonly tool_count: Schema.Number;
  readonly status: Schema.Literals<readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"]>;
  readonly source: Schema.Struct<{
    readonly id: Schema.String;
    readonly workspace_id: Schema.String;
    readonly kind: Schema.Literals<readonly ["mcp", "cli", "api"]>;
    readonly namespace: Schema.String;
    readonly display_name: Schema.String;
    readonly description: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly config: Schema.Unknown;
    readonly auth_config: Schema.Unknown;
    readonly status: Schema.Literals<readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"]>;
    readonly install_status: Schema.optional<Schema.Literals<readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"]>>;
    readonly effective_status: Schema.optional<Schema.Literals<readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"]>>;
    readonly runnable: Schema.optional<Schema.Boolean>;
    readonly redacted: Schema.optional<Schema.Boolean>;
    readonly non_runnable_reason: Schema.optional<Schema.String>;
    readonly tool_count: Schema.Number;
    readonly last_synced_at: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly error: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly verified: Schema.optional<Schema.Boolean>;
    readonly last_verified_at: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly last_verify_error: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly latest_verification: Schema.optional<Schema.Struct<{
      readonly source_id: Schema.String;
      readonly machine_id: Schema.NonEmptyString;
      readonly agent_id: Schema.NonEmptyString;
      readonly status: Schema.Literals<readonly ["pending", "verified", "failed"]>;
      readonly verified: Schema.Boolean;
      readonly checked_at: Schema.String;
      readonly error: Schema.optional<Schema.String>;
    }>>;
    readonly sand_missing_required_secret_envs: Schema.optional<Schema.$Array<Schema.String>>;
    readonly category: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly links: Schema.optional<Schema.NullOr<Schema.$Array<Schema.Struct<{
      readonly label: Schema.String;
      readonly url: Schema.String;
      readonly kind: Schema.Literals<readonly ["docs", "dashboard", "api"]>;
    }>>>>;
    readonly icon_url: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly shared_defs: Schema.optional<Schema.NullOr<Schema.Unknown>>;
    readonly registry_slug: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly mcp_protocol_version: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly mcp_server_info: Schema.optional<Schema.Unknown>;
    readonly mcp_capabilities: Schema.optional<Schema.Unknown>;
    readonly mcp_instructions: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly mcp_prompt_count: Schema.optional<Schema.Number>;
    readonly mcp_resource_count: Schema.optional<Schema.Number>;
    readonly mcp_resource_template_count: Schema.optional<Schema.Number>;
    readonly generated_types: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly created_by: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly created_by_user: Schema.optional<Schema.NullOr<Schema.Struct<{
      readonly id: Schema.String;
      readonly name: Schema.optional<Schema.NullOr<Schema.String>>;
      readonly email: Schema.optional<Schema.NullOr<Schema.String>>;
      readonly avatar_url: Schema.optional<Schema.NullOr<Schema.String>>;
    }>>>;
    readonly source_visibility: Schema.optional<Schema.Literals<readonly ["personal", "workspace"]>>;
    readonly caller_status: Schema.optional<Schema.Literals<readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"]>>;
    readonly created_at: Schema.String;
    readonly updated_at: Schema.String;
  }>;
}>;
type AddSourceResult = typeof AddSourceResult.Type;
declare const RemoveSourceResult: Schema.Struct<{
  readonly source_id: Schema.String;
  readonly removed: Schema.Literal<true>;
}>;
type RemoveSourceResult = typeof RemoveSourceResult.Type;
declare const SourceVerificationSetBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly source_id: Schema.String;
  readonly machine_id: Schema.NonEmptyString;
  readonly agent_id: Schema.NonEmptyString;
  readonly status: Schema.Literals<readonly ["pending", "verified", "failed"]>;
  readonly error: Schema.optional<Schema.String>;
  readonly details: Schema.optional<Schema.Unknown>;
  readonly checked_at: Schema.optional<Schema.String>;
}>;
type SourceVerificationSetBody = typeof SourceVerificationSetBody.Type;
declare const SourceVerificationGetBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly source_id: Schema.String;
  readonly machine_id: Schema.optional<Schema.NonEmptyString>;
  readonly agent_id: Schema.optional<Schema.NonEmptyString>;
}>;
type SourceVerificationGetBody = typeof SourceVerificationGetBody.Type;
declare const SourceVerificationGetResult: Schema.Struct<{
  readonly source_id: Schema.String;
  readonly verification: Schema.NullOr<Schema.Struct<{
    readonly id: Schema.String;
    readonly workspace_id: Schema.String;
    readonly source_id: Schema.String;
    readonly machine_id: Schema.NonEmptyString;
    readonly agent_id: Schema.NonEmptyString;
    readonly status: Schema.Literals<readonly ["pending", "verified", "failed"]>;
    readonly verified: Schema.Boolean;
    readonly error: Schema.optional<Schema.String>;
    readonly details: Schema.optional<Schema.Unknown>;
    readonly checked_at: Schema.String;
    readonly created_by: Schema.optional<Schema.String>;
    readonly created_at: Schema.String;
    readonly updated_at: Schema.String;
  }>>;
}>;
type SourceVerificationGetResult = typeof SourceVerificationGetResult.Type;
declare const SourceVerificationSetResult: Schema.Struct<{
  readonly source_id: Schema.String;
  readonly verification: Schema.Struct<{
    readonly id: Schema.String;
    readonly workspace_id: Schema.String;
    readonly source_id: Schema.String;
    readonly machine_id: Schema.NonEmptyString;
    readonly agent_id: Schema.NonEmptyString;
    readonly status: Schema.Literals<readonly ["pending", "verified", "failed"]>;
    readonly verified: Schema.Boolean;
    readonly error: Schema.optional<Schema.String>;
    readonly details: Schema.optional<Schema.Unknown>;
    readonly checked_at: Schema.String;
    readonly created_by: Schema.optional<Schema.String>;
    readonly created_at: Schema.String;
    readonly updated_at: Schema.String;
  }>;
}>;
type SourceVerificationSetResult = typeof SourceVerificationSetResult.Type;
declare const SourceVerificationProbeBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly source_id: Schema.String;
}>;
type SourceVerificationProbeBody = typeof SourceVerificationProbeBody.Type;
declare const SourceVerificationProbeResult: Schema.Struct<{
  readonly source_id: Schema.String;
  readonly status: Schema.Literals<readonly ["pending", "verified", "failed"]>;
  readonly verified: Schema.Boolean;
  readonly checked_at: Schema.String;
  readonly error: Schema.optional<Schema.String>;
  readonly details: Schema.optional<Schema.Unknown>;
}>;
type SourceVerificationProbeResult = typeof SourceVerificationProbeResult.Type;
declare const RegistryInstallBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly slug: Schema.String;
  readonly namespace: Schema.optional<Schema.String>;
  readonly source_visibility: Schema.optional<Schema.Literals<readonly ["personal", "workspace"]>>;
  readonly secrets_by_env: Schema.optional<Schema.$Record<Schema.String, Schema.NonEmptyString>>; /** @deprecated Use secrets_by_env with env-keyed values. */
  readonly credential_value: Schema.optional<Schema.NonEmptyString>;
}>;
type RegistryInstallBody = typeof RegistryInstallBody.Type;
declare const SubmitSourceRequestBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly name: Schema.String;
  readonly description: Schema.optional<Schema.String>;
  readonly docs_url: Schema.optional<Schema.String>;
}>;
type SubmitSourceRequestBody = typeof SubmitSourceRequestBody.Type;
declare const SubmitSourceRequestResult: Schema.Struct<{
  readonly id: Schema.String;
  readonly created_at: Schema.Number;
}>;
type SubmitSourceRequestResult = typeof SubmitSourceRequestResult.Type;
declare const PluginInstallJobStatus: Schema.Literals<readonly ["pending", "running", "succeeded", "failed", "cancelled"]>;
type PluginInstallJobStatus = typeof PluginInstallJobStatus.Type;
declare const PluginInstallJob: Schema.Struct<{
  readonly id: Schema.String;
  readonly workspace_id: Schema.String;
  readonly slug: Schema.String;
  readonly namespace: Schema.String;
  readonly status: Schema.Literals<readonly ["pending", "running", "succeeded", "failed", "cancelled"]>;
  readonly error: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly attempts: Schema.Number;
  readonly payload_json: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly created_by: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly source_id: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly source_status: Schema.optional<Schema.NullOr<Schema.Literals<readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"]>>>;
  readonly source_tool_count: Schema.optional<Schema.NullOr<Schema.Number>>;
  readonly source_error: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly started_at: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly finished_at: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly created_at: Schema.String;
  readonly updated_at: Schema.String;
}>;
type PluginInstallJob = typeof PluginInstallJob.Type;
declare const PluginInstallJobListResult: Schema.Struct<{
  readonly data: Schema.$Array<Schema.Struct<{
    readonly id: Schema.String;
    readonly workspace_id: Schema.String;
    readonly slug: Schema.String;
    readonly namespace: Schema.String;
    readonly status: Schema.Literals<readonly ["pending", "running", "succeeded", "failed", "cancelled"]>;
    readonly error: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly attempts: Schema.Number;
    readonly payload_json: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly created_by: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly source_id: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly source_status: Schema.optional<Schema.NullOr<Schema.Literals<readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"]>>>;
    readonly source_tool_count: Schema.optional<Schema.NullOr<Schema.Number>>;
    readonly source_error: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly started_at: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly finished_at: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly created_at: Schema.String;
    readonly updated_at: Schema.String;
  }>>;
  readonly total: Schema.optional<Schema.NullOr<Schema.Number>>;
  readonly limit: Schema.Number;
  readonly offset: Schema.Number;
  readonly hasMore: Schema.Boolean;
  readonly nextCursor: Schema.optional<Schema.NullOr<Schema.String>>;
}>;
type PluginInstallJobListResult = typeof PluginInstallJobListResult.Type;
declare const PluginInstallJobGetBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly job_id: Schema.String;
}>;
type PluginInstallJobGetBody = typeof PluginInstallJobGetBody.Type;
declare const PluginInstallJobListBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly slug: Schema.optional<Schema.String>;
  readonly status: Schema.optional<Schema.Literals<readonly ["pending", "running", "succeeded", "failed", "cancelled"]>>;
  readonly active: Schema.optional<Schema.Boolean>;
  readonly limit: Schema.optional<Schema.Number>;
  readonly offset: Schema.optional<Schema.Number>;
  readonly cursor: Schema.optional<Schema.String>;
  readonly include_total: Schema.optional<Schema.Boolean>;
}>;
type PluginInstallJobListBody = typeof PluginInstallJobListBody.Type;
declare const RegistryInstallJobResult: Schema.Struct<{
  readonly job_id: Schema.String;
  readonly status: Schema.Literals<readonly ["pending", "running", "succeeded", "failed", "cancelled"]>;
}>;
type RegistryInstallJobResult = typeof RegistryInstallJobResult.Type;
declare const RegistryInstallSourceResult: Schema.Struct<{
  readonly source_id: Schema.String;
  readonly tool_count: Schema.Number;
  readonly status: Schema.Literals<readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"]>;
}>;
type RegistryInstallSourceResult = typeof RegistryInstallSourceResult.Type;
declare const RegistryInstallResult: Schema.Union<readonly [Schema.Struct<{
  readonly job_id: Schema.String;
  readonly status: Schema.Literals<readonly ["pending", "running", "succeeded", "failed", "cancelled"]>;
}>, Schema.Struct<{
  readonly source_id: Schema.String;
  readonly tool_count: Schema.Number;
  readonly status: Schema.Literals<readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"]>;
}>]>;
type RegistryInstallResult = typeof RegistryInstallResult.Type;
declare const ToolsListBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly source_id: Schema.optional<Schema.String>;
  readonly namespace: Schema.optional<Schema.String>;
  readonly limit: Schema.optional<Schema.Number>;
  readonly offset: Schema.optional<Schema.Number>;
  readonly cursor: Schema.optional<Schema.String>;
}>;
type ToolsListBody = typeof ToolsListBody.Type;
declare const ToolIdsBody: Schema.Struct<{
  readonly tool_ids: Schema.$Array<Schema.NonEmptyString>;
}>;
type ToolIdsBody = typeof ToolIdsBody.Type;
declare const ToolsReindexBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly source_id: Schema.optional<Schema.String>;
  readonly namespace: Schema.optional<Schema.String>;
  readonly all: Schema.optional<Schema.Boolean>;
}>;
type ToolsReindexBody = typeof ToolsReindexBody.Type;
/**
 * Tool search execution mode.
 *
 * - `auto` (default): vector-first with a lexical D1 fallback when Vectorize
 *   is unavailable, errors, or returns no hits. Matches the legacy behaviour
 *   so existing clients keep working.
 * - `vector`: only run the Vectorize-backed semantic search. If the
 *   workspace has no enabled scopes, no Vectorize binding, or the embedding
 *   path errors, the response surfaces an empty result rather than silently
 *   degrading to lexical scoring.
 * - `lexical`: skip Vectorize entirely and only run the D1 lexical scorer.
 *   Useful for diagnosing search quality without depending on the vector
 *   index.
 */
declare const ToolSearchMode: Schema.Literals<readonly ["auto", "vector", "lexical"]>;
type ToolSearchMode = typeof ToolSearchMode.Type;
declare const ToolsSearchBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly query: Schema.NonEmptyString;
  readonly limit: Schema.optional<Schema.Number>;
  readonly source: Schema.optional<Schema.String>;
  readonly kind: Schema.optional<Schema.$Array<Schema.Literals<readonly ["mcp", "cli_command", "api_request", "api_graphql"]>>>;
  readonly verbose: Schema.optional<Schema.Boolean>;
  readonly mode: Schema.optional<Schema.Literals<readonly ["auto", "vector", "lexical"]>>;
}>;
type ToolsSearchBody = typeof ToolsSearchBody.Type;
declare const ToolDescribeBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly tool_id: Schema.String;
}>;
type ToolDescribeBody = typeof ToolDescribeBody.Type;
declare const AddToolBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly source_id: Schema.String;
  readonly tool_id: Schema.NonEmptyString;
  readonly name: Schema.NonEmptyString;
  readonly display_name: Schema.NonEmptyString;
  readonly description: Schema.optional<Schema.String>;
  readonly title: Schema.optional<Schema.String>;
  readonly input_schema: Schema.optional<Schema.Unknown>;
  readonly output_schema: Schema.optional<Schema.Unknown>;
  readonly annotations: Schema.optional<Schema.Unknown>;
  readonly icons: Schema.optional<Schema.Unknown>;
  readonly binding: Schema.Unknown;
  readonly tags: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
}>;
type AddToolBody = typeof AddToolBody.Type;
declare const CredentialCreateBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly source_id: Schema.String;
  readonly name: Schema.NonEmptyString;
  readonly display_name: Schema.NonEmptyString;
  readonly value: Schema.NonEmptyString;
  readonly kind: Schema.optional<Schema.Literals<readonly ["api_key", "bearer_token", "oauth2_token", "custom"]>>;
}>;
type CredentialCreateBody = typeof CredentialCreateBody.Type;
declare const CredentialUpsertBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly source_id: Schema.String;
  readonly name: Schema.NonEmptyString;
  readonly display_name: Schema.optional<Schema.String>;
  readonly value: Schema.NonEmptyString;
  readonly kind: Schema.optional<Schema.Literals<readonly ["api_key", "bearer_token", "oauth2_token", "custom"]>>;
}>;
type CredentialUpsertBody = typeof CredentialUpsertBody.Type;
declare const CredentialCreateResult: Schema.Struct<{
  readonly id: Schema.String;
  readonly workspace_id: Schema.String;
  readonly source_id: Schema.String;
  readonly name: Schema.String;
}>;
type CredentialCreateResult = typeof CredentialCreateResult.Type;
declare const CredentialUpsertResult: Schema.Struct<{
  readonly id: Schema.String;
  readonly workspace_id: Schema.String;
  readonly source_id: Schema.String;
  readonly name: Schema.String;
  readonly created: Schema.Boolean;
}>;
type CredentialUpsertResult = typeof CredentialUpsertResult.Type;
declare const CredentialsListBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly limit: Schema.optional<Schema.Number>;
  readonly offset: Schema.optional<Schema.Number>;
  readonly cursor: Schema.optional<Schema.String>;
  readonly include_total: Schema.optional<Schema.Boolean>;
}>;
type CredentialsListBody = typeof CredentialsListBody.Type;
declare const CredentialListItem: Schema.Struct<{
  readonly id: Schema.String;
  readonly workspace_id: Schema.String;
  readonly source_id: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly name: Schema.String;
  readonly display_name: Schema.String;
  readonly kind: Schema.Literals<readonly ["api_key", "bearer_token", "oauth2_token", "custom"]>;
  readonly status: Schema.Literals<readonly ["active", "expired", "revoked", "error"]>;
  readonly masked_value: Schema.String;
  readonly last_used_at: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly created_by: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly created_at: Schema.String;
  readonly updated_at: Schema.String;
}>;
type CredentialListItem = typeof CredentialListItem.Type;
declare const CredentialsListResult: Schema.Struct<{
  readonly data: Schema.$Array<Schema.Struct<{
    readonly id: Schema.String;
    readonly workspace_id: Schema.String;
    readonly source_id: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly name: Schema.String;
    readonly display_name: Schema.String;
    readonly kind: Schema.Literals<readonly ["api_key", "bearer_token", "oauth2_token", "custom"]>;
    readonly status: Schema.Literals<readonly ["active", "expired", "revoked", "error"]>;
    readonly masked_value: Schema.String;
    readonly last_used_at: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly created_by: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly created_at: Schema.String;
    readonly updated_at: Schema.String;
  }>>;
  readonly total: Schema.optional<Schema.NullOr<Schema.Number>>;
  readonly limit: Schema.Number;
  readonly offset: Schema.Number;
  readonly hasMore: Schema.Boolean;
  readonly nextCursor: Schema.optional<Schema.NullOr<Schema.String>>;
}>;
type CredentialsListResult = typeof CredentialsListResult.Type;
declare const CredentialIdBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly credential_id: Schema.String;
}>;
type CredentialIdBody = typeof CredentialIdBody.Type;
declare const CredentialDeleteResult: Schema.Struct<{
  readonly ok: Schema.Boolean;
}>;
type CredentialDeleteResult = typeof CredentialDeleteResult.Type;
declare const InvokeToolBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly tool_id: Schema.String;
  readonly input: Schema.$Record<Schema.String, Schema.Unknown>;
  readonly agent_id: Schema.optional<Schema.String>;
  readonly run_id: Schema.optional<Schema.String>;
}>;
type InvokeToolBody = typeof InvokeToolBody.Type;
declare const MetaSearchBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly query: Schema.NonEmptyString;
  readonly limit: Schema.optional<Schema.Number>;
}>;
type MetaSearchBody = typeof MetaSearchBody.Type;
declare const ExtractedTool: Schema.Struct<{
  readonly tool_id: Schema.String;
  readonly name: Schema.String;
  readonly display_name: Schema.NonEmptyString;
  readonly description: Schema.optional<Schema.String>;
  readonly title: Schema.optional<Schema.String>;
  readonly input_schema: Schema.optional<Schema.Unknown>;
  readonly output_schema: Schema.optional<Schema.Unknown>;
  readonly binding: Schema.Unknown;
  readonly tags: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
  readonly annotations: Schema.optional<Schema.Unknown>;
  readonly icons: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly src: Schema.String;
    readonly mimeType: Schema.optional<Schema.String>;
    readonly sizes: Schema.optional<Schema.String>;
  }>>>;
}>;
type ExtractedTool = typeof ExtractedTool.Type;
declare const DiscoverySourceMetadata: Schema.Struct<{
  readonly protocol_version: Schema.optional<Schema.String>;
  readonly server_info: Schema.optional<Schema.Unknown>;
  readonly capabilities: Schema.optional<Schema.Unknown>;
  readonly instructions: Schema.optional<Schema.String>;
  readonly icons: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly src: Schema.String;
    readonly mimeType: Schema.optional<Schema.String>;
    readonly sizes: Schema.optional<Schema.String>;
  }>>>;
  readonly prompt_count: Schema.optional<Schema.Number>;
  readonly resource_count: Schema.optional<Schema.Number>;
  readonly resource_template_count: Schema.optional<Schema.Number>;
}>;
type DiscoverySourceMetadata = typeof DiscoverySourceMetadata.Type;
declare const DiscoveryResult: Schema.Struct<{
  readonly tools: Schema.$Array<Schema.Struct<{
    readonly tool_id: Schema.String;
    readonly name: Schema.String;
    readonly display_name: Schema.NonEmptyString;
    readonly description: Schema.optional<Schema.String>;
    readonly title: Schema.optional<Schema.String>;
    readonly input_schema: Schema.optional<Schema.Unknown>;
    readonly output_schema: Schema.optional<Schema.Unknown>;
    readonly binding: Schema.Unknown;
    readonly tags: Schema.optional<Schema.$Array<Schema.NonEmptyString>>;
    readonly annotations: Schema.optional<Schema.Unknown>;
    readonly icons: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly src: Schema.String;
      readonly mimeType: Schema.optional<Schema.String>;
      readonly sizes: Schema.optional<Schema.String>;
    }>>>;
  }>>;
  readonly shared_defs: Schema.optional<Schema.Unknown>;
  readonly source_metadata: Schema.optional<Schema.Struct<{
    readonly protocol_version: Schema.optional<Schema.String>;
    readonly server_info: Schema.optional<Schema.Unknown>;
    readonly capabilities: Schema.optional<Schema.Unknown>;
    readonly instructions: Schema.optional<Schema.String>;
    readonly icons: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly src: Schema.String;
      readonly mimeType: Schema.optional<Schema.String>;
      readonly sizes: Schema.optional<Schema.String>;
    }>>>;
    readonly prompt_count: Schema.optional<Schema.Number>;
    readonly resource_count: Schema.optional<Schema.Number>;
    readonly resource_template_count: Schema.optional<Schema.Number>;
  }>>;
}>;
type DiscoveryResult = typeof DiscoveryResult.Type;
declare const InvokerResult: Schema.Struct<{
  readonly result: Schema.Unknown;
  readonly content_type: Schema.String;
  readonly content: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly type: Schema.Literals<readonly ["text", "image", "binary"]>;
    readonly mime_type: Schema.optional<Schema.String>;
    readonly data: Schema.String;
  }>>>;
  readonly upstream_status: Schema.optional<Schema.Number>;
  readonly duration_ms: Schema.optional<Schema.Number>;
  readonly status: Schema.optional<Schema.Number>;
}>;
type InvokerResult = typeof InvokerResult.Type;
declare const InvokerRuntimeConfig: Schema.Struct<{
  readonly base_url: Schema.optional<Schema.String>;
  readonly default_headers: Schema.optional<Schema.$Record<Schema.String, Schema.String>>;
  readonly encryption_key: Schema.optional<Schema.String>;
}>;
type InvokerRuntimeConfig = typeof InvokerRuntimeConfig.Type;
interface SourceDiscoverer {
  discover(namespace: string, config: MCPSourceConfig, auth_config: AuthConfig): Promise<DiscoveryResult>;
}
interface ToolInvoker {
  invoke(binding: ToolBinding, input: Record<string, unknown>, auth: ResolvedAuth, runtime: InvokerRuntimeConfig): Promise<InvokerResult>;
}
declare const McpOAuthDiscoveryResult: Schema.Struct<{
  readonly authorization_server: Schema.String;
  readonly authorization_endpoint: Schema.String;
  readonly token_endpoint: Schema.String;
  readonly registration_endpoint: Schema.NullOr<Schema.String>;
  readonly scopes_supported: Schema.$Array<Schema.String>;
  readonly has_dynamic_registration: Schema.Boolean;
}>;
type McpOAuthDiscoveryResult = typeof McpOAuthDiscoveryResult.Type;
declare const McpProbeResult: Schema.Struct<{
  readonly endpoint: Schema.String;
  readonly connected: Schema.Boolean;
  readonly requires_auth: Schema.Boolean;
  readonly tool_count: Schema.Number;
  readonly server_name: Schema.NullOr<Schema.String>;
  readonly oauth: Schema.NullOr<Schema.Struct<{
    readonly authorization_server: Schema.String;
    readonly authorization_endpoint: Schema.String;
    readonly token_endpoint: Schema.String;
    readonly registration_endpoint: Schema.NullOr<Schema.String>;
    readonly scopes_supported: Schema.$Array<Schema.String>;
    readonly has_dynamic_registration: Schema.Boolean;
  }>>;
}>;
type McpProbeResult = typeof McpProbeResult.Type;
declare const PLUGIN_CATEGORY_LABELS: Record<string, string>;
//#endregion
export { AWAITING_OAUTH_SOURCE_STATUSES, AddSourceBody, AddSourceResult, AddToolBody, AddToolResult, ApiAuthConfig, ApiGraphqlBinding, ApiRequestBinding, ApiSourceConfig, AuthConfig, AuthTemplate, CliArgTemplateFlag, CliArgTemplateInput, CliArgTemplateLiteral, CliArgTemplateOption, CliArgTemplatePart, CliCommandBinding, CliCwdPolicy, CliLauncher, CliSandResultDefaults, CliSourceConfig, ComposioStaticAuthConfig, ComposioStaticAuthScheme, CredentialCreateBody, CredentialCreateResult, CredentialDeleteResult, CredentialIdBody, CredentialKind, CredentialListItem, CredentialUpsertBody, CredentialUpsertResult, CredentialsListBody, CredentialsListResult, CustomMcpAddConfig, DiscoveryResult, DiscoverySourceMetadata, ExecuteResult, ExecuteResultContent, ExecuteResultJsonContent, ExecuteResultSkillBundleContent, ExecuteResultTextContent, ExecuteSkillBundle, ExecuteSkillBundleFile, ExtractedTool, InvokeResult, InvokeResultContent, InvokeToolBody, InvokerResult, InvokerRuntimeConfig, LifecycleDetectInput, LifecycleDetectResult, LifecycleInstallInput, LifecycleRefreshInput, LifecycleRegistryEntry, LifecycleRemoveInput, LifecycleSourceResult, MCPPromptBinding, MCPResourceReadBinding, MCPResourceTemplateBinding, MCPSourceConfig, MCPToolBinding, McpAnnotations, McpIcon, McpOAuthClientConfig, McpOAuthDiscovery, McpOAuthDiscoveryResult, McpProbeBody, McpProbeResult, McpServerInfo, MetaSearchBody, OAuthCallbackUrlResult, OAuthConfigureBody, OAuthConfigureResult, OAuthDisconnectResult, OAuthFlowStatusBody, OAuthFlowStatusResult, OAuthReconnectBody, OAuthSetupHints, OAuthSetupHintsBody, OAuthSetupHintsRegisterUrlSource, OAuthStartResult, PLUGIN_CATEGORY_LABELS, PersistedAuthConfig, PersistedAuthConfigJson, PluginCredential, PluginInstallJob, PluginInstallJobGetBody, PluginInstallJobListBody, PluginInstallJobListResult, PluginInstallJobStatus, PluginLifecycle, PluginLifecycleShape, PluginSource, PluginSourceCreator, PluginSourceDisplayStatus, PluginSourceDomainAction, PluginSourceDomainView, PluginSourceGroupHealth, PluginSourceToolCallabilityInput, PluginTool, RefreshSourceBody, RefreshSourceResult, RegistryInstallBody, RegistryInstallJobResult, RegistryInstallResult, RegistryInstallSourceResult, RegistryListBody, RemoveSourceResult, ResolvedAuth, SOURCE_STATUSES, SourceAbandonResult, SourceAuthTestBody, SourceAuthTestRedactedRequest, SourceAuthTestResult, SourceCleanupStaleResult, SourceConfig, SourceConfigJson, SourceDiscoverer, SourceIdBody, SourceKind, SourceLink, SourceListBody, SourceListResult, SourceStatus, SourceSummary, SourceVerification, SourceVerificationGetBody, SourceVerificationGetResult, SourceVerificationProbeBody, SourceVerificationProbeResult, SourceVerificationSetBody, SourceVerificationSetResult, SourceVerificationStatus, SourceVerificationSummary, SourceVisibility, SourceVisibilitySetBody, SubmitSourceRequestBody, SubmitSourceRequestResult, ToolBinding, ToolBindingJson, ToolDescribeBody, ToolDescribeResponse, ToolIdBody, ToolIdsBody, ToolInvoker, ToolSchemaResponse, ToolSchemasResponse, ToolSearchKind, ToolSearchMode, ToolSearchResult, ToolSignatureHit, ToolsListBody, ToolsListResult, ToolsReindexBody, ToolsReindexResult, ToolsSearchBody, ToolsSearchResponse, WorkspaceOAuthClient, WorkspaceOAuthClientDeleteBody, WorkspaceOAuthClientDeleteResult, WorkspaceOAuthClientListBody, WorkspaceOAuthClientListResult, WorkspaceOAuthClientSetBody, WorkspaceOAuthClientSetResult, comparePluginSourcesForDisplay, displayPluginSourceStatus, effectivePluginSourceStatus, isPluginSourceAwaitingOauth, isPluginSourceRunnable, isPluginSourceToolCallable, pluginSourceDomainView, pluginSourceNextAction, pluginToolNamespaceSummary, registryAgentSkillSlug, selectRepresentativePluginSource, summarizePluginSourceGroupHealth };
//# sourceMappingURL=base.d.mts.map