//#region ../runtime-planner/src/tool-call-timing.ts
function emptyWorkerToolCallTimingSummary() {
	return {
		worker_tool_calls_count: 0,
		worker_tool_calls_sum_ms: 0,
		worker_tool_calls_max_ms: 0
	};
}
var WorkerToolCallTimingCollector = class {
	#count = 0;
	#sumMs = 0;
	#maxMs = 0;
	record(durationMs) {
		const normalized = normalizeDurationMs(durationMs);
		this.#count += 1;
		this.#sumMs += normalized;
		this.#maxMs = Math.max(this.#maxMs, normalized);
		return this.snapshot();
	}
	snapshot() {
		return {
			worker_tool_calls_count: this.#count,
			worker_tool_calls_sum_ms: this.#sumMs,
			worker_tool_calls_max_ms: this.#maxMs
		};
	}
};
function workerToolCallTimingEvent(args) {
	const durationMs = normalizeDurationMs(args.durationMs);
	return {
		source_namespace: args.sourceNamespace,
		tool_name: args.toolName,
		worker_tool_call_total_ms: durationMs,
		worker_tool_call_latency_bucket: latencyBucket(durationMs),
		worker_tool_call_status: args.status
	};
}
function normalizeDurationMs(value) {
	if (!Number.isFinite(value) || value < 0) return 0;
	return Math.round(value);
}
function latencyBucket(durationMs) {
	if (durationMs < 1e3) return "lt_1s";
	if (durationMs < 3e3) return "1s_3s";
	if (durationMs < 1e4) return "3s_10s";
	if (durationMs < 3e4) return "10s_30s";
	return "gte_30s";
}
//#endregion
export { WorkerToolCallTimingCollector, emptyWorkerToolCallTimingSummary, workerToolCallTimingEvent };

//# sourceMappingURL=tool-call-timing.mjs.map