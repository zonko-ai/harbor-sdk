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
Layer.succeed(RuntimeSecretsProvider, { registerFromSource: (input) => Effect.tryPromise({
	try: input.register,
	catch: (cause) => new RuntimeError("provider", "Secret provider registration failed", {
		namespace: input.namespace,
		name: input.name,
		cause
	})
}) });
function isRuntimeSecretRefHandle(value) {
	return Boolean(value && typeof value === "object" && typeof value["__hrbr_secret_ref"] === "string");
}
function runtimeSecretRefId(handle) {
	return handle[RUNTIME_SECRET_REF_FIELD];
}
//#endregion
//#region ../runtime-provider-sand/src/index.ts
const RuntimeSandProvider = Context.Service("@hrbr/runtime-provider-sand/RuntimeSandProvider");
const RuntimeSandProviderLive = Layer.succeed(RuntimeSandProvider, { invoke: (input) => Effect.tryPromise({
	try: async () => {
		const raw = await input.invoke();
		return {
			raw,
			value: normalizeRuntimeSandResult(raw, input.resultMode)
		};
	},
	catch: (cause) => new RuntimeError("provider", "Sand provider invocation failed", {
		namespace: input.namespace,
		toolName: input.toolName,
		cause
	})
}) });
function readRuntimeInputPath(input, path) {
	let current = input;
	for (const segment of path.split(".").filter(Boolean)) {
		if (!current || typeof current !== "object") return void 0;
		current = current[segment];
	}
	return current;
}
function toRuntimeCliString(value) {
	if (value === null || value === void 0) return null;
	if (typeof value === "string") return value;
	if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return String(value);
	try {
		return JSON.stringify(value);
	} catch {
		return String(value);
	}
}
function normalizeRuntimeStringRecord(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
	const out = {};
	for (const [key, raw] of Object.entries(value)) {
		const str = toRuntimeCliString(raw);
		if (str !== null) out[key] = str;
	}
	return Object.keys(out).length > 0 ? out : void 0;
}
const SAND_ENV_KEY_RE = /^[A-Z][A-Z0-9_]*$/;
const BLOCKED_SAND_ENV_KEYS = new Set([
	"PATH",
	"HOME",
	"PWD",
	"SHELL",
	"NODE_OPTIONS",
	"BUN_OPTIONS"
]);
function isBlockedRuntimeSandEnvKey(key) {
	const normalized = key.trim().toUpperCase();
	return BLOCKED_SAND_ENV_KEYS.has(normalized) || normalized.startsWith("HRBR_");
}
function normalizeRuntimeSandSecretEnvRecord(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
	const out = {};
	for (const [env, raw] of Object.entries(value)) {
		if (!SAND_ENV_KEY_RE.test(env)) throw new Error(`sand secret_env key is invalid: ${env}`);
		if (isBlockedRuntimeSandEnvKey(env)) throw new Error(`sand secret_env key is blocked: ${env}`);
		if (!isRuntimeSecretRefHandle(raw)) throw new Error(`sand secret_env value must be a Harbor secret ref: ${env}`);
		out[env] = runtimeSecretRefId(raw);
	}
	return Object.keys(out).length > 0 ? out : void 0;
}
function buildRuntimeSandCliArgv(binding, input) {
	const out = [];
	for (const part of binding.argv_template) switch (part.kind) {
		case "literal":
			out.push(part.value);
			break;
		case "input": {
			const value = toRuntimeCliString(readRuntimeInputPath(input, part.path));
			if (value !== null) out.push(value);
			break;
		}
		case "option": {
			const value = toRuntimeCliString(readRuntimeInputPath(input, part.path));
			if (value === null || value.length === 0) {
				if (!part.omit_if_empty) out.push(part.flag);
				break;
			}
			out.push(part.flag, value);
			break;
		}
		case "flag":
			if (readRuntimeInputPath(input, part.path)) out.push(part.flag);
			break;
	}
	return out;
}
function resolveRuntimeSandCwd(sourceConfig, input, originCwd, overrideCwd, normalizeOriginCwd = (cwd) => cwd) {
	if (overrideCwd) {
		if (sourceConfig.cwd_policy !== "call") throw new Error("sand cwd override is not allowed for this source");
		return overrideCwd;
	}
	switch (sourceConfig.cwd_policy) {
		case "workspace": return normalizeOriginCwd(originCwd);
		case "configured": return typeof sourceConfig.cwd === "string" && sourceConfig.cwd.length > 0 ? sourceConfig.cwd : void 0;
		case "call": {
			const raw = readRuntimeInputPath(input, "cwd");
			return typeof raw === "string" && raw.length > 0 ? raw : void 0;
		}
		default: return;
	}
}
function resolveRuntimeSandStdin(binding, input) {
	switch (binding.sand_stdin_mode) {
		case "none": return;
		case "json": return JSON.stringify(input);
		case "text": {
			const stdinText = readRuntimeInputPath(input, "stdin_text");
			if (typeof stdinText === "string") return stdinText;
			const text = readRuntimeInputPath(input, "text");
			if (typeof text === "string") return text;
			return toRuntimeCliString(input) ?? void 0;
		}
	}
}
function normalizeRuntimeSandCallOptions(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) return void 0;
	const raw = input;
	const env = normalizeRuntimeStringRecord(raw.env);
	const secret_env = normalizeRuntimeSandSecretEnvRecord(raw.secret_env);
	const cwd = typeof raw.cwd === "string" && raw.cwd.length > 0 ? raw.cwd : void 0;
	const timeout_ms = typeof raw.timeout_ms === "number" && Number.isFinite(raw.timeout_ms) && raw.timeout_ms > 0 ? raw.timeout_ms : void 0;
	if (!env && !secret_env && !cwd && timeout_ms === void 0) return void 0;
	return {
		...env ? { env } : {},
		...secret_env ? { secret_env } : {},
		...cwd ? { cwd } : {},
		...timeout_ms !== void 0 ? { timeout_ms } : {}
	};
}
function normalizeRuntimeSandResult(raw, resultMode) {
	if (!raw || typeof raw !== "object") return raw;
	const envelope = raw;
	if (envelope.status === "error" || envelope.status === "cancelled") {
		const stderr = typeof envelope.stderr === "string" && envelope.stderr.length > 0 ? envelope.stderr : void 0;
		const genericExitError = typeof envelope.error === "string" && /^sand command exited with code\b/.test(envelope.error);
		const message = stderr && genericExitError ? stderr : typeof envelope.error === "string" && envelope.error.length > 0 ? envelope.error : stderr ? stderr : "Sand invocation failed";
		throw new Error(message);
	}
	if (envelope.result !== void 0) return envelope.result;
	if (resultMode === "exit_code_only") return envelope.exit_code ?? null;
	if (resultMode === "binary_base64") return envelope.stdout ?? envelope;
	const stdout = typeof envelope.stdout === "string" ? envelope.stdout : "";
	if (resultMode === "json_stdout" && stdout.length > 0) try {
		return JSON.parse(stdout);
	} catch {
		return stdout;
	}
	if (stdout.length > 0) return stdout;
	return envelope;
}
function sanitizeRuntimeSandInvocationLogInput(namespace, tool, input, options, envKeys, secretEnvKeys = []) {
	return {
		namespace,
		tool,
		input,
		options: options ? {
			...options.cwd ? { cwd: options.cwd } : {},
			...options.timeout_ms !== void 0 ? { timeout_ms: options.timeout_ms } : {},
			...envKeys.length > 0 ? { env_keys: envKeys } : {},
			...secretEnvKeys.length > 0 ? { secret_env_keys: secretEnvKeys } : {}
		} : void 0
	};
}
//#endregion
export { RuntimeSandProvider, RuntimeSandProviderLive, buildRuntimeSandCliArgv, isBlockedRuntimeSandEnvKey, normalizeRuntimeSandCallOptions, normalizeRuntimeSandResult, normalizeRuntimeSandSecretEnvRecord, normalizeRuntimeStringRecord, readRuntimeInputPath, resolveRuntimeSandCwd, resolveRuntimeSandStdin, sanitizeRuntimeSandInvocationLogInput, toRuntimeCliString };

//# sourceMappingURL=sand-provider.mjs.map