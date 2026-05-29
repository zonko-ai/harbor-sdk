import { Context, Effect, Layer, Schema } from "effect";

//#region ../runtime-core/src/index.d.ts
declare const RuntimeMetadata: Schema.$Record<Schema.String, Schema.Unknown>;
type RuntimeMetadata = typeof RuntimeMetadata.Type;
type RuntimeErrorReason = 'validation' | 'planning' | 'provider' | 'host' | 'state' | 'artifact' | 'timeout' | 'internal';
declare class RuntimeError extends Error {
  readonly reason: RuntimeErrorReason;
  readonly details?: unknown | undefined;
  readonly _tag = "RuntimeError";
  constructor(reason: RuntimeErrorReason, message: string, details?: unknown | undefined);
}
//#endregion
//#region ../runtime-artifacts/src/index.d.ts
declare const RuntimeArtifactKind: Schema.Literals<readonly ["file", "image", "output"]>;
type RuntimeArtifactKind = typeof RuntimeArtifactKind.Type;
declare const RuntimeArtifactPointer: Schema.Struct<{
  readonly key: Schema.String;
  readonly url: Schema.String;
  readonly kind: Schema.Literals<readonly ["file", "image", "output"]>;
  readonly contentType: Schema.String;
  readonly sizeBytes: Schema.Number;
  readonly metadata: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
}>;
type RuntimeArtifactPointer = typeof RuntimeArtifactPointer.Type;
interface RuntimeArtifactBinaryWrite {
  readonly kind: RuntimeArtifactKind;
  readonly contentType: string;
  readonly extension: string;
  readonly body: Uint8Array;
  readonly metadata?: RuntimeMetadata | undefined;
}
interface RuntimeArtifactBinaryWriter {
  readonly write: (artifact: RuntimeArtifactBinaryWrite) => Promise<RuntimeArtifactPointer> | RuntimeArtifactPointer;
}
interface RuntimeArtifactStore {
  readonly write: (artifact: RuntimeArtifactBinaryWrite) => Effect.Effect<RuntimeArtifactPointer, RuntimeError>;
}
declare const RuntimeArtifactStore: Context.Service<RuntimeArtifactStore, RuntimeArtifactStore>;
declare const RuntimeArtifactStoreLive: (writer: RuntimeArtifactBinaryWriter) => Layer.Layer<RuntimeArtifactStore, never, never>;
declare const RUNTIME_DATA_URI_IMAGE_RE: RegExp;
declare const RUNTIME_DATA_URI_MIN_BASE64_LENGTH = 1024;
declare function decodeRuntimeBase64(value: string): Uint8Array;
declare function runtimeArtifactExtensionFromContentType(contentType: string): string;
interface RuntimeArtifactExtractionResult {
  readonly cleaned: unknown;
  readonly artifacts: ReadonlyArray<RuntimeArtifactPointer>;
}
interface RuntimeArtifactExtractionOptions {
  readonly writer: RuntimeArtifactBinaryWriter;
  readonly minBase64Length?: number | undefined;
}
declare function extractRuntimeArtifactsFromValue(value: unknown, options: RuntimeArtifactExtractionOptions): Promise<RuntimeArtifactExtractionResult>;
interface RuntimeArtifactLimitInput {
  readonly artifactSizeBytes: number;
  readonly currentRunBytes: number;
  readonly maxArtifactBytes: number;
  readonly maxRunBytes: number;
}
declare function runtimeArtifactTooLargeMessage(input: {
  readonly artifactSizeBytes: number;
  readonly maxArtifactBytes: number;
}): string;
declare function runtimeArtifactRunTotalTooLargeMessage(maxRunBytes: number): string;
declare function validateRuntimeArtifactSizeLimit(input: {
  readonly artifactSizeBytes: number;
  readonly maxArtifactBytes: number;
}): readonly string[];
declare function validateRuntimeArtifactRunTotalLimit(input: {
  readonly artifactSizeBytes: number;
  readonly currentRunBytes: number;
  readonly maxRunBytes: number;
}): readonly string[];
declare function validateRuntimeArtifactLimits(input: RuntimeArtifactLimitInput): readonly string[];
interface LocalRuntimeArtifactStoreSnapshot {
  readonly artifacts: ReadonlyArray<RuntimeArtifactPointer>;
}
declare function makeLocalRuntimeArtifactStore(): {
  layer: Layer.Layer<RuntimeArtifactStore, never, never>;
  snapshot: () => LocalRuntimeArtifactStoreSnapshot;
};
//#endregion
export { LocalRuntimeArtifactStoreSnapshot, RUNTIME_DATA_URI_IMAGE_RE, RUNTIME_DATA_URI_MIN_BASE64_LENGTH, RuntimeArtifactBinaryWrite, RuntimeArtifactBinaryWriter, RuntimeArtifactExtractionOptions, RuntimeArtifactExtractionResult, RuntimeArtifactKind, RuntimeArtifactLimitInput, RuntimeArtifactPointer, RuntimeArtifactStore, RuntimeArtifactStoreLive, decodeRuntimeBase64, extractRuntimeArtifactsFromValue, makeLocalRuntimeArtifactStore, runtimeArtifactExtensionFromContentType, runtimeArtifactRunTotalTooLargeMessage, runtimeArtifactTooLargeMessage, validateRuntimeArtifactLimits, validateRuntimeArtifactRunTotalLimit, validateRuntimeArtifactSizeLimit };
//# sourceMappingURL=artifacts.d.mts.map