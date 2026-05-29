import { builtinModules } from "node:module";
import { gzipSync } from "node:zlib";
import { existsSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";
//#region ../orbit/src/bundler/index.ts
var OrbitBundleError = class extends Error {
	issues;
	diagnostics;
	constructor(message, opts) {
		super(message);
		this.name = "OrbitBundleError";
		this.issues = opts?.issues ?? [message];
		this.diagnostics = opts?.diagnostics ?? [];
	}
};
const DEFAULT_MAX_GZIP_BYTES = 1024 * 1024;
const ENTRY_LOADER = "ts";
const NODE_BUILTINS = new Set([...builtinModules, ...builtinModules.map((name) => `node:${name}`)]);
const ALWAYS_DENIED = new Set([
	"child_process",
	"node:child_process",
	"cluster",
	"node:cluster",
	"dgram",
	"node:dgram",
	"dns",
	"node:dns",
	"fs",
	"node:fs",
	"http",
	"node:http",
	"https",
	"node:https",
	"inspector",
	"node:inspector",
	"module",
	"node:module",
	"net",
	"node:net",
	"readline",
	"node:readline",
	"repl",
	"node:repl",
	"tls",
	"node:tls",
	"vm",
	"node:vm",
	"worker_threads",
	"node:worker_threads"
]);
const APP_ALLOWED_PACKAGES = [
	"@hrbr/orbit/apps",
	"@hrbr/orbit/jobs",
	"@hrbr/sdk/orbit/apps",
	"@hrbr/sdk/orbit/jobs",
	"@hrbr/core",
	"@hrbr/sdk/core",
	"effect",
	"hono"
];
const JOB_ALLOWED_PACKAGES = [
	"@hrbr/orbit/jobs",
	"@hrbr/sdk/orbit/jobs",
	"@hrbr/core",
	"@hrbr/sdk/core",
	"effect",
	"hono"
];
let __orbitDiskCache;
function getOrbitSrcDir() {
	const envOverride = process.env.HRBR_ORBIT_SRC_DIR;
	if (envOverride && existsSync(resolve(envOverride, "jobs.ts"))) return resolve(envOverride);
	if (__orbitDiskCache) return __orbitDiskCache;
	const here = dirname(fileURLToPath(import.meta.url));
	const monorepoCandidate = resolve(here, "..");
	if (existsSync(resolve(monorepoCandidate, "jobs.ts"))) {
		__orbitDiskCache = monorepoCandidate;
		return __orbitDiskCache;
	}
	const distCandidate = resolve(here, "_orbit");
	if (existsSync(resolve(distCandidate, "jobs.ts"))) {
		__orbitDiskCache = distCandidate;
		return __orbitDiskCache;
	}
	__orbitDiskCache = monorepoCandidate;
	return __orbitDiskCache;
}
function resolveOrbitSelfImport(specifier) {
	const dir = getOrbitSrcDir();
	if (specifier === "@hrbr/orbit/apps") return resolve(dir, "apps.ts");
	if (specifier === "@hrbr/orbit/jobs") return resolve(dir, "jobs.ts");
	if (specifier === "@hrbr/sdk/orbit/apps") return resolve(dir, "apps.ts");
	if (specifier === "@hrbr/sdk/orbit/jobs") return resolve(dir, "jobs.ts");
}
function toDiagnostic(message) {
	return {
		text: message.text,
		location: message.location ? {
			file: message.location.file,
			line: message.location.line,
			column: message.location.column
		} : void 0
	};
}
function packageName(specifier) {
	if (specifier.startsWith("@")) {
		const [scope, name] = specifier.split("/");
		return scope && name ? `${scope}/${name}` : specifier;
	}
	const [name] = specifier.split("/");
	return name ?? specifier;
}
function isPackageAllowed(specifier, kind) {
	return (kind === "app" ? APP_ALLOWED_PACKAGES : JOB_ALLOWED_PACKAGES).some((entry) => specifier === entry || specifier.startsWith(`${entry}/`));
}
function isRelativeOrAbsolute(specifier) {
	return specifier.startsWith(".") || specifier.startsWith("/") || isAbsolute(specifier);
}
function validateSource(source, _kind) {
	const issues = [];
	if (/from\s+["']@hrbr\/(?:orbit|sdk\/orbit)\/bundler(?:\/[^"']*)?["']/.test(source)) issues.push("Orbit bundled source must not import the Orbit bundler");
	return issues;
}
function guardImportsPlugin(kind) {
	return {
		name: "orbit-bundler-guard-imports",
		setup(build) {
			build.onResolve({ filter: /.*/ }, (args) => {
				const specifier = args.path;
				if (specifier === "") return void 0;
				if (specifier.endsWith(".node")) return { errors: [{ text: `Native addon imports are not allowed in Orbit ${kind} bundles: ${specifier}` }] };
				if (ALWAYS_DENIED.has(specifier) || NODE_BUILTINS.has(specifier)) return { errors: [{ text: `Node module imports are not allowed in Orbit ${kind} bundles: ${specifier}` }] };
				if (isRelativeOrAbsolute(specifier)) return void 0;
				const selfImportPath = resolveOrbitSelfImport(specifier);
				if (selfImportPath) return { path: selfImportPath };
				if ((args.importer ?? "").includes("/node_modules/")) return void 0;
				if (!isPackageAllowed(specifier, kind)) return { errors: [{ text: `Package import is not allowed in Orbit ${kind} bundles: ${packageName(specifier)}. Use relative app code or an allowlisted package.` }] };
			});
		}
	};
}
async function bundleOrbitSource(input) {
	const preflightIssues = validateSource(input.source, input.kind);
	if (preflightIssues.length > 0) throw new OrbitBundleError("Orbit bundle preflight failed", { issues: preflightIssues });
	const sourcePath = input.sourcePath ?? `<orbit-${input.kind}>.tsx`;
	const resolveDir = input.resolveDir ?? (isAbsolute(sourcePath) ? dirname(sourcePath) : process.cwd());
	const sourcemap = input.sourcemap ?? false;
	try {
		const options = {
			absWorkingDir: resolve(resolveDir),
			bundle: true,
			charset: "utf8",
			conditions: [
				"worker",
				"browser",
				"module"
			],
			format: "esm",
			legalComments: "none",
			loader: {
				".ts": "ts",
				".tsx": "tsx",
				".js": "js",
				".jsx": "jsx",
				".json": "json"
			},
			logLevel: "silent",
			mainFields: [
				"module",
				"browser",
				"main"
			],
			metafile: input.metafile ?? true,
			minify: input.minify ?? true,
			platform: "browser",
			plugins: [guardImportsPlugin(input.kind)],
			sourcemap,
			sourcesContent: sourcemap !== false,
			stdin: {
				contents: input.source,
				loader: ENTRY_LOADER,
				resolveDir,
				sourcefile: sourcePath
			},
			target: ["es2022"],
			treeShaking: true,
			write: false
		};
		if (input.define) options.define = input.define;
		const result = await esbuild.build(options);
		const outputFiles = result.outputFiles ?? [];
		const map = outputFiles.find((file) => file.path.endsWith(".js.map"));
		const js = outputFiles.find((file) => file !== map && file.path.endsWith(".js")) ?? outputFiles.find((file) => file !== map);
		if (!js) throw new OrbitBundleError("Orbit bundle did not produce JavaScript output");
		const code = js.text;
		const gzipBytes = gzipSync(code).byteLength;
		const maxGzipBytes = input.maxGzipBytes ?? DEFAULT_MAX_GZIP_BYTES;
		if (gzipBytes > maxGzipBytes) throw new OrbitBundleError(`Orbit ${input.kind} bundle exceeds gzip limit`, { issues: [`Bundle gzip size ${gzipBytes} bytes exceeds limit ${maxGzipBytes} bytes`] });
		return {
			runtime: "bundled",
			kind: input.kind,
			code,
			bytes: new TextEncoder().encode(code).byteLength,
			gzip_bytes: gzipBytes,
			warnings: result.warnings.map(toDiagnostic),
			metafile: result.metafile,
			sourcemap: map?.text
		};
	} catch (cause) {
		if (cause instanceof OrbitBundleError) throw cause;
		if (isEsbuildError(cause)) throw new OrbitBundleError("Orbit bundle failed", {
			issues: cause.errors.map((error) => error.text),
			diagnostics: cause.errors.map(toDiagnostic)
		});
		throw new OrbitBundleError(caughtErrorMessage(cause));
	}
}
function caughtErrorMessage(cause) {
	if (cause instanceof Error) return cause.message;
	if (typeof cause === "string") return cause;
	if (typeof cause === "number" || typeof cause === "boolean" || typeof cause === "bigint") return `${cause}`;
	return "Orbit bundle failed";
}
function isEsbuildError(cause) {
	return Boolean(cause && typeof cause === "object" && "errors" in cause && Array.isArray(cause.errors));
}
//#endregion
export { OrbitBundleError, bundleOrbitSource };

//# sourceMappingURL=bundler.mjs.map