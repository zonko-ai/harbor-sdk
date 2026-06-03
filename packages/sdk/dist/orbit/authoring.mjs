import { parse } from "acorn";
import { Schema, SchemaGetter } from "effect";
import { transform } from "sucrase";
//#region ../core-effect/src/scalars.ts
const Timestamp = Schema.String;
Schema.NullOr(Timestamp);
const WorkspaceId = Schema.String.check(Schema.isUUID());
Schema.NonEmptyString;
Schema.NonEmptyString;
Schema.String.check(Schema.isUUID());
Schema.NonEmptyString;
const SourceNamespace = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/));
/**
* Normalize an arbitrary free-text string into the lowercase-safe namespace
* shape accepted by {@link SourceNamespace}: lowercase, non-alphanumerics
* collapsed to `-`, leading/trailing `-` trimmed, capped at 40 chars.
*
* This is the single source of truth for the namespace slugify algorithm. The
* frontend mirror lives in
* `apps/web/modules/plugin-registry/namespace-suffix.ts`; the two must stay in
* sync. Returns `''` for input that contains no alphanumerics — callers that
* need a non-empty result should fall back to a default (e.g. `'source'`),
* which is what {@link NormalizedSourceNamespace} does on decode.
*/
function sanitizeNamespace(input) {
	return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}
