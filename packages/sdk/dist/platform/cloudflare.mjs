import { Cause, Context, Effect, Layer, Schema } from "effect";
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
const RuntimeState = Context.Service("@hrbr/runtime/RuntimeState");
const RuntimeArtifacts = Context.Service("@hrbr/runtime/RuntimeArtifacts");
Context.Service("@hrbr/runtime/RuntimeExecutor");
//#endregion
//#region ../runtime-artifacts/src/index.ts
const RuntimeArtifactKind = Schema.Literals([
	"file",
	"image",
	"output"
]);
Schema.Struct({
	key: Schema.String,
	url: Schema.String,
	kind: RuntimeArtifactKind,
	contentType: Schema.String,
	sizeBytes: Schema.Number,
	metadata: Schema.optional(RuntimeMetadata)
});
const RuntimeArtifactStore = Context.Service("@hrbr/runtime-artifacts/RuntimeArtifactStore");
const RuntimeArtifactStoreLive = (writer) => Layer.succeed(RuntimeArtifactStore, { write: (artifact) => Effect.tryPromise({
	try: async () => writer.write(artifact),
	catch: (cause) => new RuntimeError("artifact", "Runtime artifact write failed", {
		contentType: artifact.contentType,
		kind: artifact.kind,
		cause
	})
}) });
Object.fromEntries([..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"].map((char, index) => [char, index]));
function runtimeArtifactExtensionFromContentType(contentType) {
	return contentType.split("/")[1]?.replace("+xml", ".svg") ?? "png";
}
//#endregion
//#region ../runtime-state/src/index.ts
const RuntimeStateEventKind = Schema.Literals([
	"run_event",
	"tool_call",
	"orbit_usage",
	"warning",
	"timing",
	"final_result"
]);
const RuntimeStateBaseEvent = Schema.Struct({
	kind: RuntimeStateEventKind,
	time: Schema.String,
	runId: Schema.String,
	scopeId: Schema.String,
	agentId: Schema.optional(Schema.String),
	rootSpanId: Schema.optional(Schema.String),
	metadata: Schema.optional(RuntimeMetadata)
});
const RuntimeRunStateEvent = Schema.Struct({
	...RuntimeStateBaseEvent.fields,
	kind: Schema.Literal("run_event"),
	name: Schema.String,
	status: Schema.optional(Schema.String)
});
const RuntimeToolCallStateEvent = Schema.Struct({
	...RuntimeStateBaseEvent.fields,
	kind: Schema.Literal("tool_call"),
	sourceId: Schema.String,
	sourceNamespace: Schema.String,
	toolId: Schema.String,
	title: Schema.optional(Schema.String),
	status: Schema.String,
	durationMs: Schema.optional(Schema.Number),
	input: Schema.optional(Schema.Unknown),
	output: Schema.optional(Schema.Unknown),
	error: Schema.optional(Schema.String),
	contentType: Schema.optional(Schema.String),
	upstreamStatus: Schema.optional(Schema.Number)
});
const RuntimeOrbitUsageStateEvent = Schema.Struct({
	...RuntimeStateBaseEvent.fields,
	kind: Schema.Literal("orbit_usage"),
	operation: Schema.String,
	key: Schema.optional(Schema.String),
	model: Schema.optional(Schema.String),
	sizeBytes: Schema.optional(Schema.Number),
	durationMs: Schema.Number,
	error: Schema.optional(Schema.String)
});
const RuntimeWarningStateEvent = Schema.Struct({
	...RuntimeStateBaseEvent.fields,
	kind: Schema.Literal("warning"),
	namespace: Schema.optional(Schema.String),
	tool: Schema.optional(Schema.String),
	message: Schema.String
});
const RuntimeTimingStateEvent = Schema.Struct({
	...RuntimeStateBaseEvent.fields,
	kind: Schema.Literal("timing"),
	name: Schema.String,
	durationMs: Schema.Number
});
const RuntimeFinalResultStateEvent = Schema.Struct({
	...RuntimeStateBaseEvent.fields,
	kind: Schema.Literal("final_result"),
	status: Schema.Literals([
		"completed",
		"failed",
		"cancelled"
	]),
	durationMs: Schema.optional(Schema.Number),
	result: Schema.optional(Schema.Unknown),
	error: Schema.optional(Schema.String),
	artifactCount: Schema.optional(Schema.Number)
});
Schema.Union([
	RuntimeRunStateEvent,
	RuntimeToolCallStateEvent,
	RuntimeOrbitUsageStateEvent,
	RuntimeWarningStateEvent,
	RuntimeTimingStateEvent,
	RuntimeFinalResultStateEvent
]);
const RuntimeStatePort = Context.Service("@hrbr/runtime-state/RuntimeStatePort");
function flushRuntimeStateWriteQueue(options) {
	const batch = options.queue.drain();
	if (batch.length === 0) {
		options.onEmpty?.();
		return;
	}
	const now = options.now ?? Date.now;
	const startedAt = now();
	const work = Promise.resolve().then(() => options.flush(batch)).then(() => {
		options.onSuccess?.({
			batchSize: batch.length,
			durationMs: now() - startedAt
		});
	}, (error) => {
		options.onFailure?.(error, {
			batchSize: batch.length,
			durationMs: now() - startedAt
		});
	});
	if (options.schedule) options.schedule(work);
}
//#endregion
//#region ../telemetry/src/index.ts
const Telemetry = Context.Service("@hrbr/Telemetry");
const identityRedactor = (value) => value;
const redactTelemetryMetadata = (metadata, redact) => {
	if (!metadata) return void 0;
	return Object.fromEntries(Object.entries(metadata).map(([key, value]) => [key, redact(value, key)]));
};
const withTime = (event, now, redact) => ({
	...event,
	time: event.time ?? new Date(now()).toISOString(),
	attributes: redactTelemetryMetadata(event.attributes, redact)
});
const redactWarning = (warning, redact) => ({
	...warning,
	attributes: redactTelemetryMetadata(warning.attributes, redact)
});
const bestEffort = (effect) => effect.pipe(Effect.asVoid, Effect.catchCause(() => Effect.void));
const makeTelemetry = (options = {}) => {
	const sink = options.sink;
	const now = options.now ?? Date.now;
	const redact = options.redact ?? identityRedactor;
	const event = (input) => {
		const prepared = withTime(input, now, redact);
		return bestEffort(sink?.event?.(prepared) ?? Effect.void);
	};
	const warning = (input) => {
		const prepared = redactWarning(input, redact);
		return bestEffort(sink?.warning?.(prepared) ?? Effect.void);
	};
	const span = (input, effect) => {
		const startedAt = now();
		const baseAttributes = redactTelemetryMetadata(input.attributes, redact);
		return Effect.gen(function* () {
			yield* bestEffort(event({
				name: input.name + ".start",
				attributes: {
					...baseAttributes ?? {},
					phase: "start"
				}
			}));
			return yield* effect.pipe(Effect.tap(() => bestEffort(event({
				name: input.name + ".finish",
				durationMs: now() - startedAt,
				attributes: {
					...baseAttributes ?? {},
					phase: "finish",
					outcome: "success"
				}
			}))), Effect.catchCause((cause) => Effect.gen(function* () {
				yield* bestEffort(event({
					name: input.name + ".finish",
					durationMs: now() - startedAt,
					attributes: {
						...baseAttributes ?? {},
						phase: "finish",
						outcome: "failure",
						cause: Cause.pretty(cause).slice(0, 500)
					}
				}));
				return yield* Effect.failCause(cause);
			})));
		});
	};
	return {
		event,
		warning,
		span,
		redact
	};
};
const makeTelemetryLayer = (options = {}) => Layer.succeed(Telemetry, makeTelemetry(options));
const TelemetryNoopLive = makeTelemetryLayer();
//#endregion
//#region ../platform-cloudflare/src/runtime.ts
const cloudflareRuntimeStackSpec = (spec) => spec;
let generatedArtifactId = 0;
const runtimeArtifactId = () => {
	generatedArtifactId += 1;
	return Date.now().toString(36) + "-" + String(generatedArtifactId);
};
const trimPathSlashes = (value) => value.replace(/^\/+|\/+$/g, "");
const artifactKey = (options, artifact) => {
	const explicitKey = options.key?.(artifact);
	if (explicitKey) return trimPathSlashes(explicitKey);
	const prefix = trimPathSlashes(options.keyPrefix);
	const extension = trimPathSlashes(artifact.extension).replace(/\//g, "-");
	const fileName = (options.id?.() ?? runtimeArtifactId()) + "." + extension;
	return prefix.length > 0 ? prefix + "/" + fileName : fileName;
};
const runtimeArtifactKind = (kind) => {
	if (kind === "image" || kind === "output" || kind === "file") return kind;
	return "file";
};
const runtimeArtifactPointerToRef = (pointer) => ({
	id: pointer.key,
	kind: pointer.kind,
	contentType: pointer.contentType,
	url: pointer.url,
	sizeBytes: pointer.sizeBytes,
	...pointer.metadata ? { metadata: pointer.metadata } : {}
});
const runtimeArtifactWriteToBinaryWrite = (artifact) => ({
	kind: runtimeArtifactKind(artifact.kind),
	contentType: artifact.contentType,
	extension: runtimeArtifactExtensionFromContentType(artifact.contentType),
	body: artifact.body,
	...artifact.metadata ? { metadata: artifact.metadata } : {}
});
function scheduleCloudflareRuntimeWork(work, context) {
	if (context?.waitUntil) {
		context.waitUntil(work);
		return;
	}
}
function makeCloudflareRuntimeArtifactWriter(options) {
	return { write: async (artifact) => {
		const key = artifactKey(options, artifact);
		await options.bucket.put(key, artifact.body, { httpMetadata: { contentType: artifact.contentType } });
		return {
			key,
			url: options.publicUrl?.(key) ?? key,
			kind: artifact.kind,
			contentType: artifact.contentType,
			sizeBytes: artifact.body.byteLength,
			...artifact.metadata ? { metadata: artifact.metadata } : {}
		};
	} };
}
const makeCloudflareRuntimeArtifactStoreLayer = (options) => RuntimeArtifactStoreLive(makeCloudflareRuntimeArtifactWriter(options));
const makeCloudflareRuntimeTelemetryLayer = (options = {}) => makeTelemetryLayer(options);
const CloudflareRuntimeTelemetryNoopLive = TelemetryNoopLive;
const makeCloudflareRuntimeArtifactsLayer = (options) => {
	const writer = makeCloudflareRuntimeArtifactWriter(options);
	return Layer.succeed(RuntimeArtifacts, { put: (artifact) => Effect.tryPromise({
		try: async () => runtimeArtifactPointerToRef(await writer.write(runtimeArtifactWriteToBinaryWrite(artifact))),
		catch: (cause) => new RuntimeError("artifact", "Cloudflare runtime artifact write failed", {
			kind: artifact.kind,
			contentType: artifact.contentType,
			cause
		})
	}) });
};
function flushCloudflareRuntimeStateWrites(options) {
	flushRuntimeStateWriteQueue({
		queue: options.queue,
		flush: async (writes) => {
			await options.db.batch(writes);
		},
		now: options.now,
		schedule: (work) => scheduleCloudflareRuntimeWork(work, options.context),
		onEmpty: options.onEmpty,
		onSuccess: options.onSuccess,
		onFailure: options.onFailure
	});
}
const makeCloudflareRuntimeStateLayer = (options) => Layer.succeed(RuntimeState, {
	record: (event) => Effect.sync(() => {
		options.queue.push(options.mapEvent(event));
	}),
	flush: () => Effect.sync(() => {
		flushCloudflareRuntimeStateWrites(options);
	})
});
const makeCloudflareRuntimeStatePortLayer = (options) => Layer.succeed(RuntimeStatePort, {
	record: (event) => Effect.sync(() => {
		options.queue.push(options.mapEvent(event));
	}),
	flush: () => Effect.sync(() => {
		flushCloudflareRuntimeStateWrites(options);
	})
});
//#endregion
//#region ../platform-cloudflare/src/stack.ts
const defaultHarborPlatformCloudflareBindingNames = {
	database: "DB",
	artifactBucket: "BUCKET",
	cacheNamespace: "KV",
	harborExecWorkflow: "HARBOR_EXEC_WORKFLOW",
	toolIndexWorkflow: "TOOL_INDEX_WORKFLOW",
	openApiImportWorkflow: "OPENAPI_IMPORT_WORKFLOW"
};
function harborPlatformCloudflareBindingNames(overrides = {}) {
	return {
		database: overrides.database ?? defaultHarborPlatformCloudflareBindingNames.database,
		artifactBucket: overrides.artifactBucket ?? defaultHarborPlatformCloudflareBindingNames.artifactBucket,
		cacheNamespace: overrides.cacheNamespace ?? defaultHarborPlatformCloudflareBindingNames.cacheNamespace,
		harborExecWorkflow: Object.hasOwn(overrides, "harborExecWorkflow") ? overrides.harborExecWorkflow : defaultHarborPlatformCloudflareBindingNames.harborExecWorkflow,
		toolIndexWorkflow: Object.hasOwn(overrides, "toolIndexWorkflow") ? overrides.toolIndexWorkflow : defaultHarborPlatformCloudflareBindingNames.toolIndexWorkflow,
		openApiImportWorkflow: Object.hasOwn(overrides, "openApiImportWorkflow") ? overrides.openApiImportWorkflow : defaultHarborPlatformCloudflareBindingNames.openApiImportWorkflow,
		sessionsObject: Object.hasOwn(overrides, "sessionsObject") ? overrides.sessionsObject : defaultHarborPlatformCloudflareBindingNames.sessionsObject
	};
}
function createHarborPlatformCloudflareStackSpec(options) {
	return {
		name: options.stackName,
		bindings: harborPlatformCloudflareBindingNames(options.bindingNames)
	};
}
const defaultHarborPlatformCloudflareResourceIds = (stackName) => ({
	apiWorker: stackName + "-api",
	database: stackName + "-db",
	artifactBucket: stackName + "-artifacts",
	cacheNamespace: stackName + "-kv",
	harborExecWorkflow: stackName + "-exec-workflow",
	toolIndexWorkflow: stackName + "-tool-index-workflow",
	openApiImportWorkflow: stackName + "-openapi-import-workflow",
	sessionsObject: stackName + "-sessions"
});
const resolveHarborPlatformCloudflareResourceIds = (stackName, overrides = {}) => {
	const defaults = defaultHarborPlatformCloudflareResourceIds(stackName);
	return {
		apiWorker: overrides.apiWorker ?? defaults.apiWorker,
		database: overrides.database ?? defaults.database,
		artifactBucket: overrides.artifactBucket ?? defaults.artifactBucket,
		cacheNamespace: overrides.cacheNamespace ?? defaults.cacheNamespace,
		harborExecWorkflow: overrides.harborExecWorkflow ?? defaults.harborExecWorkflow,
		toolIndexWorkflow: overrides.toolIndexWorkflow ?? defaults.toolIndexWorkflow,
		openApiImportWorkflow: overrides.openApiImportWorkflow ?? defaults.openApiImportWorkflow,
		sessionsObject: overrides.sessionsObject ?? defaults.sessionsObject
	};
};
const workflowBindingName = (bindings, key) => {
	if (key === "harborExec") return bindings.harborExecWorkflow;
	if (key === "toolIndex") return bindings.toolIndexWorkflow;
	return bindings.openApiImportWorkflow;
};
const workflowResourceId = (resources, key) => {
	if (key === "harborExec") return resources.harborExecWorkflow;
	if (key === "toolIndex") return resources.toolIndexWorkflow;
	return resources.openApiImportWorkflow;
};
const definedBindingNames = (bindings) => [
	bindings.database,
	bindings.artifactBucket,
	bindings.cacheNamespace,
	bindings.harborExecWorkflow,
	bindings.toolIndexWorkflow,
	bindings.openApiImportWorkflow,
	bindings.sessionsObject
].filter((binding) => typeof binding === "string" && binding.length > 0);
const duplicateValues = (values) => {
	const seen = /* @__PURE__ */ new Set();
	const duplicates = /* @__PURE__ */ new Set();
	for (const value of values) {
		if (seen.has(value)) duplicates.add(value);
		seen.add(value);
	}
	return Array.from(duplicates).sort();
};
function createHarborPlatformCloudflareStackDeclaration(options) {
	const spec = createHarborPlatformCloudflareStackSpec(options);
	const resourceIds = resolveHarborPlatformCloudflareResourceIds(options.stackName, options.resourceIds);
	const workflowEntries = Object.entries(options.workflows ?? {});
	const workflowResources = {};
	for (const [key, workflow] of workflowEntries) {
		const binding = workflowBindingName(spec.bindings, key);
		workflowResources[key] = {
			id: workflowResourceId(resourceIds, key),
			kind: "workflow",
			binding,
			metadata: {
				workflowName: workflow.workflowName,
				className: workflow.className
			}
		};
	}
	const requiredBindings = [
		spec.bindings.database,
		spec.bindings.artifactBucket,
		spec.bindings.cacheNamespace,
		...workflowEntries.flatMap(([key]) => {
			const binding = workflowBindingName(spec.bindings, key);
			return binding ? [binding] : [];
		}),
		...spec.bindings.sessionsObject ? [spec.bindings.sessionsObject] : []
	];
	const warnings = [...spec.bindings.sessionsObject ? ["sessionsObject declares a future Durable Object binding; platform-cloudflare does not provision the namespace yet."] : []];
	return {
		spec,
		resources: {
			apiWorker: {
				id: resourceIds.apiWorker,
				kind: "worker",
				metadata: { main: options.apiWorker.main }
			},
			database: {
				id: resourceIds.database,
				kind: "d1_database",
				binding: spec.bindings.database
			},
			artifactBucket: {
				id: resourceIds.artifactBucket,
				kind: "r2_bucket",
				binding: spec.bindings.artifactBucket
			},
			cacheNamespace: {
				id: resourceIds.cacheNamespace,
				kind: "kv_namespace",
				binding: spec.bindings.cacheNamespace
			},
			workflows: workflowResources,
			...spec.bindings.sessionsObject ? { sessionsObject: {
				id: resourceIds.sessionsObject,
				kind: "durable_object_namespace",
				binding: spec.bindings.sessionsObject
			} } : {}
		},
		requiredBindings,
		warnings
	};
}
function validateHarborPlatformCloudflareStackDeclaration(declaration) {
	const errors = [];
	const warnings = [...declaration.warnings];
	if (declaration.spec.name.trim().length === 0) errors.push("stackName must be a non-empty string.");
	const workerMain = declaration.resources.apiWorker.metadata?.main;
	if (!workerMain || workerMain.trim().length === 0) errors.push("apiWorker.main must be a non-empty path.");
	const duplicateBindings = duplicateValues(definedBindingNames(declaration.spec.bindings));
	for (const binding of duplicateBindings) errors.push("binding name must be unique: " + binding);
	const resourceIds = [
		declaration.resources.apiWorker.id,
		declaration.resources.database.id,
		declaration.resources.artifactBucket.id,
		declaration.resources.cacheNamespace.id,
		...Object.values(declaration.resources.workflows).map((resource) => resource.id),
		...declaration.resources.sessionsObject ? [declaration.resources.sessionsObject.id] : []
	];
	for (const id of duplicateValues(resourceIds)) errors.push("resource id must be unique: " + id);
	for (const [key, resource] of Object.entries(declaration.resources.workflows)) if (!resource.binding) errors.push(key + " workflow resource requires a workflow binding name.");
	if (declaration.requiredBindings.length === 0) errors.push("at least one platform binding must be declared.");
	return {
		ok: errors.length === 0,
		errors,
		warnings
	};
}
//#endregion
export { CloudflareRuntimeTelemetryNoopLive, cloudflareRuntimeStackSpec, createHarborPlatformCloudflareStackDeclaration, createHarborPlatformCloudflareStackSpec, defaultHarborPlatformCloudflareBindingNames, defaultHarborPlatformCloudflareResourceIds, flushCloudflareRuntimeStateWrites, harborPlatformCloudflareBindingNames, makeCloudflareRuntimeArtifactStoreLayer, makeCloudflareRuntimeArtifactWriter, makeCloudflareRuntimeArtifactsLayer, makeCloudflareRuntimeStateLayer, makeCloudflareRuntimeStatePortLayer, makeCloudflareRuntimeTelemetryLayer, resolveHarborPlatformCloudflareResourceIds, scheduleCloudflareRuntimeWork, validateHarborPlatformCloudflareStackDeclaration };

//# sourceMappingURL=cloudflare.mjs.map