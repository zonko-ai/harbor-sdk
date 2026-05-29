import { createRequire } from "node:module";
import { Cause, Context, Effect, Layer, Schema } from "effect";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
//#region ../platform-local/src/frontend.ts
const LOCAL_HARBOR_FRONTEND_SCRIPT_PATH = "/local/frontend.js";
const escapeHtml = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const frontendCss = [
	":root { color-scheme: light; --bg: #f7f8fa; --panel: #ffffff; --soft: #f0f4f8; --text: #17202a; --muted: #65758b; --line: #d9e2ec; --accent: #0969da; --accent-strong: #064f9e; --danger: #b42318; --success: #067647; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif; }",
	"* { box-sizing: border-box; }",
	"body { margin: 0; background: var(--bg); color: var(--text); min-height: 100vh; }",
	"header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 24px; border-bottom: 1px solid var(--line); background: rgba(255, 255, 255, 0.94); position: sticky; top: 0; z-index: 2; }",
	"h1 { font-size: 20px; line-height: 1.2; margin: 0; font-weight: 700; letter-spacing: 0; }",
	"main { width: min(1160px, 100%); margin: 0 auto; padding: 24px; display: grid; gap: 16px; }",
	".grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(320px, 420px); gap: 16px; align-items: start; }",
	"section { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 16px; box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04); }",
	"h2 { margin: 0 0 12px; font-size: 14px; line-height: 1.3; font-weight: 700; letter-spacing: 0; }",
	"label { display: grid; gap: 6px; font-size: 12px; color: var(--muted); margin: 0 0 10px; }",
	"input, textarea, select { width: 100%; border: 1px solid var(--line); border-radius: 6px; background: #fff; color: var(--text); font: inherit; font-size: 13px; padding: 9px 10px; }",
	"textarea { min-height: 180px; resize: vertical; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }",
	"button { border: 0; border-radius: 6px; background: var(--accent); color: #fff; font-weight: 650; font-size: 13px; padding: 9px 12px; cursor: pointer; }",
	"button:hover { background: var(--accent-strong); }",
	"button.secondary { background: var(--soft); color: var(--text); border: 1px solid var(--line); }",
	".row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }",
	".status { display: inline-flex; align-items: center; min-height: 28px; border: 1px solid var(--line); border-radius: 999px; padding: 4px 10px; font-size: 12px; color: var(--muted); background: var(--soft); }",
	".status[data-tone=\"ok\"] { color: var(--success); }",
	".status[data-tone=\"error\"] { color: var(--danger); }",
	".muted { color: var(--muted); }",
	".mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }",
	".table { display: grid; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }",
	".table-row { display: grid; grid-template-columns: minmax(140px, 1.2fr) minmax(100px, 0.7fr) minmax(120px, 0.8fr); gap: 8px; padding: 10px 12px; border-top: 1px solid var(--line); font-size: 13px; }",
	".table-row:first-child { border-top: 0; background: var(--soft); color: var(--muted); font-size: 12px; }",
	"pre { margin: 0; padding: 12px; overflow: auto; background: #101828; color: #eef4ff; border-radius: 8px; min-height: 120px; max-height: 360px; font-size: 12px; line-height: 1.5; }",
	"@media (max-width: 840px) { header { align-items: flex-start; flex-direction: column; } main { padding: 16px; } .grid { grid-template-columns: 1fr; } .table-row { grid-template-columns: 1fr; } }"
].join("\n");
const renderLocalHarborFrontendHtml = (options = {}) => {
	const title = escapeHtml(options.title ?? "Harbor Local");
	const authRequired = options.authRequired ? "true" : "false";
	return [
		"<!doctype html>",
		"<html lang=\"en\">",
		"<head>",
		"  <meta charset=\"utf-8\">",
		"  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
		"  <title>" + title + "</title>",
		"  <style>" + frontendCss + "</style>",
		"</head>",
		"<body data-auth-required=\"" + authRequired + "\">",
		"  <header>",
		"    <div><h1>" + title + "</h1><div class=\"muted\">Local Harbor-compatible backend</div></div>",
		"    <div class=\"row\"><span id=\"connection-status\" class=\"status\">checking</span><button id=\"refresh\" class=\"secondary\" type=\"button\">Refresh</button></div>",
		"  </header>",
		"  <main>",
		"    <section id=\"auth-panel\" hidden><h2>Local Auth</h2><div class=\"row\"><label style=\"flex: 1 1 280px\">Bearer token<input id=\"token\" autocomplete=\"off\" spellcheck=\"false\"></label><button id=\"save-token\" type=\"button\">Save</button></div></section>",
		"    <div class=\"grid\"><section><h2>Workspace</h2><div id=\"workspace\" class=\"muted\">No workspace loaded</div></section><section><h2>Health</h2><pre id=\"health-output\">{}</pre></section></div>",
		"    <div class=\"grid\"><section><h2>Runtime Execute</h2><label>Workspace<select id=\"workspace-select\"></select></label><label>Code<textarea id=\"code\" spellcheck=\"false\">return { ok: true }</textarea></label><button id=\"execute\" type=\"button\">Run</button></section><section><h2>Output</h2><pre id=\"execute-output\">No run yet</pre></section></div>",
		"    <section><h2>Runs</h2><div id=\"runs\" class=\"table\"><div class=\"table-row\"><strong>Run</strong><strong>Status</strong><strong>Mode</strong></div></div></section>",
		"  </main>",
		"  <script type=\"module\" src=\"" + LOCAL_HARBOR_FRONTEND_SCRIPT_PATH + "\"><\/script>",
		"</body>",
		"</html>"
	].join("\n");
};
const renderLocalHarborFrontendScript = () => [
	"const $ = (id) => document.getElementById(id);",
	"const authRequired = document.body.dataset.authRequired === 'true';",
	"const state = { token: window.localStorage.getItem('hrbr.local.token') || '', workspaces: [], selectedWorkspaceId: null };",
	"const setStatus = (text, tone = '') => { const status = $('connection-status'); status.textContent = text; if (tone) status.dataset.tone = tone; else delete status.dataset.tone; };",
	"const showJson = (id, value) => { $(id).textContent = JSON.stringify(value, null, 2); };",
	"const headers = () => { const h = { accept: 'application/json', 'content-type': 'application/json' }; if (authRequired && state.token) h.authorization = 'Bearer ' + state.token; return h; };",
	"const api = async (path, body) => { const response = await fetch(path, { method: 'POST', headers: headers(), body: JSON.stringify(body || {}) }); const payload = await response.json().catch(() => null); if (!response.ok || (payload && payload.success === false)) { const error = payload && payload.error ? payload.error : 'HTTP ' + response.status; throw new Error(error); } return payload && payload.success === true && 'data' in payload ? payload.data : payload; };",
	"const renderWorkspaces = () => { const select = $('workspace-select'); select.innerHTML = ''; for (const workspace of state.workspaces) { const option = document.createElement('option'); option.value = workspace.id; option.textContent = workspace.name + ' (' + workspace.id + ')'; select.appendChild(option); } if (!state.selectedWorkspaceId && state.workspaces[0]) state.selectedWorkspaceId = state.workspaces[0].id; if (state.selectedWorkspaceId) select.value = state.selectedWorkspaceId; const current = state.workspaces.find((workspace) => workspace.id === state.selectedWorkspaceId); $('workspace').innerHTML = current ? '<strong>' + current.name + '</strong><br><span class=\"mono\">' + current.id + '</span><br><span class=\"muted\">role: ' + current.role + '</span>' : 'No workspace loaded'; };",
	"const renderRuns = (runs) => { const table = $('runs'); table.innerHTML = '<div class=\"table-row\"><strong>Run</strong><strong>Status</strong><strong>Mode</strong></div>'; for (const run of runs) { const row = document.createElement('div'); row.className = 'table-row'; row.innerHTML = '<span class=\"mono\">' + run.id + '</span><span>' + run.status + '</span><span>' + run.mode + '</span>'; table.appendChild(row); } };",
	"const refresh = async () => { try { setStatus('checking'); const healthResponse = await fetch('/healthz'); const health = await healthResponse.json(); showJson('health-output', health); const workspaceList = await api('/workspaces/list', { limit: 50, offset: 0 }); state.workspaces = workspaceList.data || []; renderWorkspaces(); if (state.selectedWorkspaceId) { const runList = await api('/runs/list', { workspace_id: state.selectedWorkspaceId }); renderRuns(runList.runs || []); } setStatus('connected', 'ok'); } catch (error) { setStatus(error instanceof Error ? error.message : String(error), 'error'); } };",
	"const execute = async () => { if (!state.selectedWorkspaceId) return; try { $('execute').disabled = true; const result = await api('/plugins/execute', { workspace_id: state.selectedWorkspaceId, code: $('code').value }); showJson('execute-output', result); await refresh(); } catch (error) { showJson('execute-output', { error: error instanceof Error ? error.message : String(error) }); } finally { $('execute').disabled = false; } };",
	"$('auth-panel').hidden = !authRequired;",
	"$('token').value = state.token;",
	"$('save-token').addEventListener('click', () => { state.token = $('token').value.trim(); window.localStorage.setItem('hrbr.local.token', state.token); refresh(); });",
	"$('refresh').addEventListener('click', refresh);",
	"$('execute').addEventListener('click', execute);",
	"$('workspace-select').addEventListener('change', (event) => { state.selectedWorkspaceId = event.target.value; renderWorkspaces(); refresh(); });",
	"refresh();"
].join("\n");
//#endregion
//#region ../runtime-core/src/index.ts
const RuntimeExecutionMode = Schema.Literals([
	"exec",
	"workflow",
	"job",
	"test"
]);
const RuntimeCapabilityKind = Schema.Literals([
	"tool",
	"orbit",
	"secret",
	"host",
	"state",
	"artifact",
	"job",
	"workflow_step"
]);
const RuntimeMetadata = Schema.Record(Schema.String, Schema.Unknown);
const RuntimeMountedInput = Schema.Struct({
	name: Schema.String,
	contentType: Schema.optional(Schema.String),
	data: Schema.String,
	sha256: Schema.optional(Schema.String)
});
Schema.Struct({
	code: Schema.String,
	mode: RuntimeExecutionMode,
	timeoutMs: Schema.optional(Schema.Number),
	executionInputs: Schema.optional(Schema.Array(RuntimeMountedInput)),
	sourceFilter: Schema.optional(Schema.Array(Schema.String)),
	features: Schema.optional(RuntimeMetadata)
});
Schema.Struct({
	scopeId: Schema.String,
	runId: Schema.String,
	attributionId: Schema.optional(Schema.String),
	machineId: Schema.optional(Schema.String),
	trace: Schema.optional(RuntimeMetadata),
	grants: Schema.optional(RuntimeMetadata)
});
const RuntimeNamespaceRequirement = Schema.Struct({
	namespace: Schema.String,
	bindingKind: RuntimeCapabilityKind,
	optional: Schema.optional(Schema.Boolean)
});
const RuntimeCapabilityUsage = Schema.Struct({
	kind: RuntimeCapabilityKind,
	key: Schema.String,
	metadata: Schema.optional(RuntimeMetadata)
});
Schema.Struct({
	requiredNamespaces: Schema.Array(RuntimeNamespaceRequirement),
	aliasMap: Schema.Record(Schema.String, Schema.String),
	capabilities: Schema.Array(RuntimeCapabilityUsage),
	mountedInputs: Schema.Array(RuntimeMountedInput),
	generatedTypeBlocks: Schema.Array(Schema.String),
	warnings: Schema.Array(Schema.String)
});
Schema.Struct({
	id: Schema.String,
	kind: Schema.String,
	contentType: Schema.optional(Schema.String),
	url: Schema.optional(Schema.String),
	sizeBytes: Schema.optional(Schema.Number),
	metadata: Schema.optional(RuntimeMetadata)
});
Schema.Struct({
	mode: RuntimeExecutionMode,
	result: Schema.optional(Schema.Unknown),
	error: Schema.optional(Schema.String),
	logs: Schema.Array(Schema.String),
	warnings: Schema.Array(Schema.String),
	timings: Schema.Record(Schema.String, Schema.Number),
	metadata: Schema.optional(RuntimeMetadata)
});
var RuntimeError = class extends Error {
	reason;
	details;
	_tag = "RuntimeError";
	constructor(reason, message, details) {
		super(message);
		this.reason = reason;
		this.details = details;
		this.name = "RuntimeError";
	}
};
const RuntimePlanner = Context.Service("@hrbr/runtime/RuntimePlanner");
Context.Service("@hrbr/runtime/RuntimeDispatchRouter");
const RuntimeProviderRegistry = Context.Service("@hrbr/runtime/RuntimeProviderRegistry");
const RuntimeHost = Context.Service("@hrbr/runtime/RuntimeHost");
const RuntimeState = Context.Service("@hrbr/runtime/RuntimeState");
const RuntimeArtifacts = Context.Service("@hrbr/runtime/RuntimeArtifacts");
const RuntimeExecutor = Context.Service("@hrbr/runtime/RuntimeExecutor");
const emptyRuntimePlan = (overrides = {}) => ({
	requiredNamespaces: [],
	aliasMap: {},
	capabilities: [],
	mountedInputs: [],
	generatedTypeBlocks: [],
	warnings: [],
	...overrides
});
//#endregion
//#region ../runtime-artifacts/src/index.ts
const RuntimeArtifactKind = Schema.Literals([
	"file",
	"image",
	"output"
]);
Schema.Struct({
	key: Schema.String,
	url: Schema.String,
	kind: RuntimeArtifactKind,
	contentType: Schema.String,
	sizeBytes: Schema.Number,
	metadata: Schema.optional(RuntimeMetadata)
});
const RuntimeArtifactStore = Context.Service("@hrbr/runtime-artifacts/RuntimeArtifactStore");
const RuntimeArtifactStoreLive = (writer) => Layer.succeed(RuntimeArtifactStore, { write: (artifact) => Effect.tryPromise({
	try: async () => writer.write(artifact),
	catch: (cause) => new RuntimeError("artifact", "Runtime artifact write failed", {
		contentType: artifact.contentType,
		kind: artifact.kind,
		cause
	})
}) });
Object.fromEntries([..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"].map((char, index) => [char, index]));
function makeLocalRuntimeArtifactStore() {
	const artifacts = [];
	return {
		layer: RuntimeArtifactStoreLive({ write: (artifact) => {
			const pointer = {
				key: "local-artifact-" + String(artifacts.length + 1),
				url: "memory://local-artifact-" + String(artifacts.length + 1),
				kind: artifact.kind,
				contentType: artifact.contentType,
				sizeBytes: artifact.body.byteLength,
				...artifact.metadata ? { metadata: artifact.metadata } : {}
			};
			artifacts.push(pointer);
			return pointer;
		} }),
		snapshot: () => ({ artifacts: artifacts.slice() })
	};
}
//#endregion
//#region ../runtime-state/src/index.ts
const RuntimeStateEventKind = Schema.Literals([
	"run_event",
	"tool_call",
	"orbit_usage",
	"warning",
	"timing",
	"final_result"
]);
const RuntimeStateBaseEvent = Schema.Struct({
	kind: RuntimeStateEventKind,
	time: Schema.String,
	runId: Schema.String,
	scopeId: Schema.String,
	agentId: Schema.optional(Schema.String),
	rootSpanId: Schema.optional(Schema.String),
	metadata: Schema.optional(RuntimeMetadata)
});
const RuntimeRunStateEvent = Schema.Struct({
	...RuntimeStateBaseEvent.fields,
	kind: Schema.Literal("run_event"),
	name: Schema.String,
	status: Schema.optional(Schema.String)
});
const RuntimeToolCallStateEvent = Schema.Struct({
	...RuntimeStateBaseEvent.fields,
	kind: Schema.Literal("tool_call"),
	sourceId: Schema.String,
	sourceNamespace: Schema.String,
	toolId: Schema.String,
	title: Schema.optional(Schema.String),
	status: Schema.String,
	durationMs: Schema.optional(Schema.Number),
	input: Schema.optional(Schema.Unknown),
	output: Schema.optional(Schema.Unknown),
	error: Schema.optional(Schema.String),
	contentType: Schema.optional(Schema.String),
	upstreamStatus: Schema.optional(Schema.Number)
});
const RuntimeOrbitUsageStateEvent = Schema.Struct({
	...RuntimeStateBaseEvent.fields,
	kind: Schema.Literal("orbit_usage"),
	operation: Schema.String,
	key: Schema.optional(Schema.String),
	model: Schema.optional(Schema.String),
	sizeBytes: Schema.optional(Schema.Number),
	durationMs: Schema.Number,
	error: Schema.optional(Schema.String)
});
const RuntimeWarningStateEvent = Schema.Struct({
	...RuntimeStateBaseEvent.fields,
	kind: Schema.Literal("warning"),
	namespace: Schema.optional(Schema.String),
	tool: Schema.optional(Schema.String),
	message: Schema.String
});
const RuntimeTimingStateEvent = Schema.Struct({
	...RuntimeStateBaseEvent.fields,
	kind: Schema.Literal("timing"),
	name: Schema.String,
	durationMs: Schema.Number
});
const RuntimeFinalResultStateEvent = Schema.Struct({
	...RuntimeStateBaseEvent.fields,
	kind: Schema.Literal("final_result"),
	status: Schema.Literals([
		"completed",
		"failed",
		"cancelled"
	]),
	durationMs: Schema.optional(Schema.Number),
	result: Schema.optional(Schema.Unknown),
	error: Schema.optional(Schema.String),
	artifactCount: Schema.optional(Schema.Number)
});
Schema.Union([
	RuntimeRunStateEvent,
	RuntimeToolCallStateEvent,
	RuntimeOrbitUsageStateEvent,
	RuntimeWarningStateEvent,
	RuntimeTimingStateEvent,
	RuntimeFinalResultStateEvent
]);
const RuntimeStatePort = Context.Service("@hrbr/runtime-state/RuntimeStatePort");
function makeLocalRuntimeStatePort() {
	const events = [];
	let flushCount = 0;
	return {
		layer: Layer.succeed(RuntimeStatePort, {
			record: (event) => Effect.sync(() => {
				events.push(event);
			}),
			flush: () => Effect.sync(() => {
				flushCount += 1;
			})
		}),
		snapshot: () => ({
			events: events.slice(),
			flushCount
		})
	};
}
//#endregion
//#region ../telemetry/src/index.ts
const Telemetry = Context.Service("@hrbr/Telemetry");
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
const bestEffort = (effect) => effect.pipe(Effect.asVoid, Effect.catchCause(() => Effect.void));
const makeTelemetry = (options = {}) => {
	const sink = options.sink;
	const now = options.now ?? Date.now;
	const redact = options.redact ?? identityRedactor;
	const event = (input) => {
		const prepared = withTime(input, now, redact);
		return bestEffort(sink?.event?.(prepared) ?? Effect.void);
	};
	const warning = (input) => {
		const prepared = redactWarning(input, redact);
		return bestEffort(sink?.warning?.(prepared) ?? Effect.void);
	};
	const span = (input, effect) => {
		const startedAt = now();
		const baseAttributes = redactTelemetryMetadata(input.attributes, redact);
		return Effect.gen(function* () {
			yield* bestEffort(event({
				name: input.name + ".start",
				attributes: {
					...baseAttributes ?? {},
					phase: "start"
				}
			}));
			return yield* effect.pipe(Effect.tap(() => bestEffort(event({
				name: input.name + ".finish",
				durationMs: now() - startedAt,
				attributes: {
					...baseAttributes ?? {},
					phase: "finish",
					outcome: "success"
				}
			}))), Effect.catchCause((cause) => Effect.gen(function* () {
				yield* bestEffort(event({
					name: input.name + ".finish",
					durationMs: now() - startedAt,
					attributes: {
						...baseAttributes ?? {},
						phase: "finish",
						outcome: "failure",
						cause: Cause.pretty(cause).slice(0, 500)
					}
				}));
				return yield* Effect.failCause(cause);
			})));
		});
	};
	return {
		event,
		warning,
		span,
		redact
	};
};
const makeTelemetryLayer = (options = {}) => Layer.succeed(Telemetry, makeTelemetry(options));
const TelemetryNoopLive = makeTelemetryLayer();
//#endregion
//#region ../platform-local/src/providers.ts
const makeLocalRuntimeHostHandler = (callback) => (invocation) => Effect.tryPromise({
	try: async () => await callback(invocation),
	catch: (cause) => new RuntimeError("host", cause instanceof Error ? cause.message : String(cause), { cause })
});
const localRuntimeArtifactRef = (artifact, index) => ({
	id: "local-artifact-" + String(index),
	kind: artifact.kind,
	contentType: artifact.contentType,
	sizeBytes: artifact.body.byteLength,
	...artifact.metadata ? { metadata: artifact.metadata } : {}
});
const defaultLocalRuntimeHost = (invocation) => Effect.succeed({
	mode: invocation.request.mode,
	result: void 0,
	logs: [],
	warnings: [],
	timings: {}
});
const makeLocalRuntimeHostLayer = (handler) => Layer.succeed(RuntimeHost, { invoke: handler });
const makeInMemoryLocalRuntimeProviders = (options = {}) => {
	const events = [];
	const artifacts = [];
	const statePort = makeLocalRuntimeStatePort();
	const artifactStorePort = makeLocalRuntimeArtifactStore();
	const hostHandler = options.host ?? defaultLocalRuntimeHost;
	const state = Layer.succeed(RuntimeState, {
		record: (event) => Effect.sync(() => {
			events.push(event);
		}),
		flush: () => Effect.void
	});
	const artifactStore = Layer.succeed(RuntimeArtifacts, { put: (artifact) => Effect.sync(() => {
		const ref = localRuntimeArtifactRef(artifact, artifacts.length + 1);
		artifacts.push(ref);
		return ref;
	}) });
	const registry = Layer.succeed(RuntimeProviderRegistry, {
		prepare: () => Effect.succeed({ providers: [] }),
		prepareScoped: () => Effect.succeed({ providers: [] }),
		dispose: () => Effect.void
	});
	const host = makeLocalRuntimeHostLayer(hostHandler);
	return {
		layers: Layer.mergeAll(state, artifactStore, statePort.layer, artifactStorePort.layer, registry, host, TelemetryNoopLive),
		snapshot: () => ({
			events,
			artifacts,
			statePort: statePort.snapshot(),
			artifactStore: artifactStorePort.snapshot()
		})
	};
};
const makeLocalRuntimeProviders = makeInMemoryLocalRuntimeProviders;
//#endregion
//#region ../runtime-engine/src/index.ts
const RuntimeExecutorLive = Layer.effect(RuntimeExecutor, Effect.gen(function* () {
	const planner = yield* RuntimePlanner;
	const providerRegistry = yield* RuntimeProviderRegistry;
	const host = yield* RuntimeHost;
	const state = yield* RuntimeState;
	const telemetry = yield* Telemetry;
	return { execute: (request, context) => Effect.gen(function* () {
		const startedAt = Date.now();
		const planning = yield* planner.plan(request, context);
		const plan = planning.runtimePlan;
		yield* state.record({
			name: "runtime.plan.created",
			time: new Date(startedAt).toISOString(),
			detail: plan
		});
		const run = Effect.scoped(Effect.gen(function* () {
			const prepared = yield* providerRegistry.prepareScoped(plan, context);
			const result = yield* host.invoke({
				request,
				context,
				plan,
				hostPlan: planning.hostPlan,
				providers: prepared
			});
			yield* state.record({
				name: "runtime.host.finished",
				time: (/* @__PURE__ */ new Date()).toISOString(),
				detail: { mode: result.mode }
			});
			return {
				...result,
				timings: {
					...result.timings,
					totalMs: Date.now() - startedAt
				}
			};
		})).pipe(Effect.ensuring(state.flush().pipe(Effect.catch(() => Effect.void))));
		return yield* telemetry.span({
			name: "runtime.execute",
			attributes: { mode: request.mode }
		}, run);
	}) };
}));
//#endregion
//#region ../platform-local/src/project.ts
const LOCAL_PROJECT_MANIFEST_VERSION = 1;
const LOCAL_STORE_SCHEMA_VERSION = 1;
let sqliteCtor = null;
let sqliteWarningPatched = false;
var LocalHttpError = class extends Error {
	status;
	issues;
	constructor(status, message, issues) {
		super(message);
		this.status = status;
		this.issues = issues;
		this.name = "LocalHttpError";
	}
};
const schemaSql = `
  CREATE TABLE IF NOT EXISTS local_workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS local_runs (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    mode TEXT NOT NULL,
    status TEXT NOT NULL,
    code_sha256 TEXT NOT NULL,
    request_json TEXT NOT NULL,
    result_json TEXT,
    error TEXT,
    created_at TEXT NOT NULL,
    completed_at TEXT,
    FOREIGN KEY (workspace_id) REFERENCES local_workspaces(id)
  );

  CREATE INDEX IF NOT EXISTS idx_local_runs_workspace_created
    ON local_runs(workspace_id, created_at DESC);

  CREATE TABLE IF NOT EXISTS local_runtime_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id TEXT NOT NULL,
    name TEXT NOT NULL,
    time TEXT NOT NULL,
    detail_json TEXT,
    FOREIGN KEY (run_id) REFERENCES local_runs(id)
  );

  CREATE INDEX IF NOT EXISTS idx_local_runtime_events_run_id
    ON local_runtime_events(run_id, id);

  CREATE TABLE IF NOT EXISTS local_artifacts (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    content_type TEXT,
    path TEXT,
    size_bytes INTEGER,
    metadata_json TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (run_id) REFERENCES local_runs(id)
  );
`;
const isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
const sha256Hex = (value) => createHash("sha256").update(value).digest("hex");
const tokenHint = (token) => {
	if (token.length <= 8) return "*".repeat(token.length);
	return token.slice(0, 4) + "..." + token.slice(-4);
};
const compareSecret = (candidate, expected) => {
	const candidateHash = Buffer.from(sha256Hex(candidate), "hex");
	const expectedHash = Buffer.from(sha256Hex(expected), "hex");
	return candidateHash.length === expectedHash.length && timingSafeEqual(candidateHash, expectedHash);
};
const nowIso = (now) => (now ? now() : /* @__PURE__ */ new Date()).toISOString();
const slugify = (value) => {
	const slug = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
	return slug.length > 0 ? slug : "local";
};
const randomId = (prefix) => prefix + "_" + randomBytes(10).toString("hex");
const writeJson = (path, value) => {
	writeFileSync(path, JSON.stringify(value, null, 2) + "\n", { mode: 384 });
};
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const manifestStorePath = (layout) => {
	const path = layout.store.path;
	const relativePath = relative(layout.harborDir, path);
	if (relativePath.length > 0 && !relativePath.startsWith("..") && !isAbsolute(relativePath)) return relativePath;
	return path;
};
const resolveManifestStorePath = (harborDir, manifest) => {
	const path = manifest.store.path;
	return isAbsolute(path) ? path : resolve(harborDir, path);
};
const validateManifest = (value) => {
	if (!isRecord(value)) throw new Error("Invalid local Harbor runtime manifest");
	const version = value.version;
	const project = value.project;
	const store = value.store;
	if (version !== LOCAL_PROJECT_MANIFEST_VERSION || !isRecord(project) || !isRecord(store)) throw new Error("Invalid local Harbor runtime manifest");
	const workspaceId = project.workspaceId;
	const workspaceName = project.workspaceName;
	const slug = project.slug;
	const createdAt = project.createdAt;
	const updatedAt = project.updatedAt;
	const driver = store.driver;
	const path = store.path;
	if (typeof workspaceId !== "string" || typeof workspaceName !== "string" || typeof slug !== "string" || typeof createdAt !== "string" || typeof updatedAt !== "string" || driver !== "sqlite" || typeof path !== "string") throw new Error("Invalid local Harbor runtime manifest");
	const auth = value.auth;
	if (auth !== void 0) {
		if (!isRecord(auth) || typeof auth.tokenSha256 !== "string" || typeof auth.tokenHint !== "string") throw new Error("Invalid local Harbor auth manifest");
		return {
			version: LOCAL_PROJECT_MANIFEST_VERSION,
			project: {
				workspaceId,
				workspaceName,
				slug,
				createdAt,
				updatedAt
			},
			store: {
				driver,
				path
			},
			auth: {
				tokenSha256: auth.tokenSha256,
				tokenHint: auth.tokenHint
			}
		};
	}
	return {
		version: LOCAL_PROJECT_MANIFEST_VERSION,
		project: {
			workspaceId,
			workspaceName,
			slug,
			createdAt,
			updatedAt
		},
		store: {
			driver,
			path
		}
	};
};
const resolveLocalProjectLayout = (rootDir, options = {}) => {
	const root = resolve(rootDir);
	const harborDir = join(root, ".harbor");
	const storePath = resolve(options.storePath ?? join(harborDir, "harbor.db"));
	return {
		rootDir: root,
		harborDir,
		runtimeManifestPath: join(harborDir, "runtime.json"),
		artifactsDir: join(harborDir, "artifacts"),
		tracesDir: join(harborDir, "traces"),
		cacheDir: join(harborDir, "cache"),
		gitignorePath: join(harborDir, ".gitignore"),
		store: { path: storePath }
	};
};
const createLocalStoreHandle = (path) => ({ path: resolve(path) });
const initLocalProject = (options = {}) => {
	const rootDir = resolve(options.rootDir ?? process.cwd());
	const layout = resolveLocalProjectLayout(rootDir, { storePath: options.storePath });
	const timestamp = nowIso(options.now);
	const workspaceName = options.workspaceName ?? "Local Harbor";
	const workspaceId = options.workspaceId ?? randomId("ws_local");
	const slug = options.slug ?? slugify(workspaceName);
	mkdirSync(layout.harborDir, { recursive: true });
	mkdirSync(dirname(layout.store.path), { recursive: true });
	mkdirSync(layout.artifactsDir, { recursive: true });
	mkdirSync(layout.tracesDir, { recursive: true });
	mkdirSync(layout.cacheDir, { recursive: true });
	if (!existsSync(layout.gitignorePath)) writeFileSync(layout.gitignorePath, "*\n!.gitignore\n", { mode: 384 });
	const manifestBase = {
		version: LOCAL_PROJECT_MANIFEST_VERSION,
		project: {
			workspaceId,
			workspaceName,
			slug,
			createdAt: timestamp,
			updatedAt: timestamp
		},
		store: {
			driver: "sqlite",
			path: manifestStorePath(layout)
		}
	};
	const manifest = options.authToken ? {
		...manifestBase,
		auth: {
			tokenSha256: sha256Hex(options.authToken),
			tokenHint: tokenHint(options.authToken)
		}
	} : manifestBase;
	writeJson(layout.runtimeManifestPath, manifest);
	const store = openLocalHarborStore(layout.store);
	try {
		store.upsertWorkspace(localWorkspaceFromManifest(manifest));
	} finally {
		store.close();
	}
	return {
		rootDir,
		layout,
		manifest
	};
};
const discoverLocalProject = (options = {}) => {
	let current = resolve(options.startDir ?? process.cwd());
	while (true) {
		const harborDir = join(current, ".harbor");
		const runtimeManifestPath = join(harborDir, "runtime.json");
		if (existsSync(runtimeManifestPath)) {
			const manifest = validateManifest(readJson(runtimeManifestPath));
			const layout = resolveLocalProjectLayout(current, { storePath: resolveManifestStorePath(harborDir, manifest) });
			return {
				rootDir: current,
				layout,
				manifest
			};
		}
		const parent = dirname(current);
		if (parent === current) return null;
		current = parent;
	}
};
const localWorkspaceFromManifest = (manifest) => ({
	id: manifest.project.workspaceId,
	name: manifest.project.workspaceName,
	slug: manifest.project.slug,
	createdBy: "local",
	createdAt: manifest.project.createdAt,
	updatedAt: manifest.project.updatedAt
});
const adaptBunSqlite = (BunDb) => {
	return class AdaptedBunSqlite {
		bun;
		constructor(filename) {
			this.bun = new BunDb(filename);
		}
		exec(sql) {
			this.bun.exec(sql);
		}
		prepare(sql) {
			const statement = this.bun.prepare(sql);
			return {
				run: (...params) => statement.run(...params),
				get: (...params) => statement.get(...params),
				all: (...params) => statement.all(...params)
			};
		}
		close() {
			this.bun.close();
		}
	};
};
const loadSqliteDatabaseCtor = () => {
	if (sqliteCtor) return sqliteCtor;
	if (!sqliteWarningPatched) {
		sqliteWarningPatched = true;
		const original = process.emitWarning.bind(process);
		process.emitWarning = ((warning, ...rest) => {
			const text = typeof warning === "string" ? warning : warning instanceof Error ? warning.message : String(warning);
			if (/SQLite is an experimental feature/i.test(text)) return;
			return original(warning, ...rest);
		});
	}
	const req = createRequire(import.meta.url);
	try {
		sqliteCtor = req("node:sqlite").DatabaseSync;
		return sqliteCtor;
	} catch {
		sqliteCtor = adaptBunSqlite(req("bun:sqlite").Database);
		return sqliteCtor;
	}
};
const tightenStorePermissions = (storePath) => {
	for (const path of [
		storePath,
		storePath + "-wal",
		storePath + "-shm"
	]) try {
		if (existsSync(path)) chmodSync(path, 384);
	} catch {}
};
const openSqlite = (handle) => {
	mkdirSync(dirname(handle.path), { recursive: true });
	const db = new (loadSqliteDatabaseCtor())(handle.path);
	db.exec("PRAGMA journal_mode = WAL;");
	db.exec("PRAGMA busy_timeout = 30000;");
	db.exec("PRAGMA foreign_keys = ON;");
	db.exec(schemaSql);
	const version = db.prepare("PRAGMA user_version").get();
	if (!version?.user_version || version.user_version < LOCAL_STORE_SCHEMA_VERSION) db.exec("PRAGMA user_version = " + String(LOCAL_STORE_SCHEMA_VERSION) + ";");
	tightenStorePermissions(handle.path);
	return db;
};
const parseJsonValue = (value) => {
	if (value === null) return null;
	return JSON.parse(value);
};
const toWorkspaceRecord = (row) => ({
	id: row.id,
	name: row.name,
	slug: row.slug,
	createdBy: row.created_by,
	createdAt: row.created_at,
	updatedAt: row.updated_at
});
const toRunRecord = (row) => ({
	id: row.id,
	workspaceId: row.workspace_id,
	mode: row.mode,
	status: row.status,
	codeSha256: row.code_sha256,
	request: parseJsonValue(row.request_json),
	result: parseJsonValue(row.result_json),
	error: row.error,
	createdAt: row.created_at,
	completedAt: row.completed_at
});
const toRuntimeEventRecord = (row) => ({
	id: row.id,
	runId: row.run_id,
	name: row.name,
	time: row.time,
	detail: parseJsonValue(row.detail_json)
});
const boundedLimit = (limit) => {
	if (!Number.isFinite(limit ?? NaN)) return 50;
	return Math.max(1, Math.min(100, Math.floor(limit)));
};
const boundedOffset = (offset) => {
	if (!Number.isFinite(offset ?? NaN)) return 0;
	return Math.max(0, Math.floor(offset));
};
const openLocalHarborStore = (handle) => {
	const normalizedHandle = createLocalStoreHandle(handle.path);
	const db = openSqlite(normalizedHandle);
	return {
		handle: normalizedHandle,
		schemaVersion: () => {
			return db.prepare("PRAGMA user_version").get()?.user_version ?? 0;
		},
		upsertWorkspace: (workspace) => {
			db.prepare(`INSERT INTO local_workspaces (id, name, slug, created_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name,
           slug = excluded.slug,
           updated_at = excluded.updated_at`).run(workspace.id, workspace.name, workspace.slug, workspace.createdBy, workspace.createdAt, workspace.updatedAt);
			tightenStorePermissions(normalizedHandle.path);
		},
		getWorkspace: (workspaceId) => {
			const row = db.prepare("SELECT * FROM local_workspaces WHERE id = ?").get(workspaceId);
			return row ? toWorkspaceRecord(row) : null;
		},
		listWorkspaces: (options = {}) => {
			const limit = boundedLimit(options.limit);
			const offset = boundedOffset(options.offset);
			const total = db.prepare("SELECT COUNT(*) AS total FROM local_workspaces").get()?.total ?? 0;
			const rows = db.prepare("SELECT * FROM local_workspaces ORDER BY created_at ASC LIMIT ? OFFSET ?").all(limit, offset);
			return {
				data: rows.map(toWorkspaceRecord),
				total,
				limit,
				offset,
				hasMore: offset + rows.length < total
			};
		},
		recordRunStarted: (run) => {
			db.prepare("DELETE FROM local_runtime_events WHERE run_id = ?").run(run.id);
			db.prepare(`INSERT INTO local_runs
          (id, workspace_id, mode, status, code_sha256, request_json, result_json, error, created_at, completed_at)
         VALUES (?, ?, ?, 'running', ?, ?, NULL, NULL, ?, NULL)
         ON CONFLICT(id) DO UPDATE SET
           workspace_id = excluded.workspace_id,
           mode = excluded.mode,
           status = excluded.status,
           code_sha256 = excluded.code_sha256,
           request_json = excluded.request_json,
           result_json = NULL,
           error = NULL,
           created_at = excluded.created_at,
           completed_at = NULL`).run(run.id, run.workspaceId, run.mode, sha256Hex(run.code), JSON.stringify(run.request), run.createdAt);
			tightenStorePermissions(normalizedHandle.path);
		},
		recordRunCompleted: (run) => {
			db.prepare(`UPDATE local_runs
         SET status = ?, result_json = ?, error = ?, completed_at = ?
         WHERE id = ?`).run(run.status, JSON.stringify(run.result), run.error ?? null, run.completedAt, run.id);
			tightenStorePermissions(normalizedHandle.path);
		},
		recordRuntimeEvents: (runId, events) => {
			const statement = db.prepare(`INSERT INTO local_runtime_events (run_id, name, time, detail_json)
         VALUES (?, ?, ?, ?)`);
			for (const event of events) statement.run(runId, event.name, event.time, event.detail === void 0 ? null : JSON.stringify(event.detail));
			tightenStorePermissions(normalizedHandle.path);
		},
		listRuns: (workspaceId) => {
			return db.prepare("SELECT * FROM local_runs WHERE workspace_id = ? ORDER BY created_at DESC").all(workspaceId).map(toRunRecord);
		},
		getRun: (runId) => {
			const row = db.prepare("SELECT * FROM local_runs WHERE id = ?").get(runId);
			return row ? toRunRecord(row) : null;
		},
		listRuntimeEvents: (runId) => {
			return db.prepare("SELECT * FROM local_runtime_events WHERE run_id = ? ORDER BY id ASC").all(runId).map(toRuntimeEventRecord);
		},
		close: () => {
			db.close();
		}
	};
};
const apiSuccess = (data, status = 200) => jsonResponse({
	success: true,
	data
}, status);
const apiFailure = (status, error, issues) => {
	return jsonResponse(issues ? {
		success: false,
		error,
		issues
	} : {
		success: false,
		error
	}, status);
};
const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), {
	status,
	headers: { "content-type": "application/json; charset=utf-8" }
});
const textResponse = (body, contentType, status = 200) => new Response(body, {
	status,
	headers: { "content-type": contentType }
});
const parseBody = async (request) => {
	if (request.method === "GET" || request.method === "HEAD") return void 0;
	const text = await request.text();
	if (text.trim().length === 0) return {};
	return JSON.parse(text);
};
const requireRecordBody = (body) => {
	if (body === void 0) return {};
	if (!isRecord(body)) throw new LocalHttpError(400, "Expected JSON object request body");
	return body;
};
const requireString = (body, key) => {
	const value = body[key];
	if (typeof value !== "string" || value.length === 0) throw new LocalHttpError(400, "Missing required string field: " + key);
	return value;
};
const optionalString = (body, key) => {
	const value = body[key];
	return typeof value === "string" && value.length > 0 ? value : void 0;
};
const optionalNumber = (body, key) => {
	const value = body[key];
	return typeof value === "number" && Number.isFinite(value) ? value : void 0;
};
const executeSources = (body) => {
	const sources = body.sources;
	if (!Array.isArray(sources)) return void 0;
	return sources.flatMap((source) => isRecord(source) && typeof source.namespace === "string" ? [source.namespace] : []);
};
const executeInputs = (body) => {
	const inputs = body.execution_inputs;
	if (!Array.isArray(inputs)) return void 0;
	return inputs.flatMap((input) => {
		if (!isRecord(input) || typeof input.path !== "string" || typeof input.data_base64 !== "string") return [];
		return [{
			name: input.path,
			data: input.data_base64,
			...typeof input.content_type === "string" ? { contentType: input.content_type } : {},
			...typeof input.sha256 === "string" ? { sha256: input.sha256 } : {}
		}];
	});
};
const executeMode = (body) => {
	return body.mode === "workflow" ? "workflow" : "exec";
};
const makeRequest = (input, init) => {
	if (input instanceof Request) return init ? new Request(input, init) : input;
	return new Request(input, init);
};
const normalizedPath = (url) => {
	const path = url.pathname.replace(/\/+$/, "") || "/";
	return path.startsWith("/v1/") ? path.slice(3) : path;
};
const workspaceSummary = (workspace) => ({
	id: workspace.id,
	name: workspace.name,
	slug: workspace.slug,
	role: "owner",
	onboarded_at: null,
	created_at: workspace.createdAt,
	updated_at: workspace.updatedAt
});
const workspaceDetail = (workspace) => ({
	id: workspace.id,
	name: workspace.name,
	slug: workspace.slug,
	created_by: workspace.createdBy,
	created_at: workspace.createdAt,
	updated_at: workspace.updatedAt
});
const runtimeHostNotConfigured = (invocation) => Effect.succeed({
	mode: invocation.request.mode,
	error: "NOT_IMPLEMENTED_LOCAL: no local runtime host configured",
	logs: [],
	warnings: [],
	timings: {}
});
const executeResultMode = (mode) => mode === "workflow" ? "workflow" : "dynamic_worker";
const localWarning = (message) => ({
	namespace: "local",
	tool: "runtime",
	message
});
const readBearerToken = (request) => {
	return (request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i))?.[1] ?? null;
};
const authorize = (request, options) => {
	if (!options.requireAuth) return null;
	if (!options.authToken) return apiFailure(500, "LOCAL_AUTH_MISCONFIGURED: requireAuth needs authToken");
	const bearer = readBearerToken(request);
	if (!bearer || !compareSecret(bearer, options.authToken)) return apiFailure(401, "Unauthorized");
	return null;
};
const createLocalHarborFetch = (options) => {
	if (options.store && options.storeHandle) throw new Error("Pass either store or storeHandle, not both");
	const store = options.store ?? openLocalHarborStore(options.storeHandle ?? options.project.layout.store);
	const ownsStore = !options.store;
	const now = options.now;
	const workspace = localWorkspaceFromManifest(options.project.manifest);
	store.upsertWorkspace(workspace);
	const requireAuth = options.requireAuth ?? options.authToken !== void 0;
	const frontend = options.frontend ?? {};
	const runtimeHost = options.runtimeHost ?? runtimeHostNotConfigured;
	const planner = options.planner ?? ((request, context) => Effect.succeed({
		runtimePlan: emptyRuntimePlan({ requiredNamespaces: (request.sourceFilter ?? []).map((namespace) => ({
			namespace,
			bindingKind: "tool",
			optional: true
		})) }),
		hostPlan: {
			platform: "local",
			workspaceId: context.scopeId,
			storePath: store.handle.path
		}
	}));
	const handleWorkspaceList = async (request) => {
		const body = requireRecordBody(await parseBody(request));
		const limit = optionalNumber(body, "limit");
		const offset = optionalNumber(body, "offset");
		const list = store.listWorkspaces({
			limit,
			offset
		});
		return apiSuccess({
			data: list.data.map(workspaceSummary),
			total: list.total,
			limit: list.limit,
			offset: list.offset,
			hasMore: list.hasMore
		});
	};
	const handleWorkspaceGet = async (request) => {
		const workspaceId = requireString(requireRecordBody(await parseBody(request)), "workspace_id");
		const found = store.getWorkspace(workspaceId);
		if (!found) return apiFailure(404, "Workspace not found");
		return apiSuccess(workspaceDetail(found));
	};
	const handleExecute = async (request) => {
		const body = requireRecordBody(await parseBody(request));
		const workspaceId = requireString(body, "workspace_id");
		if (!store.getWorkspace(workspaceId)) return apiFailure(404, "Workspace not found");
		const code = requireString(body, "code");
		const mode = executeMode(body);
		const runId = optionalString(body, "run_id") ?? randomId("run_local");
		const createdAt = nowIso(now);
		const timeoutMs = optionalNumber(body, "timeout_ms");
		const sourceFilter = executeSources(body);
		const executionInputList = executeInputs(body);
		const runtimeRequest = {
			code,
			mode,
			...timeoutMs !== void 0 ? { timeoutMs } : {},
			...sourceFilter ? { sourceFilter } : {},
			...executionInputList ? { executionInputs: executionInputList } : {}
		};
		store.recordRunStarted({
			id: runId,
			workspaceId,
			mode,
			code,
			request: body,
			createdAt
		});
		const localRuntime = makeInMemoryLocalRuntimeProviders({ host: runtimeHost });
		const runtimeLayer = RuntimeExecutorLive.pipe(Layer.provide(Layer.mergeAll(localRuntime.layers, Layer.succeed(RuntimePlanner, { plan: planner }))));
		const runtimeResult = await Effect.runPromise(RuntimeExecutor.use((executor) => executor.execute(runtimeRequest, {
			scopeId: workspaceId,
			runId
		})).pipe(Effect.provide(runtimeLayer))).catch((error) => ({
			mode,
			error: error instanceof Error ? error.message : String(error),
			logs: [],
			warnings: [],
			timings: {}
		}));
		const status = runtimeResult.error ? "failed" : "completed";
		store.recordRuntimeEvents(runId, localRuntime.snapshot().events);
		store.recordRunCompleted({
			id: runId,
			status,
			result: runtimeResult.result ?? null,
			error: runtimeResult.error,
			completedAt: nowIso(now)
		});
		return apiSuccess({
			result: runtimeResult.result ?? null,
			...runtimeResult.error ? { error: runtimeResult.error } : {},
			logs: runtimeResult.logs,
			mode: executeResultMode(mode),
			...runtimeResult.warnings.length > 0 ? { warnings: runtimeResult.warnings.map(localWarning) } : {},
			run_id: runId
		});
	};
	const handleRunsList = async (request) => {
		const workspaceId = requireString(requireRecordBody(await parseBody(request)), "workspace_id");
		return apiSuccess({ runs: store.listRuns(workspaceId) });
	};
	const handleRunsGet = async (request) => {
		const runId = requireString(requireRecordBody(await parseBody(request)), "run_id");
		const run = store.getRun(runId);
		if (!run) return apiFailure(404, "Run not found");
		return apiSuccess({ run });
	};
	const handleRunsEvents = async (request) => {
		const runId = requireString(requireRecordBody(await parseBody(request)), "run_id");
		return apiSuccess({ events: store.listRuntimeEvents(runId) });
	};
	const fetchImpl = async (input, init) => {
		const request = makeRequest(input, init);
		const path = normalizedPath(new URL(request.url));
		if (request.method === "GET" && frontend !== false && (path === "/" || path === "/local")) return textResponse(renderLocalHarborFrontendHtml({
			...frontend,
			authRequired: requireAuth
		}), "text/html; charset=utf-8");
		if (request.method === "GET" && frontend !== false && path === "/local/frontend.js") return textResponse(renderLocalHarborFrontendScript(), "text/javascript; charset=utf-8");
		if (request.method === "GET" && (path === "/health" || path === "/v1/health")) return jsonResponse({
			status: "ok",
			service: "harbor-api",
			environment: "local"
		});
		if (request.method === "GET" && (path === "/healthz" || path === "/v1/healthz")) {
			const startedAt = Date.now();
			return jsonResponse({
				status: "ok",
				service: "harbor-api",
				environment: "local",
				version: null,
				checks: {
					db: "ok",
					migrations: "ok"
				},
				migrations: {
					expected: String(LOCAL_STORE_SCHEMA_VERSION),
					latest_applied: String(store.schemaVersion()),
					applied_count: store.schemaVersion() >= LOCAL_STORE_SCHEMA_VERSION ? 1 : 0
				},
				db_ms: 0,
				total_ms: Date.now() - startedAt,
				timestamp: nowIso(now)
			});
		}
		const authFailure = authorize(request, {
			authToken: options.authToken,
			requireAuth
		});
		if (authFailure) return authFailure;
		try {
			if (request.method === "POST" && path === "/workspaces/list") return await handleWorkspaceList(request);
			if (request.method === "POST" && path === "/workspaces/get") return await handleWorkspaceGet(request);
			if (request.method === "POST" && path === "/plugins/execute") return await handleExecute(request);
			if (request.method === "POST" && path === "/runs/list") return await handleRunsList(request);
			if (request.method === "POST" && path === "/runs/get") return await handleRunsGet(request);
			if (request.method === "POST" && path === "/runs/events") return await handleRunsEvents(request);
			return apiFailure(501, "NOT_IMPLEMENTED_LOCAL: " + request.method + " " + path);
		} catch (error) {
			if (error instanceof LocalHttpError) return apiFailure(error.status, error.message, error.issues);
			if (error instanceof SyntaxError) return apiFailure(400, "Invalid JSON request body");
			return apiFailure(500, error instanceof Error ? error.message : String(error));
		}
	};
	return {
		project: options.project,
		store,
		fetch: fetchImpl,
		close: () => {
			if (ownsStore) store.close();
		}
	};
};
const incomingHeaders = (request) => {
	const headers = new Headers();
	for (const [key, value] of Object.entries(request.headers)) {
		if (value === void 0) continue;
		if (Array.isArray(value)) for (const item of value) headers.append(key, item);
		else headers.set(key, value);
	}
	return headers;
};
const incomingBody = async (request) => {
	if (request.method === "GET" || request.method === "HEAD") return void 0;
	const chunks = [];
	for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
	if (chunks.length === 0) return void 0;
	const body = Buffer.concat(chunks);
	return body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength);
};
const incomingRequest = async (request) => {
	const host = request.headers.host ?? "127.0.0.1";
	const url = new URL(request.url ?? "/", "http://" + host);
	const body = await incomingBody(request);
	return new Request(url, {
		method: request.method ?? "GET",
		headers: incomingHeaders(request),
		...body ? { body } : {}
	});
};
const writeFetchResponse = async (fetchResponse, response) => {
	response.statusCode = fetchResponse.status;
	fetchResponse.headers.forEach((value, key) => {
		response.setHeader(key, value);
	});
	const body = await fetchResponse.arrayBuffer();
	response.end(Buffer.from(body));
};
const serverUrl = (server, hostname) => {
	const address = server.address();
	if (!address || typeof address === "string") return "http://" + hostname;
	const info = address;
	return "http://" + hostname + ":" + String(info.port);
};
const startLocalHarborServer = async (options) => {
	const local = createLocalHarborFetch(options);
	const hostname = options.hostname ?? "127.0.0.1";
	const port = options.port ?? 0;
	const server = createServer((incoming, outgoing) => {
		incomingRequest(incoming).then((request) => local.fetch(request)).then((response) => writeFetchResponse(response, outgoing)).catch((error) => {
			return writeFetchResponse(apiFailure(500, error instanceof Error ? error.message : String(error)), outgoing);
		});
	});
	try {
		await new Promise((resolveListen, rejectListen) => {
			const onError = (error) => {
				server.off("listening", onListening);
				rejectListen(error);
			};
			const onListening = () => {
				server.off("error", onError);
				resolveListen();
			};
			server.once("error", onError);
			server.once("listening", onListening);
			server.listen(port, hostname);
		});
	} catch (error) {
		local.close();
		throw error;
	}
	return {
		project: local.project,
		store: local.store,
		fetch: local.fetch,
		server,
		url: serverUrl(server, hostname),
		close: async () => {
			await new Promise((resolveClose, rejectClose) => {
				server.close((error) => {
					if (error) rejectClose(error);
					else resolveClose();
				});
			});
			local.close();
		}
	};
};
//#endregion
export { LOCAL_HARBOR_FRONTEND_SCRIPT_PATH, createLocalHarborFetch, createLocalStoreHandle, discoverLocalProject, initLocalProject, localWorkspaceFromManifest, makeInMemoryLocalRuntimeProviders, makeLocalRuntimeHostHandler, makeLocalRuntimeProviders, openLocalHarborStore, renderLocalHarborFrontendHtml, renderLocalHarborFrontendScript, resolveLocalProjectLayout, startLocalHarborServer };

//# sourceMappingURL=local.mjs.map