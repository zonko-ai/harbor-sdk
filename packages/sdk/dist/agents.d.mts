import { Schema } from "effect";

//#region ../core-effect/src/agent.d.ts
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
//#region ../agents/src/index.d.ts
declare const OriginConfidence: Schema.Literals<readonly ["high", "pid", "none"]>;
type OriginConfidence = typeof OriginConfidence.Type;
declare const Agent: Schema.Struct<{
  readonly id: Schema.String;
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
  readonly agent_id: Schema.String;
}>;
type AgentIdBody = typeof AgentIdBody.Type;
declare const UpdateAgentBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly agent_id: Schema.String;
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
declare const MCP_AGENT_CATALOG: readonly [{
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}];
declare const AGENT_CATALOG: readonly [{
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}];
declare const AGENT_REGISTRY: readonly [{
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}, {
  readonly slug: string;
  readonly label: string;
  readonly kind: "local" | "mcp";
  readonly icon: {
    readonly path: string;
    readonly style: "color" | "mono";
    readonly darkPath?: string | undefined;
  };
  readonly iconPath: string;
  readonly iconPathDark: string;
  readonly envVars: readonly {
    readonly name: string;
  }[];
  readonly command?: string | undefined;
  readonly description?: string | undefined;
  readonly aliases?: readonly string[] | undefined;
  readonly installInstructions?: readonly {
    readonly id: string;
    readonly label: string;
    readonly kind: "handoff" | "mcp-shell" | "markdown";
    readonly command?: string | undefined;
    readonly next?: string | undefined;
    readonly instructions?: string | undefined;
  }[] | undefined;
}];
type AgentEntry = AgentCatalogItem;
type AgentSlug = (typeof AGENT_CATALOG)[number]['slug'];
declare function getAgentCatalogItem(slug: string): AgentCatalogItem | undefined;
declare function canonicalAgentFamily(slug: string): string;
declare function agentIconSpec(slugOrItem: string | AgentCatalogItem): AgentIconSpec | undefined;
declare function getAgentIcon(slug: string, isDark?: boolean): string | undefined;
type InstallGuideMode = 'handoff' | 'mcp';
interface BuildInstallGuideOptions {
  /** Curated workflow-backed skill id used by `hrbr skills get <id>`. */
  readonly workflow?: string | undefined;
  /** Human-readable workflow name shown in agent handoff instructions. */
  readonly workflowName?: string | undefined;
  readonly workspaceSlug?: string | undefined;
  readonly dashboardUrl?: string | undefined;
  readonly mcpUrl?: string | undefined;
  readonly imageBaseUrl?: string | undefined;
  /**
   * Setup paths to include in the response. Defaults to both handoff and
   * mcp. Pass `["handoff"]` to drop every MCP-only agent and every MCP
   * install instruction (used by the install page after ENG-601).
   */
  readonly modes?: ReadonlyArray<InstallGuideMode> | undefined;
}
declare function buildInstallGuide(options?: BuildInstallGuideOptions): InstallGuideResponse;
/**
 * Build a friendly alias for an agent identified by `(machine_id, agent_family)`.
 * Used when `display_name` is unset. Examples:
 *   formatAgentAlias("pi", "hyperion")   ──▶ "Pi on hyperion"
 *   formatAgentAlias("codex", null)      ──▶ "Codex"
 *   formatAgentAlias("unknown", "box")   ──▶ "unknown on box"
 */
declare function formatAgentAlias(agentFamily: string, hostname: string | null | undefined): string;
/**
 * Resolve the user-facing alias for an agent. Prefers user-edited
 * `display_name`, then computes one from `(agent_family, hostname)`.
 */
declare function resolveAgentAlias(agent: Pick<Agent, 'agent_family' | 'display_name' | 'metadata'>): string;
//#endregion
export { AGENT_CATALOG, AGENT_REGISTRY, Agent, AgentCatalogItem, AgentCatalogKind, AgentConnectionStatus, AgentEntry, AgentIconSpec, AgentIconStyle, AgentIdBody, AgentInfo, AgentInstallInstruction, AgentInstallInstructionKind, AgentSlug, AnnounceAgentBody, BuildInstallGuideOptions, InstallAgentGuide, InstallGuideMode, InstallGuideResponse, InstallGuideTab, MCP_AGENT_CATALOG, MCP_CLIENT_NAME_TO_AGENT_FAMILY, type McpAgentFingerprint, OriginConfidence, UpdateAgentBody, agentIconSpec, buildInstallGuide, canonicalAgentFamily, fingerprintMcpAgentFamily, formatAgentAlias, getAgentCatalogItem, getAgentIcon, parsedAgentHostname, resolveAgentAlias };
//# sourceMappingURL=agents.d.mts.map