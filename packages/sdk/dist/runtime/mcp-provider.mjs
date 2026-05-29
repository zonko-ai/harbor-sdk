import { Context, Effect, Layer, Schema } from "effect";
//#region ../runtime-core/src/index.ts
const RuntimeExecutionMode = Schema.Literals([
	"exec",
	"workflow",
	"job",
	"test"
]);
const RuntimeCapabilityKind = Schema.Literals([
	"tool",
	"orbit",
	"secret",
	"host",
	"state",
	"artifact",
	"job",
	"workflow_step"
]);
const RuntimeMetadata = Schema.Record(Schema.String, Schema.Unknown);
const RuntimeMountedInput = Schema.Struct({
	name: Schema.String,
	contentType: Schema.optional(Schema.String),
	data: Schema.String,
	sha256: Schema.optional(Schema.String)
});
Schema.Struct({
	code: Schema.String,
	mode: RuntimeExecutionMode,
	timeoutMs: Schema.optional(Schema.Number),
	executionInputs: Schema.optional(Schema.Array(RuntimeMountedInput)),
	sourceFilter: Schema.optional(Schema.Array(Schema.String)),
	features: Schema.optional(RuntimeMetadata)
});
Schema.Struct({
	scopeId: Schema.String,
	runId: Schema.String,
	attributionId: Schema.optional(Schema.String),
	machineId: Schema.optional(Schema.String),
	trace: Schema.optional(RuntimeMetadata),
	grants: Schema.optional(RuntimeMetadata)
});
const RuntimeNamespaceRequirement = Schema.Struct({
	namespace: Schema.String,
	bindingKind: RuntimeCapabilityKind,
	optional: Schema.optional(Schema.Boolean)
});
const RuntimeCapabilityUsage = Schema.Struct({
	kind: RuntimeCapabilityKind,
	key: Schema.String,
	metadata: Schema.optional(RuntimeMetadata)
});
Schema.Struct({
	requiredNamespaces: Schema.Array(RuntimeNamespaceRequirement),
	aliasMap: Schema.Record(Schema.String, Schema.String),
	capabilities: Schema.Array(RuntimeCapabilityUsage),
	mountedInputs: Schema.Array(RuntimeMountedInput),
	generatedTypeBlocks: Schema.Array(Schema.String),
	warnings: Schema.Array(Schema.String)
});
Schema.Struct({
	id: Schema.String,
	kind: Schema.String,
	contentType: Schema.optional(Schema.String),
	url: Schema.optional(Schema.String),
	sizeBytes: Schema.optional(Schema.Number),
	metadata: Schema.optional(RuntimeMetadata)
});
Schema.Struct({
	mode: RuntimeExecutionMode,
	result: Schema.optional(Schema.Unknown),
	error: Schema.optional(Schema.String),
	logs: Schema.Array(Schema.String),
	warnings: Schema.Array(Schema.String),
	timings: Schema.Record(Schema.String, Schema.Number),
	metadata: Schema.optional(RuntimeMetadata)
});
var RuntimeError = class extends Error {
	reason;
	details;
	_tag = "RuntimeError";
	constructor(reason, message, details) {
		super(message);
		this.reason = reason;
		this.details = details;
		this.name = "RuntimeError";
	}
};
Context.Service("@hrbr/runtime/RuntimePlanner");
Context.Service("@hrbr/runtime/RuntimeDispatchRouter");
Context.Service("@hrbr/runtime/RuntimeProviderRegistry");
Context.Service("@hrbr/runtime/RuntimeHost");
Context.Service("@hrbr/runtime/RuntimeState");
Context.Service("@hrbr/runtime/RuntimeArtifacts");
Context.Service("@hrbr/runtime/RuntimeExecutor");
//#endregion
//#region ../runtime-provider-mcp/src/index.ts
const RuntimeMcpProvider = Context.Service("@hrbr/runtime-provider-mcp/RuntimeMcpProvider");
const RuntimeMcpProviderLive = Layer.succeed(RuntimeMcpProvider, { invoke: (input) => Effect.tryPromise({
	try: async () => finalizeRuntimeMcpResult(await input.invoke()),
	catch: (cause) => new RuntimeError("provider", "MCP provider invocation failed", {
		namespace: input.namespace,
		toolName: input.toolName,
		cause
	})
}) });
function normalizeMcpResult(raw) {
	if (!raw || typeof raw !== "object") return raw;
	const r = raw;
	if (r.structuredContent !== void 0) return r.structuredContent;
	const content = r.content;
	if (!content || !Array.isArray(content) || content.length === 0) return raw;
	const texts = content.filter((c) => c.type === "text" && c.text).map((c) => c.text);
	if (texts.length === 0) return raw;
	const joined = texts.length === 1 ? texts[0] : texts.join("\n");
	try {
		return JSON.parse(joined);
	} catch {
		return joined;
	}
}
function isMcpErrorResult(raw) {
	return !!raw && typeof raw === "object" && raw.isError === true;
}
const MCP_WARNING_MESSAGE_MAX = 800;
const MCP_WARNING_MAX_ENTRIES = 10;
function extractMcpWarnings(result) {
	if (!result || typeof result !== "object") return [];
	const content = result.content;
	if (!Array.isArray(content) || content.length === 0) return [];
	const out = [];
	for (const block of content) {
		if (out.length >= MCP_WARNING_MAX_ENTRIES) break;
		if (!block || typeof block !== "object") continue;
		const b = block;
		if (b.type !== "text") continue;
		if (typeof b.text !== "string") continue;
		const trimmed = b.text.trim();
		if (!trimmed) continue;
		const first = trimmed.charAt(0);
		if (first === "{" || first === "[") continue;
		out.push(trimmed.length > MCP_WARNING_MESSAGE_MAX ? trimmed.slice(0, MCP_WARNING_MESSAGE_MAX) + "…[truncated]" : trimmed);
	}
	return out;
}
function mcpErrorResultMessage(result) {
	const normalized = normalizeMcpResult(result);
	if (typeof normalized === "string" && normalized.trim()) return normalized.slice(0, 1e3);
	try {
		return JSON.stringify(normalized).slice(0, 1e3);
	} catch {
		return "MCP tool returned isError=true";
	}
}
function finalizeRuntimeMcpResult(raw) {
	const isError = isMcpErrorResult(raw);
	return {
		raw,
		value: normalizeMcpResult(raw),
		warnings: extractMcpWarnings(raw),
		isError,
		...isError ? { errorMessage: mcpErrorResultMessage(raw) } : {}
	};
}
//#endregion
export { RuntimeMcpProvider, RuntimeMcpProviderLive, extractMcpWarnings, finalizeRuntimeMcpResult, isMcpErrorResult, mcpErrorResultMessage, normalizeMcpResult };

//# sourceMappingURL=mcp-provider.mjs.map