//#region src/telemetry.d.ts
type TelemetryMetadata = Readonly<Record<string, unknown>>;
type TelemetryRedactor = (value: unknown, key?: string | undefined) => unknown;
type MaybePromise<T> = T | Promise<T>;
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
  readonly event?: ((event: TelemetryEvent) => MaybePromise<void>) | undefined;
  readonly warning?: ((warning: TelemetryWarning) => MaybePromise<void>) | undefined;
}
interface TelemetryOptions {
  readonly sink?: TelemetrySink | undefined;
  readonly event?: ((event: TelemetryEvent) => MaybePromise<void>) | undefined;
  readonly warning?: ((warning: TelemetryWarning) => MaybePromise<void>) | undefined;
  readonly span?: (<A>(span: TelemetrySpan, operation: () => Promise<A>) => MaybePromise<A>) | undefined;
  readonly now?: (() => number) | undefined;
  readonly redact?: TelemetryRedactor | undefined;
}
interface Telemetry {
  readonly event: (event: TelemetryEvent) => MaybePromise<void>;
  readonly warning: (warning: TelemetryWarning) => MaybePromise<void>;
  readonly span: <A>(span: TelemetrySpan, operation: () => Promise<A>) => MaybePromise<A>;
  readonly redact: (value: unknown) => unknown;
}
declare const makeTelemetry: (options?: TelemetryOptions) => Telemetry;
//#endregion
export { MaybePromise, Telemetry, TelemetryEvent, TelemetryMetadata, TelemetryOptions, TelemetryRedactor, TelemetrySink, TelemetrySpan, TelemetryWarning, makeTelemetry };
//# sourceMappingURL=telemetry.d.mts.map