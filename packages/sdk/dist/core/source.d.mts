import { Schema } from "effect";

//#region ../core-effect/src/catalog.d.ts
interface CatalogAvailabilityRules {
  readonly manual_oauth_setup_slugs: readonly string[];
  readonly client_secret_required_slugs: readonly string[];
  readonly global_client_enabled_slugs: readonly string[];
  readonly known_broken_slugs: readonly string[];
  readonly superseded_by_kind: Readonly<Record<string, string>>;
  readonly install_verification_pending_slugs: readonly string[];
}
//#endregion
//#region ../core-effect/src/scalars.d.ts
declare const WorkspaceId: Schema.String;
type WorkspaceId = typeof WorkspaceId.Type;
declare const SourceId: Schema.NonEmptyString;
type SourceId = typeof SourceId.Type;
declare const CatalogSlug: Schema.String;
type CatalogSlug = typeof CatalogSlug.Type;
declare const AdapterId: Schema.String;
type AdapterId = typeof AdapterId.Type;
//#endregion
//#region ../core-effect/src/source.d.ts
declare const SourceKind: Schema.Literals<readonly ["mcp", "cli", "api"]>;
type SourceKind = typeof SourceKind.Type;
declare const SourceAuthMode: Schema.Literals<readonly ["none", "bearer", "api_key", "oauth2"]>;
type SourceAuthMode = typeof SourceAuthMode.Type;
declare const AuthKind: Schema.Literals<readonly ["none", "static_secret", "native_oauth", "global_confidential_oauth", "manual_client_oauth", "managed_account"]>;
type AuthKind = typeof AuthKind.Type;
declare const InstallFlow: Schema.Literals<readonly ["direct", "discover", "discover_then_auth", "manual_credentials", "managed_provider", "queued_import"]>;
type InstallFlow = typeof InstallFlow.Type;
declare const CredentialSlotKind: Schema.Literals<readonly ["oauth_token", "api_key", "client_id", "client_secret", "managed_account", "webhook_secret", "env_secret"]>;
type CredentialSlotKind = typeof CredentialSlotKind.Type;
declare const CredentialSlotScope: Schema.Literals<readonly ["workspace", "caller", "source", "machine"]>;
type CredentialSlotScope = typeof CredentialSlotScope.Type;
declare const CredentialSlot: Schema.Struct<{
  readonly slot: Schema.NonEmptyString;
  readonly kind: Schema.Literals<readonly ["oauth_token", "api_key", "client_id", "client_secret", "managed_account", "webhook_secret", "env_secret"]>;
  readonly label: Schema.NonEmptyString;
  readonly optional: Schema.optional<Schema.Boolean>;
  readonly scope: Schema.optional<Schema.Literals<readonly ["workspace", "caller", "source", "machine"]>>;
}>;
type CredentialSlot = typeof CredentialSlot.Type;
declare const CredentialBindingValue: Schema.Union<readonly [Schema.Struct<{
  readonly kind: Schema.Literal<"secret">;
  readonly secret_id: Schema.NonEmptyString;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"connection">;
  readonly connection_id: Schema.NonEmptyString;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"managed_account">;
  readonly account_id: Schema.NonEmptyString;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"env">;
  readonly env: Schema.String;
}>]>;
type CredentialBindingValue = typeof CredentialBindingValue.Type;
declare const CredentialBinding: Schema.Struct<{
  readonly workspace_id: Schema.NonEmptyString;
  readonly source_id: Schema.NonEmptyString;
  readonly slot: Schema.NonEmptyString;
  readonly scope: Schema.Literals<readonly ["workspace", "caller", "source", "machine"]>;
  readonly principal_id: Schema.optional<Schema.NonEmptyString>;
  readonly value: Schema.Union<readonly [Schema.Struct<{
    readonly kind: Schema.Literal<"secret">;
    readonly secret_id: Schema.NonEmptyString;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"connection">;
    readonly connection_id: Schema.NonEmptyString;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"managed_account">;
    readonly account_id: Schema.NonEmptyString;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"env">;
    readonly env: Schema.String;
  }>]>;
  readonly status: Schema.Literals<readonly ["active", "missing", "invalid", "reconnect_required"]>;
}>;
type CredentialBinding = typeof CredentialBinding.Type;
declare const SOURCE_STATUSES: readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"];
declare const SourceStatus: Schema.Literals<readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"]>;
type SourceStatus = typeof SourceStatus.Type;
declare const SourceVisibility: Schema.Literals<readonly ["personal", "workspace"]>;
type SourceVisibility = typeof SourceVisibility.Type;
declare const SourceVerificationStatus: Schema.Literals<readonly ["pending", "verified", "failed"]>;
type SourceVerificationStatus = typeof SourceVerificationStatus.Type;
declare const SourceIdentity: Schema.Struct<{
  readonly slug: Schema.String;
  readonly kind: Schema.Literals<readonly ["mcp", "cli", "api"]>;
  readonly default_namespace: Schema.String;
  readonly display_name: Schema.NonEmptyString;
}>;
type SourceIdentity = typeof SourceIdentity.Type;
declare const TOOL_BINDING_KINDS: readonly ["mcp", "mcp_prompt", "mcp_resource_read", "mcp_resource_template", "cli_command", "api_request", "api_graphql"];
declare const ToolBindingKind: Schema.Literals<readonly ["mcp", "mcp_prompt", "mcp_resource_read", "mcp_resource_template", "cli_command", "api_request", "api_graphql"]>;
type ToolBindingKind = typeof ToolBindingKind.Type;
declare const SourceRuntimeTransport: Schema.Literals<readonly ["mcp_http", "mcp_sse", "cli", "api_http", "api_graphql"]>;
type SourceRuntimeTransport = typeof SourceRuntimeTransport.Type;
declare const SourceAvailabilityCode: Schema.Literals<readonly ["sse_only", "manual_oauth_setup", "requires_client_secret", "install_verification_pending", "known_broken", "superseded_by_kind"]>;
type SourceAvailabilityCode = typeof SourceAvailabilityCode.Type;
declare const SourceExposure: Schema.Struct<{
  readonly status: Schema.Literals<readonly ["active", "coming_soon"]>;
  readonly selectable: Schema.Boolean;
  readonly hidden_in_onboarding: Schema.Boolean;
  readonly label: Schema.optional<Schema.String>;
  readonly reason: Schema.optional<Schema.String>;
  readonly code: Schema.optional<Schema.Literals<readonly ["sse_only", "manual_oauth_setup", "requires_client_secret", "install_verification_pending", "known_broken", "superseded_by_kind"]>>;
  readonly superseded_by: Schema.optional<Schema.String>;
}>;
type SourceExposure = typeof SourceExposure.Type;
declare const SourcePolicyDiagnostic: Schema.Struct<{
  readonly phase: Schema.Literals<readonly ["catalog", "curation", "deploy", "workspace", "runtime"]>;
  readonly modifier_id: Schema.NonEmptyString;
  readonly message: Schema.String;
}>;
type SourcePolicyDiagnostic = typeof SourcePolicyDiagnostic.Type;
declare const SourcePolicy: Schema.Struct<{
  readonly identity: Schema.Struct<{
    readonly slug: Schema.String;
    readonly kind: Schema.Literals<readonly ["mcp", "cli", "api"]>;
    readonly default_namespace: Schema.String;
    readonly display_name: Schema.NonEmptyString;
  }>;
  readonly exposure: Schema.Struct<{
    readonly status: Schema.Literals<readonly ["active", "coming_soon"]>;
    readonly selectable: Schema.Boolean;
    readonly hidden_in_onboarding: Schema.Boolean;
    readonly label: Schema.optional<Schema.String>;
    readonly reason: Schema.optional<Schema.String>;
    readonly code: Schema.optional<Schema.Literals<readonly ["sse_only", "manual_oauth_setup", "requires_client_secret", "install_verification_pending", "known_broken", "superseded_by_kind"]>>;
    readonly superseded_by: Schema.optional<Schema.String>;
  }>;
  readonly setup: Schema.Struct<{
    readonly install_flow: Schema.Literals<readonly ["direct", "discover", "discover_then_auth", "manual_credentials", "managed_provider", "queued_import"]>;
    readonly auth_kind: Schema.Literals<readonly ["none", "static_secret", "native_oauth", "global_confidential_oauth", "manual_client_oauth", "managed_account"]>;
    readonly credential_slots: Schema.$Array<Schema.Struct<{
      readonly slot: Schema.NonEmptyString;
      readonly kind: Schema.Literals<readonly ["oauth_token", "api_key", "client_id", "client_secret", "managed_account", "webhook_secret", "env_secret"]>;
      readonly label: Schema.NonEmptyString;
      readonly optional: Schema.optional<Schema.Boolean>;
      readonly scope: Schema.optional<Schema.Literals<readonly ["workspace", "caller", "source", "machine"]>>;
    }>>;
  }>;
  readonly runtime: Schema.Struct<{
    readonly transport: Schema.Literals<readonly ["mcp_http", "mcp_sse", "cli", "api_http", "api_graphql"]>;
    readonly tool_binding_kinds: Schema.$Array<Schema.Literals<readonly ["mcp", "mcp_prompt", "mcp_resource_read", "mcp_resource_template", "cli_command", "api_request", "api_graphql"]>>;
  }>;
  readonly agent: Schema.Struct<{
    readonly capabilities: Schema.$Array<Schema.String>;
  }>;
  readonly adapters: Schema.$Record<Schema.String, Schema.String>;
  readonly diagnostics: Schema.$Array<Schema.Struct<{
    readonly phase: Schema.Literals<readonly ["catalog", "curation", "deploy", "workspace", "runtime"]>;
    readonly modifier_id: Schema.NonEmptyString;
    readonly message: Schema.String;
  }>>;
}>;
type SourcePolicy = typeof SourcePolicy.Type;
interface SourcePolicyContext {
  readonly catalog?: {
    readonly availabilityRules?: CatalogAvailabilityRules | undefined;
  } | undefined;
  readonly deploy?: {
    readonly configuredGlobalOAuthClientSlugs?: ReadonlySet<string> | undefined;
  } | undefined;
  readonly workspace?: Record<string, never> | undefined;
  readonly runtime?: Record<string, never> | undefined;
}
declare const OAuthDiscovery: Schema.Struct<{
  readonly authorization_server: Schema.String;
  readonly authorization_endpoint: Schema.String;
  readonly token_endpoint: Schema.String;
  readonly registration_endpoint: Schema.optional<Schema.String>;
  readonly scopes_supported: Schema.$Array<Schema.String>;
  readonly has_dynamic_registration: Schema.Boolean;
  readonly service_documentation: Schema.optional<Schema.String>;
  readonly op_policy_uri: Schema.optional<Schema.String>;
  readonly op_tos_uri: Schema.optional<Schema.String>;
  readonly token_endpoint_auth_methods_supported: Schema.optional<Schema.$Array<Schema.String>>;
  readonly resource: Schema.optional<Schema.String>;
  readonly resource_documentation: Schema.optional<Schema.String>;
  readonly revocation_endpoint: Schema.optional<Schema.String>;
}>;
type OAuthDiscovery = typeof OAuthDiscovery.Type;
declare const OAuthClientConfig: Schema.Struct<{
  readonly client_id: Schema.optional<Schema.String>;
  readonly client_secret: Schema.optional<Schema.String>;
  readonly redirect_uri: Schema.optional<Schema.String>;
  readonly scope: Schema.optional<Schema.String>;
}>;
type OAuthClientConfig = typeof OAuthClientConfig.Type;
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
declare const McpSourceConfig: Schema.Struct<{
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
    readonly has_dynamic_registration: Schema.Boolean;
    readonly service_documentation: Schema.optional<Schema.String>;
    readonly op_policy_uri: Schema.optional<Schema.String>;
    readonly op_tos_uri: Schema.optional<Schema.String>;
    readonly token_endpoint_auth_methods_supported: Schema.optional<Schema.$Array<Schema.String>>;
    readonly resource: Schema.optional<Schema.String>;
    readonly resource_documentation: Schema.optional<Schema.String>;
    readonly revocation_endpoint: Schema.optional<Schema.String>;
  }>>;
  readonly oauth_client_config: Schema.optional<Schema.Struct<{
    readonly client_id: Schema.optional<Schema.String>;
    readonly client_secret: Schema.optional<Schema.String>;
    readonly redirect_uri: Schema.optional<Schema.String>;
    readonly scope: Schema.optional<Schema.String>;
  }>>;
  readonly default_headers: Schema.optional<Schema.$Record<Schema.String, Schema.String>>;
}>;
type McpSourceConfig = typeof McpSourceConfig.Type;
declare const CliSourceConfig: Schema.Struct<{
  readonly kind: Schema.Literal<"cli">;
  readonly namespace: Schema.String;
  readonly launcher: Schema.Literals<readonly ["binary", "npx", "uvx", "bunx"]>;
  readonly command: Schema.NonEmptyString;
  readonly args: Schema.optional<Schema.$Array<Schema.String>>;
  readonly required_secrets: Schema.optional<Schema.$Array<Schema.String>>;
}>;
type CliSourceConfig = typeof CliSourceConfig.Type;
declare const ApiSourceConfig: Schema.Struct<{
  readonly kind: Schema.Literal<"api">;
  readonly namespace: Schema.String;
  readonly base_url: Schema.NonEmptyString;
  readonly auth_mode: Schema.optional<Schema.Literals<readonly ["none", "bearer", "api_key", "oauth2"]>>;
  readonly required_secrets: Schema.optional<Schema.$Array<Schema.String>>;
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
    readonly has_dynamic_registration: Schema.Boolean;
    readonly service_documentation: Schema.optional<Schema.String>;
    readonly op_policy_uri: Schema.optional<Schema.String>;
    readonly op_tos_uri: Schema.optional<Schema.String>;
    readonly token_endpoint_auth_methods_supported: Schema.optional<Schema.$Array<Schema.String>>;
    readonly resource: Schema.optional<Schema.String>;
    readonly resource_documentation: Schema.optional<Schema.String>;
    readonly revocation_endpoint: Schema.optional<Schema.String>;
  }>>;
  readonly oauth_client_config: Schema.optional<Schema.Struct<{
    readonly client_id: Schema.optional<Schema.String>;
    readonly client_secret: Schema.optional<Schema.String>;
    readonly redirect_uri: Schema.optional<Schema.String>;
    readonly scope: Schema.optional<Schema.String>;
  }>>;
  readonly default_headers: Schema.optional<Schema.$Record<Schema.String, Schema.String>>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"cli">;
  readonly namespace: Schema.String;
  readonly launcher: Schema.Literals<readonly ["binary", "npx", "uvx", "bunx"]>;
  readonly command: Schema.NonEmptyString;
  readonly args: Schema.optional<Schema.$Array<Schema.String>>;
  readonly required_secrets: Schema.optional<Schema.$Array<Schema.String>>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"api">;
  readonly namespace: Schema.String;
  readonly base_url: Schema.NonEmptyString;
  readonly auth_mode: Schema.optional<Schema.Literals<readonly ["none", "bearer", "api_key", "oauth2"]>>;
  readonly required_secrets: Schema.optional<Schema.$Array<Schema.String>>;
}>]>;
type SourceConfig = typeof SourceConfig.Type;
declare const Source: Schema.Struct<{
  readonly id: Schema.NonEmptyString;
  readonly workspace_id: Schema.String;
  readonly namespace: Schema.String;
  readonly slug: Schema.optional<Schema.String>;
  readonly kind: Schema.Literals<readonly ["mcp", "cli", "api"]>;
  readonly status: Schema.Literals<readonly ["pending", "discovering", "ready", "needs_credentials", "credentials_error", "mcp_disconnected", "spec_error", "refreshing", "requires_oauth", "reconnect_required", "no_tools", "verification_required", "verification_failed"]>;
  readonly config: Schema.Union<readonly [Schema.Struct<{
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
      readonly has_dynamic_registration: Schema.Boolean;
      readonly service_documentation: Schema.optional<Schema.String>;
      readonly op_policy_uri: Schema.optional<Schema.String>;
      readonly op_tos_uri: Schema.optional<Schema.String>;
      readonly token_endpoint_auth_methods_supported: Schema.optional<Schema.$Array<Schema.String>>;
      readonly resource: Schema.optional<Schema.String>;
      readonly resource_documentation: Schema.optional<Schema.String>;
      readonly revocation_endpoint: Schema.optional<Schema.String>;
    }>>;
    readonly oauth_client_config: Schema.optional<Schema.Struct<{
      readonly client_id: Schema.optional<Schema.String>;
      readonly client_secret: Schema.optional<Schema.String>;
      readonly redirect_uri: Schema.optional<Schema.String>;
      readonly scope: Schema.optional<Schema.String>;
    }>>;
    readonly default_headers: Schema.optional<Schema.$Record<Schema.String, Schema.String>>;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"cli">;
    readonly namespace: Schema.String;
    readonly launcher: Schema.Literals<readonly ["binary", "npx", "uvx", "bunx"]>;
    readonly command: Schema.NonEmptyString;
    readonly args: Schema.optional<Schema.$Array<Schema.String>>;
    readonly required_secrets: Schema.optional<Schema.$Array<Schema.String>>;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"api">;
    readonly namespace: Schema.String;
    readonly base_url: Schema.NonEmptyString;
    readonly auth_mode: Schema.optional<Schema.Literals<readonly ["none", "bearer", "api_key", "oauth2"]>>;
    readonly required_secrets: Schema.optional<Schema.$Array<Schema.String>>;
  }>]>;
  readonly created_at: Schema.String;
  readonly updated_at: Schema.String;
}>;
type Source = typeof Source.Type;
//#endregion
export { AdapterId, ApiAuthConfig, ApiSourceConfig, AuthKind, CatalogSlug, CliSourceConfig, CredentialBinding, CredentialBindingValue, CredentialSlot, CredentialSlotKind, CredentialSlotScope, InstallFlow, McpSourceConfig, OAuthClientConfig, OAuthDiscovery, SOURCE_STATUSES, Source, SourceAuthMode, SourceAvailabilityCode, SourceConfig, SourceExposure, SourceId, SourceIdentity, SourceKind, SourcePolicy, SourcePolicyContext, SourcePolicyDiagnostic, SourceRuntimeTransport, SourceStatus, SourceVerificationStatus, SourceVisibility, TOOL_BINDING_KINDS, ToolBindingKind, WorkspaceId };
//# sourceMappingURL=source.d.mts.map