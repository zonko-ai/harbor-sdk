import { Schema } from "effect";
//#region ../core-effect/src/scalars.ts
const Timestamp = Schema.String;
Schema.NullOr(Timestamp);
const WorkspaceId = Schema.String.check(Schema.isUUID());
Schema.NonEmptyString;
const AgentId = Schema.NonEmptyString;
Schema.String.check(Schema.isUUID());
Schema.NonEmptyString;
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/));
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/));
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/));
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:[-_./][a-z0-9]+)*$/));
Schema.NonEmptyString;
Schema.NonEmptyString;
Schema.String.check(Schema.isPattern(/^[A-Z][A-Z0-9_]*$/));
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:_[a-z0-9]+)*$/));
Schema.Record(Schema.String, Schema.Unknown);
//#endregion
//#region ../core-effect/src/agent.ts
const OriginConfidence = Schema.Literals([
	"high",
	"pid",
	"none"
]);
const Agent = Schema.Struct({
	id: AgentId,
	workspace_id: WorkspaceId,
	machine_id: Schema.String,
	agent_family: Schema.String,
	origin_confidence: OriginConfidence,
	origin_source: Schema.String,
	first_seen_at: Schema.String,
	last_seen_at: Schema.String,
	is_online: Schema.Boolean,
	display_name: Schema.NullOr(Schema.String),
	tags: Schema.String,
	metadata: Schema.String,
	created_by: Schema.String,
	created_at: Schema.String,
	updated_at: Schema.String
});
const AnnounceAgentBody = Schema.Struct({
	workspace_id: WorkspaceId,
	machine_id: Schema.NonEmptyString,
	agent_family: Schema.NonEmptyString,
	origin_confidence: OriginConfidence,
	origin_source: Schema.String,
	metadata: Schema.optional(Schema.Record(Schema.String, Schema.Unknown))
});
const AgentIdBody = Schema.Struct({
	workspace_id: WorkspaceId,
	agent_id: AgentId
});
const UpdateAgentBody = Schema.Struct({
	workspace_id: WorkspaceId,
	agent_id: AgentId,
	display_name: Schema.optional(Schema.String),
	tags: Schema.optional(Schema.Array(Schema.String)),
	metadata: Schema.optional(Schema.Record(Schema.String, Schema.Unknown))
});
const AgentIconStyle = Schema.Literals(["color", "mono"]);
const AgentIconSpec = Schema.Struct({
	path: Schema.String,
	darkPath: Schema.optional(Schema.String),
	style: AgentIconStyle
});
const AgentCatalogKind = Schema.Literals(["local", "mcp"]);
const AgentInstallInstructionKind = Schema.Literals([
	"handoff",
	"mcp-shell",
	"markdown"
]);
const AgentInstallInstruction = Schema.Struct({
	id: Schema.String,
	label: Schema.String,
	kind: AgentInstallInstructionKind,
	command: Schema.optional(Schema.String),
	next: Schema.optional(Schema.String),
	instructions: Schema.optional(Schema.String)
});
const AgentCatalogItem = Schema.Struct({
	slug: Schema.String,
	label: Schema.String,
	kind: AgentCatalogKind,
	icon: AgentIconSpec,
	iconPath: Schema.String,
	iconPathDark: Schema.String,
	envVars: Schema.Array(Schema.Struct({ name: Schema.String })),
	command: Schema.optional(Schema.String),
	description: Schema.optional(Schema.String),
	aliases: Schema.optional(Schema.Array(Schema.String)),
	installInstructions: Schema.optional(Schema.Array(AgentInstallInstruction))
});
const AgentConnectionStatus = Schema.Literals(["connected", "disconnected"]);
const AgentInfo = Schema.Struct({
	id: Schema.String,
	family: Schema.String,
	alias: Schema.String,
	label: Schema.String,
	icon: AgentIconSpec,
	status: AgentConnectionStatus,
	last_seen_at: Schema.String,
	origin_confidence: OriginConfidence,
	hostname: Schema.optional(Schema.String)
});
const InstallGuideTab = Schema.Struct({
	id: Schema.String,
	label: Schema.String,
	instructions: Schema.String
});
const InstallAgentGuide = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	icon: Schema.String,
	image_url: Schema.String,
	tabs: Schema.Array(InstallGuideTab)
});
const InstallGuideResponse = Schema.Struct({
	workflow: Schema.NullOr(Schema.String),
	agents: Schema.Array(InstallAgentGuide)
});
const MCP_CLIENT_NAME_TO_AGENT_FAMILY = {
	"claude-code": "claude-code",
	"claude-ai": "claude-ai",
	ChatGPT: "chatgpt",
	Codex: "codex",
	"codex-mcp-client": "codex",
	"cursor-vscode": "cursor",
	"Visual-Studio-Code": "copilot",
	"JetBrains Client": "copilot",
	"IntelliJ IDEA": "copilot",
	PyCharm: "copilot",
	"mcp-inspector": "mcp-local",
	"gemini-cli-mcp-client": "gemini",
	"Kilo Code": "opencode",
	"Kiro CLI": "mcp-local",
	"Pi CLI": "pi",
	"Pi Coding Agent": "pi",
	Zed: "mcp-local",
	zed: "mcp-local",
	"qwen-code": "mcp-local",
	"qwen-cli-mcp-client": "mcp-local"
};
function asRecord(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function parsedAgentHostname(metadataJson) {
	if (!metadataJson) return null;
	try {
		const host = asRecord(JSON.parse(metadataJson))?.hostname;
		if (typeof host !== "string") return null;
		const trimmed = host.trim();
		return trimmed.length > 0 ? trimmed : null;
	} catch {
		return null;
	}
}
function fingerprintMcpAgentFamily(rawClientName, options) {
	const clientLabel = rawClientName?.trim() && rawClientName.trim() !== "_default" ? rawClientName.trim() : null;
	const normalized = clientLabel?.toLowerCase() ?? "";
	const fallbackFamily = options?.fallbackFamily ?? "mcp-remote";
	if (clientLabel && MCP_CLIENT_NAME_TO_AGENT_FAMILY[clientLabel]) return {
		family: MCP_CLIENT_NAME_TO_AGENT_FAMILY[clientLabel],
		clientLabel,
		confidence: "high",
		source: "client_info"
	};
	if (clientLabel?.startsWith("qwen-cli-mcp-client")) return {
		family: "mcp-local",
		clientLabel,
		confidence: "high",
		source: "client_info"
	};
	if (!normalized) return {
		family: fallbackFamily,
		clientLabel: null,
		confidence: "low",
		source: "fallback"
	};
	if (normalized.includes("claude code") || normalized.includes("claude-code") || normalized === "claudecode") return {
		family: "claude-code",
		clientLabel,
		confidence: "medium",
		source: "pattern"
	};
	if (/(^|[^a-z])codex([^a-z]|$)/.test(normalized) || normalized.includes("openai-codex") || normalized.includes("codex-cli") || normalized.includes("codex desktop")) return {
		family: "codex",
		clientLabel,
		confidence: "medium",
		source: "pattern"
	};
	if (/(^|[^a-z])claude([^a-z]|$)/.test(normalized) || normalized.includes("anthropic")) return {
		family: "claude-ai",
		clientLabel,
		confidence: "medium",
		source: "pattern"
	};
	if (normalized.includes("chatgpt") || normalized.includes("openai") || normalized === "gpt" || normalized.startsWith("gpt-")) return {
		family: "chatgpt",
		clientLabel,
		confidence: "medium",
		source: "pattern"
	};
	if (normalized.includes("cursor")) return {
		family: "cursor",
		clientLabel,
		confidence: "medium",
		source: "pattern"
	};
	if (normalized.includes("gemini")) return {
		family: "gemini",
		clientLabel,
		confidence: "medium",
		source: "pattern"
	};
	if (normalized.includes("opencode") || normalized.includes("kilo code") || normalized.includes("kilocode")) return {
		family: "opencode",
		clientLabel,
		confidence: "medium",
		source: "pattern"
	};
	if (normalized.includes("pi coding") || normalized === "pi" || normalized.includes("pi cli")) return {
		family: "pi",
		clientLabel,
		confidence: "medium",
		source: "pattern"
	};
	if (normalized.includes("openclaw")) return {
		family: "openclaw",
		clientLabel,
		confidence: "medium",
		source: "pattern"
	};
	if (normalized.includes("copilot") || normalized.includes("jetbrains") || normalized.includes("intellij") || normalized.includes("pycharm")) return {
		family: "copilot",
		clientLabel,
		confidence: "medium",
		source: "pattern"
	};
	if (normalized.includes("slate")) return {
		family: "slate",
		clientLabel,
		confidence: "medium",
		source: "pattern"
	};
	if (normalized.includes("mcp inspector") || normalized.includes("mcp-inspector") || normalized === "inspector" || normalized.includes("goose") || normalized.includes("mcpjam") || normalized.includes("continue") || normalized.includes("vscode") || normalized.includes("visual studio")) return {
		family: "mcp-local",
		clientLabel,
		confidence: "medium",
		source: "pattern"
	};
	return {
		family: fallbackFamily,
		clientLabel,
		confidence: "low",
		source: "fallback"
	};
}
//#endregion
export { Agent, AgentCatalogItem, AgentCatalogKind, AgentConnectionStatus, AgentIconSpec, AgentIconStyle, AgentIdBody, AgentInfo, AgentInstallInstruction, AgentInstallInstructionKind, AnnounceAgentBody, InstallAgentGuide, InstallGuideResponse, InstallGuideTab, MCP_CLIENT_NAME_TO_AGENT_FAMILY, OriginConfidence, UpdateAgentBody, fingerprintMcpAgentFamily, parsedAgentHostname };

//# sourceMappingURL=agent.mjs.map