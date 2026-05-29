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
//#region src/telemetry.ts
const identityRedactor = (value) => value;
const redactTelemetryMetadata = (metadata, redact) => {
	if (!metadata) return void 0;
	return Object.fromEntries(Object.entries(metadata).map(([key, value]) => [key, redact(value, key)]));
};
const withTime = (event, now, redact) => ({
	...event,
	time: event.time ?? new Date(now()).toISOString(),
	attributes: redactTelemetryMetadata(event.attributes, redact)
});
const redactWarning = (warning, redact) => ({
	...warning,
	attributes: redactTelemetryMetadata(warning.attributes, redact)
});
const bestEffort = async (operation) => {
	try {
		await operation();
	} catch {}
};
const formatError = (error) => {
	if (error instanceof Error) return error.stack ?? error.message;
	try {
		return JSON.stringify(error);
	} catch {
		return String(error);
	}
};
const makeTelemetry = (options = {}) => {
	const sink = options.sink;
	const eventSink = options.event ?? sink?.event;
	const warningSink = options.warning ?? sink?.warning;
	const spanSink = options.span;
	const now = options.now ?? Date.now;
	const redact = options.redact ?? identityRedactor;
	const event = async (input) => {
		const prepared = withTime(input, now, redact);
		await bestEffort(async () => {
			await eventSink?.(prepared);
		});
	};
	const warning = async (input) => {
		const prepared = redactWarning(input, redact);
		await bestEffort(async () => {
			await warningSink?.(prepared);
		});
	};
	const defaultSpan = async (input, operation) => {
		const startedAt = now();
		const baseAttributes = redactTelemetryMetadata(input.attributes, redact);
		await event({
			name: input.name + ".start",
			attributes: {
				...baseAttributes ?? {},
				phase: "start"
			}
		});
		try {
			const result = await operation();
			await event({
				name: input.name + ".finish",
				durationMs: now() - startedAt,
				attributes: {
					...baseAttributes ?? {},
					phase: "finish",
					outcome: "success"
				}
			});
			return result;
		} catch (error) {
			await event({
				name: input.name + ".finish",
				durationMs: now() - startedAt,
				attributes: {
					...baseAttributes ?? {},
					phase: "finish",
					outcome: "failure",
					cause: formatError(error).slice(0, 500)
				}
			});
			throw error;
		}
	};
	return {
		event,
		warning,
		span: spanSink ? async (input, operation) => await spanSink(input, operation) : defaultSpan,
		redact
	};
};
//#endregion
//#region src/promise.ts
var HarborClientConfigurationError = class extends Error {
	code;
	constructor(code, message) {
		super(message);
		this.name = "HarborClientConfigurationError";
		this.code = code;
	}
};
var HarborWorkspaceResolutionError = class extends HarborClientConfigurationError {};
const assertApiKeyWorkspaceId = (options) => {
	if (options.auth.kind === "api_key" && !options.workspaceId) throw new HarborClientConfigurationError("missing_workspace_id", "Harbor API-key clients require workspaceId");
};
const generatedAuthOptions = (auth) => {
	if (auth.kind === "bearer") {
		if (auth.tokenProvider) return { bearerTokenProvider: auth.tokenProvider };
		return { bearerToken: auth.token };
	}
	if (auth.keyProvider) return { bearerTokenProvider: auth.keyProvider };
	return { bearerToken: auth.key };
};
const makeClientTelemetry = (input) => makeTelemetry(input);
const randomHex = (bytes) => {
	const buffer = new Uint8Array(bytes);
	if (globalThis.crypto) globalThis.crypto.getRandomValues(buffer);
	else for (let index = 0; index < buffer.length; index++) buffer[index] = Math.floor(Math.random() * 256);
	return Array.from(buffer, (byte) => byte.toString(16).padStart(2, "0")).join("");
};
const newTraceparent = () => "00-" + randomHex(16) + "-" + randomHex(8) + "-01";
const initHeaders = (init) => new Headers(init?.headers);
const withTraceparent = (init, traceparent) => {
	const headers = initHeaders(init);
	if (!headers.has("traceparent")) headers.set("traceparent", traceparent);
	return {
		...init,
		headers
	};
};
const urlPath = (input) => {
	try {
		return new URL(String(input)).pathname;
	} catch {
		return String(input);
	}
};
const urlHost = (input) => {
	try {
		return new URL(String(input)).host;
	} catch {
		return;
	}
};
const makeInstrumentedFetch = (fetchImpl, telemetry) => {
	if (!fetchImpl) return void 0;
	return ((input, init) => {
		const traceparent = initHeaders(init).get("traceparent") ?? newTraceparent();
		const attributes = {
			"http.request.method": init?.method ?? "GET",
			"url.path": urlPath(input),
			"server.address": urlHost(input),
			traceparent
		};
		return Promise.resolve(telemetry.span({
			name: "harbor.client.http",
			attributes
		}, async () => await fetchImpl(input, withTraceparent(init, traceparent))));
	});
};
const createHarborPromiseClient = (options) => {
	assertApiKeyWorkspaceId(options);
	const telemetry = makeClientTelemetry(options.telemetry);
	const api = createHarborGeneratedClient({
		baseUrl: options.baseUrl,
		headers: options.headers,
		fetch: makeInstrumentedFetch(options.fetch ?? globalThis.fetch, telemetry),
		...generatedAuthOptions(options.auth)
	});
	const resolveWorkspaceId = async (workspaceId, operation) => {
		if (workspaceId) return workspaceId;
		throw new HarborWorkspaceResolutionError("missing_workspace_id", "Harbor " + operation + " requires workspace_id or a default HarborClient workspaceId");
	};
	const withResolvedWorkspaceId = async (request, workspaceId) => ({
		...request,
		workspace_id: await resolveWorkspaceId(request.workspace_id ?? workspaceId, "runtime.execute")
	});
	const withResolvedWorkspace = async (request, workspaceId, operation) => ({
		...request ?? {},
		workspace_id: await resolveWorkspaceId(request?.workspace_id ?? workspaceId, operation)
	});
	const withResolvedControlPlaneWorkspace = async (request, workspaceId, operation) => ({
		...request ?? {},
		workspace_id: await resolveWorkspaceId(request?.workspace_id ?? workspaceId, operation)
	});
	const controlPlaneCall = (workspaceId, path, operation) => async (request, init) => await api.requestJson({
		method: "POST",
		path,
		body: await withResolvedControlPlaneWorkspace(request, workspaceId, operation)
	}, init);
	const makeRuntime = (workspaceId) => ({ execute: async (request, init) => await api.executePlugin(await withResolvedWorkspaceId(request, workspaceId), init) });
	const makeTriggers = (workspaceId) => ({
		inspect: async (request, init) => await api.inspectTrigger(await withResolvedWorkspace(request, workspaceId, "triggers.inspect"), init),
		activate: async (request, init) => await api.activateTrigger(await withResolvedWorkspace(request, workspaceId, "triggers.activate"), init),
		list: async (request, init) => await api.listTriggers(await withResolvedWorkspace(request, workspaceId, "triggers.list"), init),
		get: async (request, init) => await api.getTrigger(await withResolvedWorkspace(request, workspaceId, "triggers.get"), init),
		pause: async (request, init) => await api.pauseTrigger(await withResolvedWorkspace(request, workspaceId, "triggers.pause"), init),
		resume: async (request, init) => await api.resumeTrigger(await withResolvedWorkspace(request, workspaceId, "triggers.resume"), init),
		disable: async (request, init) => await api.disableTrigger(await withResolvedWorkspace(request, workspaceId, "triggers.disable"), init),
		replay: async (request, init) => await api.replayTriggerDelivery(await withResolvedWorkspace(request, workspaceId, "triggers.replay"), init),
		listDeliveries: async (request, init) => await api.listTriggerDeliveries(await withResolvedWorkspace(request, workspaceId, "triggers.deliveries.list"), init),
		getDelivery: async (request, init) => await api.getTriggerDelivery(await withResolvedWorkspace(request, workspaceId, "triggers.deliveries.get"), init),
		getLimits: async (request, init) => await api.getTriggerLimits(await withResolvedWorkspace(request, workspaceId, "triggers.limits.get"), init),
		updateLimits: async (request, init) => await api.updateTriggerLimits(await withResolvedWorkspace(request, workspaceId, "triggers.limits.update"), init)
	});
	const makeControlPlaneClients = (workspaceId) => {
		const call = (path, operation) => controlPlaneCall(workspaceId, path, operation);
		return {
			sources: {
				list: call("/plugins/sources/list", "sources.list"),
				get: call("/plugins/sources/get", "sources.get"),
				add: call("/plugins/sources/add", "sources.add"),
				refresh: call("/plugins/sources/refresh", "sources.refresh"),
				remove: call("/plugins/sources/remove", "sources.remove"),
				abandon: call("/plugins/sources/abandon", "sources.abandon"),
				cleanupStale: call("/plugins/sources/cleanup-stale", "sources.cleanupStale"),
				probe: call("/plugins/sources/probe", "sources.probe"),
				authTest: call("/plugins/sources/auth-test", "sources.authTest"),
				setVisibility: call("/plugins/sources/visibility/set", "sources.visibility.set"),
				verification: {
					get: call("/plugins/sources/verification/get", "sources.verification.get"),
					probe: call("/plugins/sources/verification/probe", "sources.verification.probe"),
					set: call("/plugins/sources/verification/set", "sources.verification.set")
				}
			},
			registry: {
				list: call("/plugins/registry/list", "registry.list"),
				install: call("/plugins/registry/install", "registry.install")
			},
			tools: {
				list: call("/plugins/tools/list", "tools.list"),
				search: call("/plugins/tools/search", "tools.search"),
				describe: call("/plugins/tools/describe", "tools.describe"),
				schema: call("/plugins/tools/schema", "tools.schema"),
				schemas: call("/plugins/tools/schemas", "tools.schemas"),
				reindex: call("/plugins/tools/reindex", "tools.reindex"),
				add: call("/plugins/tools/add", "tools.add")
			},
			credentials: {
				create: call("/plugins/credentials/create", "credentials.create"),
				upsert: call("/plugins/credentials/upsert", "credentials.upsert"),
				delete: call("/plugins/credentials/delete", "credentials.delete")
			},
			oauth: {
				start: call("/plugins/sources/oauth/start", "oauth.start"),
				connect: call("/plugins/sources/oauth/connect", "oauth.connect"),
				reconnect: call("/plugins/sources/oauth/reconnect", "oauth.reconnect"),
				status: call("/plugins/sources/oauth/flow/status", "oauth.status"),
				disconnect: call("/plugins/sources/oauth/disconnect", "oauth.disconnect"),
				configure: call("/plugins/sources/oauth/configure", "oauth.configure"),
				workspaceClients: {
					list: call("/plugins/oauth/workspace-clients/list", "oauth.workspaceClients.list"),
					set: call("/plugins/oauth/workspace-clients/set", "oauth.workspaceClients.set"),
					delete: call("/plugins/oauth/workspace-clients/delete", "oauth.workspaceClients.delete")
				}
			},
			runs: {
				list: call("/runs/list", "runs.list"),
				get: call("/runs/get", "runs.get"),
				graph: call("/runs/graph", "runs.graph"),
				listArtifacts: call("/runs/artifacts/list", "runs.artifacts.list"),
				create: call("/runs/create", "runs.create"),
				complete: call("/runs/complete", "runs.complete"),
				cancel: call("/runs/cancel", "runs.cancel"),
				events: call("/runs/events", "runs.events")
			},
			policies: {
				rules: {
					list: call("/policies/rules/list", "policies.rules.list"),
					get: call("/policies/rules/get", "policies.rules.get"),
					create: call("/policies/rules/create", "policies.rules.create"),
					update: call("/policies/rules/update", "policies.rules.update"),
					delete: call("/policies/rules/delete", "policies.rules.delete")
				},
				effective: call("/policies/effective", "policies.effective"),
				simulate: call("/policies/simulate", "policies.simulate"),
				sourceGate: call("/policies/source-gate", "policies.sourceGate"),
				listAudit: call("/policies/audit/list", "policies.audit.list")
			},
			audit: { list: call("/audit/list", "audit.list") },
			jobs: {
				list: call("/orbit/jobs/list", "jobs.list"),
				inspect: call("/orbit/jobs/inspect", "jobs.inspect"),
				publish: call("/orbit/jobs/publish", "jobs.publish"),
				run: call("/orbit/jobs/run", "jobs.run"),
				versions: call("/orbit/jobs/versions", "jobs.versions"),
				disable: call("/orbit/jobs/disable", "jobs.disable"),
				invocations: {
					list: call("/orbit/jobs/invocations/list", "jobs.invocations.list"),
					get: call("/orbit/jobs/invocations/get", "jobs.invocations.get")
				}
			},
			apps: {
				list: call("/orbit/apps/list", "apps.list"),
				inspect: call("/orbit/apps/inspect", "apps.inspect"),
				publish: call("/orbit/apps/publish", "apps.publish"),
				open: call("/orbit/apps/open", "apps.open"),
				disable: call("/orbit/apps/disable", "apps.disable"),
				updateAccess: call("/orbit/apps/access/update", "apps.access.update"),
				activity: { list: call("/orbit/apps/activity/list", "apps.activity.list") },
				invocations: {
					list: call("/orbit/apps/invocations/list", "apps.invocations.list"),
					get: call("/orbit/apps/invocations/get", "apps.invocations.get")
				}
			},
			workflows: {
				list: call("/workflows/list", "workflows.list"),
				get: call("/workflows/get", "workflows.get"),
				add: call("/workflows/add", "workflows.add"),
				remove: call("/workflows/remove", "workflows.remove")
			}
		};
	};
	return {
		api,
		workspaces: {
			list: async (request, init) => await api.listWorkspaces(request ?? {}, init),
			get: async (request, init) => await api.getWorkspace(await withResolvedWorkspace(request, options.workspaceId, "workspaces.get"), init)
		},
		workspace: (workspaceId) => ({
			id: workspaceId,
			runtime: makeRuntime(workspaceId),
			triggers: makeTriggers(workspaceId),
			...makeControlPlaneClients(workspaceId)
		}),
		runtime: makeRuntime(options.workspaceId),
		triggers: makeTriggers(options.workspaceId),
		...makeControlPlaneClients(options.workspaceId)
	};
};
const createHarborClient = createHarborPromiseClient;
const normalizeScope = (scope) => typeof scope === "string" ? scope : scope ? scope.join(" ") : "openid profile email";
const createHarborOAuthAuthorizeUrl = (options) => {
	const authorize = new URL("/oauth2/authorize", options.authorizationServerUrl.replace(/\/+$/, "") + "/");
	authorize.searchParams.set("client_id", options.clientId);
	authorize.searchParams.set("redirect_uri", options.redirectUri);
	authorize.searchParams.set("response_type", "code");
	authorize.searchParams.set("scope", normalizeScope(options.scope));
	authorize.searchParams.set("state", options.state);
	authorize.searchParams.set("code_challenge", options.codeChallenge);
	authorize.searchParams.set("code_challenge_method", options.codeChallengeMethod ?? "S256");
	if (options.resource) authorize.searchParams.set("resource", options.resource);
	if (options.organizationId) authorize.searchParams.set("organization_id", options.organizationId);
	return authorize;
};
//#endregion
export { HarborClientConfigurationError, HarborWorkspaceResolutionError, createHarborClient, createHarborOAuthAuthorizeUrl, createHarborPromiseClient };

//# sourceMappingURL=client.mjs.map