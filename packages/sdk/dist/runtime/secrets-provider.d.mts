import { Context, Effect, Layer, Schema } from "effect";

//#region ../runtime-core/src/index.d.ts
type RuntimeErrorReason = 'validation' | 'planning' | 'provider' | 'host' | 'state' | 'artifact' | 'timeout' | 'internal';
declare class RuntimeError extends Error {
  readonly reason: RuntimeErrorReason;
  readonly details?: unknown | undefined;
  readonly _tag = "RuntimeError";
  constructor(reason: RuntimeErrorReason, message: string, details?: unknown | undefined);
}
//#endregion
//#region ../runtime-provider-secrets/src/index.d.ts
declare const RUNTIME_SECRET_REF_FIELD = "__hrbr_secret_ref";
type RuntimeSecretRefHandle = {
  readonly [RUNTIME_SECRET_REF_FIELD]: string;
};
interface RuntimeSecretRefStoreEntry {
  readonly sourceNamespace: string;
  readonly credentialName: string;
  readonly encryptedValue: string;
}
interface RuntimeSecretRegistrationInput {
  readonly namespace: string;
  readonly name: string;
  readonly register: () => Promise<RuntimeSecretRefHandle>;
}
interface RuntimeSecretsProvider {
  readonly registerFromSource: (input: RuntimeSecretRegistrationInput) => Effect.Effect<RuntimeSecretRefHandle, RuntimeError>;
}
declare const RuntimeSecretsProvider: Context.Service<RuntimeSecretsProvider, RuntimeSecretsProvider>;
declare const RuntimeSecretsProviderLive: Layer.Layer<RuntimeSecretsProvider, never, never>;
declare function makeRuntimeSecretRefHandle(refId: string): RuntimeSecretRefHandle;
declare function isRuntimeSecretRefHandle(value: unknown): value is RuntimeSecretRefHandle;
declare function runtimeSecretRefId(handle: RuntimeSecretRefHandle): string;
declare function normalizeRuntimeSecretName(value: string): string;
declare function resolveRuntimeSecretSourceLookupNames(configValue: string | null, requestedName: string): string[];
//#endregion
export { RUNTIME_SECRET_REF_FIELD, RuntimeSecretRefHandle, RuntimeSecretRefStoreEntry, RuntimeSecretRegistrationInput, RuntimeSecretsProvider, RuntimeSecretsProviderLive, isRuntimeSecretRefHandle, makeRuntimeSecretRefHandle, normalizeRuntimeSecretName, resolveRuntimeSecretSourceLookupNames, runtimeSecretRefId };
//# sourceMappingURL=secrets-provider.d.mts.map