import { Context, Effect, Schema } from "effect";
//#region ../core-effect/src/rate-limit.ts
const NonNegativeInteger = Schema.Number.check(Schema.isInt(), Schema.isGreaterThanOrEqualTo(0));
const PositiveInteger = Schema.Number.check(Schema.isInt(), Schema.isGreaterThanOrEqualTo(1));
const RateLimitScope = Schema.Literals([
	"workspace",
	"user",
	"agent",
	"ip",
	"public"
]);
const RateLimitPolicy = Schema.Struct({
	id: Schema.String,
	scope: RateLimitScope,
	windowMs: PositiveInteger,
	max: PositiveInteger,
	costUnit: Schema.optional(Schema.String)
});
const RateLimitBucketSnapshot = Schema.Struct({
	windowStartMs: NonNegativeInteger,
	count: NonNegativeInteger
});
const RateLimitInfo = Schema.Struct({
	policy_id: Schema.String,
	scope: RateLimitScope,
	limit: PositiveInteger,
	window_ms: PositiveInteger,
	remaining: NonNegativeInteger,
	reset_at_ms: PositiveInteger
});
const RateLimitDecision = Schema.Struct({
	allowed: Schema.Boolean,
	retryAfterSec: NonNegativeInteger,
	remaining: NonNegativeInteger,
	resetAtMs: PositiveInteger,
	bucket: RateLimitBucketSnapshot,
	info: RateLimitInfo
});
const ApiRateLimitFailure = Schema.Struct({
	success: Schema.Literal(false),
	error: Schema.String,
	retry_after_sec: PositiveInteger,
	rate_limit: RateLimitInfo
});
const normalizeCost = (cost) => {
	if (cost === void 0) return 1;
	if (!Number.isFinite(cost)) return 1;
	return Math.max(1, Math.trunc(cost));
};
const retryAfterSeconds = (resetAtMs, nowMs) => Math.max(1, Math.ceil((resetAtMs - nowMs) / 1e3));
const decisionInfo = (policy, remaining, resetAtMs) => ({
	policy_id: policy.id,
	scope: policy.scope,
	limit: policy.max,
	window_ms: policy.windowMs,
	remaining,
	reset_at_ms: resetAtMs
});
const evaluateFixedWindowRateLimit = (input) => {
	const nowMs = Math.max(0, Math.trunc(input.nowMs ?? Date.now()));
	const cost = normalizeCost(input.cost);
	const current = input.bucket;
	const bucket = !current || nowMs - current.windowStartMs >= input.policy.windowMs ? {
		windowStartMs: nowMs,
		count: 0
	} : current;
	const projected = bucket.count + cost;
	const resetAtMs = bucket.windowStartMs + input.policy.windowMs;
	if (projected > input.policy.max) {
		const remaining = Math.max(0, input.policy.max - bucket.count);
		return {
			allowed: false,
			retryAfterSec: retryAfterSeconds(resetAtMs, nowMs),
			remaining,
			resetAtMs,
			bucket,
			info: decisionInfo(input.policy, remaining, resetAtMs)
		};
	}
	const nextBucket = {
		...bucket,
		count: projected
	};
	const remaining = Math.max(0, input.policy.max - projected);
	return {
		allowed: true,
		retryAfterSec: 0,
		remaining,
		resetAtMs,
		bucket: nextBucket,
		info: decisionInfo(input.policy, remaining, resetAtMs)
	};
};
const applyFixedWindowRateLimit = (input) => {
	const decision = evaluateFixedWindowRateLimit({
		policy: input.policy,
		bucket: input.store.get(input.key),
		cost: input.cost,
		nowMs: input.nowMs
	});
	if (decision.allowed) input.store.set(input.key, decision.bucket);
	return decision;
};
const RateLimiter = Context.Service("@hrbr/core/RateLimiter");
const makeInMemoryRateLimiter = (store = /* @__PURE__ */ new Map(), now = Date.now) => ({ check: (input) => Effect.sync(() => applyFixedWindowRateLimit({
	...input,
	store,
	nowMs: now()
})) });
//#endregion
export { ApiRateLimitFailure, RateLimitBucketSnapshot, RateLimitDecision, RateLimitInfo, RateLimitPolicy, RateLimitScope, RateLimiter, applyFixedWindowRateLimit, evaluateFixedWindowRateLimit, makeInMemoryRateLimiter };

//# sourceMappingURL=rate-limit.mjs.map