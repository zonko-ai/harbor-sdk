// Stable, shared error tag strings for sand-related failures.
//
// Each tag prefixes the user-visible message at every layer (daemon
// `ensureSession`, API `/sand/sessions/open`, API `executeWorker`,
// Coast `printErrorAndExit`). LLM-facing skill content can grep for
// these prefixes to give users actionable guidance.
//
// Pure constant module. Zero runtime deps.

export const SAND_ERROR_TAGS = {
	MACHINE_KEYPAIR_UNAVAILABLE: "SAND_MACHINE_KEYPAIR_UNAVAILABLE",
	SESSION_INCOMPLETE: "SAND_SESSION_INCOMPLETE",
	RUNTIME_UNAVAILABLE: "LOCAL_RUNTIME_UNAVAILABLE",
	TOOL_UNAVAILABLE: "LOCAL_TOOL_UNAVAILABLE",
} as const;

export type SandErrorTag = (typeof SAND_ERROR_TAGS)[keyof typeof SAND_ERROR_TAGS];
