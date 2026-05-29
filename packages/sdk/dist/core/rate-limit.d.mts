import { Context, Effect, Schema } from "effect";

//#region ../core-effect/src/rate-limit.d.ts
declare const RateLimitScope: Schema.Literals<readonly ["workspace", "user", "agent", "ip", "public"]>;
type RateLimitScope = typeof RateLimitScope.Type;
declare const RateLimitPolicy: Schema.Struct<{
  readonly id: Schema.String;
  readonly scope: Schema.Literals<readonly ["workspace", "user", "agent", "ip", "public"]>;
  readonly windowMs: Schema.Number;
  readonly max: Schema.Number;
  readonly costUnit: Schema.optional<Schema.String>;
}>;
type RateLimitPolicy = typeof RateLimitPolicy.Type;
declare const RateLimitBucketSnapshot: Schema.Struct<{
  readonly windowStartMs: Schema.Number;
  readonly count: Schema.Number;
}>;
type RateLimitBucketSnapshot = typeof RateLimitBucketSnapshot.Type;
declare const RateLimitInfo: Schema.Struct<{
  readonly policy_id: Schema.String;
  readonly scope: Schema.Literals<readonly ["workspace", "user", "agent", "ip", "public"]>;
  readonly limit: Schema.Number;
  readonly window_ms: Schema.Number;
  readonly remaining: Schema.Number;
  readonly reset_at_ms: Schema.Number;
}>;
type RateLimitInfo = typeof RateLimitInfo.Type;
declare const RateLimitDecision: Schema.Struct<{
  readonly allowed: Schema.Boolean;
  readonly retryAfterSec: Schema.Number;
  readonly remaining: Schema.Number;
  readonly resetAtMs: Schema.Number;
  readonly bucket: Schema.Struct<{
    readonly windowStartMs: Schema.Number;
    readonly count: Schema.Number;
  }>;
  readonly info: Schema.Struct<{
    readonly policy_id: Schema.String;
    readonly scope: Schema.Literals<readonly ["workspace", "user", "agent", "ip", "public"]>;
    readonly limit: Schema.Number;
    readonly window_ms: Schema.Number;
    readonly remaining: Schema.Number;
    readonly reset_at_ms: Schema.Number;
  }>;
}>;
type RateLimitDecision = typeof RateLimitDecision.Type;
declare const ApiRateLimitFailure: Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly retry_after_sec: Schema.Number;
  readonly rate_limit: Schema.Struct<{
    readonly policy_id: Schema.String;
    readonly scope: Schema.Literals<readonly ["workspace", "user", "agent", "ip", "public"]>;
    readonly limit: Schema.Number;
    readonly window_ms: Schema.Number;
    readonly remaining: Schema.Number;
    readonly reset_at_ms: Schema.Number;
  }>;
}>;
type ApiRateLimitFailure = typeof ApiRateLimitFailure.Type;
interface FixedWindowRateLimitStore {
  readonly get: (key: string) => RateLimitBucketSnapshot | undefined;
  readonly set: (key: string, bucket: RateLimitBucketSnapshot) => void;
}
interface FixedWindowRateLimitInput {
  readonly policy: RateLimitPolicy;
  readonly bucket?: RateLimitBucketSnapshot | undefined;
  readonly cost?: number | undefined;
  readonly nowMs?: number | undefined;
}
interface ApplyFixedWindowRateLimitInput extends FixedWindowRateLimitInput {
  readonly key: string;
  readonly store: FixedWindowRateLimitStore;
}
declare const evaluateFixedWindowRateLimit: (input: FixedWindowRateLimitInput) => RateLimitDecision;
declare const applyFixedWindowRateLimit: (input: ApplyFixedWindowRateLimitInput) => RateLimitDecision;
interface RateLimiter {
  readonly check: (input: {
    readonly key: string;
    readonly policy: RateLimitPolicy;
    readonly cost?: number | undefined;
  }) => Effect.Effect<RateLimitDecision>;
}
declare const RateLimiter: Context.Service<RateLimiter, RateLimiter>;
declare const makeInMemoryRateLimiter: (store?: Map<string, {
  readonly windowStartMs: number;
  readonly count: number;
}>, now?: () => number) => RateLimiter;
//#endregion
export { ApiRateLimitFailure, ApplyFixedWindowRateLimitInput, FixedWindowRateLimitInput, FixedWindowRateLimitStore, RateLimitBucketSnapshot, RateLimitDecision, RateLimitInfo, RateLimitPolicy, RateLimitScope, RateLimiter, applyFixedWindowRateLimit, evaluateFixedWindowRateLimit, makeInMemoryRateLimiter };
//# sourceMappingURL=rate-limit.d.mts.map