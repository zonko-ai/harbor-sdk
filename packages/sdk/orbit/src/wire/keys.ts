// Canonical orbit primitive keys.
// Single source of truth for the host-side dispatch table
// (apps/api/src/plugins/worker/orbit-primitives.ts: buildOrbitFns),
// the codemode preamble (orbitPreamble),
// and the WFP user-worker template (apps/api/src/orbit/jobs/wfp.ts).
//
// scripts/check-orbit-primitive-parity.ts asserts all four
// string-coupled call sites use exactly this set.

export const ORBIT_PRIMITIVE_KEYS = [
	"storage_put",
	"storage_get",
	"storage_list",
	"storage_delete",
	"storage_url",
	"cache_get",
	"cache_set",
	"cache_delete",
	"socket_url",
	"socket_broadcast",
	"socket_stats",
	"tools_search",
	"tools_describe",
	"tools_namespaces",
	"db_exec",
	"db_query",
	"db_first",
	"db_batch",
	"ai_run",
	"ai_generate",
	"ai_summarize",
	"ai_embed",
	"ai_classify",
	"ai_rerank",
	"ai_models",
] as const;

export type OrbitPrimitiveKey = (typeof ORBIT_PRIMITIVE_KEYS)[number];

/**
 * Keys that the WFP user worker implements natively against its
 * `__HRBR_WORKSPACE_DB` D1 binding instead of round-tripping through
 * the host-call wire. Today this is the orbit.db.* family — see
 * orbit-infra-map.md §S3 for the latency/error-shape divergence this
 * creates with the codemode isolate path. The parity check uses this
 * to keep the WFP template honest about which keys it must implement
 * in each lane.
 */
export const WFP_NATIVE_PRIMITIVE_KEYS = [
	"db_exec",
	"db_query",
	"db_first",
	"db_batch",
] as const satisfies readonly OrbitPrimitiveKey[];

type WfpNativePrimitiveKey = (typeof WFP_NATIVE_PRIMITIVE_KEYS)[number];

/** Keys that always cross the host-call wire from any user runtime. */
export const HOST_CALL_PRIMITIVE_KEYS = ORBIT_PRIMITIVE_KEYS.filter(
	(k): k is Exclude<OrbitPrimitiveKey, WfpNativePrimitiveKey> =>
		!(WFP_NATIVE_PRIMITIVE_KEYS as readonly string[]).includes(k),
);
