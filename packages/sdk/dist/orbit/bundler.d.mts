import * as esbuild from "esbuild";

//#region ../orbit/src/bundler/index.d.ts
type OrbitBundleKind = 'app' | 'job';
type OrbitBundleRuntime = 'bundled';
interface OrbitBundleInput {
  readonly kind: OrbitBundleKind;
  readonly source: string;
  /** Human-readable source path used for sourcemaps, error messages, and relative import resolution. */
  readonly sourcePath?: string | undefined;
  /** Directory for resolving relative imports when sourcePath is omitted. Defaults to process.cwd(). */
  readonly resolveDir?: string | undefined;
  readonly minify?: boolean | undefined;
  readonly sourcemap?: boolean | 'inline' | 'external' | undefined;
  readonly metafile?: boolean | undefined;
  readonly maxGzipBytes?: number | undefined;
  readonly define?: Record<string, string> | undefined;
}
interface OrbitBundleOutput {
  readonly runtime: OrbitBundleRuntime;
  readonly kind: OrbitBundleKind;
  readonly code: string;
  readonly gzip_bytes: number;
  readonly bytes: number;
  readonly warnings: readonly OrbitBundleDiagnostic[];
  readonly metafile?: esbuild.Metafile | undefined;
  readonly sourcemap?: string | undefined;
}
interface OrbitBundleDiagnostic {
  readonly text: string;
  readonly location?: {
    readonly file?: string | undefined;
    readonly line?: number | undefined;
    readonly column?: number | undefined;
  } | undefined;
}
declare class OrbitBundleError extends Error {
  readonly issues: readonly string[];
  readonly diagnostics: readonly OrbitBundleDiagnostic[];
  constructor(message: string, opts?: {
    readonly issues?: readonly string[];
    readonly diagnostics?: readonly OrbitBundleDiagnostic[];
  });
}
declare function bundleOrbitSource(input: OrbitBundleInput): Promise<OrbitBundleOutput>;
//#endregion
export { OrbitBundleDiagnostic, OrbitBundleError, OrbitBundleInput, OrbitBundleKind, OrbitBundleOutput, OrbitBundleRuntime, bundleOrbitSource };
//# sourceMappingURL=bundler.d.mts.map