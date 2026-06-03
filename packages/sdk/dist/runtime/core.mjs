import { Context, Schema } from "effect";
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
	"git",
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
const RuntimeExecutionRequest = Schema.Struct({
	code: Schema.String,
	mode: RuntimeExecutionMode,
	timeoutMs: Schema.optional(Schema.Number),
	executionInputs: Schema.optional(Schema.Array(RuntimeMountedInput)),
	sourceFilter: Schema.optional(Schema.Array(Schema.String)),
	features: Schema.optional(RuntimeMetadata)
});
const TrustedExecutionContext = Schema.Struct({
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
const RuntimePlan = Schema.Struct({
	requiredNamespaces: Schema.Array(RuntimeNamespaceRequirement),
	aliasMap: Schema.Record(Schema.String, Schema.String),
	capabilities: Schema.Array(RuntimeCapabilityUsage),
	mountedInputs: Schema.Array(RuntimeMountedInput),
	generatedTypeBlocks: Schema.Array(Schema.String),
	warnings: Schema.Array(Schema.String)
});
const RuntimeArtifactRef = Schema.Struct({
	id: Schema.String,
	kind: Schema.String,
	contentType: Schema.optional(Schema.String),
	url: Schema.optional(Schema.String),
	sizeBytes: Schema.optional(Schema.Number),
	metadata: Schema.optional(RuntimeMetadata)
});
const RuntimeExecutionResult = Schema.Struct({
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
function unwrapRuntimeErrorCause(error) {
	if (!(error instanceof RuntimeError)) return error;
	const details = error.details;
	if (!details || typeof details !== "object" || !("cause" in details)) return error;
	return details.cause;
}
const RuntimePlanner = Context.Service("@hrbr/runtime/RuntimePlanner");
const isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
const normalizeRuntimeHostDispatchInput = (input) => {
	if (!isRecord(input)) return {
		kind: "unknown",
		raw: input
	};
	if ("outboundFetch" in input) return {
		kind: "outbound_fetch",
		outboundFetch: input.outboundFetch,
		raw: input
	};
	if ("secret" in input) return {
		kind: "secret",
		secret: input.secret,
		raw: input
	};
	if ("sand" in input) return {
		kind: "sand",
		sand: input.sand,
		raw: input
	};
	if (typeof input.namespace === "string" && typeof input.tool === "string") return {
		kind: "namespace_tool",
		namespace: input.namespace,
		tool: input.tool,
		args: input.args,
		raw: input
	};
	if (typeof input.key === "string") return {
		kind: "legacy_key",
		key: input.key,
		args: input.args,
		raw: input
	};
	return {
		kind: "unknown",
		raw: input
	};
};
const RuntimeDispatchRouter = Context.Service("@hrbr/runtime/RuntimeDispatchRouter");
const RuntimeProviderRegistry = Context.Service("@hrbr/runtime/RuntimeProviderRegistry");
const RuntimeHost = Context.Service("@hrbr/runtime/RuntimeHost");
const RuntimeState = Context.Service("@hrbr/runtime/RuntimeState");
const RuntimeArtifacts = Context.Service("@hrbr/runtime/RuntimeArtifacts");
const RuntimeExecutor = Context.Service("@hrbr/runtime/RuntimeExecutor");
const emptyRuntimePlan = (overrides = {}) => ({
	requiredNamespaces: [],
	aliasMap: {},
	capabilities: [],
	mountedInputs: [],
	generatedTypeBlocks: [],
	warnings: [],
	...overrides
});
//#endregion
export { RuntimeArtifactRef, RuntimeArtifacts, RuntimeCapabilityKind, RuntimeCapabilityUsage, RuntimeDispatchRouter, RuntimeError, RuntimeExecutionMode, RuntimeExecutionRequest, RuntimeExecutionResult, RuntimeExecutor, RuntimeHost, RuntimeMetadata, RuntimeMountedInput, RuntimeNamespaceRequirement, RuntimePlan, RuntimePlanner, RuntimeProviderRegistry, RuntimeState, TrustedExecutionContext, emptyRuntimePlan, normalizeRuntimeHostDispatchInput, unwrapRuntimeErrorCause };

//# sourceMappingURL=core.mjs.map