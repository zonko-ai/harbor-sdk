import { gzipSync } from "node:zlib"
import { builtinModules } from "node:module"
import { existsSync } from "node:fs"
import { dirname, isAbsolute, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import * as esbuild from "esbuild"

export type OrbitBundleKind = "app" | "job"

export type OrbitBundleRuntime = "bundled"

export interface OrbitBundleInput {
	readonly kind: OrbitBundleKind
	readonly source: string
	/** Human-readable source path used for sourcemaps, error messages, and relative import resolution. */
	readonly sourcePath?: string | undefined
	/** Directory for resolving relative imports when sourcePath is omitted. Defaults to process.cwd(). */
	readonly resolveDir?: string | undefined
	readonly minify?: boolean | undefined
	readonly sourcemap?: boolean | "inline" | "external" | undefined
	readonly metafile?: boolean | undefined
	readonly maxGzipBytes?: number | undefined
	readonly define?: Record<string, string> | undefined
}

export interface OrbitBundleOutput {
	readonly runtime: OrbitBundleRuntime
	readonly kind: OrbitBundleKind
	readonly code: string
	readonly gzip_bytes: number
	readonly bytes: number
	readonly warnings: readonly OrbitBundleDiagnostic[]
	readonly metafile?: esbuild.Metafile | undefined
	readonly sourcemap?: string | undefined
}

export interface OrbitBundleDiagnostic {
	readonly text: string
	readonly location?: {
		readonly file?: string | undefined
		readonly line?: number | undefined
		readonly column?: number | undefined
	} | undefined
}

export class OrbitBundleError extends Error {
	readonly issues: readonly string[]
	readonly diagnostics: readonly OrbitBundleDiagnostic[]

	constructor(message: string, opts?: { readonly issues?: readonly string[]; readonly diagnostics?: readonly OrbitBundleDiagnostic[] }) {
		super(message)
		this.name = "OrbitBundleError"
		this.issues = opts?.issues ?? [message]
		this.diagnostics = opts?.diagnostics ?? []
	}
}

const DEFAULT_MAX_GZIP_BYTES = 1024 * 1024
const ENTRY_LOADER = "ts"

const NODE_BUILTINS = new Set([
	...builtinModules,
	...builtinModules.map((name) => `node:${name}`),
])

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
	"node:worker_threads",
])

const APP_ALLOWED_PACKAGES = [
	"@hrbr/orbit/apps",
	"@hrbr/orbit/jobs",
	"effect",
]

const JOB_ALLOWED_PACKAGES = [
	"@hrbr/orbit/jobs",
	"effect",
]

// In monorepo dev this file lives at packages/sdk/orbit/src/bundler/index.ts
// and the orbit src tree (jobs.ts, apps.ts) sits at `..`.
//
// In the published `@zonko-ai/harbor` CLI the bundler is rolled into
// `dist/index.js`, so `..` resolves to the package root where the orbit
// `.ts` files are NOT shipped. The CLI build copies `packages/sdk/orbit/src`
// into `dist/_orbit/`, and we discover that fallback at runtime.
//
// Resolution order:
//   1. HRBR_ORBIT_SRC_DIR env var (escape hatch / explicit override)
//   2. ../jobs.ts sibling (monorepo dev)
//   3. ./_orbit/jobs.ts sibling of import.meta.url (published CLI dist)
let __orbitDiskCache: string | undefined
function getOrbitSrcDir(): string {
	// Env override is checked every call so tests / explicit overrides take
	// effect without requiring a module reload.
	const envOverride = process.env.HRBR_ORBIT_SRC_DIR
	if (envOverride && existsSync(resolve(envOverride, "jobs.ts"))) {
		return resolve(envOverride)
	}
	if (__orbitDiskCache) return __orbitDiskCache
	const here = dirname(fileURLToPath(import.meta.url))
	const monorepoCandidate = resolve(here, "..")
	if (existsSync(resolve(monorepoCandidate, "jobs.ts"))) {
		__orbitDiskCache = monorepoCandidate
		return __orbitDiskCache
	}
	const distCandidate = resolve(here, "_orbit")
	if (existsSync(resolve(distCandidate, "jobs.ts"))) {
		__orbitDiskCache = distCandidate
		return __orbitDiskCache
	}
	// Last resort: return the monorepo-style guess so error messages still
	// point somewhere meaningful when none of the candidates exist.
	__orbitDiskCache = monorepoCandidate
	return __orbitDiskCache
}

function resolveOrbitSelfImport(specifier: string): string | undefined {
	const dir = getOrbitSrcDir()
	if (specifier === "@hrbr/orbit/apps") return resolve(dir, "apps.ts")
	if (specifier === "@hrbr/orbit/jobs") return resolve(dir, "jobs.ts")
	return undefined
}

function toDiagnostic(message: esbuild.Message): OrbitBundleDiagnostic {
	return {
		text: message.text,
		location: message.location
			? {
				file: message.location.file,
				line: message.location.line,
				column: message.location.column,
			}
			: undefined,
	}
}

function packageName(specifier: string): string {
	if (specifier.startsWith("@")) {
		const [scope, name] = specifier.split("/")
		return scope && name ? `${scope}/${name}` : specifier
	}
	const [name] = specifier.split("/")
	return name ?? specifier
}

function isPackageAllowed(specifier: string, kind: OrbitBundleKind): boolean {
	const allowed = kind === "app" ? APP_ALLOWED_PACKAGES : JOB_ALLOWED_PACKAGES
	return allowed.some((entry) => specifier === entry || specifier.startsWith(`${entry}/`))
}

