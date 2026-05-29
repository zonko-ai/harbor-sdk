//#region ../runtime-planner/src/tool-call-timing.d.ts
type WorkerToolCallTimingStatus = 'success' | 'error';
type WorkerToolCallTimingEvent = {
  readonly source_namespace: string;
  readonly tool_name: string;
  readonly worker_tool_call_total_ms: number;
  readonly worker_tool_call_latency_bucket: string;
  readonly worker_tool_call_status: WorkerToolCallTimingStatus;
};
type WorkerToolCallTimingSummary = {
  readonly worker_tool_calls_count: number;
  readonly worker_tool_calls_sum_ms: number;
  readonly worker_tool_calls_max_ms: number;
};
declare function emptyWorkerToolCallTimingSummary(): WorkerToolCallTimingSummary;
declare class WorkerToolCallTimingCollector {
  #private;
  record(durationMs: number): WorkerToolCallTimingSummary;
  snapshot(): WorkerToolCallTimingSummary;
}
declare function workerToolCallTimingEvent(args: {
  readonly sourceNamespace: string;
  readonly toolName: string;
  readonly durationMs: number;
  readonly status: WorkerToolCallTimingStatus;
}): WorkerToolCallTimingEvent;
//#endregion
export { WorkerToolCallTimingCollector, WorkerToolCallTimingEvent, WorkerToolCallTimingStatus, WorkerToolCallTimingSummary, emptyWorkerToolCallTimingSummary, workerToolCallTimingEvent };
//# sourceMappingURL=tool-call-timing.d.mts.map