import { Context, Effect, Layer, Schema } from "effect";
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
Context.Service("@hrbr/runtime/RuntimePlanner");
Context.Service("@hrbr/runtime/RuntimeDispatchRouter");
Context.Service("@hrbr/runtime/RuntimeProviderRegistry");
Context.Service("@hrbr/runtime/RuntimeHost");
Context.Service("@hrbr/runtime/RuntimeState");
Context.Service("@hrbr/runtime/RuntimeArtifacts");
Context.Service("@hrbr/runtime/RuntimeExecutor");
//#endregion
//#region ../runtime-artifacts/src/index.ts
const RuntimeArtifactKind = Schema.Literals([
	"file",
	"image",
	"output"
]);
const RuntimeArtifactPointer = Schema.Struct({
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
const RUNTIME_DATA_URI_IMAGE_RE = /^data:(image\/[a-z+]+);base64,([A-Za-z0-9+/=]+)$/;
const RUNTIME_DATA_URI_MIN_BASE64_LENGTH = 1024;
const BASE64_LOOKUP = Object.fromEntries([..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"].map((char, index) => [char, index]));
function decodeRuntimeBase64(value) {
	const clean = value.replace(/\s/g, "");
	if (clean.length % 4 === 1) throw new Error("Invalid base64 length");
	const bytes = [];
	for (let index = 0; index < clean.length; index += 4) {
		const chunk = clean.slice(index, index + 4);
		const a = BASE64_LOOKUP[chunk[0] ?? ""];
		const b = BASE64_LOOKUP[chunk[1] ?? ""];
		const c = chunk[2] === "=" ? 0 : BASE64_LOOKUP[chunk[2] ?? ""];
		const d = chunk[3] === "=" ? 0 : BASE64_LOOKUP[chunk[3] ?? ""];
		if (a === void 0 || b === void 0 || c === void 0 || d === void 0) throw new Error("Invalid base64 character");
		const triple = a << 18 | b << 12 | c << 6 | d;
		bytes.push(triple >> 16 & 255);
		if (chunk[2] !== "=") bytes.push(triple >> 8 & 255);
		if (chunk[3] !== "=") bytes.push(triple & 255);
	}
	return Uint8Array.from(bytes);
}
function runtimeArtifactExtensionFromContentType(contentType) {
	return contentType.split("/")[1]?.replace("+xml", ".svg") ?? "png";
}
async function extractRuntimeArtifactsFromValue(value, options) {
	const artifacts = [];
	const minBase64Length = options.minBase64Length ?? 1024;
	async function walk(node) {
		if (typeof node === "string") {
			const match = node.match(RUNTIME_DATA_URI_IMAGE_RE);
			if (match && match[2].length > minBase64Length) {
				const contentType = match[1];
				const body = decodeRuntimeBase64(match[2]);
				const pointer = await options.writer.write({
					kind: "image",
					contentType,
					extension: runtimeArtifactExtensionFromContentType(contentType),
					body
				});
				artifacts.push(pointer);
				return pointer.url;
			}
		}
		if (Array.isArray(node)) return Promise.all(node.map(walk));
		if (node && typeof node === "object") {
			const output = {};
			for (const [key, child] of Object.entries(node)) output[key] = await walk(child);
			return output;
		}
		return node;
	}
	return {
		cleaned: await walk(value),
		artifacts
	};
}
function runtimeArtifactTooLargeMessage(input) {
	return `Artifact too large: ${(input.artifactSizeBytes / 1024 / 1024).toFixed(1)}MB exceeds ${(input.maxArtifactBytes / 1024 / 1024).toFixed(0)}MB limit`;
}
function runtimeArtifactRunTotalTooLargeMessage(maxRunBytes) {
	return `Run artifact total would exceed ${(maxRunBytes / 1024 / 1024).toFixed(0)}MB limit`;
}
function validateRuntimeArtifactSizeLimit(input) {
	if (input.artifactSizeBytes <= input.maxArtifactBytes) return [];
	return [runtimeArtifactTooLargeMessage(input)];
}
function validateRuntimeArtifactRunTotalLimit(input) {
	if (input.currentRunBytes + input.artifactSizeBytes <= input.maxRunBytes) return [];
	return [runtimeArtifactRunTotalTooLargeMessage(input.maxRunBytes)];
}
function validateRuntimeArtifactLimits(input) {
	const issues = [];
	issues.push(...validateRuntimeArtifactSizeLimit({
		artifactSizeBytes: input.artifactSizeBytes,
		maxArtifactBytes: input.maxArtifactBytes
	}));
	issues.push(...validateRuntimeArtifactRunTotalLimit({
		artifactSizeBytes: input.artifactSizeBytes,
		currentRunBytes: input.currentRunBytes,
		maxRunBytes: input.maxRunBytes
	}));
	return issues;
}
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
export { RUNTIME_DATA_URI_IMAGE_RE, RUNTIME_DATA_URI_MIN_BASE64_LENGTH, RuntimeArtifactKind, RuntimeArtifactPointer, RuntimeArtifactStore, RuntimeArtifactStoreLive, decodeRuntimeBase64, extractRuntimeArtifactsFromValue, makeLocalRuntimeArtifactStore, runtimeArtifactExtensionFromContentType, runtimeArtifactRunTotalTooLargeMessage, runtimeArtifactTooLargeMessage, validateRuntimeArtifactLimits, validateRuntimeArtifactRunTotalLimit, validateRuntimeArtifactSizeLimit };

//# sourceMappingURL=artifacts.mjs.map