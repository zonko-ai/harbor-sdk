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
//#region ../runtime-provider-secrets/src/index.ts
const RUNTIME_SECRET_REF_FIELD = "__hrbr_secret_ref";
const RuntimeSecretsProvider = Context.Service("@hrbr/runtime-provider-secrets/RuntimeSecretsProvider");
const RuntimeSecretsProviderLive = Layer.succeed(RuntimeSecretsProvider, { registerFromSource: (input) => Effect.tryPromise({
	try: input.register,
	catch: (cause) => new RuntimeError("provider", "Secret provider registration failed", {
		namespace: input.namespace,
		name: input.name,
		cause
	})
}) });
function makeRuntimeSecretRefHandle(refId) {
	return { [RUNTIME_SECRET_REF_FIELD]: refId };
}
function isRuntimeSecretRefHandle(value) {
	return Boolean(value && typeof value === "object" && typeof value["__hrbr_secret_ref"] === "string");
}
function runtimeSecretRefId(handle) {
	return handle[RUNTIME_SECRET_REF_FIELD];
}
function normalizeRuntimeSecretName(value) {
	return value.trim().toLowerCase();
}
function resolveRuntimeSecretSourceLookupNames(configValue, requestedName) {
	const names = new Set([requestedName]);
	if (!configValue) return [...names];
	try {
		const parsed = JSON.parse(configValue);
		if (parsed.kind !== "cli" || !Array.isArray(parsed.sand_secret_bindings)) return [...names];
		for (const rawBinding of parsed.sand_secret_bindings) {
			if (!rawBinding || typeof rawBinding !== "object") continue;
			const binding = rawBinding;
			const secretName = typeof binding.secret_name === "string" ? binding.secret_name : void 0;
			const env = typeof binding.env === "string" ? binding.env : void 0;
			if (!secretName) continue;
			const requested = normalizeRuntimeSecretName(requestedName);
			if (normalizeRuntimeSecretName(secretName) === requested || env && normalizeRuntimeSecretName(env) === requested) names.add(secretName);
		}
	} catch {
		return [...names];
	}
	return [...names];
}
//#endregion
export { RUNTIME_SECRET_REF_FIELD, RuntimeSecretsProvider, RuntimeSecretsProviderLive, isRuntimeSecretRefHandle, makeRuntimeSecretRefHandle, normalizeRuntimeSecretName, resolveRuntimeSecretSourceLookupNames, runtimeSecretRefId };

//# sourceMappingURL=secrets-provider.mjs.map