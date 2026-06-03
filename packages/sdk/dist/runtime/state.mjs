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
Context.Service("@hrbr/runtime/RuntimePlanner");
Context.Service("@hrbr/runtime/RuntimeDispatchRouter");
Context.Service("@hrbr/runtime/RuntimeProviderRegistry");
Context.Service("@hrbr/runtime/RuntimeHost");
Context.Service("@hrbr/runtime/RuntimeState");
Context.Service("@hrbr/runtime/RuntimeArtifacts");
Context.Service("@hrbr/runtime/RuntimeExecutor");
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
const RuntimeStructuredStateEvent = Schema.Union([
	RuntimeRunStateEvent,
	RuntimeToolCallStateEvent,
	RuntimeOrbitUsageStateEvent,
	RuntimeWarningStateEvent,
	RuntimeTimingStateEvent,
	RuntimeFinalResultStateEvent
]);
const RuntimeStatePort = Context.Service("@hrbr/runtime-state/RuntimeStatePort");
function createRuntimeStateWriteQueue() {
	const writes = [];
	return {
		push: (write) => {
			writes.push(write);
		},
		drain: () => writes.splice(0, writes.length),
		size: () => writes.length,
		snapshot: () => writes.slice()
	};
}
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
function makeLocalRuntimeStatePort() {
	const events = [];
	let flushCount = 0;
	return {
		layer: Layer.succeed(RuntimeStatePort, {
			record: (event) => Effect.sync(() => {
				events.push(event);
			}),
			flush: () => Effect.sync(() => {
				flushCount += 1;
			})
		}),
		snapshot: () => ({
			events: events.slice(),
			flushCount
		})
	};
}
//#endregion
export { RuntimeFinalResultStateEvent, RuntimeOrbitUsageStateEvent, RuntimeRunStateEvent, RuntimeStateBaseEvent, RuntimeStateEventKind, RuntimeStatePort, RuntimeStructuredStateEvent, RuntimeTimingStateEvent, RuntimeToolCallStateEvent, RuntimeWarningStateEvent, createRuntimeStateWriteQueue, flushRuntimeStateWriteQueue, makeLocalRuntimeStatePort };

//# sourceMappingURL=state.mjs.map