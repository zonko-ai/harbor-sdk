//#region ../runtime-adapter-harbor/src/index.ts
const toRuntimeMode = (kind) => {
	if (kind === "workflow") return "workflow";
	if (kind === "tool_invocation") return "exec";
	return "exec";
};
const harborRequestToRuntimeRequest = (request) => ({
	code: typeof request.payload === "string" ? request.payload : "",
	mode: toRuntimeMode(request.kind)
});
const harborRequestToTrustedContext = (request) => ({
	scopeId: request.workspace_id,
	runId: request.run_id ?? "unassigned-run"
});
const runtimeResultToHarborResult = (result, context) => ({
	ok: result.error === void 0,
	run_id: context.runId,
	output: result.result,
	error: result.error
});
const toWorkerRuntimeMode = (request, options) => {
	if (options?.mode) return options.mode;
	if (request.mode === "workflow" || request.workflow_step) return "workflow";
	return "exec";
};
const harborWorkerRequestToRuntimeRequest = (request, options = {}) => {
	const sourceFilter = request.sources?.map((source) => source.namespace);
	const executionInputs = request.execution_inputs?.map((input) => ({
		name: input.path,
		contentType: input.content_type,
		data: input.data_base64,
		sha256: input.sha256
	}));
	return {
		code: request.code,
		mode: toWorkerRuntimeMode(request, options),
		...request.timeout_ms !== void 0 ? { timeoutMs: request.timeout_ms } : {},
		...executionInputs && executionInputs.length > 0 ? { executionInputs } : {},
		...sourceFilter && sourceFilter.length > 0 ? { sourceFilter } : {},
		...options.features ? { features: options.features } : {}
	};
};
const harborWorkerRequestToTrustedContext = (request, options = {}) => {
	const attributionId = options.attributionId ?? request.agent_id;
	const machineId = options.machineId ?? request.sand_machine_id;
	return {
		scopeId: request.workspace_id,
		runId: request.run_id ?? "unassigned-run",
		...attributionId ? { attributionId } : {},
		...machineId ? { machineId } : {},
		...options.trace ? { trace: options.trace } : {}
	};
};
//#endregion
export { harborRequestToRuntimeRequest, harborRequestToTrustedContext, harborWorkerRequestToRuntimeRequest, harborWorkerRequestToTrustedContext, runtimeResultToHarborResult };

//# sourceMappingURL=adapter-harbor.mjs.map