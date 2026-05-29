import { Context, Effect, Layer } from "effect";

//#region src/generated/harbor.d.ts
type JsonValue = null | boolean | number | string | JsonValue[] | {
  readonly [key: string]: JsonValue;
};
type TriggerKind = 'schedule.cron' | 'schedule.once' | 'webhook.http';
type TriggerStatus = 'draft' | 'active' | 'paused' | 'disabled' | 'failed';
type TriggerDeliveryStatus = 'queued' | 'claimed' | 'running' | 'completed' | 'failed' | 'skipped' | 'cancelled' | 'dead_lettered';
interface TriggerLimits {
  readonly max_active_triggers?: number | undefined;
  readonly max_active_schedules?: number | undefined;
  readonly max_due_per_tick?: number | undefined;
  readonly max_concurrent_deliveries?: number | undefined;
  readonly max_concurrent_cron_deliveries?: number | undefined;
  readonly max_concurrent_webhook_deliveries?: number | undefined;
  readonly min_cron_interval_seconds?: number | undefined;
  readonly max_event_bytes?: number | undefined;
}
interface TriggerInspectBody {
  readonly workspace_id: string;
  readonly kind?: TriggerKind | undefined;
  readonly source?: unknown;
  readonly config?: unknown;
  readonly target?: unknown;
  readonly input_mapping?: unknown;
  readonly limits?: TriggerLimits | undefined;
  readonly activation?: unknown;
  readonly [key: string]: unknown;
}
interface TriggerActivateBody {
  readonly workspace_id: string;
  readonly inspect_receipt_id: string;
  readonly name: string;
  readonly description?: string | undefined;
  readonly status?: 'active' | 'paused' | undefined;
}
interface TriggerPauseResumeBody {
  readonly workspace_id: string;
  readonly trigger_id: string;
}
interface TriggerReplayBody {
  readonly workspace_id: string;
  readonly delivery_id: string;
  readonly reason?: string | undefined;
}
interface TriggerListBody {
  readonly workspace_id: string;
  readonly status?: TriggerStatus | undefined;
  readonly kind?: TriggerKind | undefined;
  readonly limit?: number | undefined;
  readonly offset?: number | undefined;
}
interface TriggerGetBody {
  readonly workspace_id: string;
  readonly trigger_id: string;
}
interface TriggerDeliveriesListBody {
  readonly workspace_id: string;
  readonly trigger_id?: string | undefined;
  readonly status?: TriggerDeliveryStatus | undefined;
  readonly limit?: number | undefined;
  readonly offset?: number | undefined;
}
interface TriggerDeliveryGetBody {
  readonly workspace_id: string;
  readonly delivery_id: string;
}
interface TriggerLimitsGetBody {
  readonly workspace_id: string;
}
interface TriggerLimitsUpdateBody {
  readonly workspace_id: string;
  readonly limits: TriggerLimits;
}
interface TriggerRecord {
  readonly id: string;
  readonly workspace_id: string;
  readonly kind: TriggerKind;
  readonly status: TriggerStatus;
  readonly [key: string]: unknown;
}
interface TriggerDeliveryRecord {
  readonly id: string;
  readonly workspace_id: string;
  readonly trigger_id: string;
  readonly kind: TriggerKind;
  readonly status: TriggerDeliveryStatus;
  readonly source_delivery_id: string | null;
  readonly [key: string]: unknown;
}
interface TriggerInspectResponse {
  readonly ok: boolean;
  readonly receipt_id: string;
  readonly expires_at: string;
  readonly normalized?: unknown;
  readonly target?: unknown;
  readonly checks?: readonly unknown[] | undefined;
  readonly required_setup?: readonly unknown[] | undefined;
  readonly activation_body?: TriggerActivateBody | undefined;
  readonly errors?: readonly unknown[] | undefined;
  readonly [key: string]: unknown;
}
interface TriggerActivateResponse {
  readonly trigger: TriggerRecord;
}
interface TriggerListResponse {
  readonly triggers: readonly TriggerRecord[];
  readonly count: number;
}
interface TriggerGetResponse {
  readonly trigger: TriggerRecord;
}
interface TriggerStatusUpdateResponse {
  readonly trigger: TriggerRecord;
}
interface TriggerDeliveriesListResponse {
  readonly deliveries: readonly TriggerDeliveryRecord[];
  readonly count: number;
}
interface TriggerDeliveryGetResponse {
  readonly delivery: TriggerDeliveryRecord;
}
interface TriggerLimitsResponse {
  readonly workspace_id: string;
  readonly limits: TriggerLimits;
}
interface HealthResponse {
  readonly status: 'ok';
  readonly service: 'harbor-api';
  readonly environment: string;
}
interface HealthzResponse extends HealthResponse {
  readonly version?: string | null | undefined;
  readonly checks: {
    readonly db: 'ok' | 'error';
    readonly migrations: 'ok' | 'drift' | 'unknown';
  };
  readonly migrations: {
    readonly expected?: string | null | undefined;
    readonly latest_applied?: string | null | undefined;
    readonly latest_applied_at?: string | null | undefined;
    readonly applied_count?: number | undefined;
  };
  readonly db_ms: number;
  readonly total_ms: number;
  readonly timestamp: string;
  readonly error?: string | undefined;
}
interface WellKnownHarbor {
  readonly name: string;
  readonly id: string;
  readonly description: string;
  readonly endpoints: {
    readonly api: string;
    readonly web: string;
    readonly mcp: string;
    readonly apps: string;
  };
  readonly well_known: {
    readonly index: string;
    readonly harbor: string;
    readonly openapi: string;
    readonly mcp_protected_resource: string;
    readonly agent_skills: string;
    readonly ai_policy: string;
  };
}
interface WellKnownIndexEntry {
  readonly rel: string;
  readonly href: string;
  readonly type: string;
}
interface WellKnownIndex {
  readonly name: string;
  readonly entries: readonly WellKnownIndexEntry[];
}
interface Workspace {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly role: 'owner' | 'admin' | 'member' | 'viewer';
  readonly onboarded_at: string | null;
  readonly current_user_id?: string | undefined;
  readonly current_user_email?: string | undefined;
  readonly current_user_name?: string | null | undefined;
  readonly current_user_avatar?: string | null | undefined;
  readonly created_at?: string | undefined;
  readonly updated_at?: string | undefined;
}
interface WorkspaceDetail {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly created_by: string;
  readonly created_at: string;
  readonly updated_at: string;
}
interface ListWorkspacesRequest {
  readonly limit?: number | undefined;
  readonly offset?: number | undefined;
  readonly cursor?: string | undefined;
  readonly include_total?: boolean | undefined;
}
interface WorkspaceRequest {
  readonly workspace_id: string;
}
interface ListWorkspacesResult {
  readonly data: readonly Workspace[];
  readonly total?: number | null | undefined;
  readonly limit: number;
  readonly offset: number;
  readonly hasMore: boolean;
  readonly nextCursor?: string | null | undefined;
}
interface ExecuteSourceRef {
  readonly namespace: string;
}
interface ExecuteInput {
  readonly path: string;
  readonly content_type?: string | undefined;
  readonly size_bytes: number;
  readonly sha256: string;
  readonly data_base64: string;
}
interface ExecuteRequest {
  readonly workspace_id: string;
  readonly mode?: 'exec' | 'workflow' | undefined;
  readonly sources?: readonly ExecuteSourceRef[] | undefined;
  readonly code: string;
  readonly timeout_ms?: number | undefined;
  readonly run_id?: string | undefined;
  readonly sand_session_id?: string | undefined;
  readonly origin_cwd?: string | undefined;
  readonly execution_inputs?: readonly ExecuteInput[] | undefined;
}
interface ExecuteWarning {
  readonly namespace: string;
  readonly tool: string;
  readonly message: string;
}
interface ExecuteResultTextContent {
  readonly type: 'text';
  readonly mime_type?: string | undefined;
  readonly text: string;
}
interface ExecuteResultJsonContent {
  readonly type: 'json';
  readonly mime_type?: string | undefined;
  readonly json: JsonValue;
}
interface ExecuteSkillBundleFile {
  readonly relative_path: string;
  readonly content_base64: string;
  readonly content_hash: string;
}
interface ExecuteSkillBundle {
  readonly slug: string;
  readonly name?: string | undefined;
  readonly description?: string | undefined;
  readonly content: string;
  readonly content_hash: string;
  readonly source_commit?: string | undefined;
  readonly files?: readonly ExecuteSkillBundleFile[] | undefined;
}
interface ExecuteResultSkillBundleContent {
  readonly type: 'skill_bundle';
  readonly skill: ExecuteSkillBundle;
}
type ExecuteResultContent = ExecuteResultTextContent | ExecuteResultJsonContent | ExecuteResultSkillBundleContent;
interface ExecuteResult {
  readonly result: unknown;
  readonly error?: string | undefined;
  readonly logs?: unknown;
  readonly mode: 'dynamic_worker' | 'workflow';
  readonly content?: readonly ExecuteResultContent[] | undefined;
  readonly warnings?: readonly ExecuteWarning[] | undefined;
  readonly run_id: string;
  readonly workflow_instance_id?: string | undefined;
}
interface HarborRequestInit {
  readonly headers?: Record<string, string> | undefined;
  readonly signal?: AbortSignal | undefined;
}
type HarborBearerTokenProvider = () => string | Promise<string>;
interface HarborJsonRequest {
  readonly method?: 'GET' | 'POST';
  readonly path: string;
  readonly body?: unknown;
}
interface HarborGeneratedClient {
  readonly requestJson: <T = unknown>(request: HarborJsonRequest, init?: HarborRequestInit) => Promise<T>;
  readonly getHealth: (init?: HarborRequestInit) => Promise<HealthResponse>;
  readonly getV1Health: (init?: HarborRequestInit) => Promise<HealthResponse>;
  readonly getHealthz: (init?: HarborRequestInit) => Promise<HealthzResponse>;
  readonly getV1Healthz: (init?: HarborRequestInit) => Promise<HealthzResponse>;
  readonly getHarborWellKnown: (init?: HarborRequestInit) => Promise<WellKnownHarbor>;
  readonly getWellKnownIndex: (init?: HarborRequestInit) => Promise<WellKnownIndex>;
  readonly getHarborOpenApi: (init?: HarborRequestInit) => Promise<Record<string, unknown>>;
  readonly getOpenApiJson: (init?: HarborRequestInit) => Promise<Record<string, unknown>>;
  readonly listWorkspaces: (body: ListWorkspacesRequest, init?: HarborRequestInit) => Promise<ListWorkspacesResult>;
  readonly getWorkspace: (body: WorkspaceRequest, init?: HarborRequestInit) => Promise<WorkspaceDetail>;
  readonly executePlugin: (body: ExecuteRequest, init?: HarborRequestInit) => Promise<ExecuteResult>;
  readonly inspectTrigger: (body: TriggerInspectBody, init?: HarborRequestInit) => Promise<TriggerInspectResponse>;
  readonly activateTrigger: (body: TriggerActivateBody, init?: HarborRequestInit) => Promise<TriggerActivateResponse>;
  readonly listTriggers: (body: TriggerListBody, init?: HarborRequestInit) => Promise<TriggerListResponse>;
  readonly getTrigger: (body: TriggerGetBody, init?: HarborRequestInit) => Promise<TriggerGetResponse>;
  readonly pauseTrigger: (body: TriggerPauseResumeBody, init?: HarborRequestInit) => Promise<TriggerStatusUpdateResponse>;
  readonly resumeTrigger: (body: TriggerPauseResumeBody, init?: HarborRequestInit) => Promise<TriggerStatusUpdateResponse>;
  readonly disableTrigger: (body: TriggerPauseResumeBody, init?: HarborRequestInit) => Promise<TriggerStatusUpdateResponse>;
  readonly replayTriggerDelivery: (body: TriggerReplayBody, init?: HarborRequestInit) => Promise<TriggerDeliveryGetResponse>;
  readonly listTriggerDeliveries: (body: TriggerDeliveriesListBody, init?: HarborRequestInit) => Promise<TriggerDeliveriesListResponse>;
  readonly getTriggerDelivery: (body: TriggerDeliveryGetBody, init?: HarborRequestInit) => Promise<TriggerDeliveryGetResponse>;
  readonly getTriggerLimits: (body: TriggerLimitsGetBody, init?: HarborRequestInit) => Promise<TriggerLimitsResponse>;
  readonly updateTriggerLimits: (body: TriggerLimitsUpdateBody, init?: HarborRequestInit) => Promise<TriggerLimitsResponse>;
}
//#endregion
//#region src/telemetry.d.ts
type TelemetryMetadata = Readonly<Record<string, unknown>>;
type TelemetryRedactor = (value: unknown, key?: string | undefined) => unknown;
type MaybePromise<T> = T | Promise<T>;
interface TelemetryEvent {
  readonly name: string;
  readonly time?: string | undefined;
  readonly attributes?: TelemetryMetadata | undefined;
  readonly durationMs?: number | undefined;
}
interface TelemetryWarning {
  readonly code: string;
  readonly message: string;
  readonly attributes?: TelemetryMetadata | undefined;
}
interface TelemetrySpan {
  readonly name: string;
  readonly attributes?: TelemetryMetadata | undefined;
}
interface TelemetrySink {
  readonly event?: ((event: TelemetryEvent) => MaybePromise<void>) | undefined;
  readonly warning?: ((warning: TelemetryWarning) => MaybePromise<void>) | undefined;
}
interface TelemetryOptions {
  readonly sink?: TelemetrySink | undefined;
  readonly event?: ((event: TelemetryEvent) => MaybePromise<void>) | undefined;
  readonly warning?: ((warning: TelemetryWarning) => MaybePromise<void>) | undefined;
  readonly span?: (<A>(span: TelemetrySpan, operation: () => Promise<A>) => MaybePromise<A>) | undefined;
  readonly now?: (() => number) | undefined;
  readonly redact?: TelemetryRedactor | undefined;
}
//#endregion
//#region src/promise.d.ts
interface HarborBearerTokenAuth {
  readonly kind: 'bearer';
  readonly token: string;
  readonly tokenProvider?: undefined;
}
interface HarborBearerTokenProviderAuth {
  readonly kind: 'bearer';
  readonly token?: undefined;
  readonly tokenProvider: HarborBearerTokenProvider;
}
interface HarborApiKeyAuth {
  readonly kind: 'api_key';
  readonly key: string;
  readonly keyProvider?: undefined;
}
interface HarborApiKeyProviderAuth {
  readonly kind: 'api_key';
  readonly key?: undefined;
  readonly keyProvider: HarborBearerTokenProvider;
}
type HarborClientAuth = HarborBearerTokenAuth | HarborBearerTokenProviderAuth | HarborApiKeyAuth | HarborApiKeyProviderAuth;
interface HarborPromiseClientBaseOptions {
  readonly baseUrl: string;
  readonly headers?: Record<string, string> | undefined;
  readonly fetch?: typeof fetch | undefined;
  readonly telemetry?: TelemetryOptions | undefined;
}
type HarborPromiseClientOptions = (HarborPromiseClientBaseOptions & {
  readonly workspaceId: string;
  readonly auth: HarborApiKeyAuth | HarborApiKeyProviderAuth;
}) | (HarborPromiseClientBaseOptions & {
  readonly workspaceId?: string | undefined;
  readonly auth: HarborBearerTokenAuth | HarborBearerTokenProviderAuth;
});
type HarborRuntimeExecuteRequest = Omit<ExecuteRequest, 'workspace_id'> & {
  readonly workspace_id?: string | undefined;
};
interface HarborRuntimeClient$1 {
  readonly execute: (request: HarborRuntimeExecuteRequest, init?: HarborRequestInit) => Promise<ExecuteResult>;
}
type WithOptionalWorkspace<T extends {
  readonly workspace_id: string;
}> = Omit<T, 'workspace_id'> & {
  readonly workspace_id?: string | undefined;
};
type HarborWorkspaceGetRequest = WithOptionalWorkspace<WorkspaceRequest>;
interface HarborTriggersClient$1 {
  readonly inspect: (request: WithOptionalWorkspace<TriggerInspectBody>, init?: HarborRequestInit) => Promise<TriggerInspectResponse>;
  readonly activate: (request: WithOptionalWorkspace<TriggerActivateBody>, init?: HarborRequestInit) => Promise<TriggerActivateResponse>;
  readonly list: (request?: WithOptionalWorkspace<TriggerListBody>, init?: HarborRequestInit) => Promise<TriggerListResponse>;
  readonly get: (request: WithOptionalWorkspace<TriggerGetBody>, init?: HarborRequestInit) => Promise<TriggerGetResponse>;
  readonly pause: (request: WithOptionalWorkspace<TriggerPauseResumeBody>, init?: HarborRequestInit) => Promise<TriggerStatusUpdateResponse>;
  readonly resume: (request: WithOptionalWorkspace<TriggerPauseResumeBody>, init?: HarborRequestInit) => Promise<TriggerStatusUpdateResponse>;
  readonly disable: (request: WithOptionalWorkspace<TriggerPauseResumeBody>, init?: HarborRequestInit) => Promise<TriggerStatusUpdateResponse>;
  readonly replay: (request: WithOptionalWorkspace<TriggerReplayBody>, init?: HarborRequestInit) => Promise<TriggerDeliveryGetResponse>;
  readonly listDeliveries: (request?: WithOptionalWorkspace<TriggerDeliveriesListBody>, init?: HarborRequestInit) => Promise<TriggerDeliveriesListResponse>;
  readonly getDelivery: (request: WithOptionalWorkspace<TriggerDeliveryGetBody>, init?: HarborRequestInit) => Promise<TriggerDeliveryGetResponse>;
  readonly getLimits: (request?: WithOptionalWorkspace<TriggerLimitsGetBody>, init?: HarborRequestInit) => Promise<TriggerLimitsResponse>;
  readonly updateLimits: (request: WithOptionalWorkspace<TriggerLimitsUpdateBody>, init?: HarborRequestInit) => Promise<TriggerLimitsResponse>;
}
interface HarborWorkspacesClient$1 {
  readonly list: (request?: ListWorkspacesRequest, init?: HarborRequestInit) => Promise<ListWorkspacesResult>;
  readonly get: (request?: HarborWorkspaceGetRequest, init?: HarborRequestInit) => Promise<WorkspaceDetail>;
}
type HarborControlPlaneBody = Record<string, unknown> & {
  readonly workspace_id?: string | undefined;
};
type HarborControlPlaneResult = Record<string, unknown>;
type HarborControlPlaneCall$1 = <TBody extends HarborControlPlaneBody = HarborControlPlaneBody, TResult = HarborControlPlaneResult>(request?: TBody, init?: HarborRequestInit) => Promise<TResult>;
interface HarborSourcesClient$1 {
  readonly list: HarborControlPlaneCall$1;
  readonly get: HarborControlPlaneCall$1;
  readonly add: HarborControlPlaneCall$1;
  readonly refresh: HarborControlPlaneCall$1;
  readonly remove: HarborControlPlaneCall$1;
  readonly abandon: HarborControlPlaneCall$1;
  readonly cleanupStale: HarborControlPlaneCall$1;
  readonly probe: HarborControlPlaneCall$1;
  readonly authTest: HarborControlPlaneCall$1;
  readonly setVisibility: HarborControlPlaneCall$1;
  readonly verification: {
    readonly get: HarborControlPlaneCall$1;
    readonly probe: HarborControlPlaneCall$1;
    readonly set: HarborControlPlaneCall$1;
  };
}
interface HarborRegistryClient$1 {
  readonly list: HarborControlPlaneCall$1;
  readonly install: HarborControlPlaneCall$1;
}
interface HarborToolsClient$1 {
  readonly list: HarborControlPlaneCall$1;
  readonly search: HarborControlPlaneCall$1;
  readonly describe: HarborControlPlaneCall$1;
  readonly schema: HarborControlPlaneCall$1;
  readonly schemas: HarborControlPlaneCall$1;
  readonly reindex: HarborControlPlaneCall$1;
  readonly add: HarborControlPlaneCall$1;
}
interface HarborCredentialsClient$1 {
  readonly create: HarborControlPlaneCall$1;
  readonly upsert: HarborControlPlaneCall$1;
  readonly delete: HarborControlPlaneCall$1;
}
interface HarborPluginOAuthClient$1 {
  readonly start: HarborControlPlaneCall$1;
  readonly connect: HarborControlPlaneCall$1;
  readonly reconnect: HarborControlPlaneCall$1;
  readonly status: HarborControlPlaneCall$1;
  readonly disconnect: HarborControlPlaneCall$1;
  readonly configure: HarborControlPlaneCall$1;
  readonly workspaceClients: {
    readonly list: HarborControlPlaneCall$1;
    readonly set: HarborControlPlaneCall$1;
    readonly delete: HarborControlPlaneCall$1;
  };
}
interface HarborRunsClient$1 {
  readonly list: HarborControlPlaneCall$1;
  readonly get: HarborControlPlaneCall$1;
  readonly graph: HarborControlPlaneCall$1;
  readonly listArtifacts: HarborControlPlaneCall$1;
  readonly create: HarborControlPlaneCall$1;
  readonly complete: HarborControlPlaneCall$1;
  readonly cancel: HarborControlPlaneCall$1;
  readonly events: HarborControlPlaneCall$1;
}
interface HarborPoliciesClient$1 {
  readonly rules: {
    readonly list: HarborControlPlaneCall$1;
    readonly get: HarborControlPlaneCall$1;
    readonly create: HarborControlPlaneCall$1;
    readonly update: HarborControlPlaneCall$1;
    readonly delete: HarborControlPlaneCall$1;
  };
  readonly effective: HarborControlPlaneCall$1;
  readonly simulate: HarborControlPlaneCall$1;
  readonly sourceGate: HarborControlPlaneCall$1;
  readonly listAudit: HarborControlPlaneCall$1;
}
interface HarborAuditClient$1 {
  readonly list: HarborControlPlaneCall$1;
}
interface HarborOrbitJobsClient$1 {
  readonly list: HarborControlPlaneCall$1;
  readonly inspect: HarborControlPlaneCall$1;
  readonly publish: HarborControlPlaneCall$1;
  readonly run: HarborControlPlaneCall$1;
  readonly versions: HarborControlPlaneCall$1;
  readonly disable: HarborControlPlaneCall$1;
  readonly invocations: {
    readonly list: HarborControlPlaneCall$1;
    readonly get: HarborControlPlaneCall$1;
  };
}
interface HarborOrbitAppsClient$1 {
  readonly list: HarborControlPlaneCall$1;
  readonly inspect: HarborControlPlaneCall$1;
  readonly publish: HarborControlPlaneCall$1;
  readonly open: HarborControlPlaneCall$1;
  readonly disable: HarborControlPlaneCall$1;
  readonly updateAccess: HarborControlPlaneCall$1;
  readonly activity: {
    readonly list: HarborControlPlaneCall$1;
  };
  readonly invocations: {
    readonly list: HarborControlPlaneCall$1;
    readonly get: HarborControlPlaneCall$1;
  };
}
interface HarborWorkflowsClient$1 {
  readonly list: HarborControlPlaneCall$1;
  readonly get: HarborControlPlaneCall$1;
  readonly add: HarborControlPlaneCall$1;
  readonly remove: HarborControlPlaneCall$1;
}
interface HarborControlPlaneClients$1 {
  readonly sources: HarborSourcesClient$1;
  readonly registry: HarborRegistryClient$1;
  readonly tools: HarborToolsClient$1;
  readonly credentials: HarborCredentialsClient$1;
  readonly oauth: HarborPluginOAuthClient$1;
  readonly runs: HarborRunsClient$1;
  readonly policies: HarborPoliciesClient$1;
  readonly audit: HarborAuditClient$1;
  readonly jobs: HarborOrbitJobsClient$1;
  readonly apps: HarborOrbitAppsClient$1;
  readonly workflows: HarborWorkflowsClient$1;
}
interface HarborWorkspaceClient$1 {
  readonly id: string;
  readonly runtime: HarborRuntimeClient$1;
  readonly triggers: HarborTriggersClient$1;
  readonly sources: HarborSourcesClient$1;
  readonly registry: HarborRegistryClient$1;
  readonly tools: HarborToolsClient$1;
  readonly credentials: HarborCredentialsClient$1;
  readonly oauth: HarborPluginOAuthClient$1;
  readonly runs: HarborRunsClient$1;
  readonly policies: HarborPoliciesClient$1;
  readonly audit: HarborAuditClient$1;
  readonly jobs: HarborOrbitJobsClient$1;
  readonly apps: HarborOrbitAppsClient$1;
  readonly workflows: HarborWorkflowsClient$1;
}
interface HarborPromiseClient {
  readonly api: HarborGeneratedClient;
  readonly workspaces: HarborWorkspacesClient$1;
  readonly workspace: (workspaceId: string) => HarborWorkspaceClient$1;
  readonly runtime: HarborRuntimeClient$1;
  readonly triggers: HarborTriggersClient$1;
  readonly sources: HarborSourcesClient$1;
  readonly registry: HarborRegistryClient$1;
  readonly tools: HarborToolsClient$1;
  readonly credentials: HarborCredentialsClient$1;
  readonly oauth: HarborPluginOAuthClient$1;
  readonly runs: HarborRunsClient$1;
  readonly policies: HarborPoliciesClient$1;
  readonly audit: HarborAuditClient$1;
  readonly jobs: HarborOrbitJobsClient$1;
  readonly apps: HarborOrbitAppsClient$1;
  readonly workflows: HarborWorkflowsClient$1;
}
declare class HarborClientConfigurationError extends Error {
  readonly code: 'missing_workspace_id' | 'ambiguous_workspace_id';
  constructor(code: 'missing_workspace_id' | 'ambiguous_workspace_id', message: string);
}
declare class HarborWorkspaceResolutionError extends HarborClientConfigurationError {}
interface HarborOAuthAuthorizeUrlOptions {
  readonly authorizationServerUrl: string;
  readonly clientId: string;
  readonly redirectUri: string;
  readonly state: string;
  readonly codeChallenge: string;
  readonly scope?: readonly string[] | string | undefined;
  readonly codeChallengeMethod?: 'S256' | 'plain' | undefined;
  readonly resource?: string | undefined;
  readonly organizationId?: string | undefined;
}
declare const createHarborOAuthAuthorizeUrl: (options: HarborOAuthAuthorizeUrlOptions) => URL;
//#endregion
//#region src/effect.d.ts
type HarborEffectClientOptions = HarborPromiseClientOptions;
type HarborClientOptions = HarborEffectClientOptions;
type EffectError = unknown;
type Effectify<T> = T extends ((...args: infer Args) => Promise<infer Result>) ? (...args: Args) => Effect.Effect<Result, EffectError> : T extends ((...args: infer Args) => infer Result) ? (...args: Args) => Effectify<Result> : T extends object ? { readonly [Key in keyof T]: Effectify<T[Key]> } : T;
type HarborRuntimeClient = Effectify<HarborRuntimeClient$1>;
type HarborWorkspacesClient = Effectify<HarborWorkspacesClient$1>;
type HarborWorkspaceClient = Effectify<HarborWorkspaceClient$1>;
type HarborControlPlaneCall = Effectify<HarborControlPlaneCall$1>;
type HarborSourcesClient = Effectify<HarborSourcesClient$1>;
type HarborRegistryClient = Effectify<HarborRegistryClient$1>;
type HarborToolsClient = Effectify<HarborToolsClient$1>;
type HarborCredentialsClient = Effectify<HarborCredentialsClient$1>;
type HarborPluginOAuthClient = Effectify<HarborPluginOAuthClient$1>;
type HarborRunsClient = Effectify<HarborPromiseClient['runs']>;
type HarborPoliciesClient = Effectify<HarborPoliciesClient$1>;
type HarborAuditClient = Effectify<HarborAuditClient$1>;
type HarborOrbitJobsClient = Effectify<HarborOrbitJobsClient$1>;
type HarborOrbitAppsClient = Effectify<HarborOrbitAppsClient$1>;
type HarborWorkflowsClient = Effectify<HarborWorkflowsClient$1>;
type HarborTriggersClient = Effectify<HarborTriggersClient$1>;
type HarborControlPlaneClients = Effectify<HarborControlPlaneClients$1>;
type HarborEffectClient = Effectify<HarborPromiseClient>;
type HarborClient = HarborEffectClient;
declare const createHarborEffectClient: (options: HarborEffectClientOptions) => HarborEffectClient;
declare const HarborClient: Context.Service<{
  readonly api: {
    readonly requestJson: (request: HarborJsonRequest, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly getHealth: (init?: HarborRequestInit | undefined) => Effect.Effect<HealthResponse, unknown, never>;
    readonly getV1Health: (init?: HarborRequestInit | undefined) => Effect.Effect<HealthResponse, unknown, never>;
    readonly getHealthz: (init?: HarborRequestInit | undefined) => Effect.Effect<HealthzResponse, unknown, never>;
    readonly getV1Healthz: (init?: HarborRequestInit | undefined) => Effect.Effect<HealthzResponse, unknown, never>;
    readonly getHarborWellKnown: (init?: HarborRequestInit | undefined) => Effect.Effect<WellKnownHarbor, unknown, never>;
    readonly getWellKnownIndex: (init?: HarborRequestInit | undefined) => Effect.Effect<WellKnownIndex, unknown, never>;
    readonly getHarborOpenApi: (init?: HarborRequestInit | undefined) => Effect.Effect<Record<string, unknown>, unknown, never>;
    readonly getOpenApiJson: (init?: HarborRequestInit | undefined) => Effect.Effect<Record<string, unknown>, unknown, never>;
    readonly listWorkspaces: (body: ListWorkspacesRequest, init?: HarborRequestInit | undefined) => Effect.Effect<ListWorkspacesResult, unknown, never>;
    readonly getWorkspace: (body: WorkspaceRequest, init?: HarborRequestInit | undefined) => Effect.Effect<WorkspaceDetail, unknown, never>;
    readonly executePlugin: (body: ExecuteRequest, init?: HarborRequestInit | undefined) => Effect.Effect<ExecuteResult, unknown, never>;
    readonly inspectTrigger: (body: TriggerInspectBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerInspectResponse, unknown, never>;
    readonly activateTrigger: (body: TriggerActivateBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerActivateResponse, unknown, never>;
    readonly listTriggers: (body: TriggerListBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerListResponse, unknown, never>;
    readonly getTrigger: (body: TriggerGetBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerGetResponse, unknown, never>;
    readonly pauseTrigger: (body: TriggerPauseResumeBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerStatusUpdateResponse, unknown, never>;
    readonly resumeTrigger: (body: TriggerPauseResumeBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerStatusUpdateResponse, unknown, never>;
    readonly disableTrigger: (body: TriggerPauseResumeBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerStatusUpdateResponse, unknown, never>;
    readonly replayTriggerDelivery: (body: TriggerReplayBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerDeliveryGetResponse, unknown, never>;
    readonly listTriggerDeliveries: (body: TriggerDeliveriesListBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerDeliveriesListResponse, unknown, never>;
    readonly getTriggerDelivery: (body: TriggerDeliveryGetBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerDeliveryGetResponse, unknown, never>;
    readonly getTriggerLimits: (body: TriggerLimitsGetBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerLimitsResponse, unknown, never>;
    readonly updateTriggerLimits: (body: TriggerLimitsUpdateBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerLimitsResponse, unknown, never>;
  };
  readonly workspaces: {
    readonly list: (request?: ListWorkspacesRequest | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<ListWorkspacesResult, unknown, never>;
    readonly get: (request?: HarborWorkspaceGetRequest | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<WorkspaceDetail, unknown, never>;
  };
  readonly workspace: (workspaceId: string) => {
    readonly id: string;
    readonly runtime: {
      readonly execute: (request: HarborRuntimeExecuteRequest, init?: HarborRequestInit | undefined) => Effect.Effect<ExecuteResult, unknown, never>;
    };
    readonly triggers: {
      readonly inspect: (request: Omit<TriggerInspectBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerInspectResponse, unknown, never>;
      readonly activate: (request: Omit<TriggerActivateBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerActivateResponse, unknown, never>;
      readonly list: (request?: (Omit<TriggerListBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }) | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerListResponse, unknown, never>;
      readonly get: (request: Omit<TriggerGetBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerGetResponse, unknown, never>;
      readonly pause: (request: Omit<TriggerPauseResumeBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerStatusUpdateResponse, unknown, never>;
      readonly resume: (request: Omit<TriggerPauseResumeBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerStatusUpdateResponse, unknown, never>;
      readonly disable: (request: Omit<TriggerPauseResumeBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerStatusUpdateResponse, unknown, never>;
      readonly replay: (request: Omit<TriggerReplayBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerDeliveryGetResponse, unknown, never>;
      readonly listDeliveries: (request?: (Omit<TriggerDeliveriesListBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }) | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerDeliveriesListResponse, unknown, never>;
      readonly getDelivery: (request: Omit<TriggerDeliveryGetBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerDeliveryGetResponse, unknown, never>;
      readonly getLimits: (request?: (Omit<TriggerLimitsGetBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }) | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerLimitsResponse, unknown, never>;
      readonly updateLimits: (request: Omit<TriggerLimitsUpdateBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerLimitsResponse, unknown, never>;
    };
    readonly sources: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly add: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly refresh: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly remove: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly abandon: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly cleanupStale: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly probe: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly authTest: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly setVisibility: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly verification: {
        readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly probe: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly set: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      };
    };
    readonly registry: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly install: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
    readonly tools: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly search: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly describe: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly schema: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly schemas: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly reindex: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly add: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
    readonly credentials: {
      readonly create: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly upsert: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly delete: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
    readonly oauth: {
      readonly start: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly connect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly reconnect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly status: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly disconnect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly configure: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly workspaceClients: {
        readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly set: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly delete: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      };
    };
    readonly runs: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly graph: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly listArtifacts: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly create: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly complete: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly cancel: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly events: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
    readonly policies: {
      readonly rules: {
        readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly create: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly update: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly delete: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      };
      readonly effective: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly simulate: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly sourceGate: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly listAudit: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
    readonly audit: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
    readonly jobs: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly inspect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly publish: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly run: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly versions: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly disable: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly invocations: {
        readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      };
    };
    readonly apps: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly inspect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly publish: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly open: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly disable: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly updateAccess: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly activity: {
        readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      };
      readonly invocations: {
        readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      };
    };
    readonly workflows: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly add: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly remove: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
  };
  readonly runtime: {
    readonly execute: (request: HarborRuntimeExecuteRequest, init?: HarborRequestInit | undefined) => Effect.Effect<ExecuteResult, unknown, never>;
  };
  readonly triggers: {
    readonly inspect: (request: Omit<TriggerInspectBody, "workspace_id"> & {
      readonly workspace_id?: string | undefined;
    }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerInspectResponse, unknown, never>;
    readonly activate: (request: Omit<TriggerActivateBody, "workspace_id"> & {
      readonly workspace_id?: string | undefined;
    }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerActivateResponse, unknown, never>;
    readonly list: (request?: (Omit<TriggerListBody, "workspace_id"> & {
      readonly workspace_id?: string | undefined;
    }) | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerListResponse, unknown, never>;
    readonly get: (request: Omit<TriggerGetBody, "workspace_id"> & {
      readonly workspace_id?: string | undefined;
    }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerGetResponse, unknown, never>;
    readonly pause: (request: Omit<TriggerPauseResumeBody, "workspace_id"> & {
      readonly workspace_id?: string | undefined;
    }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerStatusUpdateResponse, unknown, never>;
    readonly resume: (request: Omit<TriggerPauseResumeBody, "workspace_id"> & {
      readonly workspace_id?: string | undefined;
    }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerStatusUpdateResponse, unknown, never>;
    readonly disable: (request: Omit<TriggerPauseResumeBody, "workspace_id"> & {
      readonly workspace_id?: string | undefined;
    }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerStatusUpdateResponse, unknown, never>;
    readonly replay: (request: Omit<TriggerReplayBody, "workspace_id"> & {
      readonly workspace_id?: string | undefined;
    }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerDeliveryGetResponse, unknown, never>;
    readonly listDeliveries: (request?: (Omit<TriggerDeliveriesListBody, "workspace_id"> & {
      readonly workspace_id?: string | undefined;
    }) | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerDeliveriesListResponse, unknown, never>;
    readonly getDelivery: (request: Omit<TriggerDeliveryGetBody, "workspace_id"> & {
      readonly workspace_id?: string | undefined;
    }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerDeliveryGetResponse, unknown, never>;
    readonly getLimits: (request?: (Omit<TriggerLimitsGetBody, "workspace_id"> & {
      readonly workspace_id?: string | undefined;
    }) | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerLimitsResponse, unknown, never>;
    readonly updateLimits: (request: Omit<TriggerLimitsUpdateBody, "workspace_id"> & {
      readonly workspace_id?: string | undefined;
    }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerLimitsResponse, unknown, never>;
  };
  readonly sources: {
    readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly add: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly refresh: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly remove: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly abandon: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly cleanupStale: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly probe: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly authTest: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly setVisibility: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly verification: {
      readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly probe: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly set: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
  };
  readonly registry: {
    readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly install: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
  };
  readonly tools: {
    readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly search: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly describe: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly schema: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly schemas: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly reindex: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly add: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
  };
  readonly credentials: {
    readonly create: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly upsert: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly delete: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
  };
  readonly oauth: {
    readonly start: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly connect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly reconnect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly status: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly disconnect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly configure: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly workspaceClients: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly set: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly delete: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
  };
  readonly runs: {
    readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly graph: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly listArtifacts: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly create: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly complete: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly cancel: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly events: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
  };
  readonly policies: {
    readonly rules: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly create: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly update: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly delete: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
    readonly effective: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly simulate: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly sourceGate: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly listAudit: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
  };
  readonly audit: {
    readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
  };
  readonly jobs: {
    readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly inspect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly publish: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly run: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly versions: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly disable: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly invocations: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
  };
  readonly apps: {
    readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly inspect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly publish: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly open: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly disable: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly updateAccess: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly activity: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
    readonly invocations: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
  };
  readonly workflows: {
    readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly add: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly remove: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
  };
}, {
  readonly api: {
    readonly requestJson: (request: HarborJsonRequest, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly getHealth: (init?: HarborRequestInit | undefined) => Effect.Effect<HealthResponse, unknown, never>;
    readonly getV1Health: (init?: HarborRequestInit | undefined) => Effect.Effect<HealthResponse, unknown, never>;
    readonly getHealthz: (init?: HarborRequestInit | undefined) => Effect.Effect<HealthzResponse, unknown, never>;
    readonly getV1Healthz: (init?: HarborRequestInit | undefined) => Effect.Effect<HealthzResponse, unknown, never>;
    readonly getHarborWellKnown: (init?: HarborRequestInit | undefined) => Effect.Effect<WellKnownHarbor, unknown, never>;
    readonly getWellKnownIndex: (init?: HarborRequestInit | undefined) => Effect.Effect<WellKnownIndex, unknown, never>;
    readonly getHarborOpenApi: (init?: HarborRequestInit | undefined) => Effect.Effect<Record<string, unknown>, unknown, never>;
    readonly getOpenApiJson: (init?: HarborRequestInit | undefined) => Effect.Effect<Record<string, unknown>, unknown, never>;
    readonly listWorkspaces: (body: ListWorkspacesRequest, init?: HarborRequestInit | undefined) => Effect.Effect<ListWorkspacesResult, unknown, never>;
    readonly getWorkspace: (body: WorkspaceRequest, init?: HarborRequestInit | undefined) => Effect.Effect<WorkspaceDetail, unknown, never>;
    readonly executePlugin: (body: ExecuteRequest, init?: HarborRequestInit | undefined) => Effect.Effect<ExecuteResult, unknown, never>;
    readonly inspectTrigger: (body: TriggerInspectBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerInspectResponse, unknown, never>;
    readonly activateTrigger: (body: TriggerActivateBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerActivateResponse, unknown, never>;
    readonly listTriggers: (body: TriggerListBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerListResponse, unknown, never>;
    readonly getTrigger: (body: TriggerGetBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerGetResponse, unknown, never>;
    readonly pauseTrigger: (body: TriggerPauseResumeBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerStatusUpdateResponse, unknown, never>;
    readonly resumeTrigger: (body: TriggerPauseResumeBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerStatusUpdateResponse, unknown, never>;
    readonly disableTrigger: (body: TriggerPauseResumeBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerStatusUpdateResponse, unknown, never>;
    readonly replayTriggerDelivery: (body: TriggerReplayBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerDeliveryGetResponse, unknown, never>;
    readonly listTriggerDeliveries: (body: TriggerDeliveriesListBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerDeliveriesListResponse, unknown, never>;
    readonly getTriggerDelivery: (body: TriggerDeliveryGetBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerDeliveryGetResponse, unknown, never>;
    readonly getTriggerLimits: (body: TriggerLimitsGetBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerLimitsResponse, unknown, never>;
    readonly updateTriggerLimits: (body: TriggerLimitsUpdateBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerLimitsResponse, unknown, never>;
  };
  readonly workspaces: {
    readonly list: (request?: ListWorkspacesRequest | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<ListWorkspacesResult, unknown, never>;
    readonly get: (request?: HarborWorkspaceGetRequest | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<WorkspaceDetail, unknown, never>;
  };
  readonly workspace: (workspaceId: string) => {
    readonly id: string;
    readonly runtime: {
      readonly execute: (request: HarborRuntimeExecuteRequest, init?: HarborRequestInit | undefined) => Effect.Effect<ExecuteResult, unknown, never>;
    };
    readonly triggers: {
      readonly inspect: (request: Omit<TriggerInspectBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerInspectResponse, unknown, never>;
      readonly activate: (request: Omit<TriggerActivateBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerActivateResponse, unknown, never>;
      readonly list: (request?: (Omit<TriggerListBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }) | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerListResponse, unknown, never>;
      readonly get: (request: Omit<TriggerGetBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerGetResponse, unknown, never>;
      readonly pause: (request: Omit<TriggerPauseResumeBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerStatusUpdateResponse, unknown, never>;
      readonly resume: (request: Omit<TriggerPauseResumeBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerStatusUpdateResponse, unknown, never>;
      readonly disable: (request: Omit<TriggerPauseResumeBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerStatusUpdateResponse, unknown, never>;
      readonly replay: (request: Omit<TriggerReplayBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerDeliveryGetResponse, unknown, never>;
      readonly listDeliveries: (request?: (Omit<TriggerDeliveriesListBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }) | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerDeliveriesListResponse, unknown, never>;
      readonly getDelivery: (request: Omit<TriggerDeliveryGetBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerDeliveryGetResponse, unknown, never>;
      readonly getLimits: (request?: (Omit<TriggerLimitsGetBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }) | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerLimitsResponse, unknown, never>;
      readonly updateLimits: (request: Omit<TriggerLimitsUpdateBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerLimitsResponse, unknown, never>;
    };
    readonly sources: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly add: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly refresh: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly remove: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly abandon: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly cleanupStale: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly probe: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly authTest: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly setVisibility: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly verification: {
        readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly probe: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly set: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      };
    };
    readonly registry: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly install: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
    readonly tools: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly search: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly describe: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly schema: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly schemas: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly reindex: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly add: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
    readonly credentials: {
      readonly create: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly upsert: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly delete: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
    readonly oauth: {
      readonly start: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly connect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly reconnect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly status: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly disconnect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly configure: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly workspaceClients: {
        readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly set: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly delete: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      };
    };
    readonly runs: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly graph: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly listArtifacts: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly create: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly complete: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly cancel: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly events: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
    readonly policies: {
      readonly rules: {
        readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly create: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly update: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly delete: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      };
      readonly effective: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly simulate: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly sourceGate: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly listAudit: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
    readonly audit: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
    readonly jobs: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly inspect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly publish: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly run: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly versions: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly disable: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly invocations: {
        readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      };
    };
    readonly apps: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly inspect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly publish: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly open: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly disable: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly updateAccess: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly activity: {
        readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      };
      readonly invocations: {
        readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      };
    };
    readonly workflows: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly add: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly remove: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
  };
  readonly runtime: {
    readonly execute: (request: HarborRuntimeExecuteRequest, init?: HarborRequestInit | undefined) => Effect.Effect<ExecuteResult, unknown, never>;
  };
  readonly triggers: {
    readonly inspect: (request: Omit<TriggerInspectBody, "workspace_id"> & {
      readonly workspace_id?: string | undefined;
    }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerInspectResponse, unknown, never>;
    readonly activate: (request: Omit<TriggerActivateBody, "workspace_id"> & {
      readonly workspace_id?: string | undefined;
    }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerActivateResponse, unknown, never>;
    readonly list: (request?: (Omit<TriggerListBody, "workspace_id"> & {
      readonly workspace_id?: string | undefined;
    }) | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerListResponse, unknown, never>;
    readonly get: (request: Omit<TriggerGetBody, "workspace_id"> & {
      readonly workspace_id?: string | undefined;
    }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerGetResponse, unknown, never>;
    readonly pause: (request: Omit<TriggerPauseResumeBody, "workspace_id"> & {
      readonly workspace_id?: string | undefined;
    }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerStatusUpdateResponse, unknown, never>;
    readonly resume: (request: Omit<TriggerPauseResumeBody, "workspace_id"> & {
      readonly workspace_id?: string | undefined;
    }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerStatusUpdateResponse, unknown, never>;
    readonly disable: (request: Omit<TriggerPauseResumeBody, "workspace_id"> & {
      readonly workspace_id?: string | undefined;
    }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerStatusUpdateResponse, unknown, never>;
    readonly replay: (request: Omit<TriggerReplayBody, "workspace_id"> & {
      readonly workspace_id?: string | undefined;
    }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerDeliveryGetResponse, unknown, never>;
    readonly listDeliveries: (request?: (Omit<TriggerDeliveriesListBody, "workspace_id"> & {
      readonly workspace_id?: string | undefined;
    }) | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerDeliveriesListResponse, unknown, never>;
    readonly getDelivery: (request: Omit<TriggerDeliveryGetBody, "workspace_id"> & {
      readonly workspace_id?: string | undefined;
    }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerDeliveryGetResponse, unknown, never>;
    readonly getLimits: (request?: (Omit<TriggerLimitsGetBody, "workspace_id"> & {
      readonly workspace_id?: string | undefined;
    }) | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerLimitsResponse, unknown, never>;
    readonly updateLimits: (request: Omit<TriggerLimitsUpdateBody, "workspace_id"> & {
      readonly workspace_id?: string | undefined;
    }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerLimitsResponse, unknown, never>;
  };
  readonly sources: {
    readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly add: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly refresh: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly remove: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly abandon: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly cleanupStale: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly probe: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly authTest: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly setVisibility: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly verification: {
      readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly probe: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly set: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
  };
  readonly registry: {
    readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly install: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
  };
  readonly tools: {
    readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly search: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly describe: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly schema: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly schemas: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly reindex: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly add: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
  };
  readonly credentials: {
    readonly create: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly upsert: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly delete: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
  };
  readonly oauth: {
    readonly start: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly connect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly reconnect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly status: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly disconnect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly configure: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly workspaceClients: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly set: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly delete: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
  };
  readonly runs: {
    readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly graph: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly listArtifacts: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly create: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly complete: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly cancel: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly events: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
  };
  readonly policies: {
    readonly rules: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly create: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly update: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly delete: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
    readonly effective: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly simulate: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly sourceGate: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly listAudit: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
  };
  readonly audit: {
    readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
  };
  readonly jobs: {
    readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly inspect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly publish: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly run: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly versions: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly disable: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly invocations: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
  };
  readonly apps: {
    readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly inspect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly publish: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly open: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly disable: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly updateAccess: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly activity: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
    readonly invocations: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
  };
  readonly workflows: {
    readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly add: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    readonly remove: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
  };
}> & {
  layer: (options: HarborEffectClientOptions) => Layer.Layer<{
    readonly api: {
      readonly requestJson: (request: HarborJsonRequest, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly getHealth: (init?: HarborRequestInit | undefined) => Effect.Effect<HealthResponse, unknown, never>;
      readonly getV1Health: (init?: HarborRequestInit | undefined) => Effect.Effect<HealthResponse, unknown, never>;
      readonly getHealthz: (init?: HarborRequestInit | undefined) => Effect.Effect<HealthzResponse, unknown, never>;
      readonly getV1Healthz: (init?: HarborRequestInit | undefined) => Effect.Effect<HealthzResponse, unknown, never>;
      readonly getHarborWellKnown: (init?: HarborRequestInit | undefined) => Effect.Effect<WellKnownHarbor, unknown, never>;
      readonly getWellKnownIndex: (init?: HarborRequestInit | undefined) => Effect.Effect<WellKnownIndex, unknown, never>;
      readonly getHarborOpenApi: (init?: HarborRequestInit | undefined) => Effect.Effect<Record<string, unknown>, unknown, never>;
      readonly getOpenApiJson: (init?: HarborRequestInit | undefined) => Effect.Effect<Record<string, unknown>, unknown, never>;
      readonly listWorkspaces: (body: ListWorkspacesRequest, init?: HarborRequestInit | undefined) => Effect.Effect<ListWorkspacesResult, unknown, never>;
      readonly getWorkspace: (body: WorkspaceRequest, init?: HarborRequestInit | undefined) => Effect.Effect<WorkspaceDetail, unknown, never>;
      readonly executePlugin: (body: ExecuteRequest, init?: HarborRequestInit | undefined) => Effect.Effect<ExecuteResult, unknown, never>;
      readonly inspectTrigger: (body: TriggerInspectBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerInspectResponse, unknown, never>;
      readonly activateTrigger: (body: TriggerActivateBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerActivateResponse, unknown, never>;
      readonly listTriggers: (body: TriggerListBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerListResponse, unknown, never>;
      readonly getTrigger: (body: TriggerGetBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerGetResponse, unknown, never>;
      readonly pauseTrigger: (body: TriggerPauseResumeBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerStatusUpdateResponse, unknown, never>;
      readonly resumeTrigger: (body: TriggerPauseResumeBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerStatusUpdateResponse, unknown, never>;
      readonly disableTrigger: (body: TriggerPauseResumeBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerStatusUpdateResponse, unknown, never>;
      readonly replayTriggerDelivery: (body: TriggerReplayBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerDeliveryGetResponse, unknown, never>;
      readonly listTriggerDeliveries: (body: TriggerDeliveriesListBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerDeliveriesListResponse, unknown, never>;
      readonly getTriggerDelivery: (body: TriggerDeliveryGetBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerDeliveryGetResponse, unknown, never>;
      readonly getTriggerLimits: (body: TriggerLimitsGetBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerLimitsResponse, unknown, never>;
      readonly updateTriggerLimits: (body: TriggerLimitsUpdateBody, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerLimitsResponse, unknown, never>;
    };
    readonly workspaces: {
      readonly list: (request?: ListWorkspacesRequest | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<ListWorkspacesResult, unknown, never>;
      readonly get: (request?: HarborWorkspaceGetRequest | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<WorkspaceDetail, unknown, never>;
    };
    readonly workspace: (workspaceId: string) => {
      readonly id: string;
      readonly runtime: {
        readonly execute: (request: HarborRuntimeExecuteRequest, init?: HarborRequestInit | undefined) => Effect.Effect<ExecuteResult, unknown, never>;
      };
      readonly triggers: {
        readonly inspect: (request: Omit<TriggerInspectBody, "workspace_id"> & {
          readonly workspace_id?: string | undefined;
        }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerInspectResponse, unknown, never>;
        readonly activate: (request: Omit<TriggerActivateBody, "workspace_id"> & {
          readonly workspace_id?: string | undefined;
        }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerActivateResponse, unknown, never>;
        readonly list: (request?: (Omit<TriggerListBody, "workspace_id"> & {
          readonly workspace_id?: string | undefined;
        }) | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerListResponse, unknown, never>;
        readonly get: (request: Omit<TriggerGetBody, "workspace_id"> & {
          readonly workspace_id?: string | undefined;
        }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerGetResponse, unknown, never>;
        readonly pause: (request: Omit<TriggerPauseResumeBody, "workspace_id"> & {
          readonly workspace_id?: string | undefined;
        }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerStatusUpdateResponse, unknown, never>;
        readonly resume: (request: Omit<TriggerPauseResumeBody, "workspace_id"> & {
          readonly workspace_id?: string | undefined;
        }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerStatusUpdateResponse, unknown, never>;
        readonly disable: (request: Omit<TriggerPauseResumeBody, "workspace_id"> & {
          readonly workspace_id?: string | undefined;
        }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerStatusUpdateResponse, unknown, never>;
        readonly replay: (request: Omit<TriggerReplayBody, "workspace_id"> & {
          readonly workspace_id?: string | undefined;
        }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerDeliveryGetResponse, unknown, never>;
        readonly listDeliveries: (request?: (Omit<TriggerDeliveriesListBody, "workspace_id"> & {
          readonly workspace_id?: string | undefined;
        }) | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerDeliveriesListResponse, unknown, never>;
        readonly getDelivery: (request: Omit<TriggerDeliveryGetBody, "workspace_id"> & {
          readonly workspace_id?: string | undefined;
        }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerDeliveryGetResponse, unknown, never>;
        readonly getLimits: (request?: (Omit<TriggerLimitsGetBody, "workspace_id"> & {
          readonly workspace_id?: string | undefined;
        }) | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerLimitsResponse, unknown, never>;
        readonly updateLimits: (request: Omit<TriggerLimitsUpdateBody, "workspace_id"> & {
          readonly workspace_id?: string | undefined;
        }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerLimitsResponse, unknown, never>;
      };
      readonly sources: {
        readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly add: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly refresh: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly remove: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly abandon: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly cleanupStale: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly probe: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly authTest: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly setVisibility: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly verification: {
          readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
          readonly probe: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
          readonly set: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        };
      };
      readonly registry: {
        readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly install: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      };
      readonly tools: {
        readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly search: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly describe: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly schema: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly schemas: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly reindex: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly add: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      };
      readonly credentials: {
        readonly create: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly upsert: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly delete: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      };
      readonly oauth: {
        readonly start: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly connect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly reconnect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly status: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly disconnect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly configure: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly workspaceClients: {
          readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
          readonly set: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
          readonly delete: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        };
      };
      readonly runs: {
        readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly graph: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly listArtifacts: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly create: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly complete: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly cancel: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly events: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      };
      readonly policies: {
        readonly rules: {
          readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
          readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
          readonly create: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
          readonly update: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
          readonly delete: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        };
        readonly effective: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly simulate: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly sourceGate: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly listAudit: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      };
      readonly audit: {
        readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      };
      readonly jobs: {
        readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly inspect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly publish: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly run: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly versions: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly disable: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly invocations: {
          readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
          readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        };
      };
      readonly apps: {
        readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly inspect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly publish: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly open: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly disable: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly updateAccess: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly activity: {
          readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        };
        readonly invocations: {
          readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
          readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        };
      };
      readonly workflows: {
        readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly add: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly remove: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      };
    };
    readonly runtime: {
      readonly execute: (request: HarborRuntimeExecuteRequest, init?: HarborRequestInit | undefined) => Effect.Effect<ExecuteResult, unknown, never>;
    };
    readonly triggers: {
      readonly inspect: (request: Omit<TriggerInspectBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerInspectResponse, unknown, never>;
      readonly activate: (request: Omit<TriggerActivateBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerActivateResponse, unknown, never>;
      readonly list: (request?: (Omit<TriggerListBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }) | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerListResponse, unknown, never>;
      readonly get: (request: Omit<TriggerGetBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerGetResponse, unknown, never>;
      readonly pause: (request: Omit<TriggerPauseResumeBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerStatusUpdateResponse, unknown, never>;
      readonly resume: (request: Omit<TriggerPauseResumeBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerStatusUpdateResponse, unknown, never>;
      readonly disable: (request: Omit<TriggerPauseResumeBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerStatusUpdateResponse, unknown, never>;
      readonly replay: (request: Omit<TriggerReplayBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerDeliveryGetResponse, unknown, never>;
      readonly listDeliveries: (request?: (Omit<TriggerDeliveriesListBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }) | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerDeliveriesListResponse, unknown, never>;
      readonly getDelivery: (request: Omit<TriggerDeliveryGetBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerDeliveryGetResponse, unknown, never>;
      readonly getLimits: (request?: (Omit<TriggerLimitsGetBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }) | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerLimitsResponse, unknown, never>;
      readonly updateLimits: (request: Omit<TriggerLimitsUpdateBody, "workspace_id"> & {
        readonly workspace_id?: string | undefined;
      }, init?: HarborRequestInit | undefined) => Effect.Effect<TriggerLimitsResponse, unknown, never>;
    };
    readonly sources: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly add: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly refresh: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly remove: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly abandon: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly cleanupStale: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly probe: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly authTest: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly setVisibility: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly verification: {
        readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly probe: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly set: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      };
    };
    readonly registry: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly install: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
    readonly tools: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly search: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly describe: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly schema: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly schemas: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly reindex: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly add: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
    readonly credentials: {
      readonly create: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly upsert: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly delete: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
    readonly oauth: {
      readonly start: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly connect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly reconnect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly status: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly disconnect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly configure: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly workspaceClients: {
        readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly set: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly delete: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      };
    };
    readonly runs: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly graph: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly listArtifacts: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly create: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly complete: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly cancel: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly events: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
    readonly policies: {
      readonly rules: {
        readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly create: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly update: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly delete: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      };
      readonly effective: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly simulate: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly sourceGate: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly listAudit: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
    readonly audit: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
    readonly jobs: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly inspect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly publish: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly run: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly versions: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly disable: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly invocations: {
        readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      };
    };
    readonly apps: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly inspect: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly publish: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly open: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly disable: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly updateAccess: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly activity: {
        readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      };
      readonly invocations: {
        readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
        readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      };
    };
    readonly workflows: {
      readonly list: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly get: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly add: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
      readonly remove: (request?: HarborControlPlaneBody | undefined, init?: HarborRequestInit | undefined) => Effect.Effect<unknown, unknown, never>;
    };
  }, never, never>;
};
//#endregion
export { type HarborApiKeyAuth, type HarborApiKeyProviderAuth, HarborAuditClient, type HarborBearerTokenAuth, type HarborBearerTokenProviderAuth, HarborClient, type HarborClientAuth, HarborClientConfigurationError, HarborClientOptions, type HarborControlPlaneBody, HarborControlPlaneCall, HarborControlPlaneClients, type HarborControlPlaneResult, HarborCredentialsClient, HarborEffectClient, HarborEffectClientOptions, type HarborOAuthAuthorizeUrlOptions, HarborOrbitAppsClient, HarborOrbitJobsClient, HarborPluginOAuthClient, HarborPoliciesClient, HarborRegistryClient, HarborRunsClient, HarborRuntimeClient, type HarborRuntimeExecuteRequest, HarborSourcesClient, HarborToolsClient, HarborTriggersClient, HarborWorkflowsClient, HarborWorkspaceClient, type HarborWorkspaceGetRequest, HarborWorkspaceResolutionError, HarborWorkspacesClient, createHarborEffectClient, createHarborOAuthAuthorizeUrl };
//# sourceMappingURL=effect.d.mts.map