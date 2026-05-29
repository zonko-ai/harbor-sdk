//#region src/generated/harbor.ts
var HarborApiError = class extends Error {
	status;
	payload;
	constructor(status, payload) {
		const fallback = status === 0 ? "Harbor request failed" : `Harbor request failed with HTTP ${status}`;
		const message = payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string" ? payload.error : fallback;
		super(message);
		this.name = "HarborApiError";
		this.status = status;
		this.payload = payload;
	}
};
const joinUrl = (baseUrl, path) => baseUrl.replace(/\/+$/, "") + path;
const isApiFailure = (payload) => !!payload && typeof payload === "object" && "success" in payload && payload.success === false;
const unwrapApiEnvelope = (payload) => {
	if (payload && typeof payload === "object" && "success" in payload && payload.success === true && "data" in payload) return payload.data;
	return payload;
};
function createHarborGeneratedClient(options) {
	const fetchImpl = options.fetch ?? globalThis.fetch;
	if (!fetchImpl) throw new Error("No fetch implementation available for HarborGeneratedClient");
	if (options.bearerToken && options.bearerTokenProvider) throw new Error("Pass either bearerToken or bearerTokenProvider, not both");
	const resolveBearerToken = async () => {
		const token = options.bearerTokenProvider ? await options.bearerTokenProvider() : options.bearerToken;
		return token && token.length > 0 ? token : void 0;
	};
	const request = async (method, path, body, init) => {
		const headers = {
			accept: "application/json",
			...options.headers,
			...init?.headers
		};
		if (body !== void 0) headers["content-type"] = "application/json";
		const bearerToken = await resolveBearerToken();
		if (bearerToken) headers.authorization = `Bearer ${bearerToken}`;
		const requestInit = {
			method,
			headers,
			...body !== void 0 ? { body: JSON.stringify(body) } : {},
			...init?.signal ? { signal: init.signal } : {}
		};
		const response = await fetchImpl(joinUrl(options.baseUrl, path), requestInit);
		const payload = await response.json().catch(() => void 0);
		if (!response.ok || isApiFailure(payload)) throw new HarborApiError(response.status, payload);
		return unwrapApiEnvelope(payload);
	};
	return {
		requestJson: (input, init) => request(input.method ?? (input.body === void 0 ? "GET" : "POST"), input.path, input.body, init),
		getHealth: (init) => request("GET", "/health", void 0, init),
		getV1Health: (init) => request("GET", "/v1/health", void 0, init),
		getHealthz: (init) => request("GET", "/healthz", void 0, init),
		getV1Healthz: (init) => request("GET", "/v1/healthz", void 0, init),
		getHarborWellKnown: (init) => request("GET", "/.well-known/harbor.json", void 0, init),
		getWellKnownIndex: (init) => request("GET", "/.well-known/index.json", void 0, init),
		getHarborOpenApi: (init) => request("GET", "/openapi/harbor.v1.json", void 0, init),
		getOpenApiJson: (init) => request("GET", "/openapi.json", void 0, init),
		listWorkspaces: (body, init) => request("POST", "/workspaces/list", body, init),
		getWorkspace: (body, init) => request("POST", "/workspaces/get", body, init),
		executePlugin: (body, init) => request("POST", "/plugins/execute", body, init),
		inspectTrigger: (body, init) => request("POST", "/triggers/inspect", body, init),
		activateTrigger: (body, init) => request("POST", "/triggers/activate", body, init),
		listTriggers: (body, init) => request("POST", "/triggers/list", body, init),
		getTrigger: (body, init) => request("POST", "/triggers/get", body, init),
		pauseTrigger: (body, init) => request("POST", "/triggers/pause", body, init),
		resumeTrigger: (body, init) => request("POST", "/triggers/resume", body, init),
		disableTrigger: (body, init) => request("POST", "/triggers/disable", body, init),
		replayTriggerDelivery: (body, init) => request("POST", "/triggers/replay", body, init),
		listTriggerDeliveries: (body, init) => request("POST", "/triggers/deliveries/list", body, init),
		getTriggerDelivery: (body, init) => request("POST", "/triggers/deliveries/get", body, init),
		getTriggerLimits: (body, init) => request("POST", "/triggers/limits/get", body, init),
		updateTriggerLimits: (body, init) => request("POST", "/triggers/limits/update", body, init)
	};
}
//#endregion
export { HarborApiError, createHarborGeneratedClient };

//# sourceMappingURL=harbor.mjs.map