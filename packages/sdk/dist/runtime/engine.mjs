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
const RuntimePlanner = Context.Service("@hrbr/runtime/RuntimePlanner");
Context.Service("@hrbr/runtime/RuntimeDispatchRouter");
const RuntimeProviderRegistry = Context.Service("@hrbr/runtime/RuntimeProviderRegistry");
const RuntimeHost = Context.Service("@hrbr/runtime/RuntimeHost");
const RuntimeState = Context.Service("@hrbr/runtime/RuntimeState");
Context.Service("@hrbr/runtime/RuntimeArtifacts");
const RuntimeExecutor = Context.Service("@hrbr/runtime/RuntimeExecutor");
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
makeTelemetryLayer();
//#endregion
//#region ../runtime-engine/src/index.ts
const requirementKey = (requirement) => requirement.kind + ":" + requirement.key;
const runtimeProviderRequirements = (plan) => {
	const requirements = /* @__PURE__ */ new Map();
	for (const namespace of plan.requiredNamespaces) {
		const requirement = {
			kind: namespace.bindingKind,
			key: namespace.namespace,
			optional: namespace.optional
		};
		requirements.set(requirementKey(requirement), requirement);
	}
	for (const capability of plan.capabilities) {
		const requirement = {
			kind: capability.kind,
			key: capability.key,
			metadata: capability.metadata
		};
		requirements.set(requirementKey(requirement), requirement);
	}
	return Array.from(requirements.values());
};
const normalizePreparedProviders = (prepared) => {
	if (Array.isArray(prepared)) return prepared;
	return [prepared];
};
const prepareRequirement = (providerByKind, requirement, plan, context) => {
	const provider = providerByKind.get(requirement.kind);
	if (!provider) {
		if (requirement.optional) return Effect.succeed([]);
		return Effect.fail(new RuntimeError("provider", "No runtime provider registered for " + requirement.kind + " capability", requirement));
	}
	const input = {
		kind: requirement.kind,
		key: requirement.key,
		plan,
		context,
		metadata: requirement.metadata,
		optional: requirement.optional
	};
	return provider.prepare(input).pipe(Effect.map(normalizePreparedProviders));
};
const disposePreparedProviders = (providerByKind, prepared) => Effect.gen(function* () {
	for (const preparedProvider of prepared.providers) {
		const provider = providerByKind.get(preparedProvider.kind);
		if (!provider?.dispose) continue;
		yield* provider.dispose(preparedProvider);
	}
});
const releasePreparedProviders = (providerByKind, prepared) => disposePreparedProviders(providerByKind, prepared).pipe(Effect.catch(() => Effect.void));
const makeRuntimeProviderRegistry = (providers) => {
	const providerByKind = /* @__PURE__ */ new Map();
	for (const provider of providers) providerByKind.set(provider.kind, provider);
	return {
		prepare: (plan, context) => Effect.gen(function* () {
			const prepared = [];
			for (const requirement of runtimeProviderRequirements(plan)) prepared.push(...yield* prepareRequirement(providerByKind, requirement, plan, context));
			return { providers: prepared };
		}),
		prepareScoped: (plan, context) => Effect.gen(function* () {
			const prepared = [];
			for (const requirement of runtimeProviderRequirements(plan)) {
				const acquired = yield* Effect.acquireRelease(prepareRequirement(providerByKind, requirement, plan, context), (preparedProviders) => releasePreparedProviders(providerByKind, { providers: preparedProviders }));
				prepared.push(...acquired);
			}
			return { providers: prepared };
		}),
		dispose: (prepared) => disposePreparedProviders(providerByKind, prepared)
	};
};
const RuntimeProviderRegistryLive = (providers) => Layer.succeed(RuntimeProviderRegistry, makeRuntimeProviderRegistry(providers));
const RuntimeExecutorLive = Layer.effect(RuntimeExecutor, Effect.gen(function* () {
	const planner = yield* RuntimePlanner;
	const providerRegistry = yield* RuntimeProviderRegistry;
	const host = yield* RuntimeHost;
	const state = yield* RuntimeState;
	const telemetry = yield* Telemetry;
	return { execute: (request, context) => Effect.gen(function* () {
		const startedAt = Date.now();
		const planning = yield* planner.plan(request, context);
		const plan = planning.runtimePlan;
		yield* state.record({
			name: "runtime.plan.created",
			time: new Date(startedAt).toISOString(),
			detail: plan
		});
		const run = Effect.scoped(Effect.gen(function* () {
			const prepared = yield* providerRegistry.prepareScoped(plan, context);
			const result = yield* host.invoke({
				request,
				context,
				plan,
				hostPlan: planning.hostPlan,
				providers: prepared
			});
			yield* state.record({
				name: "runtime.host.finished",
				time: (/* @__PURE__ */ new Date()).toISOString(),
				detail: { mode: result.mode }
			});
			return {
				...result,
				timings: {
					...result.timings,
					totalMs: Date.now() - startedAt
				}
			};
		})).pipe(Effect.ensuring(state.flush().pipe(Effect.catch(() => Effect.void))));
		return yield* telemetry.span({
			name: "runtime.execute",
			attributes: { mode: request.mode }
		}, run);
	}) };
}));
//#endregion
export { RuntimeExecutorLive, RuntimeProviderRegistryLive, makeRuntimeProviderRegistry };

//# sourceMappingURL=engine.mjs.map