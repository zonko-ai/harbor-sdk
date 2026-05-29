import { Schema } from "effect";

//#region ../core-effect/src/agent.d.ts
declare const OriginConfidence: Schema.Literals<readonly ["high", "pid", "none"]>;
type OriginConfidence = typeof OriginConfidence.Type;
declare const Agent: Schema.Struct<{
  readonly id: Schema.NonEmptyString;
  readonly workspace_id: Schema.String;
  readonly machine_id: Schema.String;
  readonly agent_family: Schema.String;
  readonly origin_confidence: Schema.Literals<readonly ["high", "pid", "none"]>;
  readonly origin_source: Schema.String;
  readonly first_seen_at: Schema.String;
  readonly last_seen_at: Schema.String;
  readonly is_online: Schema.Boolean;
  readonly display_name: Schema.NullOr<Schema.String>;
  readonly tags: Schema.String;
  readonly metadata: Schema.String;
  readonly created_by: Schema.String;
  readonly created_at: Schema.String;
  readonly updated_at: Schema.String;
}>;
type Agent = typeof Agent.Type;
declare const AnnounceAgentBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly machine_id: Schema.NonEmptyString;
  readonly agent_family: Schema.NonEmptyString;
  readonly origin_confidence: Schema.Literals<readonly ["high", "pid", "none"]>;
  readonly origin_source: Schema.String;
  readonly metadata: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
}>;
type AnnounceAgentBody = typeof AnnounceAgentBody.Type;
declare const AgentIdBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly agent_id: Schema.NonEmptyString;
}>;
type AgentIdBody = typeof AgentIdBody.Type;
declare const UpdateAgentBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly agent_id: Schema.NonEmptyString;
  readonly display_name: Schema.optional<Schema.String>;
  readonly tags: Schema.optional<Schema.$Array<Schema.String>>;
  readonly metadata: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
}>;
type UpdateAgentBody = typeof UpdateAgentBody.Type;
declare const AgentIconStyle: Schema.Literals<readonly ["color", "mono"]>;
type AgentIconStyle = typeof AgentIconStyle.Type;
declare const AgentIconSpec: Schema.Struct<{
  readonly path: Schema.String;
  readonly darkPath: Schema.optional<Schema.String>;
  readonly style: Schema.Literals<readonly ["color", "mono"]>;
}>;
type AgentIconSpec = typeof AgentIconSpec.Type;
declare const AgentCatalogKind: Schema.Literals<readonly ["local", "mcp"]>;
type AgentCatalogKind = typeof AgentCatalogKind.Type;
declare const AgentInstallInstructionKind: Schema.Literals<readonly ["handoff", "mcp-shell", "markdown"]>;
type AgentInstallInstructionKind = typeof AgentInstallInstructionKind.Type;
declare const AgentInstallInstruction: Schema.Struct<{
  readonly id: Schema.String;
  readonly label: Schema.String;
  readonly kind: Schema.Literals<readonly ["handoff", "mcp-shell", "markdown"]>;
  readonly command: Schema.optional<Schema.String>;
  readonly next: Schema.optional<Schema.String>;
  readonly instructions: Schema.optional<Schema.String>;
}>;
type AgentInstallInstruction = typeof AgentInstallInstruction.Type;
declare const AgentCatalogItem: Schema.Struct<{
  readonly slug: Schema.String;
  readonly label: Schema.String;
  readonly kind: Schema.Literals<readonly ["local", "mcp"]>;
  readonly icon: Schema.Struct<{
    readonly path: Schema.String;
    readonly darkPath: Schema.optional<Schema.String>;
    readonly style: Schema.Literals<readonly ["color", "mono"]>;
  }>;
  readonly iconPath: Schema.String;
  readonly iconPathDark: Schema.String;
  readonly envVars: Schema.$Array<Schema.Struct<{
    readonly name: Schema.String;
  }>>;
  readonly command: Schema.optional<Schema.String>;
  readonly description: Schema.optional<Schema.String>;
  readonly aliases: Schema.optional<Schema.$Array<Schema.String>>;
  readonly installInstructions: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly id: Schema.String;
    readonly label: Schema.String;
    readonly kind: Schema.Literals<readonly ["handoff", "mcp-shell", "markdown"]>;
    readonly command: Schema.optional<Schema.String>;
    readonly next: Schema.optional<Schema.String>;
    readonly instructions: Schema.optional<Schema.String>;
  }>>>;
}>;
type AgentCatalogItem = typeof AgentCatalogItem.Type;
type AgentEntry = AgentCatalogItem;
declare const AgentConnectionStatus: Schema.Literals<readonly ["connected", "disconnected"]>;
type AgentConnectionStatus = typeof AgentConnectionStatus.Type;
declare const AgentInfo: Schema.Struct<{
  readonly id: Schema.String;
  readonly family: Schema.String;
  readonly alias: Schema.String;
  readonly label: Schema.String;
  readonly icon: Schema.Struct<{
    readonly path: Schema.String;
    readonly darkPath: Schema.optional<Schema.String>;
    readonly style: Schema.Literals<readonly ["color", "mono"]>;
  }>;
  readonly status: Schema.Literals<readonly ["connected", "disconnected"]>;
  readonly last_seen_at: Schema.String;
  readonly origin_confidence: Schema.Literals<readonly ["high", "pid", "none"]>;
  readonly hostname: Schema.optional<Schema.String>;
}>;
type AgentInfo = typeof AgentInfo.Type;
declare const InstallGuideTab: Schema.Struct<{
  readonly id: Schema.String;
  readonly label: Schema.String;
  readonly instructions: Schema.String;
}>;
type InstallGuideTab = typeof InstallGuideTab.Type;
declare const InstallAgentGuide: Schema.Struct<{
  readonly id: Schema.String;
  readonly name: Schema.String;
  readonly icon: Schema.String;
  readonly image_url: Schema.String;
  readonly tabs: Schema.$Array<Schema.Struct<{
    readonly id: Schema.String;
    readonly label: Schema.String;
    readonly instructions: Schema.String;
  }>>;
}>;
type InstallAgentGuide = typeof InstallAgentGuide.Type;
declare const InstallGuideResponse: Schema.Struct<{
  readonly workflow: Schema.NullOr<Schema.String>;
  readonly agents: Schema.$Array<Schema.Struct<{
    readonly id: Schema.String;
    readonly name: Schema.String;
    readonly icon: Schema.String;
    readonly image_url: Schema.String;
    readonly tabs: Schema.$Array<Schema.Struct<{
      readonly id: Schema.String;
      readonly label: Schema.String;
      readonly instructions: Schema.String;
    }>>;
  }>>;
}>;
type InstallGuideResponse = typeof InstallGuideResponse.Type;
type InstallGuideMode = 'handoff' | 'mcp';
interface BuildInstallGuideOptions {
  readonly workflow?: string | undefined;
  readonly workflowName?: string | undefined;
  readonly workspaceSlug?: string | undefined;
  readonly dashboardUrl?: string | undefined;
  readonly mcpUrl?: string | undefined;
  readonly imageBaseUrl?: string | undefined;
  readonly modes?: ReadonlyArray<InstallGuideMode> | undefined;
}
interface McpAgentFingerprint {
  readonly family: string;
  readonly clientLabel: string | null;
  readonly confidence: 'high' | 'medium' | 'low';
  readonly source: 'client_info' | 'pattern' | 'fallback';
}
declare const MCP_CLIENT_NAME_TO_AGENT_FAMILY: Readonly<Record<string, string>>;
declare function parsedAgentHostname(metadataJson: string | null | undefined): string | null;
declare function fingerprintMcpAgentFamily(rawClientName: string | null | undefined, options?: {
  readonly fallbackFamily?: string | undefined;
}): McpAgentFingerprint;
//#endregion
export { Agent, AgentCatalogItem, AgentCatalogKind, AgentConnectionStatus, AgentEntry, AgentIconSpec, AgentIconStyle, AgentIdBody, AgentInfo, AgentInstallInstruction, AgentInstallInstructionKind, AnnounceAgentBody, BuildInstallGuideOptions, InstallAgentGuide, InstallGuideMode, InstallGuideResponse, InstallGuideTab, MCP_CLIENT_NAME_TO_AGENT_FAMILY, McpAgentFingerprint, OriginConfidence, UpdateAgentBody, fingerprintMcpAgentFamily, parsedAgentHostname };
//# sourceMappingURL=agent.d.mts.map