function isRelativeOrAbsolute(specifier: string): boolean {
	return specifier.startsWith(".") || specifier.startsWith("/") || isAbsolute(specifier)
}

function validateSource(source: string, _kind: OrbitBundleKind) {
	const issues: string[] = []
	if (/from\s+["']@hrbr\/orbit\/app-ui(?:\/[^"']*)?["']/.test(source)) {
		issues.push("Orbit bundled source must not import @hrbr/orbit/app-ui; frontend rendering is outside the SDK boundary.")
	}
	if (/from\s+["']@hrbr\/orbit\/bundler(?:\/[^"']*)?["']/.test(source)) {
		issues.push("Orbit bundled source must not import @hrbr/orbit/bundler")
	}
	return issues
}

function guardImportsPlugin(kind: OrbitBundleKind): esbuild.Plugin {
	return {
		name: "orbit-bundler-guard-imports",
		setup(build) {
			build.onResolve({ filter: /.*/ }, (args) => {
				const specifier = args.path
				if (specifier === "") return undefined
				if (specifier.endsWith(".node")) {
					return { errors: [{ text: `Native addon imports are not allowed in Orbit ${kind} bundles: ${specifier}` }] }
				}
				if (ALWAYS_DENIED.has(specifier) || NODE_BUILTINS.has(specifier)) {
					return { errors: [{ text: `Node module imports are not allowed in Orbit ${kind} bundles: ${specifier}` }] }
				}
				if (isRelativeOrAbsolute(specifier)) return undefined
				const selfImportPath = resolveOrbitSelfImport(specifier)
				if (selfImportPath) return { path: selfImportPath }
				// Transitive imports inside an already-allowlisted package's own
				// dependency graph are auto-allowed. The gate exists for user
				// source; vetted package internals (e.g. effect → fast-check)
				// must not be blocked.
				const importer = args.importer ?? ""
				if (importer.includes("/node_modules/")) return undefined
				if (!isPackageAllowed(specifier, kind)) {
					return {
						errors: [{
							text: `Package import is not allowed in Orbit ${kind} bundles: ${packageName(specifier)}. Use relative app code or an allowlisted package.`,
						}],
					}
				}
				return undefined
			})
		}
	}
}

export async function bundleOrbitSource(input: OrbitBundleInput): Promise<OrbitBundleOutput> {
	const preflightIssues = validateSource(input.source, input.kind)
	if (preflightIssues.length > 0) {
		throw new OrbitBundleError("Orbit bundle preflight failed", { issues: preflightIssues })
	}

	const sourcePath = input.sourcePath ?? `<orbit-${input.kind}>.ts`
	const resolveDir = input.resolveDir ?? (isAbsolute(sourcePath) ? dirname(sourcePath) : process.cwd())
	const sourcemap = input.sourcemap ?? false

	try {
		const options: esbuild.BuildOptions = {
			absWorkingDir: resolve(resolveDir),
			bundle: true,
			charset: "utf8",
			conditions: ["worker", "browser", "module"],
			format: "esm",
			legalComments: "none",
			loader: { ".ts": "ts", ".tsx": "tsx", ".js": "js", ".jsx": "jsx", ".json": "json" },
			logLevel: "silent",
			mainFields: ["module", "browser", "main"],
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
				sourcefile: sourcePath,
			},
			target: ["es2022"],
			treeShaking: true,
			write: false,
		}
		if (input.define) options.define = input.define
		const result = await esbuild.build(options)

		const outputFiles = result.outputFiles ?? []
		const map = outputFiles.find((file) => file.path.endsWith(".js.map"))
		const js = outputFiles.find((file) => file !== map && file.path.endsWith(".js")) ?? outputFiles.find((file) => file !== map)
		if (!js) throw new OrbitBundleError("Orbit bundle did not produce JavaScript output")
		const code = js.text
		const gzipBytes = gzipSync(code).byteLength
		const maxGzipBytes = input.maxGzipBytes ?? DEFAULT_MAX_GZIP_BYTES
		if (gzipBytes > maxGzipBytes) {
			throw new OrbitBundleError(`Orbit ${input.kind} bundle exceeds gzip limit`, {
				issues: [`Bundle gzip size ${gzipBytes} bytes exceeds limit ${maxGzipBytes} bytes`],
			})
		}

		return {
			runtime: "bundled",
			kind: input.kind,
			code,
			bytes: new TextEncoder().encode(code).byteLength,
			gzip_bytes: gzipBytes,
			warnings: result.warnings.map(toDiagnostic),
			metafile: result.metafile,
			sourcemap: map?.text,
		}
	} catch (cause) {
		if (cause instanceof OrbitBundleError) throw cause
		if (isEsbuildError(cause)) {
			throw new OrbitBundleError("Orbit bundle failed", {
				issues: cause.errors.map((error) => error.text),
				diagnostics: cause.errors.map(toDiagnostic),
			})
		}
			throw new OrbitBundleError(caughtErrorMessage(cause))
		}
}

function caughtErrorMessage(cause: unknown): string {
	if (cause instanceof Error) return cause.message
	if (typeof cause === "string") return cause
	if (typeof cause === "number" || typeof cause === "boolean" || typeof cause === "bigint") {
		return `${cause}`
	}
	return "Orbit bundle failed"
}

function isEsbuildError(cause: unknown): cause is { readonly errors: readonly esbuild.Message[] } {
	return Boolean(cause && typeof cause === "object" && "errors" in cause && Array.isArray((cause as { errors?: unknown }).errors))
}
