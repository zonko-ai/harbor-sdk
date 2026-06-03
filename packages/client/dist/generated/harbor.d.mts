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
interface ApiFailure {
  readonly success: false;
  readonly error: string;
  readonly issues?: readonly string[] | undefined;
}
interface RateLimitInfo {
  readonly policy_id: string;
  readonly scope: 'workspace' | 'user' | 'agent' | 'ip' | 'public';
  readonly limit: number;
  readonly window_ms: number;
  readonly remaining: number;
  readonly reset_at_ms: number;
}
interface ApiRateLimitFailure {
  readonly success: false;
  readonly error: string;
  readonly retry_after_sec: number;
  readonly rate_limit: RateLimitInfo;
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
interface UserOnboarding {
  readonly onboardedAt: string | null;
}
interface ListWorkspacesResult {
  readonly data: readonly Workspace[];
  readonly user: UserOnboarding;
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
interface HarborGeneratedClientOptions {
  readonly baseUrl: string;
  readonly bearerToken?: string | undefined;
  readonly bearerTokenProvider?: HarborBearerTokenProvider | undefined;
  readonly headers?: Record<string, string> | undefined;
  readonly fetch?: typeof fetch | undefined;
}
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
declare class HarborApiError extends Error {
  readonly status: number;
  readonly payload: unknown;
  constructor(status: number, payload: unknown);
}
declare function createHarborGeneratedClient(options: HarborGeneratedClientOptions): HarborGeneratedClient;
//#endregion
export { ApiFailure, ApiRateLimitFailure, ExecuteInput, ExecuteRequest, ExecuteResult, ExecuteResultContent, ExecuteResultJsonContent, ExecuteResultSkillBundleContent, ExecuteResultTextContent, ExecuteSkillBundle, ExecuteSkillBundleFile, ExecuteSourceRef, ExecuteWarning, HarborApiError, HarborBearerTokenProvider, HarborGeneratedClient, HarborGeneratedClientOptions, HarborJsonRequest, HarborRequestInit, HealthResponse, HealthzResponse, JsonValue, ListWorkspacesRequest, ListWorkspacesResult, RateLimitInfo, TriggerActivateBody, TriggerActivateResponse, TriggerDeliveriesListBody, TriggerDeliveriesListResponse, TriggerDeliveryGetBody, TriggerDeliveryGetResponse, TriggerDeliveryRecord, TriggerDeliveryStatus, TriggerGetBody, TriggerGetResponse, TriggerInspectBody, TriggerInspectResponse, TriggerKind, TriggerLimits, TriggerLimitsGetBody, TriggerLimitsResponse, TriggerLimitsUpdateBody, TriggerListBody, TriggerListResponse, TriggerPauseResumeBody, TriggerRecord, TriggerReplayBody, TriggerStatus, TriggerStatusUpdateResponse, UserOnboarding, WellKnownHarbor, WellKnownIndex, WellKnownIndexEntry, Workspace, WorkspaceDetail, WorkspaceRequest, createHarborGeneratedClient };
//# sourceMappingURL=harbor.d.mts.map