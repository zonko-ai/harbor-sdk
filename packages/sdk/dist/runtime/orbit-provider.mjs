import { Context, Effect, Layer } from "effect";
//#region ../runtime-provider-orbit/src/index.ts
const RUNTIME_ORBIT_DISPATCH_PREFIX = "orbit__";
const RUNTIME_ORBIT_CACHE_KEY_PREFIX = "ws:";
const RUNTIME_ORBIT_DEFAULT_CAPABILITY_KEY = "orbit";
const RUNTIME_ORBIT_PRIMITIVES = [
	{
		key: "storage_put",
		operation: "storage.put",
		family: "storage",
		exposedOnHrbr: true
	},
	{
		key: "storage_get",
		operation: "storage.get",
		family: "storage",
		exposedOnHrbr: true
	},
	{
		key: "storage_list",
		operation: "storage.list",
		family: "storage",
		exposedOnHrbr: true
	},
	{
		key: "storage_delete",
		operation: "storage.delete",
		family: "storage",
		exposedOnHrbr: true
	},
	{
		key: "storage_url",
		operation: "storage.url",
		family: "storage",
		exposedOnHrbr: true
	},
	{
		key: "cache_get",
		operation: "cache.get",
		family: "cache",
		exposedOnHrbr: true
	},
	{
		key: "cache_set",
		operation: "cache.set",
		family: "cache",
		exposedOnHrbr: true
	},
	{
		key: "cache_delete",
		operation: "cache.delete",
		family: "cache",
		exposedOnHrbr: true
	},
	{
		key: "socket_url",
		operation: "socket.url",
		family: "socket",
		exposedOnHrbr: false
	},
	{
		key: "socket_broadcast",
		operation: "socket.broadcast",
		family: "socket",
		exposedOnHrbr: false
	},
	{
		key: "socket_stats",
		operation: "socket.stats",
		family: "socket",
		exposedOnHrbr: false
	},
	{
		key: "db_exec",
		operation: "db.exec",
		family: "db",
		exposedOnHrbr: true
	},
	{
		key: "db_query",
		operation: "db.query",
		family: "db",
		exposedOnHrbr: true
	},
	{
		key: "db_first",
		operation: "db.first",
		family: "db",
		exposedOnHrbr: true
	},
	{
		key: "db_batch",
		operation: "db.batch",
		family: "db",
		exposedOnHrbr: true
	},
	{
		key: "tools_search",
		operation: "tools.search",
		family: "tools",
		exposedOnHrbr: true
	},
	{
		key: "tools_describe",
		operation: "tools.describe",
		family: "tools",
		exposedOnHrbr: true
	},
	{
		key: "tools_namespaces",
		operation: "tools.namespaces",
		family: "tools",
		exposedOnHrbr: true
	},
	{
		key: "ai_run",
		operation: "ai.run",
		family: "ai",
		exposedOnHrbr: true
	},
	{
		key: "ai_generate",
		operation: "ai.generate",
		family: "ai",
		exposedOnHrbr: true
	},
	{
		key: "ai_summarize",
		operation: "ai.summarize",
		family: "ai",
		exposedOnHrbr: true
	},
	{
		key: "ai_embed",
		operation: "ai.embed",
		family: "ai",
		exposedOnHrbr: true
	},
	{
		key: "ai_classify",
		operation: "ai.classify",
		family: "ai",
		exposedOnHrbr: true
	},
	{
		key: "ai_rerank",
		operation: "ai.rerank",
		family: "ai",
		exposedOnHrbr: true
	},
	{
		key: "ai_models",
		operation: "ai.models",
		family: "ai",
		exposedOnHrbr: true
	}
];
const RUNTIME_ORBIT_PRIMITIVE_KEYS = RUNTIME_ORBIT_PRIMITIVES.map((primitive) => primitive.key);
const RUNTIME_ORBIT_OPERATION_NAMES = RUNTIME_ORBIT_PRIMITIVES.map((primitive) => primitive.operation);
const RuntimeOrbitProvider = Context.Service("@hrbr/runtime-provider-orbit/RuntimeOrbitProvider");
function runtimeOrbitDispatchKey(key) {
	return RUNTIME_ORBIT_DISPATCH_PREFIX + key;
}
const FORBIDDEN_KEY_SEGMENTS = /(?:^|\/)\.\.(?:\/|$)/;
function validateRuntimeOrbitUserKey(key) {
	if (!key || key.length === 0) throw new Error("orbit: key must be non-empty");
	if (key.length > 512) throw new Error("orbit: key must be ≤512 chars");
	if (FORBIDDEN_KEY_SEGMENTS.test(key)) throw new Error("orbit: key must not contain '..'");
	if (key.startsWith("/") || key.startsWith("\\")) throw new Error("orbit: key must not start with / or \\");
}
function scopeRuntimeOrbitCacheKey(workspaceId, userKey) {
	validateRuntimeOrbitUserKey(userKey);
	return "ws:" + workspaceId + ":" + userKey;
}
function safeMeta(extractMeta, args, result) {
	if (!extractMeta) return {};
	try {
		return extractMeta(args, result);
	} catch {
		return {};
	}
}
function recordUsage(sink, entry) {
	if (!sink) return;
	try {
		sink.record(entry);
	} catch {}
}
function traceRuntimeOrbitOperation(sink, operation, fn, extractMeta) {
	return async (args) => {
		const startedAt = Date.now();
		try {
			const result = await fn(args);
			recordUsage(sink, {
				operation,
				...safeMeta(extractMeta, args, result),
				durationMs: Date.now() - startedAt
			});
			return result;
		} catch (err) {
			recordUsage(sink, {
				operation,
				...safeMeta(extractMeta, args, void 0),
				durationMs: Date.now() - startedAt,
				error: err instanceof Error ? err.message : String(err)
			});
			throw err;
		}
	};
}
function defaultRuntimeOrbitCall(key, argsExpression) {
	return "__call(" + JSON.stringify(runtimeOrbitDispatchKey(key)) + ", " + argsExpression + ")";
}
function runtimeOrbitCall(options, key, argsExpression) {
	return (options.callExpression ?? defaultRuntimeOrbitCall)(key, argsExpression);
}
function defaultRuntimeOrbitJobsExpression() {
	return "typeof jobs === \"undefined\" ? new Proxy({}, { get: (_, name) => async () => { throw new Error(\"ORBIT_JOB_NOT_DEPLOYED: no WFP deployment for job '\" + String(name) + \"' in this workspace\"); } }) : jobs";
}
function createRuntimeOrbitSurfaceSource(options = {}) {
	const workspace = options.workspaceVariableName ?? "__hrbr_workspace";
	const orbit = options.orbitVariableName ?? "orbit";
	const hrbr = options.hrbrVariableName ?? "hrbr";
	const exposeOrbit = options.exposeOrbit ?? true;
	const exposeGlobalHrbr = options.exposeGlobalHrbr ?? true;
	const dbExpression = options.dbExpression ?? [
		"{",
		"    exec: (sql, params) => " + runtimeOrbitCall(options, "db_exec", "{ sql, params }") + ",",
		"    query: (sql, params) => " + runtimeOrbitCall(options, "db_query", "{ sql, params }") + ",",
		"    first: (sql, params) => " + runtimeOrbitCall(options, "db_first", "{ sql, params }") + ",",
		"    batch: (statements) => " + runtimeOrbitCall(options, "db_batch", "{ statements }") + ",",
		"  }"
	].join("\n");
	const lines = [
		"function __hrbr_tools_search_args(query, opts) {",
		"  if (query && typeof query === \"object\" && !Array.isArray(query)) return { ...query, ...(opts ?? {}) };",
		"  return { query, ...(opts ?? {}) };",
		"}",
		"const " + workspace + " = {",
		"  storage: {",
		"    put: (key, data, opts) => " + runtimeOrbitCall(options, "storage_put", "{ key, data, ...opts }") + ",",
		"    get: (key, opts) => " + runtimeOrbitCall(options, "storage_get", "{ key, ...opts }") + ",",
		"    list: (opts) => " + runtimeOrbitCall(options, "storage_list", "opts ?? {}") + ",",
		"    delete: (key) => " + runtimeOrbitCall(options, "storage_delete", "{ key }") + ",",
		"    url: (key) => " + runtimeOrbitCall(options, "storage_url", "{ key }") + ",",
		"  },",
		"  cache: {",
		"    get: (key) => " + runtimeOrbitCall(options, "cache_get", "{ key }") + ",",
		"    set: (key, value, ttl_seconds) => " + runtimeOrbitCall(options, "cache_set", "{ key, value, ttl_seconds }") + ",",
		"    delete: (key) => " + runtimeOrbitCall(options, "cache_delete", "{ key }") + ",",
		"  },",
		"  socket: {",
		"    url: (channel, opts) => " + runtimeOrbitCall(options, "socket_url", "{ channel, ...opts }") + ",",
		"    broadcast: (channel, event, opts) => " + runtimeOrbitCall(options, "socket_broadcast", "{ channel, event, ...opts }") + ",",
		"    stats: (channel) => " + runtimeOrbitCall(options, "socket_stats", "{ channel }") + ",",
		"  },",
		"  db: " + dbExpression + ",",
		"  tools: {",
		"    search: (query, opts) => " + runtimeOrbitCall(options, "tools_search", "__hrbr_tools_search_args(query, opts)") + ",",
		"    describe: (tool_id) => " + runtimeOrbitCall(options, "tools_describe", "{ tool_id }") + ",",
		"    namespaces: () => " + runtimeOrbitCall(options, "tools_namespaces", "{}") + ",",
		"  },",
		"  ai: {",
		"    run: (model, input, opts) => typeof model === \"string\" ? " + runtimeOrbitCall(options, "ai_run", "{ model, input, ...opts }") + " : " + runtimeOrbitCall(options, "ai_run", "{ input: model, ...input }") + ",",
		"    generate: (input, opts) => " + runtimeOrbitCall(options, "ai_generate", "{ input, opts }") + ",",
		"    summarize: (input, opts) => " + runtimeOrbitCall(options, "ai_summarize", "{ input, opts }") + ",",
		"    embed: (input, opts) => " + runtimeOrbitCall(options, "ai_embed", "{ input, opts }") + ",",
		"    classify: (input, opts) => " + runtimeOrbitCall(options, "ai_classify", "{ input, opts }") + ",",
		"    rerank: (input, opts) => " + runtimeOrbitCall(options, "ai_rerank", "{ input, opts }") + ",",
		"    models: (opts) => " + runtimeOrbitCall(options, "ai_models", "opts ?? {}") + ",",
		"  },",
		"};"
	];
	if (exposeOrbit) lines.push("const " + orbit + " = " + workspace + ";");
	if (options.exposeHrbr) {
		lines.push("const __hrbr_jobs = " + (options.jobsExpression ?? defaultRuntimeOrbitJobsExpression()) + ";", "const " + hrbr + " = Object.freeze({", "  storage: " + workspace + ".storage,", "  cache: " + workspace + ".cache,", "  db: " + workspace + ".db,", "  ai: " + workspace + ".ai,", "  tools: " + workspace + ".tools,", "  jobs: __hrbr_jobs,", "});");
		if (exposeGlobalHrbr) lines.push("globalThis." + hrbr + " = " + hrbr + ";");
	}
	return lines.join("\n");
}
function createRuntimeOrbitPreamble(options = {}) {
	return createRuntimeOrbitSurfaceSource({ exposeHrbr: options.hrbr });
}
function preparedRuntimeOrbitProvider(key = RUNTIME_ORBIT_DEFAULT_CAPABILITY_KEY, metadata) {
	return {
		kind: "orbit",
		key,
		...metadata ? { metadata } : {}
	};
}
function runtimeOrbitProviderMetadata(metadata) {
	return {
		...metadata ?? {},
		primitiveCount: RUNTIME_ORBIT_PRIMITIVES.length
	};
}
const RuntimeOrbitProviderLive = Layer.succeed(RuntimeOrbitProvider, { prepare: (input) => Effect.succeed(preparedRuntimeOrbitProvider(input?.key, runtimeOrbitProviderMetadata(input?.metadata))) });
const RuntimeOrbitCapabilityProvider = {
	kind: "orbit",
	prepare: (input) => Effect.succeed(preparedRuntimeOrbitProvider(input.key, runtimeOrbitProviderMetadata(input.metadata)))
};
//#endregion
export { RUNTIME_ORBIT_CACHE_KEY_PREFIX, RUNTIME_ORBIT_DEFAULT_CAPABILITY_KEY, RUNTIME_ORBIT_DISPATCH_PREFIX, RUNTIME_ORBIT_OPERATION_NAMES, RUNTIME_ORBIT_PRIMITIVES, RUNTIME_ORBIT_PRIMITIVE_KEYS, RuntimeOrbitCapabilityProvider, RuntimeOrbitProvider, RuntimeOrbitProviderLive, createRuntimeOrbitPreamble, createRuntimeOrbitSurfaceSource, runtimeOrbitDispatchKey, scopeRuntimeOrbitCacheKey, traceRuntimeOrbitOperation, validateRuntimeOrbitUserKey };

//# sourceMappingURL=orbit-provider.mjs.map