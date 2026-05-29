import { Context, Effect, Layer } from "effect";

//#region ../telemetry/src/index.d.ts
type TelemetryMetadata = Readonly<Record<string, unknown>>;
type TelemetryRedactor = (value: unknown, key?: string | undefined) => unknown;
interface TelemetryEvent {
  readonly name: string;
  readonly time?: string | undefined;
  readonly attributes?: TelemetryMetadata | undefined;
  readonly durationMs?: number | undefined;
}
interface TelemetryWarning {
  readonly code: string;
  readonly message: string;
  readonly attributes?: TelemetryMetadata | undefined;
}
interface TelemetrySpan {
  readonly name: string;
  readonly attributes?: TelemetryMetadata | undefined;
}
interface TelemetrySink {
  readonly event?: ((event: TelemetryEvent) => Effect.Effect<void, unknown>) | undefined;
  readonly warning?: ((warning: TelemetryWarning) => Effect.Effect<void, unknown>) | undefined;
}
interface TelemetryOptions {
  readonly sink?: TelemetrySink | undefined;
  readonly now?: (() => number) | undefined;
  readonly redact?: TelemetryRedactor | undefined;
}
interface Telemetry {
  readonly event: (event: TelemetryEvent) => Effect.Effect<void>;
  readonly warning: (warning: TelemetryWarning) => Effect.Effect<void>;
  readonly span: <A, E, R>(span: TelemetrySpan, effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
  readonly redact: (value: unknown) => unknown;
}
declare const Telemetry: Context.Service<Telemetry, Telemetry>;
declare const redactTelemetryMetadata: (metadata: TelemetryMetadata | undefined, redact: TelemetryRedactor) => TelemetryMetadata | undefined;
declare const makeTelemetry: (options?: TelemetryOptions) => Telemetry;
declare const makeTelemetryLayer: (options?: TelemetryOptions) => Layer.Layer<Telemetry, never, never>;
declare const TelemetryNoopLive: Layer.Layer<Telemetry, never, never>;
type RuntimeTelemetryEvent = TelemetryEvent;
type RuntimeTelemetryWarning = TelemetryWarning;
type RuntimeTelemetrySpan = TelemetrySpan;
type RuntimeTelemetrySink = TelemetrySink;
type RuntimeTelemetryOptions = TelemetryOptions;
type RuntimeTelemetryRedactor = TelemetryRedactor;
type RuntimeTelemetry = Telemetry;
declare const RuntimeTelemetry: Context.Service<Telemetry, Telemetry>;
declare const makeRuntimeTelemetry: (options?: TelemetryOptions) => Telemetry;
declare const makeRuntimeTelemetryLayer: (options?: TelemetryOptions) => Layer.Layer<Telemetry, never, never>;
declare const RuntimeTelemetryNoopLive: Layer.Layer<Telemetry, never, never>;
//#endregion
export { RuntimeTelemetry, RuntimeTelemetryEvent, RuntimeTelemetryNoopLive, RuntimeTelemetryOptions, RuntimeTelemetryRedactor, RuntimeTelemetrySink, RuntimeTelemetrySpan, RuntimeTelemetryWarning, Telemetry, TelemetryEvent, TelemetryMetadata, TelemetryNoopLive, TelemetryOptions, TelemetryRedactor, TelemetrySink, TelemetrySpan, TelemetryWarning, makeRuntimeTelemetry, makeRuntimeTelemetryLayer, makeTelemetry, makeTelemetryLayer, redactTelemetryMetadata };
//# sourceMappingURL=telemetry.d.mts.map