Schema.String.pipe(Schema.decodeTo(SourceNamespace, {
	decode: SchemaGetter.transform((s) => sanitizeNamespace(s) || "source"),
	encode: SchemaGetter.passthrough()
}));
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/));
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/));
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:[-_./][a-z0-9]+)*$/));
Schema.NonEmptyString;
Schema.NonEmptyString;
Schema.String.check(Schema.isPattern(/^[A-Z][A-Z0-9_]*$/));
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:_[a-z0-9]+)*$/));
Schema.Record(Schema.String, Schema.Unknown);
//#endregion
//#region ../core-effect/src/trigger.ts
const TriggerId = Schema.NonEmptyString;
const TriggerDeliveryId = Schema.NonEmptyString;
const TriggerSourceKind = Schema.Literals([
	"schedule.cron",
	"schedule.once",
	"webhook.http"
]);
const TriggerKind = TriggerSourceKind;
const TriggerStatus = Schema.Literals([
	"draft",
	"active",
	"paused",
	"disabled",
	"failed"
]);
const TriggerDeliveryStatus = Schema.Literals([
	"queued",
	"claimed",
	"running",
	"completed",
	"failed",
	"skipped",
	"cancelled",
	"dead_lettered"
]);
Schema.Literals([
	"started",
	"completed",
	"failed",
	"retry_scheduled",
	"abandoned"
]);
const TriggerSetupKind = Schema.Literals([
	"webhook_url",
	"source_authorization",
	"secret",
	"schedule",
	"policy"
]);
const TriggerCheckStatus = Schema.Literals([
	"pass",
	"warn",
	"fail"
]);
const TriggerScheduleCatchUp = Schema.Literals([
	"none",
	"one",
	"all"
]);
const TriggerMisfireStrategy = Schema.Literals([
	"skip",
	"coalesce_latest",
	"enqueue"
]);
const TriggerConcurrencyOverflow = Schema.Literals([
	"queue",
	"skip",
	"coalesce_latest",
	"fail"
]);
const TriggerConcurrencyScope = Schema.Literals([
	"global",
	"workspace",
	"trigger",
	"job",
	"custom"
]);
const TriggerErrorReason = Schema.Literals([
	"invalid_trigger_kind",
	"invalid_config",
	"target_job_not_found",
	"target_version_not_ready",
	"target_not_triggerable",
	"input_mapping_invalid",
	"schedule_invalid",
	"webhook_verification_unavailable",
	"source_authorization_missing",
	"quota_exceeded",
	"policy_denied",
	"receipt_expired",
	"receipt_consumed",
	"idempotency_conflict",
	"concurrency_limit_exceeded"
]);
Schema.Struct({
	cron: Schema.NonEmptyString,
	timezone: Schema.optional(Schema.String),
	min_interval_seconds: Schema.optional(Schema.Number),
	catch_up: Schema.optional(TriggerScheduleCatchUp),
	misfire_strategy: Schema.optional(TriggerMisfireStrategy)
});
const TriggerOnceScheduleSpec = Schema.Struct({
	kind: Schema.Literal("schedule.once"),
	fire_at: Schema.NonEmptyString,
	timezone: Schema.optional(Schema.String)
});
const TriggerWebhookSignedPayloadPart = Schema.Union([
	Schema.Struct({ type: Schema.Literal("raw_body") }),
	Schema.Struct({
		type: Schema.Literal("header"),
		header: Schema.NonEmptyString
	}),
	Schema.Struct({
		type: Schema.Literal("json_path"),
		path: Schema.NonEmptyString
	}),
	Schema.Struct({
		type: Schema.Literal("static"),
		value: Schema.String
	})
]);
const TriggerWebhookVerification = Schema.Union([
	Schema.Struct({ mode: Schema.Literal("none") }),
	Schema.Struct({
		mode: Schema.Literal("shared_secret_header"),
		header: Schema.NonEmptyString,
		secret_sha256: Schema.NonEmptyString
	}),
	Schema.Struct({
		mode: Schema.Literal("hmac_sha256"),
		signature_header: Schema.NonEmptyString,
		secret: Schema.NonEmptyString,
		encoding: Schema.optional(Schema.Literals(["hex", "base64"])),
		prefix: Schema.optional(Schema.String),
		signed_payload: Schema.optional(Schema.Struct({
			separator: Schema.optional(Schema.String),
			parts: Schema.Array(TriggerWebhookSignedPayloadPart)
		})),
		tolerance_seconds: Schema.optional(Schema.Number),
		timestamp_header: Schema.optional(Schema.NonEmptyString)
	}),
	Schema.Struct({
		mode: Schema.Literal("standard_webhooks"),
		secret: Schema.NonEmptyString,
		tolerance_seconds: Schema.optional(Schema.Number)
	})
]);
const TriggerWebhookIdempotency = Schema.Union([
	Schema.Struct({ mode: Schema.Literal("body_sha256") }),
	Schema.Struct({
		mode: Schema.Literal("header"),
		header: Schema.NonEmptyString
	}),
	Schema.Struct({
		mode: Schema.Literal("json_path"),
		path: Schema.NonEmptyString
	}),
	Schema.Struct({ mode: Schema.Literal("standard_webhooks_id") })
]);
const TriggerWebhookEventType = Schema.Union([
	Schema.Struct({ mode: Schema.Literal("none") }),
	Schema.Struct({
		mode: Schema.Literal("static"),
		value: Schema.NonEmptyString
	}),
	Schema.Struct({
		mode: Schema.Literal("header"),
		header: Schema.NonEmptyString
	}),
	Schema.Struct({
		mode: Schema.Literal("json_path"),
		path: Schema.NonEmptyString
	})
]);
const TriggerWebhookSpec = Schema.Struct({
	kind: Schema.Literal("webhook.http"),
	event: Schema.optional(Schema.String),
	secret_ref: Schema.optional(Schema.String),
	max_event_bytes: Schema.optional(Schema.Number),
	verification: Schema.optional(TriggerWebhookVerification),
	idempotency: Schema.optional(TriggerWebhookIdempotency),
	event_type: Schema.optional(TriggerWebhookEventType)
});
const TriggerScheduleSpecWithKind = Schema.Struct({
	kind: Schema.Literal("schedule.cron"),
	cron: Schema.NonEmptyString,
	timezone: Schema.optional(Schema.String),
	min_interval_seconds: Schema.optional(Schema.Number),
	catch_up: Schema.optional(TriggerScheduleCatchUp),
	misfire_strategy: Schema.optional(TriggerMisfireStrategy)
});
const TriggerSourceConfig = Schema.Union([
	TriggerScheduleSpecWithKind,
	TriggerOnceScheduleSpec,
	TriggerWebhookSpec
]);
const TriggerInputPassthroughMapping = Schema.Struct({ mode: Schema.Literal("passthrough") });
const TriggerInputSourceEventMapping = Schema.Struct({
	mode: Schema.Literal("source_event"),
	schema: Schema.NonEmptyString
});
const TriggerInputDeclarativeMapping = Schema.Struct({
	mode: Schema.Literal("declarative"),
	fields: Schema.Record(Schema.String, Schema.NonEmptyString)
});
const TriggerInputMapping = Schema.Union([
	TriggerInputPassthroughMapping,
	TriggerInputSourceEventMapping,
	TriggerInputDeclarativeMapping
]);
const TriggerIdempotencyPolicy = Schema.Struct({
	key: Schema.Array(Schema.NonEmptyString),
	ttl_seconds: Schema.optional(Schema.Number)
});
const TriggerConcurrencyPolicy = Schema.Struct({
	scope: Schema.optional(TriggerConcurrencyScope),
	key: Schema.Array(Schema.NonEmptyString),
	limit: Schema.Number,
	overflow: TriggerConcurrencyOverflow,
	ttl_seconds: Schema.optional(Schema.Number)
});
const TriggerRetryPolicy = Schema.Struct({
	max_attempts: Schema.optional(Schema.Number),
	backoff: Schema.optional(Schema.Literals([
		"none",
		"fixed",
		"exponential"
	]))
});
const TriggerRetentionPolicy = Schema.Struct({
	event_ttl_seconds: Schema.optional(Schema.Number),
	delivery_ttl_seconds: Schema.optional(Schema.Number)
});
const TriggerLimitCount = Schema.Number.check(Schema.isInt(), Schema.isGreaterThanOrEqualTo(1));
const TriggerLimitEventBytes = Schema.Number.check(Schema.isInt(), Schema.isGreaterThanOrEqualTo(1024));
const TriggerLimits = Schema.Struct({
	max_active_triggers: Schema.optional(TriggerLimitCount),
	max_active_schedules: Schema.optional(TriggerLimitCount),
	max_due_per_tick: Schema.optional(TriggerLimitCount),
	max_concurrent_deliveries: Schema.optional(TriggerLimitCount),
	max_concurrent_cron_deliveries: Schema.optional(TriggerLimitCount),
	max_concurrent_webhook_deliveries: Schema.optional(TriggerLimitCount),
	min_cron_interval_seconds: Schema.optional(TriggerLimitCount),
	max_event_bytes: Schema.optional(TriggerLimitEventBytes)
});
const TriggerableJobEventBinding = Schema.Struct({
	source_kind: TriggerSourceKind,
	event: Schema.optional(Schema.NonEmptyString),
	input_mapping: TriggerInputMapping,
	idempotency: Schema.optional(TriggerIdempotencyPolicy),
	concurrency: Schema.optional(TriggerConcurrencyPolicy),
	retry: Schema.optional(TriggerRetryPolicy),
	retention: Schema.optional(TriggerRetentionPolicy),
	metadata: Schema.optional(Schema.Record(Schema.String, Schema.Unknown))
});
const TriggerableJobManifest = Schema.Struct({
	version: Schema.optional(Schema.Literal(1)),
	events: Schema.Array(TriggerableJobEventBinding)
});
const TriggerTargetJobRef = Schema.Struct({
	job: Schema.NonEmptyString,
	version: Schema.optional(Schema.String)
});
Schema.Struct({
	workspace_id: WorkspaceId,
	source: TriggerSourceConfig,
	target: TriggerTargetJobRef,
	input_mapping: Schema.optional(TriggerInputMapping),
	limits: Schema.optional(TriggerLimits),
	activation: Schema.optional(Schema.Struct({
		name: Schema.optional(Schema.String),
		description: Schema.optional(Schema.String)
	}))
});
const TriggerCheck = Schema.Struct({
	code: Schema.NonEmptyString,
	status: TriggerCheckStatus,
	message: Schema.String,
	data: Schema.optional(Schema.Unknown)
});
const TriggerRequiredSetup = Schema.Struct({
	kind: TriggerSetupKind,
	status: Schema.Literals([
		"ready",
		"required",
		"missing"
	]),
	data: Schema.optional(Schema.Unknown)
});
const TriggerActivationDraft = Schema.Struct({
	source: TriggerSourceConfig,
	target: TriggerTargetJobRef,
	input_mapping: Schema.optional(TriggerInputMapping),
	limits: Schema.optional(TriggerLimits)
});
const TriggerActivateBody = Schema.Struct({
	workspace_id: WorkspaceId,
	inspect_receipt_id: Schema.NonEmptyString,
	name: Schema.NonEmptyString,
	description: Schema.optional(Schema.String),
	status: Schema.optional(Schema.Literals(["active", "paused"]))
});
Schema.Struct({
	ok: Schema.Boolean,
	receipt_id: Schema.NonEmptyString,
	expires_at: Schema.String,
	normalized: TriggerActivationDraft,
	target: Schema.Struct({
		job: Schema.NonEmptyString,
		version: Schema.String,
		compatible: Schema.Boolean,
		manifest: Schema.optional(TriggerableJobManifest)
	}),
	checks: Schema.Array(TriggerCheck),
	required_setup: Schema.Array(TriggerRequiredSetup),
	activation_body: Schema.optional(TriggerActivateBody),
	errors: Schema.optional(Schema.Array(Schema.Struct({
		reason: TriggerErrorReason,
		message: Schema.String,
		path: Schema.optional(Schema.String)
	})))
});
const TriggerRecord = Schema.Struct({
	id: TriggerId,
	workspace_id: WorkspaceId,
	name: Schema.String,
	description: Schema.NullOr(Schema.String),
	kind: TriggerKind,
	status: TriggerStatus,
	target_job_name: Schema.String,
	target_version_name: Schema.String,
	trigger_manifest: Schema.optional(Schema.NullOr(TriggerableJobManifest)),
	created_at: Schema.String,
	updated_at: Schema.String,
	activated_at: Schema.NullOr(Schema.String),
	paused_at: Schema.NullOr(Schema.String),
	disabled_at: Schema.NullOr(Schema.String)
});
const TriggerDeliveryRecord = Schema.Struct({
	id: TriggerDeliveryId,
	workspace_id: WorkspaceId,
	trigger_id: TriggerId,
	kind: TriggerKind,
	status: TriggerDeliveryStatus,
	scheduled_for: Schema.NullOr(Schema.String),
	source_delivery_id: Schema.NullOr(Schema.String),
	idempotency_key: Schema.String,
	run_id: Schema.NullOr(Schema.String),
	job_invocation_id: Schema.NullOr(Schema.String),
	attempt_count: Schema.Number,
	next_attempt_at: Schema.NullOr(Schema.String),
	error_reason: Schema.NullOr(Schema.String),
	error_message: Schema.NullOr(Schema.String),
	created_at: Schema.String,
	updated_at: Schema.String,
	finished_at: Schema.NullOr(Schema.String)
});
Schema.Struct({
	workspace_id: WorkspaceId,
	delivery_id: TriggerDeliveryId,
	reason: Schema.optional(Schema.String)
});
Schema.Struct({
	workspace_id: WorkspaceId,
	trigger_id: TriggerId
});
Schema.Struct({
	workspace_id: WorkspaceId,
	status: Schema.optional(TriggerStatus),
	kind: Schema.optional(TriggerKind),
	limit: Schema.optional(Schema.Number),
	offset: Schema.optional(Schema.Number)
});
Schema.Struct({
	triggers: Schema.Array(TriggerRecord),
	count: Schema.Number
});
Schema.Struct({
	workspace_id: WorkspaceId,
	trigger_id: TriggerId
});
Schema.Struct({ trigger: TriggerRecord });
Schema.Struct({ trigger: TriggerRecord });
Schema.Struct({ trigger: TriggerRecord });
Schema.Struct({
	workspace_id: WorkspaceId,
	trigger_id: Schema.optional(TriggerId),
	status: Schema.optional(TriggerDeliveryStatus),
	limit: Schema.optional(Schema.Number),
	offset: Schema.optional(Schema.Number)
});
Schema.Struct({
	deliveries: Schema.Array(TriggerDeliveryRecord),
	count: Schema.Number
});
Schema.Struct({
	workspace_id: WorkspaceId,
	delivery_id: TriggerDeliveryId
});
Schema.Struct({ delivery: TriggerDeliveryRecord });
Schema.Struct({ workspace_id: WorkspaceId });
Schema.Struct({
	workspace_id: WorkspaceId,
	limits: TriggerLimits
});
Schema.Struct({
	workspace_id: WorkspaceId,
	limits: TriggerLimits
});
//#endregion
//#region ../runtime-planner/src/source-prep.ts
function stripRuntimeTypescript(code, mode) {
	try {
		return {
			code: transform(code, {
				transforms: ["typescript"],
				production: true
			}).code,
			transformed: true,
			mode
		};
	} catch (error) {
		return {
			code,
			transformed: false,
			mode,
			error: error instanceof Error ? error.message : String(error)
		};
	}
}
function prepareRuntimeSource(code, mode) {
	return stripRuntimeTypescript(code, mode);
}
//#endregion
//#region ../orbit/src/authoring/define-job.ts
const DEFINE_JOB_PATTERN = /\bdefineJob\s*\(/;
const JOB_NAME_PATTERN = /^[a-z][a-z0-9-]{0,127}$/;
const CAMEL_JOB_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9]{0,127}$/;
const SCALAR_TYPES = new Set([
	"string",
	"number",
	"boolean",
	"unknown"
]);
const stripStringsAndComments$1 = (source) => {
	let out = "";
	let i = 0;
	while (i < source.length) {
		const ch = source[i];
		const next = source[i + 1];
		if (ch === "/" && next === "/") {
			while (i < source.length && source[i] !== "\n") {
				out += " ";
				i += 1;
			}
			continue;
		}
		if (ch === "/" && next === "*") {
			out += "  ";
			i += 2;
			while (i < source.length && !(source[i] === "*" && source[i + 1] === "/")) {
				out += source[i] === "\n" ? "\n" : " ";
				i += 1;
			}
			if (i < source.length) {
				out += "  ";
				i += 2;
			}
			continue;
		}
		if (ch === "\"" || ch === "'" || ch === "`") {
			const quote = ch;
			out += " ";
			i += 1;
			while (i < source.length) {
				const c = source[i];
				out += c === "\n" ? "\n" : " ";
				i += c === "\\" ? 2 : 1;
				if (c === quote) break;
			}
			continue;
		}
		out += ch;
		i += 1;
	}
	return out;
};
const isNode$1 = (value) => Boolean(value) && typeof value === "object" && typeof value.type === "string";
var OrbitAuthoringValidationError = class extends Error {
	issues;
	constructor(issues) {
		super(issues.join("; "));
		this.issues = issues;
		this.name = "OrbitAuthoringValidationError";
	}
};
const issue$1 = (message) => {
	throw new OrbitAuthoringValidationError([message]);
};
const propName$1 = (node) => {
	if (node.type === "Identifier") return String(node.name);
	if (node.type === "Literal" && typeof node.value === "string") return node.value;
};
const objectProperties$1 = (node) => {
	if (node.type !== "ObjectExpression") issue$1("defineJob must receive an object literal.");
	const map = /* @__PURE__ */ new Map();
	for (const prop of node.properties ?? []) {
		if (prop.type === "SpreadElement") issue$1("defineJob does not support spread properties in v1.");
		const key = propName$1(prop.key) || issue$1("defineJob object keys must be static identifiers or string literals.");
		const value = prop.value ?? prop;
		map.set(key, value);
	}
	return map;
};
const literalValue$1 = (node) => {
	if (node.type === "Literal") return node.value;
	if (node.type === "ObjectExpression") {
		const out = {};
		for (const [key, value] of objectProperties$1(node)) out[key] = literalValue$1(value);
		return out;
	}
	if (node.type === "ArrayExpression") return (node.elements ?? []).map((item) => item ? literalValue$1(item) : null);
	issue$1("defineJob schema and metadata must use static literals in v1.");
};
const scalarSchema = (raw, path) => {
	const optional = raw.endsWith("?");
	const type = optional ? raw.slice(0, -1) : raw;
	if (!SCALAR_TYPES.has(type)) issue$1(`${path} uses unsupported schema shortcut "${raw}". Use string, number, boolean, unknown, optional ? suffix, nested objects, or full JSON Schema.`);
	return {
		optional,
		schema: type === "unknown" ? {} : { type }
	};
};
const normalizeSchemaNode = (node, path) => {
	if (node.type === "Literal" && typeof node.value === "string") return scalarSchema(node.value, path);
	if (node.type !== "ObjectExpression") issue$1(`${path} must be a schema literal object, scalar shortcut, or full JSON Schema object.`);
	const props = objectProperties$1(node);
	if (props.get("type")) {
		const full = literalValue$1(node);
		if (!full || typeof full !== "object" || Array.isArray(full)) issue$1(`${path} full JSON Schema must be an object.`);
		return {
			schema: full,
			optional: false
		};
	}
	const properties = {};
	const required = [];
	for (const [key, child] of props) {
		const normalized = normalizeSchemaNode(child, `${path}.${key}`);
		properties[key] = normalized.schema;
		if (!normalized.optional) required.push(key);
	}
	return {
		optional: false,
		schema: {
			type: "object",
			properties,
			required,
			additionalProperties: false
		}
	};
};
const requireString = (props, key) => {
	const node = props.get(key);
	const value = node?.type === "Literal" ? node.value : void 0;
	if (typeof value !== "string" || value.trim() === "") issue$1(`defineJob.${key} must be a non-empty string literal.`);
	return value.trim();
};
const optionalString$1 = (props, key) => {
	const node = props.get(key);
	if (!node) return void 0;
	const value = node.type === "Literal" ? node.value : void 0;
	if (typeof value !== "string") issue$1(`defineJob.${key} must be a string literal when provided.`);
	return value;
};
const optionalNumber = (props, key) => {
	const node = props.get(key);
	if (!node) return void 0;
	const value = node.type === "Literal" ? node.value : void 0;
	if (typeof value !== "number") issue$1(`defineJob.${key} must be a number literal when provided.`);
	return value;
};
const optionalStringArray$1 = (props, key) => {
	const node = props.get(key);
	if (!node) return void 0;
	if (node.type !== "ArrayExpression") issue$1(`defineJob.${key} must be a string array literal.`);
	return (node.elements ?? []).map((item) => {
		const value = item?.type === "Literal" ? item.value : void 0;
		if (typeof value !== "string") issue$1(`defineJob.${key} must contain only string literals.`);
		return value;
	});
};
const optionalLiteralObject$1 = (props, key) => {
	const node = props.get(key);
	if (!node) return void 0;
	const value = literalValue$1(node);
	if (!value || typeof value !== "object" || Array.isArray(value)) issue$1(`defineJob.${key} must be an object literal when provided.`);
	return value;
};
const optionalTriggerManifest = (props) => {
	const node = props.get("triggers");
	if (!node) return void 0;
	const value = literalValue$1(node);
	if (!Array.isArray(value)) issue$1("defineJob.triggers must be an array literal when provided.");
	try {
		return Schema.decodeUnknownSync(TriggerableJobManifest)({
			version: 1,
			events: value
		});
	} catch {
		issue$1("defineJob.triggers must match the TriggerableJobManifest event binding contract.");
	}
};
const toCanonicalJobName = (raw) => {
	if (JOB_NAME_PATTERN.test(raw)) return raw;
	if (!CAMEL_JOB_NAME_PATTERN.test(raw)) issue$1("defineJob.name must be kebab-case, or camelCase so Harbor can canonicalize it.");
	const kebab = raw.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z][a-z])/g, "$1-$2").toLowerCase();
	if (!JOB_NAME_PATTERN.test(kebab)) issue$1("defineJob.name could not be canonicalized to kebab-case.");
	return kebab;
};
const inferCapabilities = (code) => {
	const caps = /* @__PURE__ */ new Set();
	if (/\bhrbr\s*\.\s*storage\b/.test(code) || /\borbit\s*\.\s*storage\b/.test(code)) caps.add("storage");
	if (/\bhrbr\s*\.\s*cache\b/.test(code) || /\borbit\s*\.\s*cache\b/.test(code)) caps.add("memory");
	if (/\bhrbr\s*\.\s*db\b/.test(code) || /\borbit\s*\.\s*db\b/.test(code)) caps.add("data");
	if (/\bhrbr\s*\.\s*ai\b/.test(code) || /\borbit\s*\.\s*ai\b/.test(code)) caps.add("ai");
	if (/\bhrbr\s*\.\s*tools\b/.test(code) || /\bplugins\s*\.\s*call\b/.test(code)) caps.add("plugins");
	return [...caps];
};
const findTopLevelDefineJob = (ast) => {
	const body = ast.body;
	let found;
	for (const statement of body) {
		if (statement.type === "ImportDeclaration") issue$1("defineJob authoring does not support imports in v1.");
		const expression = statement.type === "ExpressionStatement" ? statement.expression : void 0;
		if (expression?.type === "CallExpression" && isNode$1(expression.callee) && expression.callee.type === "Identifier" && expression.callee.name === "defineJob") {
			if (found) issue$1("Exactly one top-level defineJob(...) call is allowed.");
			found = expression;
		}
	}
	return found ?? issue$1("Expected one top-level defineJob({...}) call.");
};
const looksLikeDefineJobSource = (source) => DEFINE_JOB_PATTERN.test(stripStringsAndComments$1(source));
function compileDefineJobPublish(source) {
	const totalStarted = Date.now();
	const validateStarted = Date.now();
	if (!looksLikeDefineJobSource(source)) issue$1("Expected defineJob({...}) in job source.");
	const strippedSource = stripStringsAndComments$1(source);
	if (/(^|[;\n])\s*import(?:\s|\{|\*|[\w$])/.test(strippedSource) || /\bimport\s*\(/.test(strippedSource)) issue$1("defineJob authoring does not support imports in v1.");
	const transformed = prepareRuntimeSource(source, "defineJob").code;
	const args = findTopLevelDefineJob(parse(transformed, {
		ecmaVersion: "latest",
		sourceType: "module",
		allowAwaitOutsideFunction: true,
		allowReturnOutsideFunction: true
	})).arguments ?? [];
	if (args.length !== 1) issue$1("defineJob expects exactly one object literal argument.");
	const props = objectProperties$1(args[0]);
	const name = toCanonicalJobName(requireString(props, "name"));
	const run = props.get("run");
	if (!run || !["FunctionExpression", "ArrowFunctionExpression"].includes(run.type)) issue$1("defineJob.run must be an inline function or async method.");
	const input = props.get("input") ?? issue$1("defineJob.input is required.");
	const validateMs = Date.now() - validateStarted;
	const schemaStarted = Date.now();
	const inputSchema = normalizeSchemaNode(input, "defineJob.input").schema;
	const outputSchemaNode = props.get("output");
	const outputSchema = outputSchemaNode ? normalizeSchemaNode(outputSchemaNode, "defineJob.output").schema : void 0;
	const schemaNormalizeMs = Date.now() - schemaStarted;
	const description = optionalString$1(props, "description");
	const tags = optionalStringArray$1(props, "tags");
	const timeoutMs = optionalNumber(props, "timeout_ms");
	const retry = optionalLiteralObject$1(props, "retry");
	const retention = optionalLiteralObject$1(props, "retention");
	const triggerManifest = optionalTriggerManifest(props);
	return {
		timing: {
			validate_ms: validateMs,
			schema_normalize_ms: schemaNormalizeMs,
			total_ms: Date.now() - totalStarted
		},
		publish: {
			name,
			input_schema: inputSchema,
			...description !== void 0 ? { description } : {},
			...outputSchema ? { output_schema: outputSchema } : {},
			capabilities: inferCapabilities(transformed),
			...tags !== void 0 ? { tags } : {},
			...timeoutMs !== void 0 ? { timeout_ms: timeoutMs } : {},
			...retry !== void 0 ? { retry } : {},
			...retention !== void 0 ? { retention } : {},
			...triggerManifest !== void 0 ? { trigger_manifest: triggerManifest } : {},
			code: transformed,
			runtime: "define_job"
		}
	};
}
//#endregion
//#region ../orbit/src/authoring/deploy-app.ts
const DEPLOY_APP_PATTERN = /\bdeployApp\s*\(/;
const APP_NAME_PATTERN = /^[a-z][a-z0-9-]{0,127}$/;
const CAMEL_APP_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9]{0,127}$/;
const ROUTE_KEY_PATTERN = /^(GET|POST|PUT|PATCH|DELETE|OPTIONS)\s+(\/.*)$/;
const HTTP_METHODS = new Set([
	"GET",
	"POST",
	"PUT",
	"PATCH",
	"DELETE",
	"OPTIONS"
]);
const INPUT_ADAPTERS = new Set([
	"none",
	"query",
	"json",
	"form",
	"raw"
]);
const OUTPUT_ADAPTERS = new Set([
	"html",
	"json",
	"text",
	"redirect",
	"passthrough"
]);
const ROUTE_AUTH_VALUES = new Set([
	"public",
	"workspace_member",
	"signed_link",
	"service"
]);
const stripStringsAndComments = (source) => {
	let out = "";
	let i = 0;
	while (i < source.length) {
		const ch = source[i];
		const next = source[i + 1];
		if (ch === "/" && next === "/") {
			while (i < source.length && source[i] !== "\n") {
				out += " ";
				i += 1;
			}
			continue;
		}
		if (ch === "/" && next === "*") {
			out += "  ";
			i += 2;
			while (i < source.length && !(source[i] === "*" && source[i + 1] === "/")) {
				out += source[i] === "\n" ? "\n" : " ";
				i += 1;
			}
			if (i < source.length) {
				out += "  ";
				i += 2;
			}
			continue;
		}
		if (ch === "\"" || ch === "'" || ch === "`") {
			const quote = ch;
			out += " ";
			i += 1;
			while (i < source.length) {
				const c = source[i];
				out += c === "\n" ? "\n" : " ";
				i += c === "\\" ? 2 : 1;
				if (c === quote) break;
			}
			continue;
		}
		out += ch;
		i += 1;
	}
	return out;
};
const isNode = (value) => Boolean(value) && typeof value === "object" && typeof value.type === "string";
const issue = (message) => {
	throw new OrbitAuthoringValidationError([message]);
};
const propName = (node) => {
	if (node.type === "Identifier") return String(node.name);
	if (node.type === "Literal" && typeof node.value === "string") return node.value;
};
const objectProperties = (node, label) => {
	if (node.type !== "ObjectExpression") issue(`${label} must be an object literal.`);
	const map = /* @__PURE__ */ new Map();
	for (const prop of node.properties ?? []) {
		if (prop.type === "SpreadElement") issue(`${label} does not support spread properties in v1.`);
		const key = propName(prop.key) || issue(`${label} object keys must be static identifiers or string literals.`);
		const value = prop.value ?? prop;
		map.set(key, value);
	}
	return map;
};
const literalValue = (node, label) => {
	if (node.type === "Literal") return node.value;
	if (node.type === "ObjectExpression") {
		const out = {};
		for (const [key, value] of objectProperties(node, label)) out[key] = literalValue(value, `${label}.${key}`);
		return out;
	}
	if (node.type === "ArrayExpression") return (node.elements ?? []).map((item, index) => item ? literalValue(item, `${label}[${index}]`) : null);
	issue(`${label} must use static literals in v1.`);
};
const optionalString = (props, key, label) => {
	const node = props.get(key);
	if (!node) return void 0;
	const value = node.type === "Literal" ? node.value : void 0;
	if (typeof value !== "string") issue(`${label}.${key} must be a string literal when provided.`);
	return value;
};
const optionalStringArray = (props, key, label) => {
	const node = props.get(key);
	if (!node) return void 0;
	if (node.type !== "ArrayExpression") issue(`${label}.${key} must be a string array literal.`);
	return (node.elements ?? []).map((item) => {
		const value = item?.type === "Literal" ? item.value : void 0;
		if (typeof value !== "string") issue(`${label}.${key} must contain only string literals.`);
		return value;
	});
};
const optionalLiteralObject = (props, key, label) => {
	const node = props.get(key);
	if (!node) return void 0;
	const value = literalValue(node, `${label}.${key}`);
	if (!value || typeof value !== "object" || Array.isArray(value)) issue(`${label}.${key} must be an object literal when provided.`);
	return value;
};
const toCanonicalAppName = (raw) => {
	if (APP_NAME_PATTERN.test(raw)) return raw;
	if (!CAMEL_APP_NAME_PATTERN.test(raw)) issue("deployApp.id must be kebab-case, or camelCase so Harbor can canonicalize it.");
	const kebab = raw.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z][a-z])/g, "$1-$2").toLowerCase();
	if (!APP_NAME_PATTERN.test(kebab)) issue("deployApp.id could not be canonicalized to kebab-case.");
	return kebab;
};
const stringEnum = (value, allowed, fallback, label) => {
	const selected = value ?? fallback;
	if (!allowed.has(selected)) issue(`${label} must be one of: ${[...allowed].join(", ")}.`);
	return selected;
};
const defaultInputForMethod = (method) => method === "GET" || method === "DELETE" || method === "OPTIONS" ? "none" : "json";
const defaultOutputForMethod = (method) => method === "GET" ? "html" : "json";
const routePartsFromKey = (key, routeProps, label) => {
	const match = ROUTE_KEY_PATTERN.exec(key);
	const methodFromKey = match?.[1];
	const pathFromKey = match?.[2];
	const method = optionalString(routeProps, "method", label)?.toUpperCase() ?? methodFromKey;
	const path = optionalString(routeProps, "path", label) ?? pathFromKey;
	if (!method || !HTTP_METHODS.has(method)) issue(`${label} route key must look like "GET /path" or include a valid method.`);
	if (!path || !path.startsWith("/")) issue(`${label} route path must start with /.`);
	return {
		method,
		path
	};
};
const hasFunctionValue = (node) => Boolean(node && ["FunctionExpression", "ArrowFunctionExpression"].includes(node.type));
const normalizeJobs = (node) => {
	if (!node) return {};
	const raw = literalValue(node, "deployApp.jobs");
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) issue("deployApp.jobs must be an object literal.");
	return raw;
};
const normalizeRoutes = (node, defaultAuth) => {
	const props = objectProperties(node, "deployApp.routes");
	const routes = [];
	let hasHandlers = false;
	for (const [key, value] of props) {
		const label = `deployApp.routes[${JSON.stringify(key)}]`;
		const routeProps = objectProperties(value, label);
		const { method, path } = routePartsFromKey(key, routeProps, label);
		const inputLiteral = optionalString(routeProps, "input", label);
		const outputLiteral = optionalString(routeProps, "output", label);
		const authLiteral = optionalString(routeProps, "auth", label);
		const runNode = routeProps.get("run");
		const hasHandler = hasFunctionValue(runNode);
		const job = optionalString(routeProps, "job", label);
		const staticHtml = optionalString(routeProps, "static_html", label) ?? optionalString(routeProps, "staticHtml", label);
		if (runNode && !hasHandler) issue(`${label}.run must be an inline function or async method.`);
		if (hasHandler && (job || staticHtml !== void 0)) issue(`${label} must not combine run with job/staticHtml.`);
		if (!hasHandler && !job && staticHtml === void 0) issue(`${label} must declare run, job, or staticHtml.`);
		hasHandlers = hasHandlers || hasHandler;
		const route = {
			method,
			path,
			auth: stringEnum(authLiteral, ROUTE_AUTH_VALUES, defaultAuth, `${label}.auth`),
			input: stringEnum(inputLiteral, INPUT_ADAPTERS, defaultInputForMethod(method), `${label}.input`),
			output: stringEnum(outputLiteral, OUTPUT_ADAPTERS, defaultOutputForMethod(method), `${label}.output`),
			...optionalString(routeProps, "id", label) ? { id: optionalString(routeProps, "id", label) } : {},
			...optionalString(routeProps, "title", label) ? { title: optionalString(routeProps, "title", label) } : {},
			...optionalStringArray(routeProps, "tags", label) ? { tags: optionalStringArray(routeProps, "tags", label) } : {},
			...optionalLiteralObject(routeProps, "rate_limit", label) ? { rate_limit: optionalLiteralObject(routeProps, "rate_limit", label) } : {},
			...job ? { job } : {},
			...staticHtml !== void 0 ? { static_html: staticHtml } : {}
		};
		routes.push(route);
	}
	if (routes.length === 0) issue("deployApp.routes must contain at least one route.");
	return {
		routes,
		hasHandlers
	};
};
const findTopLevelDeployApp = (ast) => {
	const body = ast.body;
	let found;
	for (const statement of body) {
		if (statement.type === "ImportDeclaration") issue("deployApp authoring does not support imports in v1.");
		const expression = statement.type === "ExpressionStatement" ? statement.expression : void 0;
		if (expression?.type === "CallExpression" && isNode(expression.callee) && expression.callee.type === "Identifier" && expression.callee.name === "deployApp") {
			if (found) issue("Exactly one top-level deployApp(...) call is allowed.");
			found = {
				statement,
				call: expression
			};
		}
	}
	return found ?? issue("Expected one top-level deployApp({...}) call.");
};
const buildGeneratedSource = (opts) => {
	const arg = (opts.call.arguments ?? [])[0];
	const definitionSource = opts.transformed.slice(Number(arg.start), Number(arg.end));
	const routeKeys = opts.routes.map((route) => `${route.method} ${route.path}`);
	const fetchBlock = opts.hasHandlers ? [
		"async fetch(request, env, ctx) {",
		"  const { hrbr, orbit } = env?.hrbr && env?.orbit ? { hrbr: env.hrbr, orbit: env.orbit } : __buildRuntime(request, env);",
		"  void orbit;",
		"  const url = new URL(request.url);",
		"  const key = request.method + \" \" + (url.pathname || \"/\");",
		"  const __hrbrDeployAppDefinition = " + definitionSource + ";",
		"  const route = __hrbrDeployAppDefinition.routes[key];",
		"  if (!route || typeof route.run !== \"function\") return undefined;",
		"  return await route.run(request, env, ctx);",
		"}"
	].join("\n") : "";
	const replacement = [
		"export default defineOrbitApp({",
		"  name: " + JSON.stringify(opts.appName) + ",",
		...opts.description !== void 0 ? ["  description: " + JSON.stringify(opts.description) + ","] : [],
		"  jobs: " + JSON.stringify(opts.jobs) + ",",
		"  routes: " + JSON.stringify(opts.routes) + ",",
		...opts.theme !== void 0 ? ["  theme: " + JSON.stringify(opts.theme) + ","] : [],
		...opts.hasHandlers ? ["  " + fetchBlock.replace(/\n/g, "\n  ") + ","] : [],
		"});",
		"void " + JSON.stringify(routeKeys) + ";"
	].join("\n");
	return opts.transformed.slice(0, Number(opts.statement.start)) + replacement + opts.transformed.slice(Number(opts.statement.end));
};
const looksLikeDeployAppSource = (source) => DEPLOY_APP_PATTERN.test(stripStringsAndComments(source));
function compileDeployAppPublish(source) {
	const totalStarted = Date.now();
	const validateStarted = Date.now();
	if (!looksLikeDeployAppSource(source)) issue("Expected deployApp({...}) in app source.");
	const strippedSource = stripStringsAndComments(source);
	if (/(^|[;\n])\s*import(?:\s|\{|\*|[\w$])/.test(strippedSource) || /\bimport\s*\(/.test(strippedSource)) issue("deployApp authoring does not support imports in v1.");
	const transformed = prepareRuntimeSource(source, "deployApp").code;
	const found = findTopLevelDeployApp(parse(transformed, {
		ecmaVersion: "latest",
		sourceType: "module",
		allowAwaitOutsideFunction: true,
		allowReturnOutsideFunction: true
	}));
	const args = found.call.arguments ?? [];
	if (args.length !== 1) issue("deployApp expects exactly one object literal argument.");
	const props = objectProperties(args[0], "deployApp");
	const rawName = optionalString(props, "id", "deployApp") ?? optionalString(props, "name", "deployApp");
	if (!rawName) issue("deployApp.id must be a non-empty string literal.");
	const name = toCanonicalAppName(rawName);
	const routesNode = props.get("routes") ?? issue("deployApp.routes is required.");
	const defaultAuth = stringEnum(optionalString(props, "access", "deployApp"), new Set(["public", "workspace_member"]), "workspace_member", "deployApp.access");
	const validateMs = Date.now() - validateStarted;
	const manifestStarted = Date.now();
	const description = optionalString(props, "description", "deployApp") ?? optionalString(props, "title", "deployApp");
	const jobs = normalizeJobs(props.get("jobs"));
	const { routes, hasHandlers } = normalizeRoutes(routesNode, defaultAuth);
	const theme = optionalLiteralObject(props, "theme", "deployApp");
	const allowedOrigins = optionalStringArray(props, "allowed_origins", "deployApp") ?? optionalStringArray(props, "allowedOrigins", "deployApp");
	const idempotencyKey = optionalString(props, "idempotency_key", "deployApp") ?? optionalString(props, "idempotencyKey", "deployApp");
	if (props.has("runtime")) issue("deployApp.runtime is not a public authoring field; Harbor selects app execution internally.");
	const manifestMs = Date.now() - manifestStarted;
	const code = buildGeneratedSource({
		transformed,
		statement: found.statement,
		call: found.call,
		appName: name,
		description,
		routes,
		jobs,
		theme,
		hasHandlers
	});
	return {
		timing: {
			validate_ms: validateMs,
			manifest_normalize_ms: manifestMs,
			total_ms: Date.now() - totalStarted
		},
		publish: {
			name,
			...description !== void 0 ? { description } : {},
			code,
			routes,
			jobs,
			...theme !== void 0 ? { theme } : {},
			...allowedOrigins !== void 0 ? { allowed_origins: allowedOrigins } : {},
			...idempotencyKey !== void 0 ? { idempotency_key: idempotencyKey } : {}
		}
	};
}
//#endregion
export { OrbitAuthoringValidationError, compileDefineJobPublish, compileDeployAppPublish, looksLikeDefineJobSource, looksLikeDeployAppSource };

//# sourceMappingURL=authoring.mjs.map