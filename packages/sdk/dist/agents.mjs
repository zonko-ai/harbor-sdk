import { Schema, SchemaGetter } from "effect";
//#region ../core-effect/src/scalars.ts
const Timestamp = Schema.String;
Schema.NullOr(Timestamp);
const WorkspaceId = Schema.String.check(Schema.isUUID());
Schema.NonEmptyString;
const AgentId = Schema.NonEmptyString;
Schema.String.check(Schema.isUUID());
Schema.NonEmptyString;
const SourceNamespace = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/));
/**
* Normalize an arbitrary free-text string into the lowercase-safe namespace
* shape accepted by {@link SourceNamespace}: lowercase, non-alphanumerics
* collapsed to `-`, leading/trailing `-` trimmed, capped at 40 chars.
*
* This is the single source of truth for the namespace slugify algorithm. The
* frontend mirror lives in
* `apps/web/modules/plugin-registry/namespace-suffix.ts`; the two must stay in
* sync. Returns `''` for input that contains no alphanumerics — callers that
* need a non-empty result should fall back to a default (e.g. `'source'`),
* which is what {@link NormalizedSourceNamespace} does on decode.
*/
function sanitizeNamespace(input) {
	return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}
Schema.String.pipe(Schema.decodeTo(SourceNamespace, {
	decode: SchemaGetter.transform((s) => sanitizeNamespace(s) || "source"),
	encode: SchemaGetter.passthrough()
}));
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
const OriginConfidence$1 = Schema.Literals([
	"high",
	"pid",
	"none"
]);
Schema.Struct({
	id: AgentId,
	workspace_id: WorkspaceId,
	machine_id: Schema.String,
	agent_family: Schema.String,
	origin_confidence: OriginConfidence$1,
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
Schema.Struct({
	workspace_id: WorkspaceId,
	machine_id: Schema.NonEmptyString,
	agent_family: Schema.NonEmptyString,
	origin_confidence: OriginConfidence$1,
	origin_source: Schema.String,
	metadata: Schema.optional(Schema.Record(Schema.String, Schema.Unknown))
});
Schema.Struct({
	workspace_id: WorkspaceId,
	agent_id: AgentId
});
Schema.Struct({
	workspace_id: WorkspaceId,
	agent_id: AgentId,
	display_name: Schema.optional(Schema.String),
	tags: Schema.optional(Schema.Array(Schema.String)),
	metadata: Schema.optional(Schema.Record(Schema.String, Schema.Unknown))
});
const AgentIconStyle$1 = Schema.Literals(["color", "mono"]);
const AgentIconSpec$1 = Schema.Struct({
	path: Schema.String,
	darkPath: Schema.optional(Schema.String),
	style: AgentIconStyle$1
});
const AgentCatalogKind$1 = Schema.Literals(["local", "mcp"]);
const AgentInstallInstructionKind$1 = Schema.Literals([
	"handoff",
	"mcp-shell",
	"markdown"
]);
const AgentInstallInstruction$1 = Schema.Struct({
	id: Schema.String,
	label: Schema.String,
	kind: AgentInstallInstructionKind$1,
	command: Schema.optional(Schema.String),
	next: Schema.optional(Schema.String),
	instructions: Schema.optional(Schema.String)
});
Schema.Struct({
	slug: Schema.String,
	label: Schema.String,
	kind: AgentCatalogKind$1,
	icon: AgentIconSpec$1,
	iconPath: Schema.String,
	iconPathDark: Schema.String,
	envVars: Schema.Array(Schema.Struct({ name: Schema.String })),
	command: Schema.optional(Schema.String),
	description: Schema.optional(Schema.String),
	aliases: Schema.optional(Schema.Array(Schema.String)),
	installInstructions: Schema.optional(Schema.Array(AgentInstallInstruction$1))
});
const AgentConnectionStatus$1 = Schema.Literals(["connected", "disconnected"]);
Schema.Struct({
	id: Schema.String,
	family: Schema.String,
	alias: Schema.String,
	label: Schema.String,
	icon: AgentIconSpec$1,
	status: AgentConnectionStatus$1,
	last_seen_at: Schema.String,
	origin_confidence: OriginConfidence$1,
	hostname: Schema.optional(Schema.String)
});
const InstallGuideTab$1 = Schema.Struct({
	id: Schema.String,
	label: Schema.String,
	instructions: Schema.String
});
const InstallAgentGuide$1 = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	icon: Schema.String,
	image_url: Schema.String,
	tabs: Schema.Array(InstallGuideTab$1)
});
Schema.Struct({
	workflow: Schema.NullOr(Schema.String),
	agents: Schema.Array(InstallAgentGuide$1)
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
//#region ../agents/src/index.ts
const OriginConfidence = Schema.Literals([
	"high",
	"pid",
	"none"
]);
const Agent = Schema.Struct({
	id: Schema.String,
	workspace_id: Schema.String,
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
	workspace_id: Schema.String.check(Schema.isUUID()),
	machine_id: Schema.NonEmptyString,
	agent_family: Schema.NonEmptyString,
	origin_confidence: OriginConfidence,
	origin_source: Schema.String,
	metadata: Schema.optional(Schema.Record(Schema.String, Schema.Unknown))
});
const AgentIdBody = Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
	agent_id: Schema.String.check(Schema.isUUID())
});
const UpdateAgentBody = Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
	agent_id: Schema.String.check(Schema.isUUID()),
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
function icon(name, ext = "svg") {
	return `/agents/${name}.${ext}`;
}
function iconDark(name, hasDark) {
	return hasDark ? `/agents/${name}-white.svg` : `/agents/${name}.svg`;
}
function withIcon(path, darkPath, style = "color") {
	return {
		path,
		darkPath,
		style
	};
}
function catalogItem(args) {
	return {
		slug: args.slug,
		label: args.label,
		kind: args.kind,
		icon: args.icon,
		iconPath: args.icon.path,
		iconPathDark: args.icon.darkPath ?? args.icon.path,
		envVars: [...args.envVars ?? []],
		...args.command ? { command: args.command } : {},
		...args.description ? { description: args.description } : {},
		...args.aliases ? { aliases: [...args.aliases] } : {},
		...args.installInstructions ? { installInstructions: [...args.installInstructions] } : {}
	};
}
const HANDOFF_INSTALL = {
	id: "handoff",
	label: "Direct handoff",
	kind: "handoff"
};
function mcpShellInstall(command, next) {
	return {
		id: "mcp",
		label: "MCP",
		kind: "mcp-shell",
		command,
		next
	};
}
function markdownInstall(instructions) {
	return {
		id: "mcp",
		label: "MCP",
		kind: "markdown",
		instructions
	};
}
function localInstallInstructions(command, next) {
	return [HANDOFF_INSTALL, mcpShellInstall(`${command} mcp add harbor {{mcpUrl}}`, next ?? `Restart ${command} and authorize Harbor for this workspace.`)];
}
const LOCAL_AGENT_CATALOG = [
	catalogItem({
		slug: "claude-code",
		label: "Claude Code",
		kind: "local",
		icon: withIcon(icon("claude"), icon("claude")),
		envVars: [{ name: "CLAUDECODE" }],
		command: "claude --dangerously-skip-permissions",
		installInstructions: [HANDOFF_INSTALL, mcpShellInstall("claude mcp add --transport http harbor {{mcpUrl}}", "The next time you run Claude Code, it will have access to your Harbor workspace tools.")],
		description: "Anthropic's coding agent for reading code, editing files, and running terminal workflows."
	}),
	catalogItem({
		slug: "amp",
		label: "Amp",
		kind: "local",
		icon: withIcon(icon("amp"), icon("amp")),
		command: "amp",
		installInstructions: localInstallInstructions("amp"),
		description: "Amp's coding agent for terminal-first coding, subagents, and task work."
	}),
	catalogItem({
		slug: "codex",
		label: "Codex",
		kind: "local",
		icon: withIcon(icon("codex"), iconDark("codex", true), "mono"),
		envVars: [{ name: "CODEX_THREAD_ID" }],
		command: "codex",
		installInstructions: [HANDOFF_INSTALL, mcpShellInstall("codex mcp add harbor {{mcpUrl}}", "Start a new Codex session and ask it to list Harbor tools.")],
		description: "OpenAI's coding agent for reading, modifying, and running code across tasks."
	}),
	catalogItem({
		slug: "copilot",
		label: "Copilot",
		kind: "local",
		icon: withIcon(icon("copilot"), iconDark("copilot", true), "mono"),
		command: "copilot --allow-all",
		installInstructions: localInstallInstructions("copilot"),
		description: "GitHub's coding agent for planning, editing, and building in your repo."
	}),
	catalogItem({
		slug: "cursor",
		label: "Cursor",
		kind: "local",
		icon: withIcon(icon("cursor"), icon("cursor")),
		envVars: [{ name: "CURSOR_TRACE_ID" }],
		command: "cursor-agent",
		installInstructions: [HANDOFF_INSTALL, markdownInstall(`1. Open Cursor Settings → MCP and add a new server.

\`\`\`json
{
  "name": "harbor",
  "url": "{{mcpUrl}}"
}
\`\`\`

2. Save the server, then approve Harbor access from Cursor.`)],
		aliases: ["cursor-mcp"],
		description: "Cursor's coding agent for editing, running, and debugging code in parallel."
	}),
	catalogItem({
		slug: "gemini",
		label: "Gemini",
		kind: "local",
		icon: withIcon(icon("gemini"), icon("gemini")),
		envVars: [{ name: "GEMINI_CLI" }],
		command: "gemini --yolo",
		installInstructions: localInstallInstructions("gemini"),
		description: "Google's open-source terminal agent for coding, problem-solving, and task work."
	}),
	catalogItem({
		slug: "mastracode",
		label: "Mastracode",
		kind: "local",
		icon: withIcon(icon("mastracode"), iconDark("mastracode", true), "mono"),
		command: "mastracode",
		installInstructions: localInstallInstructions("mastracode"),
		description: "Mastra's coding agent for building, debugging, and shipping code from the terminal."
	}),
	catalogItem({
		slug: "opencode",
		label: "OpenCode",
		kind: "local",
		icon: withIcon(icon("opencode"), iconDark("opencode", true), "mono"),
		envVars: [{ name: "OPENCODE_TERMINAL" }],
		command: "opencode",
		installInstructions: [HANDOFF_INSTALL, mcpShellInstall("opencode mcp add harbor {{mcpUrl}}", "Restart OpenCode and select Harbor tools from the MCP tool list.")],
		description: "Open-source coding agent for the terminal, IDE, and desktop."
	}),
	catalogItem({
		slug: "slate",
		label: "Slate",
		kind: "local",
		icon: withIcon(icon("slate"), icon("slate"), "mono"),
		command: "slate",
		installInstructions: localInstallInstructions("slate"),
		description: "Slate CLI coding agent (OpenCode-derived) for terminal workflows."
	}),
	catalogItem({
		slug: "pi",
		label: "Pi",
		kind: "local",
		icon: withIcon(icon("pi"), iconDark("pi", true), "mono"),
		envVars: [{ name: "PI_CODING_AGENT" }, { name: "PI_CODING_AGENT_DIR" }],
		command: "pi",
		installInstructions: localInstallInstructions("pi"),
		description: "Minimal terminal coding harness for flexible coding workflows."
	}),
	catalogItem({
		slug: "hermes",
		label: "Hermes",
		kind: "local",
		icon: withIcon(icon("hermes", "png"), icon("hermes", "png")),
		envVars: [{ name: "HERMES_HOME" }],
		command: "hermes",
		installInstructions: localInstallInstructions("hermes"),
		description: "Hermes AI agent harness by Nous Research."
	}),
	catalogItem({
		slug: "openclaw",
		label: "OpenClaw",
		kind: "local",
		icon: withIcon(icon("openclaw"), icon("openclaw")),
		envVars: [{ name: "OPENCLAW_HOME" }],
		command: "openclaw",
		installInstructions: localInstallInstructions("openclaw"),
		description: "OpenClaw's autonomous AI agent platform."
	}),
	catalogItem({
		slug: "windsurf",
		label: "Windsurf",
		kind: "local",
		icon: withIcon(icon("windsurf"), iconDark("windsurf", true), "mono"),
		envVars: [{ name: "WINDSURF_ORIGINAL_PS1" }],
		command: "windsurf",
		installInstructions: localInstallInstructions("windsurf"),
		description: "Codeium's Windsurf IDE agent."
	}),
	catalogItem({
		slug: "superset",
		label: "Superset",
		kind: "local",
		icon: withIcon(icon("superset"), icon("superset")),
		description: "Superset agent orchestration platform."
	})
];
const MCP_AGENT_CATALOG = [
	catalogItem({
		slug: "claude-ai",
		label: "Claude.ai",
		kind: "mcp",
		icon: withIcon(icon("claude"), icon("claude")),
		aliases: ["claude-web"],
		installInstructions: [markdownInstall(`1. Open Claude Desktop settings and edit your MCP server configuration.

\`\`\`json
{
  "mcpServers": {
    "harbor": {
      "command": "npx",
      "args": ["mcp-remote", "{{mcpUrl}}"]
    }
  }
}
\`\`\`

2. Restart Claude Desktop and connect Harbor when prompted.`)],
		description: "Claude.ai or Claude Desktop connecting via Harbor's remote MCP endpoint."
	}),
	catalogItem({
		slug: "chatgpt",
		label: "ChatGPT",
		kind: "mcp",
		icon: withIcon(icon("chatgpt"), iconDark("chatgpt", true)),
		aliases: ["chatgpt-web"],
		installInstructions: [markdownInstall(`1. Add Harbor as a connector in ChatGPT using the remote MCP endpoint.

\`\`\`text
{{mcpUrl}}
\`\`\`

2. Complete OAuth in the browser and return to ChatGPT.`)],
		description: "ChatGPT or OpenAI client connecting via Harbor's remote MCP endpoint."
	}),
	catalogItem({
		slug: "mcp-local",
		label: "Loopback MCP client",
		kind: "mcp",
		icon: withIcon(icon("opencode"), iconDark("opencode", true), "mono"),
		description: "Loopback MCP client (Inspector, Goose, dev tooling) connecting via loopback."
	}),
	catalogItem({
		slug: "mcp-remote",
		label: "Remote MCP client",
		kind: "mcp",
		icon: withIcon(icon("opencode"), iconDark("opencode", true), "mono"),
		description: "Unrecognised remote MCP client connecting through Harbor's remote MCP endpoint."
	})
];
const AGENT_CATALOG = [...LOCAL_AGENT_CATALOG, ...MCP_AGENT_CATALOG];
const AGENT_REGISTRY = LOCAL_AGENT_CATALOG;
const slugIndex = new Map(AGENT_CATALOG.map((agent) => [agent.slug, agent]));
const aliasIndex = new Map(AGENT_CATALOG.flatMap((agent) => (agent.aliases ?? []).map((alias) => [alias, agent])));
function getAgentCatalogItem(slug) {
	return slugIndex.get(slug) ?? aliasIndex.get(slug);
}
function canonicalAgentFamily(slug) {
	return getAgentCatalogItem(slug)?.slug ?? slug;
}
function agentIconSpec(slugOrItem) {
	return (typeof slugOrItem === "string" ? getAgentCatalogItem(slugOrItem) : slugOrItem)?.icon;
}
function getAgentIcon(slug, isDark = false) {
	const iconSpec = agentIconSpec(slug);
	if (!iconSpec) return void 0;
	return isDark ? iconSpec.darkPath ?? iconSpec.path : iconSpec.path;
}
function installInstructionMode(instruction) {
	return instruction.kind === "handoff" ? "handoff" : "mcp";
}
const DEFAULT_DASHBOARD_URL = "https://tryharbor.ai";
function trimTrailingSlash(value) {
	return value.replace(/\/+$/, "");
}
function buildPublicUrl(pathOrUrl, baseUrl) {
	if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
	return `${trimTrailingSlash(baseUrl)}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}
function buildSkillUrl(args) {
	const base = buildPublicUrl("/skill.md", args.dashboardUrl);
	return args.workspaceSlug ? `${base}?ws=${encodeURIComponent(args.workspaceSlug)}` : base;
}
function shellQuote(value) {
	return `'${value.replaceAll("'", `'\\''`)}'`;
}
const HANDOFF_PROMPTS = {
	default: () => `curl https://tryharbor.ai/skill.md and read the downloaded text before taking any setup steps. Then help me set up Harbor: install it, verify complete login and workspace, show me any configured Harbor plugins, and explain what we can do.`,
	workflow: (ctx) => {
		const workflowId = ctx.workflowId?.trim();
		if (!workflowId) return HANDOFF_PROMPTS.default(ctx);
		const workflowName = ctx.workflowName?.trim();
		const workflowLabel = workflowName ? `the "${workflowName}" workflow` : "this workflow";
		return `Read ${ctx.skillUrl}. Trigger Harbor auth/login yourself, then run \`hrbr skills get ${shellQuote(workflowId)}\` to fetch and execute ${workflowLabel}.`;
	}
};
function resolveHandoffInstructionKey(ctx) {
	return ctx.workflowId?.trim() ? "workflow" : "default";
}
function handoffInstructions(agentName, ctx) {
	return `1. Copy this prompt into ${agentName}:

\`\`\`text
${HANDOFF_PROMPTS[resolveHandoffInstructionKey(ctx)](ctx)}
\`\`\`

2. Let the agent follow the Harbor skill. It will ask you for any command, browser action, or confirmation it needs.`;
}
function workflowMcpFollowup(ctx) {
	const workflowId = ctx.workflowId?.trim();
	if (!workflowId) return null;
	const workflowName = ctx.workflowName?.trim();
	const workflowLabel = workflowName ? `the "${workflowName}" workflow` : "this workflow";
	return `After Harbor MCP is connected, copy this prompt into the agent:

\`\`\`text
${`Call the Harbor MCP workflow tool with { "action": "get", "workflow_id": ${JSON.stringify(workflowId)} } to fetch ${workflowLabel}'s instructions, then execute those instructions step by step for me.`}
\`\`\``;
}
function mcpShellInstructions(command, next, ctx) {
	const followup = workflowMcpFollowup(ctx);
	return `1. Run the following command in your shell:

\`\`\`bash
${command}
\`\`\`

2. ${next}${followup ? `\n\n3. ${followup}` : ""}`;
}
function renderInstallInstruction(instruction, ctx) {
	if (instruction.kind === "handoff") return {
		id: instruction.id,
		label: instruction.label,
		instructions: handoffInstructions(ctx.agentName, {
			skillUrl: ctx.skillUrl,
			workflowId: ctx.workflowId,
			workflowName: ctx.workflowName
		})
	};
	if (instruction.kind === "mcp-shell" && instruction.command && instruction.next) {
		if (!ctx.mcpUrl) return null;
		return {
			id: instruction.id,
			label: instruction.label,
			instructions: mcpShellInstructions(instruction.command.replaceAll("{{mcpUrl}}", ctx.mcpUrl), instruction.next.replaceAll("{{mcpUrl}}", ctx.mcpUrl), {
				skillUrl: ctx.skillUrl,
				workflowId: ctx.workflowId,
				workflowName: ctx.workflowName
			})
		};
	}
	if (instruction.kind === "markdown" && instruction.instructions) {
		if (!ctx.mcpUrl) return null;
		return {
			id: instruction.id,
			label: instruction.label,
			instructions: (() => {
				const base = instruction.instructions.replaceAll("{{mcpUrl}}", ctx.mcpUrl).replaceAll("{{skillUrl}}", ctx.skillUrl);
				const followup = workflowMcpFollowup({
					skillUrl: ctx.skillUrl,
					workflowId: ctx.workflowId,
					workflowName: ctx.workflowName
				});
				return followup ? `${base}\n\n3. ${followup}` : base;
			})()
		};
	}
	return null;
}
function buildInstallGuide(options = {}) {
	const dashboardUrl = options.dashboardUrl ?? DEFAULT_DASHBOARD_URL;
	const mcpUrl = options.mcpUrl?.trim() || void 0;
	const imageBaseUrl = options.imageBaseUrl ?? dashboardUrl;
	const skillUrl = buildSkillUrl({
		dashboardUrl,
		workspaceSlug: options.workspaceSlug
	});
	const enabledModes = new Set(options.modes ?? ["handoff", "mcp"]);
	const includeMcp = enabledModes.has("mcp");
	const agents = AGENT_CATALOG.flatMap((agent) => {
		if (!includeMcp && agent.kind === "mcp") return [];
		const tabs = (agent.installInstructions ?? []).filter((instruction) => enabledModes.has(installInstructionMode(instruction))).map((instruction) => renderInstallInstruction(instruction, {
			agentName: agent.label,
			skillUrl,
			mcpUrl,
			workflowId: options.workflow,
			workflowName: options.workflowName
		})).filter((tab) => tab !== null);
		if (tabs.length === 0) return [];
		return [{
			id: agent.slug,
			name: agent.label,
			icon: agent.slug,
			image_url: buildPublicUrl(agent.icon.path, imageBaseUrl),
			tabs
		}];
	});
	return {
		workflow: options.workflow ?? null,
		agents
	};
}
/**
* Build a friendly alias for an agent identified by `(machine_id, agent_family)`.
* Used when `display_name` is unset. Examples:
*   formatAgentAlias("pi", "hyperion")   ──▶ "Pi on hyperion"
*   formatAgentAlias("codex", null)      ──▶ "Codex"
*   formatAgentAlias("unknown", "box")   ──▶ "unknown on box"
*/
function formatAgentAlias(agentFamily, hostname) {
	const label = getAgentCatalogItem(agentFamily)?.label ?? agentFamily;
	const host = hostname?.trim();
	return host && host.length > 0 ? `${label} on ${host}` : label;
}
/**
* Resolve the user-facing alias for an agent. Prefers user-edited
* `display_name`, then computes one from `(agent_family, hostname)`.
*/
function resolveAgentAlias(agent) {
	const explicit = agent.display_name?.trim();
	if (explicit) return explicit;
	return formatAgentAlias(agent.agent_family, parsedAgentHostname(agent.metadata));
}
//#endregion
export { AGENT_CATALOG, AGENT_REGISTRY, Agent, AgentCatalogItem, AgentCatalogKind, AgentConnectionStatus, AgentIconSpec, AgentIconStyle, AgentIdBody, AgentInfo, AgentInstallInstruction, AgentInstallInstructionKind, AnnounceAgentBody, InstallAgentGuide, InstallGuideResponse, InstallGuideTab, MCP_AGENT_CATALOG, MCP_CLIENT_NAME_TO_AGENT_FAMILY, OriginConfidence, UpdateAgentBody, agentIconSpec, buildInstallGuide, canonicalAgentFamily, fingerprintMcpAgentFamily, formatAgentAlias, getAgentCatalogItem, getAgentIcon, parsedAgentHostname, resolveAgentAlias };

//# sourceMappingURL=agents.mjs.map