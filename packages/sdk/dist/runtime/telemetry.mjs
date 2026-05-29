import { Cause, Context, Effect, Layer } from "effect";
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
const RuntimeTelemetry = Telemetry;
const makeRuntimeTelemetry = makeTelemetry;
const makeRuntimeTelemetryLayer = makeTelemetryLayer;
const RuntimeTelemetryNoopLive = TelemetryNoopLive;
//#endregion
export { RuntimeTelemetry, RuntimeTelemetryNoopLive, Telemetry, TelemetryNoopLive, makeRuntimeTelemetry, makeRuntimeTelemetryLayer, makeTelemetry, makeTelemetryLayer, redactTelemetryMetadata };

//# sourceMappingURL=telemetry.mjs.map